const app = getApp()
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function tip(params, showCancel = true) {
    var title = params.hasOwnProperty('title') ? params['title'] : '提示';
    var content = params.hasOwnProperty('content') ? params['content'] : '';
    wx.showModal({
        title: title,
        content: content,
        showCancel: showCancel,
        success: function(res) {
            if (res.confirm) { //点击确定
                if (params.hasOwnProperty('cb_confirm') && typeof(params.cb_confirm) == "function") {
                    params.cb_confirm();
                }
            } else { //点击否
                if (params.hasOwnProperty('cb_cancel') && typeof(params.cb_cancel) == "function") {
                    params.cb_cancel();
                }
            }
        }
    })
}

function alert(params) {
    tip(params, false)
}

// method 为 get 时，拼凑路由与请求参数
function buildUrl(path, params) {
    var _paramUrl = "";
    if (params) {
        _paramUrl = Object.keys(params).map(
            function(k) {
                return [encodeURIComponent(k), encodeURIComponent(params[k])].join("=");
            }
        ).join("&");
        _paramUrl = "?" + _paramUrl;
    }
    return path + _paramUrl;
}

function getCache(key) {
    var value = undefined;
    try {
        value = wx.getStorageSync(key);
    } catch (e) {}
    return value;
}

function setCache(key, value) {
    wx.setStorage({
        key: key,
        data: value
    });
}

function clearCache() {
    try {
        return wx.clearStorageSync();
    } catch (e) {
        console.error(e);
    }
}

function getRandNumForRange(min, max, num = 1) {
    // 检查传值是否合法
    if (num > max - min) return false;
    var numList = [];
    for (var i = min; i < max; i++) numList.push(i);
    // 对数组随机排序
    numList.sort(function() {
        return Math.random() < 0.5 ? -1 : 1
    });
    return numList.slice(0, num);
}

module.exports = {
    formatTime,
    tip,
    alert,
    buildUrl,
    getCache,
    setCache,
    // clearCache,
    getRandNumForRange,
}