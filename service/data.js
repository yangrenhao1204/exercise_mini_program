const api = require('api.js');
const util = require('../common/js/util.js');

function getSubjectList() {
    wx.request({
        url: api.getSubjectList,
        method: 'GET',
        success: function(res) {
            if (res.statusCode == 200) {
                util.setCache('subjectList', res.data)
            }
        }
    });
}

function getSubjectNameById(subjectId) {
    if (subjectId != null) {
        var subjectList = util.getCache('subjectList')
        for (var i = 0; i < subjectList.length; i++) {
            if (subjectList[i].id == subjectId) {
                return subjectList[i].name
            }
        }
    }
    return null
}

function getChapterListBySubjectId(subjectId) {
    wx.request({
        url: api.getChapterList,
        method: 'POST',
        header: {
            'content-type': 'application/json',
        },
        data: {
            'subject_id': subjectId,
        },
        success: function(res) {
            if (res.statusCode == 200) {
                util.setCache('chapterList', res.data)
            }
        }
    });
}

function createProblemIdMap(problemList) {
    var map = {}
    var length = problemList.length
    for (var i = 0; i < length; i++) {
        map[problemList[i].id] = i
    }
    return map
}

function getProblemListBySubjectId(subjectId) {
    wx.request({
        url: api.getProblemList,
        method: 'POST',
        header: {
            'content-type': 'application/json',
        },
        data: {
            'subject_id': subjectId,
        },
        success: function(res) {
            if (res.statusCode == 200) {
                util.setCache('SingleChoice', res.data["SingleChoice"])
                util.setCache('MultipleChoice', res.data["MultipleChoice"])
                util.setCache('Judgement', res.data["Judgement"])
                util.setCache('SingleChoiceIdMap', createProblemIdMap(res.data["SingleChoice"]))
                util.setCache('MultipleChoiceIdMap', createProblemIdMap(res.data["MultipleChoice"]))
                util.setCache('JudgementIdMap', createProblemIdMap(res.data["Judgement"]))
            }
        }
    });
}

function getArticleBychapterId(chapterId, callback){
    //请求markdown文件，并转换为内容
    wx.request({
        url: api.getArticle,
        method: 'POST',
        header: {
            'content-type': 'application/json',
        },
        data: {
            'chapter_id': chapterId,
        },
        success: (res) => {
            //将markdown内容转换为towxml数据
            if (res.data != null && typeof callback === 'function'){
                callback(res.data)
            }
        }
    });
}

function getChapterProblems(type, chapterId) {
    var problems = []
    var problemList = util.getCache(type)
    for (var i = 0; i < problemList.length; i++) {
        if (problemList[i].chapter_id == chapterId)
            problems.push(problemList[i])
    }
    return problems
}

function getChapterProblemListById(chapterId) {
    var singleChoice_list = getChapterProblems('SingleChoice', chapterId)
    var multipleChoice_list = getChapterProblems('MultipleChoice', chapterId)
    var judgement_list = getChapterProblems('Judgement', chapterId)
    var problemList = [...singleChoice_list, ...multipleChoice_list, ...judgement_list]
    return problemList
}

function getRandomProblems(type, number) {
    var problems = []
    var problemList = util.getCache(type)
    if (problemList.length != 0){
        var arr = util.getRandNumForRange(0, problemList.length, number)
        for (var i = 0; i < number; i++) {
            problems.push(problemList[arr[i]])
        }
    }
    return problems
}

function getRandomProblemList() {
    var singleChoice_list = getRandomProblems('SingleChoice', 10)
    var multipleChoice_list = getRandomProblems('MultipleChoice', 5)
    var judgement_list = getRandomProblems('Judgement', 5)
    var problemList = [...singleChoice_list, ...multipleChoice_list, ...judgement_list]
    return problemList
}

