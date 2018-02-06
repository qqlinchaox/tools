;
(function(document) {
/*
 * 支付方式
 * 使用方法：在页面加入 <% include ../common/payMethod.html %>
 * and <link rel="stylesheet" type="text/css" href="../common/css/common.debug.css"/>
 * and <script src="/common/js/common.js"></script>
	   <script src="/common/js/public.js"></script>
	   <script src="//res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
 * bookOrder主要下单函数，openApp打开或下载App，_bindEvent所有元素点击事件集合
 * 
 * 增加方法：在现新方法后面定义
 */
// TODO /**/
var payMethodComponents = {
	params: {},
	init: function(params) {
		var self = this;
		self.params = params;
		self._ready();
	},
	bindEvent: function() {
		var _this = this;
		$(".pay li").click(function(event) {
					_this.bookOrder(_this.params);
				}
				$(".pay").click(function() {
					$(this).hide();
					$(".mouble").show();
					$(".back").hide();
					$(".payBtn").show();
				}) $(".payBtn").on("click", function() {
					$(".pay").show();
					var price = parseFloat($('#price').html());
					$(".money").html('￥' + price);
				})
			},
			ready: function() {
				var self = this;
				self.();
				$(document).ready(function() {
					self._bindEvent();
				})
			},
	}
	//选择支付方式
	payMethodComponents.prototype.chooseMethod = function() {
		$(".payBtn").on("click", function() {
			$(".pay").show();
			var price = parseFloat($('#price').html());
			$(".money").html('￥' + price);
		})
	}
	//定义下单函数
	payMethodComponents.prototype.bookOrder = function() {
		$.ajax({
				url: this._url,
				type: 'POST',
				data: this.params,
				success: function(result) {
					if(result && !result.error) {
						if(isWechat()) {
							$.when(wechatConfig.init()).done(function() {
									wx.chooseWXPay({
										timestamp: result.timeStamp,
										nonceStr: result.nonceStr,
										package: result.package,
										signType: result.signType,
										paySign: result.paySign,
										success: function(res) {
											window.location.href = 'paySuccess?orderId=' + orderId;
										},
										fail: function(res) {
											alert(res.errMsg);
											$(".loading_big_box").hide();
										},
										cancel: function() {
											$(".loading_big_box").hide();
										}
									});
								})
								.fail(function() {
									$(".loading_big_box").hide();
									$(".layer").css("display", "block");
									$(".title").html("温馨提示");
									$(".errorMsg").html("微信配置初始化失败");
									$(".loading_big_box").hide();
								})
						} else {
							window.location.href = 'https://openapi.alipay.com/gateway.do?' + result;
						}
					} else {
						$(".layer").css("display", "block");
						$(".title").html("温馨提示");
						$(".errorMsg").html(result.message);
						$(".loading_big_box").hide();
					}
				},
				error: function(res) {
					$(".layer").css("display", "block");
					$(".title").html("温馨提示");
					$(".errorMsg").html("下单失败");
					$(".loading_big_box").hide();
				}
			})
			.done(function(res) {
				if(res.error) {
					$(".layer").css("display", "block");
					$(".title").html("温馨提示");
					$(".errorMsg").html("服务器异常");
					$(".loading_big_box").hide();
				} else {
					$(".loading_big_box").hide();
					$(".layer").hide();
				}
			})
			.fail(function() {
				$(".layer").css("display", "block");
				$(".title").html("温馨提示");
				$(".errorMsg").html("下单失败");
				$(".loading_big_box").hide();
			})
	}
})(document);