//和app交互方法

//初始化ios和app交互方法
if(!window.android) {
	window.connectWebViewJavascriptBridge = function(callback) {
		if(window.WebViewJavascriptBridge) {
			callback(WebViewJavascriptBridge);
		} else {
			document.addEventListener('WebViewJavascriptBridgeReady', function() {
				callback(WebViewJavascriptBridge);
			}, false);
		}
	}
	connectWebViewJavascriptBridge(function(bridge) {
		bridge.init(function(message, responseCallback) {
			var data = {
				'Javascript Responds': 'Wee!'
			}
			responseCallback(data);
		});
	});
}

var AppInteraction = {};

AppInteraction.execute = function(androidMethod, iosMethod, params, callback) {
	//执行函数
	var method = androidMethod || iosMethod;

	if(navigator.platform === 'iPhone' ||
		navigator.platform === 'iPad' ||
		navigator.platform === 'iPod' ||
		navigator.platform === 'iPhone Simulator' ||
		navigator.platform === 'iPad Simulator' ||
		navigator.platform === 'iPod Simulator' ||
		navigator.platform === 'iPod touch' ||
		navigator.platform === 'iPod Touch') {
		if(callback instanceof Function) {
			//注册回调函数
			window[iosMethod] = callback;
			bridge.registerHandler(iosMethod, function(data, responseCallback) {
				responseCallback(window[iosMethod](data));
			});
		} else {
			//否则如果params是个json对象或具体某个值，即为H5调APP时传递的参数
			connectWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler(iosMethod, params, function(response) {});
			});
		}
	} else if(window.android) {
		if(callback instanceof Function) {
			window[androidMethod] = callback;
		} else {
			android[androidMethod](JSON.stringify(params));
		}
	} else {
		alert("请在健康猫APP打开！");
	}
}

//H5调APP。设置loading是否显示
AppInteraction.setLoading = function(isLoading) {
	var data = {
		loading: isLoading
	};
	AppInteraction.execute('setThePageLoading', 'setThePageLoading', data);
}

//H5调APP。设置网页的当前页面是否拦截用户的返回上一页（左上角返回箭头）和退出网页（左上角X）的行为。流程可以结合 控制APP的网页页面返回，控制APP的网页页面关闭 , 通知标题栏返回上一页或退出网页按钮被点击使用
AppInteraction.setIsInterceptBack = function(isIntercept) {
	var data = {
		isIntercept: isIntercept
	};
	AppInteraction.execute('setIsInterceptBack', 'setIsInterceptBack', data);
}

//H5调APP。APP短暂提示消息
AppInteraction.toast = function(message) {
	var data = {
		message: message
	};
	AppInteraction.execute('toastMessage', 'toastMessage', data);
}

//APP调H5。通知标题栏返回上一页（左上角返回箭头）或退出网页（左上角X）被点击
AppInteraction.notifyTBBackClickedForOwn = function(eventListener) {
	AppInteraction.execute('notifyTBBackClicked', 'notifyTBBackClicked', null, eventListener);
}

//H5调APP。APP做和标题栏左上角关闭键一样的处理。如果需要回调结果，调用通知新页面返回结果
AppInteraction.closeWebview = function(eventListener) {
	AppInteraction.execute('requestCloseWeb', 'requestCloseWeb');
}

//H5调APP。判断是否app打开，返回true 或者 false
AppInteraction.isAppOpen = function() {
	var result = false;
	if(window.android) {
		result = android.isAppOpen();
	} else {
		var arr, reg = new RegExp("(^| )deviceType=([^;]*)(;|$)");
		if(arr = document.cookie.match(reg)) {
			result = unescape(arr[2]);
		}
	}
	return result
}

//H5调APP。调用登陆，此方法特别，暂时不做封装，登陆后会刷新页面
AppInteraction.callAppLogin = function(callback) {
	if(window.android) {
		window.mallLoginCallback = function(status, token) {
			callback(status, token);
		}
		window.android.mallToLogin();
	} else {
		connectWebViewJavascriptBridge(function(bridge) {
			bridge.callHandler('H5ArouseAppLogin', null, function(res) {
				res && callback(res.status, res.token);
			});
		});
	}
}
//H5调APP。APP做和标题栏右上角分享键一样的处理 接口型
AppInteraction.setTBRightButton = function(TBRightJson) {
	AppInteraction.execute('setTBRightButton', 'setTBRightButton', TBRightJson);
}

