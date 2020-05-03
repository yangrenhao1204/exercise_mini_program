// pages/chapter/chapterList.js
const util = require('../../common/js/util.js');

Page({

    data: {
        chapterList: null,
    },

    onLoad: function (options) {
        var that = this  
        that.setData({
            chapterList: util.getCache('chapterList'),
        });
    },

    // chooseChapter: function(event) {
    //     wx.navigateTo({
    //         url: '/pages/problem/problem?testtype=order&chapterId=' + event.currentTarget.dataset.id,
    //     })
    // },

    chooseChapter: function (event) {
        wx.navigateTo({
            url: '/pages/article/article?chapterId=' + event.currentTarget.dataset.id,
        })
    },

})