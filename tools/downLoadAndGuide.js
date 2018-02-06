;
(function(document) {
	/*
	 * 下载 打开App
	 * 使用方法：在页面加入 <% include ../common/appDownLoad.html %>
	 * and <link rel="stylesheet" type="text/css" href="../common/css/common.debug.css"/>
	 * and <script src="/common/js/common.js"></script> <script src="/common/js/public.js"></script>
	 * <script src="https://static.lkme.cc/linkedme.min.js"></script> <script src="https://h5-beta-cdn.healthmall.cn/dist/jkmLinkme.js"></script>
	 * openBrowser微信引导打开浏览器，openApp打开或下载App，_bindEvent所有元素点击事件集合
	 * 增加方法：在现有方法后面定义
	 * 注 jkmLinkme 此对象必须引入https://static.lkme.cc/linkedme.min.js 否则无法使用
	 */
	// TODO 测试第三方分享配置
	window.downLoadComponents = {
		params: {},
		init: function(params) {
			var self = this;
			this.params = params;
			self._ready();
		},
		setParams: function(params) {
			var self = this;
			self.params = params;
		},
		_bindEvent: function() {
			var _this = this;
			//旧版本App下载  3.0.2开始暂时弃用
			/*$(".app_download, .j-app_download").on("click", function() {
				if(!isWechat()) {
					if(isWeibo()) {
						_this._openBrowser();
						return;
					};
					_this._openApp(_this.params);
					return false;
				} else {
					_this._openBrowser();
				};

			})
			$('#guide').click(function() {
				$(this).hide();
			});*/

			//新版本第三方下载  3.0.2开始暂时启用
			//初始化第三方插件
			jkmLinkme.init('d49167d290c03f0bbbbcd7ced332dc40', null, null);
			// 20170926-byxyl
			var data = {};
			var modelName = "LifeHome";//若不指定跳转则默认为App生活馆首页
			//跳转的模块参数
			if(_this.params&&_this.params.modelName){
				modelName = _this.params.modelName;
			}
			var modelType = "LifeHall";
      var paramsStr = null
			//跳转的模块名称
      if(_this.params && _this.params.isHome) {
        paramsStr = 'healthmall://healthmall.cn/'
      } else {
        if(_this.params&&_this.params.modelType){
  				modelType = _this.params.modelType;
  			}
  			paramsStr = 'healthmall://healthmall.cn/'+modelType+'/'+modelName+'?params=' + encodeURIComponent(JSON.stringify(_this.params));
      }

			data.params = JSON.stringify({
				"healthmall_scheme": paramsStr
			});
			jkmLinkme.link(data, function(err, res) {
				$(".btn_download, .j-app_download").on("click", function() {
					window.location.href = res.url;
				})
			});

			//关闭App下载
			$(".btn_download_close, .j-app_download_close").on("click", function() {
				$("#app_download").hide();							
			})
		},
		_ready: function() {
			var self = this;
			$(document).ready(function() {
				self._bindEvent();
			})
		},
		// 3.0.2开始暂时弃用
		_openApp: function() {
			//老版本的跳转
			var _this = this;
			//定义打开或者下载App方法 等待....
			//跳转到APP指定页面
			var scheme = 'healthmallapp://healthmall.tv?type=1&param=' + JSON.stringify(self.params);
			//应用宝地址
			var url = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.zhanyun.ihealth';

			function trigger() {
				//先尝试唤起app
				window.location.href = scheme;
				setTimeout(function() {
					//同时打开应用宝
					window.location.href = url;
				}, 3000);
			}
			//alert(navigator.userAgent)
			if(isIOS()) {
				window.location.href = scheme;
			} else if(isCompatible(navigator.userAgent)) {
				window.location.href = scheme;
				$(".app_download btn_download").show();
			}
			trigger();
		},
		// 3.0.2开始暂时弃用
		_openBrowser: function() {
			//var addClass = isIOS()?"ios":"android";
			//$("#guide").addClass(addClass).show();
			$('#guide').show();
		}
	}
	downLoadComponents.init();
})(document);
