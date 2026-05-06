// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-d9gum5alw05f9ed63',
        traceUser: true,
      })
    }

    this.globalData = {
      userInfo: null,
      openid: null,
    }

    // 检查并发送到期的定时提醒
    this.checkScheduledReminders()
  },

  onShow: function () {
    // 每次进入小程序都检查并发送到期的定时提醒
    this.checkScheduledReminders()
  },

  // 检查登录状态
  checkLogin() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo)
        return
      }

      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          if (res.result.success) {
            this.globalData.userInfo = res.result.user
            this.globalData.openid = res.result.user._openid
            resolve(res.result.user)
          } else {
            reject(res.result.error)
          }
        },
        fail: reject
      })
    })
  },

  // 检查并发送到期的定时提醒
  checkScheduledReminders() {
    wx.cloud.callFunction({
      name: 'checkAndSendReminders',
      success: res => {
        if (res.result.success && res.result.count > 0) {
          wx.showToast({
            title: `有${res.result.count}条提醒`,
            icon: 'none'
          })
        }
      }
    })
  }
})
