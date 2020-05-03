const api = require('/service/api.js');
const util = require('/common/js/util.js');

App({
    // 小程序启动生命周期
    onLaunch: function() {
        // if (this.checkLoginState() == false) {
        //     this.login()
        // }
        this.getUserInfo()
    },

    // onHide: function() {
    //     this.redirectToPageWhenLoggedIn('/pages/index/index')
    // },

    onUnlaunch: function() {
        wx.clearStorage()
    },

    towxml: require('/towxml/index'),

    login: function (callback) {
        var that = this
        wx.login({
            success: function(res) {
                if (res.code) {
                    wx.request({
                        url: api.login,
                        header: {
                            'content-type': 'application/json',
                        },
                        data: {
                            code: res.code
                        },
                        success: function(res) {
                            if (res.statusCode == 200) {
                                that.saveLoginState(res.data.openid)
                            }
                            if (callback && typeof callback === 'function') {
                                callback(res)
                            }
                        }
                    });
                } else {
                    util.alert({
                        'content': '登录失败'
                    });
                }
            }
        });
    },

    getUserInfo: function (callback) {
        var that = this
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo
                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (that.userInfoReadyCallback && typeof that.userInfoReadyCallback === 'function') {
                                that.userInfoReadyCallback(res)
                            }
                            if (callback && typeof callback === 'function') {
                                callback(res)
                            }
                        }
                    })
                }
            }
        })
    },

    userInfoReadyCallback: function(res) {
        wx.request({
            url: api.saveUserInfo,
            method: 'POST',
            header: {
                'content-type': 'application/json',
            },
            data: {
                openid: this.globalData.openid,
                nickname: res.userInfo.nickName,
                avatar_url: res.userInfo.avatarUrl,
            },
            success: function(res) {}
        });
    },

    checkLoginState: function() {
        // 此处根据项目要求自行修改，使用token
        return this.globalData.openid != null
    },

    getLoginState: function() {
        // 此处根据项目要求自行修改，使用tokens
        return this.globalData.openid
    },

    saveLoginState: function(openid) {
        // 此处根据项目要求自行修改，使用tokens
        this.globalData.openid = openid
    },

    redirectToPageWhenLoggedIn: function(url) {
        if (this.checkLoginState() == true) {
            wx.redirectTo({
                url: url,
            })
        } else {
            wx.redirectTo({
                url: '/pages/authorize/authorize',
            })
        }
    },

    navigateToPageWhenLoggedIn: function(url) {
        if (this.checkLoginState() == true) {
            wx.navigateTo({
                url: url,
            })
        } else {
            wx.redirectTo({
                url: '/pages/authorize/authorize',
            })
        }
    },

    globalData: {
        miniProgramName: "刷题小程序",
        openid: null,
        userInfo: null,
        subjectId: null,
        // chapterId: null,
    },
})