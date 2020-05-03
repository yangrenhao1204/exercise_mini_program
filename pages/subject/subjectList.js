// pages/subject/subjectList.js
const util = require('../../common/js/util.js');
const app = getApp()
Page({

    data: {
        subjectList: null,
    },

    onLoad: function(options) {
        var that = this
        that.setData({
            subjectList: util.getCache('subjectList'),
        });
    },

    returnWithSubjectId: function (event){
        let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
        let prevPage = pages[pages.length - 2];
        prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
            subjectId: event.currentTarget.dataset.id,
            changedSubjectFlag: true,
        })
        app.globalData.subjectId = event.currentTarget.dataset.id
        wx.navigateBack({
            delta: 1
        })
    },
})