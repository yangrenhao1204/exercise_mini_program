//获得手势方向
function getDirection(start, end) {
    let x = end.x - start.x
    let y = end.y - start.y
    let pi = 360 * Math.atan(y / x) / (2 * Math.PI)
    if (pi < 45 && pi > -45 && x > 0 && Math.abs(x) > 5) {
        return 'right'
    }
    else if (pi < 45 && pi > -45 && x < 0 && Math.abs(x) > 5) {
        return 'left'
    }
    else if ((pi < -45 || pi > 45) && y > 0 && Math.abs(y) > 5) {
        return 'down'
    }
    else if ((pi < -45 || pi > 45) && y < 0 && Math.abs(y) > 5) {
        return 'up'
    }
}

//页面左右滑动动画
function slideAnimation(direction, duration) {
    let pageAnimation = {}
    let previousPage = wx.createAnimation({
        duration: duration,
        timingFunction: 'ease',
    })
    let currentPage = wx.createAnimation({
        duration: duration,
        timingFunction: 'ease',
    })
    let posteriorPage = wx.createAnimation({
        duration: duration,
        timingFunction: 'ease',
    })
    if (direction == 'right') {
        previousPage.translate3d('0', 0, 0).step()
        currentPage.translate3d('100%', 0, 0).step()
    } 
    else if (direction == 'left') {
        currentPage.translate3d('-100%', 0, 0).step()
        posteriorPage.translate3d('0', 0, 0).step()
    }
    pageAnimation.previousPage = previousPage
    pageAnimation.currentPage = currentPage
    pageAnimation.posteriorPage = posteriorPage
    return pageAnimation
}

//重置页面动画
function resetAnimation() {
    let pageAnimation = {}
    let previousPage = wx.createAnimation({
        transformOrigin: '50% 50%',
        duration: 0,
        timingFunction: 'ease',
        delay: 0
    })
    let currentPage = wx.createAnimation({
        transformOrigin: '50% 50%',
        duration: 0,
        timingFunction: 'ease',
        delay: 0
    })
    let posteriorPage = wx.createAnimation({
        transformOrigin: '50% 50%',
        duration: 0,
        timingFunction: 'ease',
        delay: 0
    })
    previousPage.translate3d('-100%', 0, 0).step()
    currentPage.translate3d('0', 0, 0).step()
    posteriorPage.translate3d('100%', 0, 0).step()
    pageAnimation.previousPage = previousPage
    pageAnimation.currentPage = currentPage
    pageAnimation.posteriorPage = posteriorPage
    return pageAnimation
}


//题目选择层滑动动画
function slideProblemListLayer(isShow) {
    let layerAnimation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
    })
    if (isShow) {
        layerAnimation.translate3d(0, '100%', 0).step()
    } else {
        layerAnimation.translate3d(0, 0, 0).step()
    }
    return layerAnimation
}


module.exports = {
    getDirection,
    slideAnimation,
    resetAnimation,
    slideProblemListLayer,
}