const app = getApp()
const util = require('../../common/js/util.js')
const data = require('../../service/data.js')
const animation = require('../../service/animation.js')
Page({
    data: {
        subjectId: null,
        chapterId: null,
        testType: "",
        isFinish: false,
        moving: false,
        
        problem: {
            currentNum: 0, //当前显示题目序号
            problemList: [], // 当前题目列表
            problemListLength: 0,
            record: {
                right: 0, // 本次答题正确次数
                error: 0, // 本次答题错误次数
                correctIdSet: {},
                incorrectIdSet: {},
                // incorrectIndexList: new Array(),
            },
        },
        // 左右翻页动画
        animation: {
            previousPage: {},
            currentPage: {},
            posteriorPage: {},
        },
        // 题目列表层
        layer: {
            isShow: false, // 题目列表层是否已显示
            layerAnimation: {}, //弹窗动画
        },
        // 触点
        touchPoint: {
            start: {
                x: null,
                y: null,
            },
            end: {
                x: null,
                y: null,
            },
        },

    },

    onLoad: function(options) {
        var that = this
        that.data.subjectId = app.globalData.subjectId
        switch (options.testtype) {
            case "order":
                that.data.testType = "order"
                that.data.chapterId = parseInt(options.chapterId)
                that.data.problem.problemList = data.getChapterProblemListById(that.data.chapterId)
                break
            case "rand":
                that.data.testType = "rand"
                that.data.problem.problemList = data.getRandomProblemList()
                break
            case "error":
                that.data.testType = "error"
                var errorProblemIdSet = {}
                if (options.pattern == 'all'){
                    errorProblemIdSet["SingleChoice"] = util.getCache("SingleChoiceErrorIdSet")
                    errorProblemIdSet["MultipleChoice"] = util.getCache("MultipleChoiceErrorIdSet")
                    errorProblemIdSet["Judgement"] = util.getCache("JudgementErrorIdSet")
                }
                else if (options.pattern == "recheck"){
                    errorProblemIdSet = JSON.parse(options.incorrectIdSet)
                }
                that.data.problem.problemList = data.getErrorProblemList(errorProblemIdSet)
                break
        }
        that.data.problem.problemListLength = that.data.problem.problemList.length
        if (that.data.problem.problemListLength == 0) {
            this.data.isFinish = true
        }
    },

    onUnload: function() {
        //保存错题id
        if (this.data.testType === "order" || this.data.testType === "rand"){
            data.addErrorProblemId(app.globalData.openid, this.data.subjectId, this.data.problem.record.incorrectIdSet)
        }
        else if (this.data.testType === "error"){
            data.reduceErrorProblemId(app.globalData.openid, this.data.subjectId, this.data.problem.record.correctIdSet)
        }
    },

    onShow: function() {
        //刷新页面
        this.setData(this.data)
    },


    goFinish: function () {
        var that = this
        var subjectId = that.data.subjectId
        var testType = that.data.testType
        var problem = that.data.problem
        var paramStr = "?param=" + encodeURIComponent(JSON.stringify({
            subjectId: subjectId,
            testType: testType,
            problem: problem,
        }));
        wx.redirectTo({
            url: "../result/result" + paramStr,

        });
    },

    canMove: function(direction) {
        var that = this
        if ((direction != 'left' && direction != 'right') || direction == 'left' && that.data.problem.currentNum >= that.data.problem.problemListLength - 1 || direction == 'right' && that.data.problem.currentNum <= 0) {
            return false
        } else {
            return true
        }
    },

    touchStart: function(e) {
        this.data.touchPoint.start.x = e.changedTouches[0].clientX
        this.data.touchPoint.start.y = e.changedTouches[0].clientY
        return
    },

    touchEnd: function(e) {
        this.data.touchPoint.end.x = e.changedTouches[0].clientX
        this.data.touchPoint.end.y = e.changedTouches[0].clientY
        this.switchPage()
        return
    },

    switchPage: function() {
        var that = this
        let direction = animation.getDirection(that.data.touchPoint.start, that.data.touchPoint.end)
        if (that.canMove(direction) === true && that.data.moving === false) {
            that.data.moving = true
            that.movePage(direction)
            that.data.moving = false
        }
    },

    movePage: function(direction) {
        var that = this
        let duration = 500
        var pageAnimation = animation.slideAnimation(direction, duration)
        that.data.animation = pageAnimation
        that.setData(that.data)
        if (direction == 'left') {
            that.data.problem.currentNum++
        } else if (direction == 'right') {
            that.data.problem.currentNum--
        }
        setTimeout(function() {
            that.data.animation = animation.resetAnimation()
            that.setData(that.data)
        }, duration)
    },

    hideProblemListLayer: function() {
        var that = this
        that.data.layer.layerAnimation = animation.slideProblemListLayer(that.data.layer.isShow)
        that.data.layer.isShow = false
        that.setData(that.data)
    },

    changeProblemListLayerState: function() {
        var that = this
        that.data.layer.layerAnimation = animation.slideProblemListLayer(that.data.layer.isShow)
        that.data.layer.isShow = !that.data.layer.isShow
        that.setData(that.data)
    },

    setCurrentProblem: function(e) {
        this.data.problem.currentNum = e.currentTarget.dataset.currentNum
        this.hideProblemListLayer()
    },

    selectItem: function(args) {
        var that = this
        let currentNum = args.target.dataset.currentNum
        let selectValue = args.target.dataset.value
        let curQuestion = that.data.problem.problemList[currentNum] //得到当前显示的考题
        let isLock = curQuestion.lockQuestion //锁住回答
        if (isLock) {
            return
        }
        let questionType = curQuestion.type
        let userSelect = curQuestion.userSelect || {}
        if (questionType === 'SingleChoice' || questionType === 'Judgement') { //如果是单选，则清空已经选的选项
            userSelect = {}
        }
        userSelect[selectValue] = userSelect[selectValue] ? "" : 'selected'
        curQuestion.userSelect = userSelect //构建userSelect对象
        that.setData(that.data)
    },


    getUserAnswerStr: function(curQuestion) {
        var userAnswerStr = ''
        let userSelect = curQuestion.userSelect
        //将用户选择的选项转换为字符串
        if (curQuestion.type == 'SingleChoice' || curQuestion.type == 'MultipleChoice') {
            let aStatus = userSelect['A'] === 'selected' ? "A" : ""
            let bStatus = userSelect['B'] === 'selected' ? "B" : ""
            let cStatus = userSelect['C'] === 'selected' ? "C" : ""
            let dStatus = userSelect['D'] === 'selected' ? "D" : ""
            userAnswerStr = aStatus + bStatus + cStatus + dStatus
        } else if (curQuestion.type == 'Judgement') {
            userAnswerStr = userSelect['right'] === 'selected' ? true : (userSelect['error'] === 'selected' ? false : "")
        }
        return userAnswerStr
    },

    answerMap: function(curQuestion) {
        let answer = curQuestion.answer
        var answerObj = {};
        if (curQuestion.type == 'SingleChoice' || curQuestion.type == 'MultipleChoice') {
            answerObj['A'] = (answer.indexOf("A") != -1) ? "correct" : "incorrect"
            answerObj['B'] = (answer.indexOf("B") != -1) ? "correct" : "incorrect"
            answerObj['C'] = (answer.indexOf("C") != -1) ? "correct" : "incorrect"
            answerObj['D'] = (answer.indexOf("D") != -1) ? "correct" : "incorrect"
        } else if (curQuestion.type == 'Judgement') {
            answerObj['right'] = curQuestion.answer === true ? "correct" : "incorrect"
            answerObj['error'] = curQuestion.answer === false ? "correct" : "incorrect"
        }
        return answerObj
    },

    doAnswer: function() {
        var that = this
        let currentNum = that.data.problem.currentNum
        let curQuestion = that.data.problem.problemList[currentNum]
        let isLock = curQuestion.lockQuestion
        let userAnswerStr = that.getUserAnswerStr(curQuestion)
        var judgeRes
        if (isLock || userAnswerStr === "") {
            return
        }
        if (userAnswerStr.length == 1 && curQuestion.type == "MultipleChoice"){
            util.alert({
                title: "至少选择两个答案"
            })
            return
        }
        //如果相同则表示正确，否则为错误
        if (userAnswerStr === curQuestion.answer) {
            judgeRes = true
            that.data.problem.record.right++
            if (that.data.problem.record.correctIdSet[curQuestion.type] === undefined) {
                that.data.problem.record.correctIdSet[curQuestion.type] = new Array()
            }
            that.data.problem.record.correctIdSet[curQuestion.type].push(curQuestion.id)
        } else {
            judgeRes = false
            that.data.problem.record.error++
            if (that.data.problem.record.incorrectIdSet[curQuestion.type] === undefined){
                that.data.problem.record.incorrectIdSet[curQuestion.type] = new Array()
            }
            that.data.problem.record.incorrectIdSet[curQuestion.type].push(curQuestion.id)
        }
        that.data.isFinish = true
        curQuestion.correctAnswerMap = that.answerMap(curQuestion)
        curQuestion.judgeRes = judgeRes
        curQuestion.showExplains = true
        curQuestion.lockQuestion = true
        that.data.problem.problemList[currentNum] = curQuestion
        that.setData(that.data)
        if (judgeRes === true) {
            setTimeout(function() {
                if (that.canMove('left') === true && that.data.moving === false) {
                    that.data.moving = true
                    that.movePage('left')
                    that.data.moving = false
                }
            }, 500)
        }
    },


})