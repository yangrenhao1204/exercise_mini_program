Page({

    data: {},

    onLoad: function(args) {
        var that = this
        var param = JSON.parse(decodeURIComponent(args.param))
        var problem = param.problem
        var data = {
            subjectId: param.subjectId,
            testType: param.testType,
            problem: problem,
            percentage: ((problem.record.right * 100) / (problem.record.right + problem.record.error)).toFixed(2) + '%',
            total: problem.record.right + problem.record.error,
            right: problem.record.right,
            error: problem.record.error,
        };
        that.setData(data);
    },

    goHome: function() {
        // wx.reLaunch({
        //     url: "../index/index"
        // });
        wx.navigateBack({
            delta: 3,
        });
    },

    goCheckError: function() {
        var incorrectIdSet = this.data.problem.record.incorrectIdSet;
        var testType = "error";
        var pattern = 'recheck'
        var paramStr = "?testtype=" + testType + "&pattern=" + pattern + "&incorrectIdSet=" + JSON.stringify(incorrectIdSet);
        wx.redirectTo({
            url: "../problem/problem" + paramStr,
        });
    },

})