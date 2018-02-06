;
(function(window) {
  /*
   * 支付列表组件
   * 使用方法：在页面加入 <section class="select_pay"></section> 标签，对应的css还有这个js文件即可
   * 类名必须指定为 select_pay
   */
  window.payListComponents = {
    /*
     * 初始化入口
     */
    init: function() {
      var self = this;
      self._ready();
    },

    _ready: function() {
      var self = this;
      //判断当前支付方式是否微信,必须引入pulic.js
      self._isWechat = isWechat();
      self._addPayList();
      $(document).ready(function() {
        self._bindEvent();
      })
    },

    /*
     * 绑定事件
     */
    _bindEvent: function() {
      var self = this;
      if (location.hostname == "lifehouseforweb.healthmall.cn" && isWechat()) {
        wechatLogin.getToken();
      }
      // 点击支付方式
      $(".pay-method-li").on("click", function() {
        // 恢复页面滚动
        $('body').css({
          "overflow-x": "",
          "overflow-y": ""
        });
        $(".select_pay").hide();
        $(".loading_big_box").show();
        //正式服
        self._params.param.OpenId = localStorage.wechatLogin ? JSON.parse(localStorage.wechatLogin).info.openid : self._params.param.OpenId;
        //测试服兼容测试服
        self._params.param.OpenId = self._params.param.OpenId ? self._params.param.OpenId : "oIno0v51X_jmVA93MFHjY2HCnsNI";
        self._params.param.PayType = parseInt($(this).data("type"));
        // 创建订单
        self._creatOrder();
      })
      // 取消支付方式
      $(".pay-cancel").on("click", function() {
        // 恢复页面滚动
        $('body').css({
          "overflow-x": "",
          "overflow-y": ""
        });
        $(".select_pay .select").animate({
          "bottom": -$(".select_pay .select").height() + "px"
        });
        var timer = setTimeout(function() {
          clearTimeout(timer);
          $(".select_pay").hide();
        }, 500);

      })
    },

    // 判断是否是微信打开
    _isWechat: false,

    // 外部参数
    _params: {},

    /*
     * 创建订单
     */
    _creatOrder: function() {
      var self = this;
      if (!self._params.param.OpenId && isWechat() && location.hostname == "lifehouseforweb.healthmall.cn") {
        alert("微信授权过期，请重新授权");
        wechatLogin.getToken();
        $(".loading_big_box").hide();
        return;
      }
      $.ajax({
        url: self._params.url,
        type: 'POST',
        data: self._params.param,
        success: function(result) {
          if (result && !result.error) {
          	console.log('payListComponents.js 支付成功返回的结果 result ', result);
          	if(self._params.param.price==0){
          	  //微信支付成功、需要根据订单类型显示按钮或者跳转时传递参数orderId
              var type = (self._params.param && self._params.param.lifehouseCardId) ? 'card': '';/*区别特权卡*/
              location.href = location.origin + '/share/paySuccess?orderId=' + result.order_no + '&type=' + type;
          	  return;
          	}
            //获取订单号
            if (self._isWechat) {
              $.when(wechatConfig.init())
              .done(function() {
                wx.chooseWXPay({
                  timestamp: result.timeStamp,
                  nonceStr: result.nonceStr,
                  package: result.package,
                  signType: result.signType,
                  paySign: result.paySign,
                  success: function(res) {
                    //微信支付成功、需要根据订单类型显示按钮或者跳转时传递参数orderId
                    var type = (self._params.param && self._params.param.lifehouseCardId) ? 'card': '';/*区别特权卡*/
                    location.href = location.origin + '/share/paySuccess?orderId=' + result.orderId + '&type=' + type;
                  },
                  fail: function(res) {
                    alert(res.errMsg);
                  },
                  cancel: function() {
                    $(".loading_big_box").hide();
                  }
                });
              })
              .fail(function() {
                $(".layer_ts").show();
                $(".layer_ts").html("微信配置初始化失败");
                var timer = setTimeout(function() {
                  clearTimeout(timer);
                  $(".layer_ts").hide();
                }, 3000)
              })
            } else {
              window.location.href = 'https://openapi.alipay.com/gateway.do?' + result;
            }
          } else {
            $(".layer_ts").show();
            $(".layer_ts").html(result.message ? result.message : "服务器错误");
            var timer = setTimeout(function() {
              clearTimeout(timer);
              $(".layer_ts").hide();
            }, 3000)
          }
          $(".loading_big_box").hide();
        },
        error: function(res) {
          $(".layer_ts").show();
          $(".layer_ts").html(res.message ? res.message : "服务器错误");
          $(".loading_big_box").hide();
          var timer = setTimeout(function() {
            clearTimeout(timer);
            $(".layer_ts").hide();
          }, 3000)
        }
      })
    },

    /*
     * 添加支付方式到页面上
     */
    _addPayList: function() {
      var self = this;
      var $selectPay = $(".select_pay");
      if ($selectPay.length === 0) return false;

      // var payMethod = $selectPay.attr('pay-method') || "alipay, wechatpay";
      // isWechat() 引入这个方法之前要在这个js之前引入 /common/js/public.js
      var payMethod = self._isWechat ? "wechatpay" : "alipay";
      var ret = [];

      // 过滤掉相同的支付方式
      // 这种写法是针对之前的设计写的，现在的画可以直接push进去一个数组就好
      payMethod.split(",").filter(function(item, index) {
        if (ret.indexOf(item) === -1) ret.push(item);
        return ret;
      });
      payMethod = ret;

      // 如果有新的支付方式的话需要在map添加对应的字段
      var map = {
        wechatpay: {
          _title: "微信支付",
          type: 4,
          _imgUrl: "/forApp/images/general_icon_wechat@xxhdpi.png"
        },
        alipay: {
          _title: "支付宝支付",
          type: 1,
          _imgUrl: "/forApp/images/general_icon_zfb@xxhdpi.png",
        }
      }

      // 添加到页面的 li 集，一个li代表一种支付方式
      var lis = "";
      for (var i = 0, len = payMethod.length; i < len; i++) {
        var method = map[$.trim(payMethod[i])];
        var imgUrl = method._imgUrl,
          title = method._title;
        lis += '<li class="pay-method-li" data-type=' + method.type + '>' +
          '<div class="pay-way-icon">' +
          '<img src="' + imgUrl + '" alt="">' +
          '</div>' +
          '<div class="pay-way-name">' +
          title +
          '</div>' +
          '<i class="pay-way-jump"></i>' +
          '</li>'
      }

      var $selectDiv = $("<div class='select'><p class='select_title'>支付方式</p><ul>" + lis + "</ul><div class='pay-cancel'><span class='word'>取消</span></div></div>");
      $selectPay.append($selectDiv);
    },

    /*
     * 设置外部参数
     */
    setParam: function(params) {
      var self = this;
      self._params = params || {};
    },

    /*
     * 获取外部参数
     */
    getParam: function() {
      var self = this;
      return self._params;
    },
  }
  payListComponents.init();
})(window);