function getErrorProblemIdSet(openid, subjectId) {
    util.setCache('SingleChoiceErrorIdSet', [])
    util.setCache('MultipleChoiceErrorIdSet', [])
    util.setCache("JudgementErrorIdSet", [])
    wx.request({
        url: api.getErrorProblemIdSet,
        method: 'POST',
        header: {
            'content-type': 'application/json',
        },
        data: {
            'openid': openid,
            'subject_id': subjectId
        },
        success: function(res) {
            for (var i = 0, len = res.data.length; i < len; i++) {
                var temp = res.data[i]
                var name = temp.type + 'ErrorIdSet'
                util.setCache(name, temp.problem_list)
            }
        }
    });
}

function getProblemListByTypeAndIdList(type, list) {
    if(list == []){
        return
    }
    var problems = []
    var problemList = util.getCache(type)
    var map = util.getCache(type + 'IdMap')
    for (var i in list) {
        problems.push(problemList[map[list[i]]])
    }
    return problems
}

function getErrorProblemList(errorProblemIdSet) {
    var singleChoice_list = getProblemListByTypeAndIdList('SingleChoice', errorProblemIdSet['SingleChoice'])
    var multipleChoice_list = getProblemListByTypeAndIdList('MultipleChoice', errorProblemIdSet["MultipleChoice"])
    var judgement_list = getProblemListByTypeAndIdList('Judgement', errorProblemIdSet["Judgement"])
    var problemList = [...singleChoice_list, ...multipleChoice_list, ...judgement_list]
    return problemList
}

function addErrorProblemIdByTypeAndIdList(type, list) {
    if (list == null) {
        return
    }
    var name = type + "ErrorIdSet"
    if (util.getCache(name) != undefined) {
        list = list.concat(util.getCache(name));
    }
    util.setCache(name, Array.from(new Set(list)));
}

function addErrorProblemId(openid, subjectId, incorrectIdSet) {
    addErrorProblemIdByTypeAndIdList("SingleChoice", incorrectIdSet["SingleChoice"])
    addErrorProblemIdByTypeAndIdList("MultipleChoice", incorrectIdSet["MultipleChoice"])
    addErrorProblemIdByTypeAndIdList("Judgement", incorrectIdSet["Judgement"])
    saveErrorProblemIdSet(openid, subjectId)
}

function reduceErrorProblemIdByTypeAndIdList(type, list) {
    if (list == null) {
        return
    }
    var name = type + "ErrorIdSet"
    var res = [];
    var temp = util.getCache(name)
    if (temp != undefined) {
        for (var i = 0, len = temp.length; i < len; i++) {
            if (list.indexOf(temp[i]) < 0) {
                res.push(temp[i]);
            }
        }
    }
    util.setCache(name, res);
}

function reduceErrorProblemId(openid, subjectId, correctIdSet) {
    reduceErrorProblemIdByTypeAndIdList("SingleChoice", correctIdSet["SingleChoice"])
    reduceErrorProblemIdByTypeAndIdList("MultipleChoice", correctIdSet["MultipleChoice"])
    reduceErrorProblemIdByTypeAndIdList("Judgement", correctIdSet["Judgement"])
    saveErrorProblemIdSet(openid, subjectId)
}

function saveErrorProblemIdSet(openid, subjectId) {
    var incorrectIdSet = {
        "SingleChoice": util.getCache("SingleChoiceErrorIdSet"),
        "MultipleChoice": util.getCache("MultipleChoiceErrorIdSet"),
        "Judgement": util.getCache("JudgementErrorIdSet"),
    }
    wx.request({
        url: api.saveErrorProblemIdSet,
        method: 'POST',
        header: {
            'content-type': 'application/json',
        },
        data: {
            'openid': openid,
            'subject_id': subjectId,
            'incorrectIdSet': incorrectIdSet,
        },
        success: function(res) {
        }
    });
}


module.exports = {
    getSubjectList,
    getSubjectNameById,
    getChapterListBySubjectId,
    getProblemListBySubjectId,
    getArticleBychapterId,
    getChapterProblemListById,
    getRandomProblemList,
    getErrorProblemIdSet,
    getErrorProblemList,
    addErrorProblemId,
    reduceErrorProblemId,
}