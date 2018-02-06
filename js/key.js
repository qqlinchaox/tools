sessionStorage.address = location.href;
var key = getCookie("key");
if (key) {
} else {
    window.location.href = "/user/login";
}