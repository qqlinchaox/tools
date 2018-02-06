  /*
  * @param{String}
  * 获取地址栏对应key的value值
  * return：String
  */
  var tools = {
    getUrlKey:function(name){
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20')) || null;
    }
  }
  