const app = getApp();
const data = require('../../service/data.js');
const util = require('../../common/js/util.js');
Page({
    data: {
        userInfo: null,
        openid: null,
        subjectId: null,
        subjectName: null,
        changedSubjectFlag: false,
        hasUserInfo: false,
        // canIUse: wx.canIUse('button.open-type.getUserInfo'),
    },

    onLoad: function() {
        var that = this
        if (app.checkLoginState() == false) {
            app.login(function() {
                that.setData({
                    openid: app.globalData.openid,
                });
            })
        }
        if (app.globalData.userInfo == null) {
            app.getUserInfo(function() {
                that.setData({
                    hasUserInfo: true,
                    userInfo: app.globalData.userInfo,
                });
            })
        }
        that.data.subjectId = app.globalData.subjectId
        // if (app.checkLoginState() == false || that.data.userInfo == null) {
        //     wx.redirectTo({
        //         url: '/pages/authorize/authorize',
        //     })
        // }
    },

    onShow: function() {
        var that = this
        data.getSubjectList()
        if (that.data.subjectId != null && that.data.changedSubjectFlag == true) {
            data.getChapterListBySubjectId(that.data.subjectId)
            data.getProblemListBySubjectId(that.data.subjectId)
            data.getErrorProblemIdSet(that.data.openid, that.data.subjectId)
            that.setData({
                changedSubjectFlag: false,
                subjectName: data.getSubjectNameById(this.data.subjectId),
            });
        }
    },

    bindGetUserInfo: function(e) {
        var that = this;
        if (!e.detail.userInfo) {
            util.alert({
                title: '警告',
                content: '授权失败!!!',
            })
        } else {
            app.globalData.userInfo = e.detail.userInfo
            app.userInfoReadyCallback(e.detail)
            that.setData({
                hasUserInfo: true,
                userInfo: app.globalData.userInfo,
            });
        }
    },

    switchPage: function(event) {
        wx.navigateTo({
            url: event.currentTarget.dataset.url
        })
    }
})