// H5调APP。我的积分明细
AppInteraction.mallToIntegralDetails = function(TBRightJson) {
	AppInteraction.execute('mallToIntegralDetails', 'mallToIntegralDetails', TBRightJson);
}
//H5调APP。APP做和标题栏右上角分享键一样的处理 点击处理分享函数
AppInteraction.notifyTBRightButtonClicked = function(imgUrl, title, des, url, callback) {
	if(window.android) {
		window.notifyTBRightButtonClicked = function() {
			callback(imgUrl, title, des, url);
		}
		window.android.notifyTBRightButtonClicked();
	} else {
		var params = {
			"imgUrl":imgUrl,
			"title":title,
			"des":des,
			"url":url,
		}
		connectWebViewJavascriptBridge(function(bridge) {
			bridge.registerHandler('notifyTBRightButtonClicked', function (data, responseCallback) {
                responseCallback(callback(imgUrl, title, des, url));
            });
		});
	}
}
//H5调APP。APP做和标题栏右上角按钮不分享-跳转页面使用
AppInteraction.notifyTBRightButtonClickedToLocation = function(callback,param){
	if(window.android) {
		window.notifyTBRightButtonClicked = function() {
			callback(param);
		}
		window.android.notifyTBRightButtonClicked();
	} else {
		connectWebViewJavascriptBridge(function(bridge) {
			bridge.registerHandler('notifyTBRightButtonClicked', function (data,responseCallback) {
                responseCallback(callback(param));
            });
		});
	}
}
//H5调APP，分享按钮
AppInteraction.mallShare = function(imgUrl, title, des, url) {
	if(window.android) {
		window.mallShare = function(imgUrl, title, des, url) {}
		window.android.mallShare(imgUrl, title, des, url);
	} else {
		connectWebViewJavascriptBridge(function(bridge) {
			var params = {
				"imgUrl":imgUrl,
				"title":title,
				"des":des,
				"url":url,
			}
			bridge.callHandler('mallShare',params,function(res) {});
		});
	}
};
//APP调用H5
AppInteraction.requestShare = function(TBRightJson) {
	AppInteraction.execute('requestShare', 'requestShare');
}
//H5调用APP----点击进入原生页面并传参
AppInteraction.jumpToLifeClubHome = function(Json) {
	AppInteraction.execute('jumpToLifeClubHome', 'jumpToLifeClubHome',Json);
}
//H5调APP。返回生活馆首页
AppInteraction.setIsInterceptBack = function(isIntercept) {
	var data = {
		isIntercept: isIntercept
	};
	AppInteraction.execute('setIsInterceptBack', 'setIsInterceptBack', data);
}
//H5打开APP新页面显示web网页
AppInteraction.startViewToShow = function(params) {
	AppInteraction.execute('startViewToShow', 'startViewToShow',params);
}

/*
-----------------
启航 begin
-----------------
*/

//H5调用APP----点击进入原生页面跑步方案并传参
AppInteraction.mallToRunPlanDetail = function(Json) {
	AppInteraction.execute('mallToRunPlanDetail', 'mallToRunPlanDetail',Json);
};
//H5调用APP----分享按钮，邀请好友
AppInteraction.sailShare = function(jsonData) {
	if(window.android) {
		jsonData=JSON.stringify(jsonData);//传递给安卓时候必须是字符串json,否则接不到。
        window.mallToShare = function(jsonData) {};
		window.android.mallToShare(jsonData);
	} else {
		connectWebViewJavascriptBridge(function(bridge) {
			var params = {
				"channel":channel,
				"imgUrl":imgUrl,
				"title":title,
				"des":des,
				"url":url
			};
			bridge.callHandler('mallToShare',params,function(res) {});
		});
	}
};
/*
 -----------------
 启航 end
 -----------------
 */
