const app = getApp();
const data = require('../../service/data.js')
Page({
    data: {
        chapterId: null,
        isLoading: true, // 判断是否尚在加载中
        title: null,
        content: {}, // 内容数据
    },

    onLoad: function(options) {
        const that = this;
        that.data.chapterId = parseInt(options.chapterId)
        var article = data.getArticleBychapterId(that.data.chapterId, article => {
            that.data.isLoading = false
            if (article) {
                that.data.title = article.title
                that.data.content = app.towxml(article.content, 'markdown');
                that.setData(that.data)
            }
        })
    },

    chooseChapter: function(event) {
        wx.navigateTo({
            url: '/pages/problem/problem?testtype=order&chapterId=' + this.data.chapterId,
        })
    },
})