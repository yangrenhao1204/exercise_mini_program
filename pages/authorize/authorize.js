const app = getApp();
const util = require('../../common/js/util.js');
Page({
    data: {
        //判断小程序的API，回调，参数，组件等是否在当前版本可用。
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
    },

    onLoad: function() {
        if (app.checkLoginState() == false) {
            app.login()
        }
        if (app.globalData.userInfo == null) {
            app.getUserInfo()
        }
    },

    bindGetUserInfo: function(e) {
        var that = this;
        if (!e.detail.userInfo) {
            util.alert({
                title: '警告',
                content: '授权失败，将无法进入小程序，请重新授权之后再进入!!!',
            })
        } else {
            app.globalData.userInfo = e.detail.userInfo
            app.userInfoReadyCallback(e.detail)
            this.goToIndex()
        }
    },

    goToIndex: function() {
        wx.redirectTo({
            url: '/pages/index/index',
        })
        //app.redirectToPageWhenLoggedIn('/pages/index/index');
    },

})