(function() {
    var root = this;

    //初始化ios和app交互方法
    if(!window.android){
        window.connectWebViewJavascriptBridge = function (callback) {
            if (window.WebViewJavascriptBridge) {
                callback(WebViewJavascriptBridge);
            } else {
                document.addEventListener('WebViewJavascriptBridgeReady', function () {
                    callback(WebViewJavascriptBridge);
                }, false);
            }
        }
        connectWebViewJavascriptBridge(function (bridge) {
            bridge.init(function (message, responseCallback) {
                var data = { 'Javascript Responds': 'Wee!' }
                responseCallback(data);
            });
        });
    }

    var register = function(method,func){
        //注册函数
        if (navigator.platform === 'iPhone' ||
            navigator.platform === 'iPad' ||
            navigator.platform === 'iPod' ||
            navigator.platform === 'iPhone Simulator' ||
            navigator.platform === 'iPad Simulator' ||
            navigator.platform === 'iPod Simulator' ||
            navigator.platform === 'iPod touch' ||
            navigator.platform === 'iPod Touch') {
            connectWebViewJavascriptBridge(function(bridge) {
                bridge.registerHandler(method, function (data, responseCallback) {
                    responseCallback(func(data));
                });
            });
        }else{
            window[method] = func;
        }
    }
    var execute = function(androidMethod, iosMethod, params,callback,type){
        // androidMethod 安卓方法
        // iosMethod     ios方法
        // params        参数
        // callback      针对有返回的方法的回调函数
        // type          用于识别安卓方法（传字符串的方法）

        var method = androidMethod || iosMethod;
        var isJson = typeof params == 'object' ? true : false;
        var data = isJson ? params : {};
        if (navigator.platform === 'iPhone' ||
            navigator.platform === 'iPad' ||
            navigator.platform === 'iPod' ||
            navigator.platform === 'iPhone Simulator' ||
            navigator.platform === 'iPad Simulator' ||
            navigator.platform === 'iPod Simulator' ||
            navigator.platform === 'iPod touch' ||
            navigator.platform === 'iPod Touch') {
            connectWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler(method, data, function(response) {
                    callback&&callback(response);
                });
            });
        } else if (window.android) {
            //如果是json对象，而且有回调
            if(isJson){
                if(type){
                    switch(androidMethod){
                        default:
                            break
                    }
                    return;
                }else{
                    if(callback){
                        callback(android[method](JSON.stringify(params)));
                        return;
                    }
                    window.android[method](JSON.stringify(params));
                }
            }else{
                if(callback){
                    callback(android[method]());
                    return;
                }
                window.android[method]();
            }
        }else{
            alert("请在健康猫APP打开！");
        }
    }
    var AppInteraction = {
        isAppOpen:function(callback){
            //1.判断是否app打开
            execute('isAppOpen','isAppOpen','',callback);
        },
        mallToLogin:function(appCallback){
            // 2.登录接口
            appCallback&&register('mallLoginCallback',appCallback);
            execute('mallToLogin','mallToLogin');
        },
        getAppVersion:function(callback){
            // 7.获取APP当前版本号
            execute('getAppVersion','getAppVersion','',callback);
        },
        getAccessToken:function(callback){
            // 8.获取accessToken
            execute('getAccessToken','getAccessToken','',callback);
        },
        requestChoosePhotos:function(json,callback){
            // 9.请求APP选择图片 10.通知H5图片选择完成
            callback&&register('notifyAfterChoosePhoto',callback);
            execute('requestChoosePhotos','requestChoosePhotos',json);
        },
        toastMessage:function(json){
            // 11.APP短暂提示消息
            execute('toastMessage','toastMessage',json);
        },
        setThePageLoading:function(json){
            // 12.控制APP页面加载
            execute('setThePageLoading','setThePageLoading',json);
        },
        setTheProgressDialogShow:function(json){
            // 13.控制APP滚动弹出框（可在请求接口的时候调用，请求完后关闭弹出框）
            execute('setTheProgressDialogShow','setTheProgressDialogShow',json);
        },
        setTheRefreshView:function(json,callback){
            // 14.控制APP页面下拉刷新 15.通知H5页面刷新
            callback&&register('notifyPageRefresh',callback);
            execute('setTheRefreshView','setTheRefreshView',json);
        },
        startViewToShow:function(json,callback){
            // 16.打开APP新页面显示web网页 17.通知新页面返回结果
            callback&&register('notifyViewResult',callback);
            json&&json.url&&execute('startViewToShow','startViewToShow',json);
        },
        mallToCoachCabin:function(json){
            // 18.进入APP约私教列表
            execute('mallToCoachCabin','mallToCoachCabin',json);
        },
        mallToCoachList:function(json){
            // 19.进入APP私教小屋
            json&&json.userId&&execute('mallToCoachList','mallToCoachList',json);
        },
        mallToUserCabin:function(json){
            // 20.进入APP用户小屋
            json&&json.userId&&execute('mallToUserCabin','mallToUserCabin',json);
        },
        mallToGroupsTab:function(json){
            // 21.进入圈子指定栏目
            json&&json.type&&execute('mallToGroupsTab','mallToGroupsTab',json);
        },
        mallToGroupsPostDetail:function(json){
            // 22.进入圈子的帖子详情
            json&&json.id&&execute('mallToGroupsPostDetail','mallToGroupsPostDetail',json);
        },
        setTBRightButton:function(json,callback){
            // 23.设置标题栏右上角按钮 24.通知标题栏右上角按钮被点击
            callback&&register('notifyTBRightButtonClicked',callback)
            execute('setTBRightButton','setTBRightButton',json);
        },
        setTBSearchButton:function(json,callback){
            // 25.设置标题栏右上角搜索按钮 26.请求H5执行搜索
            callback&&register('requestSearch',callback);
            execute('setTBSearchButton','setTBSearchButton',json);
        },
        setTitleBarTab:function(json,callback){
            // 27.设置标题栏的tab 28.通知标题栏tab选中改变
            callback&&register('notifyTBTabChanged',callback);
            execute('setTitleBarTab','setTitleBarTab',json);
        },
        setIsInterceptBack:function(json,callback){
            // 29.设置网页的当前页面是否拦截返回和退出行为 30.通知标题栏返回上一页或退出网页按钮被点击
            callback&&register('notifyTBBackClicked',callback);
            execute('setIsInterceptBack','setIsInterceptBack',json);
        },
        requestBack:function(){
            // 31.控制APP的网页页面返回
            execute('requestBack','requestBack');
        },
        requestCloseWeb:function(){
            // 32.控制APP的网页页面关闭
            execute('requestCloseWeb','requestCloseWeb');
        },
        mallToShowPics:function(json){
            // 33.请求APP显示图片
            execute('mallToShowPics','mallToShowPics',json);
        },
        mallToCustomizationGuidedFinish:function(json){
            // 34.进入健康定制首页（2.9.3及以上）
            json&&json.type&&execute('mallToCustomizationGuidedFinish','mallToCustomizationGuidedFinish',json);
        },
        mallToHealthSignIn:function(){
            // 35.进入健康签到（2.9.3及以上）
            execute('mallToHealthSignIn','mallToHealthSignIn');
        },
        mallToExpertQuestion:function(){
            // 36.进入问吧专家问题集（2.9.3及以上）
            execute('mallToExpertQuestion','mallToExpertQuestion');
        },
        mallToShare:function(json){
            // 39.分享接口(新)
            execute('mallToShare','mallToShare',json);
        },
        mallToCopy: function(json) {
            // 40.网页调用复制功能
            execute('mallToCopy', 'mallToCopy', json);
        },
        editorBarTools:function(callback){
            // 41.注册工具栏回调函数
            callback&&register('editorBarTools',callback);
        },
        tellStateForEditorBarTools:function(json){
            // 42.通知app富文本框工具栏状态
            execute('tellStateForEditorBarTools','tellStateForEditorBarTools',json);
        },
        requestPostForMeowGroups:function(json){
            // 43.瞄圈发布文章点击预览、发布
            execute('requestPostForMeowGroups','requestPostForMeowGroups',json);
        },
        mallToPrincipalIntegralMoreHistory: function() {
            // 36.补贴积分查询-查看更多历史数据
            execute('mallToPrincipalIntegralMoreHistory', 'mallToPrincipalIntegralMoreHistory');
        }
    };
    root.AppInteraction = AppInteraction;


}.call(this));
