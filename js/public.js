var wechatConfig = {
    getConfig: function() {
        //生成微信接口配置，缓存2小时-10分钟 = 6600秒
        var dfd = $.Deferred();
        var href = location.href.split('#')[0];
        var localWechatConfig = localStorage.wechatConfig;
        var lastTimestamp = !!localWechatConfig ? Date.parse(new Date(JSON.parse(localWechatConfig).time)) : 0;
        var url = !!localWechatConfig ? JSON.parse(localWechatConfig).url : null;
        if (!localWechatConfig || (this.getTime() - lastTimestamp) > 6600000 || href!=url ) {
            $.ajax({
                url: '/common/getSignature',
                type: 'get',
                data: { url: location.href.split('#')[0] },
                success: function(data) {
                    if (!data.error && data.ConfigData) {
                        console.info("from api");
                        localStorage.wechatConfig = JSON.stringify(data.ConfigData);
                        dfd.resolve(data.ConfigData.config);
                    } else {
                        dfd.reject(data);
                    }
                }
            });
        } else {
            console.info("from localStorage");
            dfd.resolve(JSON.parse(localWechatConfig).config);
        }
        return dfd.promise();
    },
    getTime: function() {
        //获取服务器当前时间
        var now = 0;
        $.ajax({
            url: '/common/getTime',
            type: 'get',
            // async: false,
            success: function(time) {
                now = Date.parse(new Date(time.serverTime));
            }
        });
        return now;
    },
    init: function() {
        return $.when(this.getConfig()).done(function(config) {
            wx.config({
                appId: config.appId,
                timestamp: config.timestamp,
                nonceStr: config.nonceStr,
                signature: config.signature,
                jsApiList: ['checkJsApi',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'hideMenuItems',
                    'chooseImage',
                    'chooseWXPay'
                ]
            });
        });
    }
}

var wechatLogin = {
    getToken: function() {
        var code = getParameter("code");
        var url = window.location.href ;
        //生成微信接口配置，缓存2小时-10分钟 = 6600秒
        var localWechatLogin = localStorage.wechatLogin;
        // 第一次授权登录的时间戳
        var firstTimestamp = !!localWechatLogin ? Date.parse(new Date(parseInt(JSON.parse(localWechatLogin).firstTime))) : 0;
        // 最后一次刷新token的时间戳
        var refreshTimestamp = !!localWechatLogin &&  JSON.parse(localWechatLogin).refreshTime ? Date.parse(new Date(parseInt(JSON.parse(localWechatLogin).refreshTime))) : 0;
        // 如果没有授权记录或者当前时间距离第一次授权时间已超过5天 5*24*60*60=432000s(432000000ms)
        if (!localWechatLogin || (this.getTime() - firstTimestamp) >  432000000 ) {
            if(code){
                $.ajax({
                    url: '/wechatLogin/getToken',
                    type: 'POST',
                    data:{code:code},
                    success: function(data) {
                        if (!data.error && !data.errcode) {
                            console.info("from api");
                            localStorage.wechatLogin = JSON.stringify(data);
                        }else{
                            var msg = data.errmsg || data.msg;
                            alert(msg);
                        }
                    }
                });
            }else{
                if(getParameter("courseId")){
                    window.location = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe257222ea9a59056&redirect_uri="+url+"&response_type=code&scope=snsapi_userinfo&state="+getParameter("courseId")+"#wechat_redirect";
                }else{
                    window.location = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe257222ea9a59056&redirect_uri="+url+"&response_type=code&scope=snsapi_userinfo#wechat_redirect";
                }
            }
        } else if(localWechatLogin && (this.getTime() - refreshTimestamp) > 6600000 ){
            $.ajax({
                url: '/wechatLogin/refreshToken',
                type: 'POST',
                data:{refreshToken:JSON.parse(localWechatLogin).info.refresh_token,firstTime:firstTimestamp},
                success: function(data) {
                    if (!data.error && !data.errcode) {
                        console.info("from api");
                        localStorage.wechatLogin = JSON.stringify(data);
                    }else if(data.errcode == 40030){
                        localStorage.removeItem("wechatConfig");
                        localStorage.removeItem("wechatLogin");
                        if(getParameter("courseId")){
                            window.location = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe257222ea9a59056&redirect_uri="+url+"&response_type=code&scope=snsapi_userinfo&state="+getParameter("courseId")+"#wechat_redirect";
                        }else{
                            window.location = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe257222ea9a59056&redirect_uri="+url+"&response_type=code&scope=snsapi_userinfo#wechat_redirect";
                        }
                    }else{
                        var msg = data.errmsg || data.msg;
                        alert(msg);
                    }
                }
            });
        }
    },
    getTime: function() {
        //获取服务器当前时间
        var now = 0;
        $.ajax({
            url: '/common/getTime',
            type: 'get',
            // async: false,
            success: function(time) {
                now = Date.parse(new Date(time.serverTime));
            }
        });
        return now;
    }
}

var getParameter = function(name){
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
/*获取公共的一些配置
 * @author lincl
 * @param {}
 * @return {string}
 */
var getConfig = {
	getLeTvUu:function(){
		var leTvUu = "re0lc3ue7g";
		//leTvUu = "9oe0ifsxwh";//测试使用上线后删除
		console.log(location)
		if(location.hostname ==="lifehouseforweb.healthmall.cn"){
			leTvUu = "9oe0ifsxwh";
		}
		return leTvUu;
	}
}
