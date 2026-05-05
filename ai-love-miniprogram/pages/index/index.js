// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null
  },

  onLoad: function () {
    // 检查登录状态
    this.checkLogin()
  },

  // 检查登录状态
  async checkLogin() {
    const that = this

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      // 调用登录云函数
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          if (res.result.success) {
            app.globalData.userInfo = res.result.user
            app.globalData.openid = res.result.user._openid
            that.setData({
              userInfo: res.result.user
            })
            console.log('登录成功:', res.result.user)
          } else {
            console.error('登录失败:', res.result.error)
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'none'
            })
          }
        },
        fail: err => {
          console.error('登录请求失败:', err)
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
        }
      })
    }
  },

  // 跳转到笔记
  goToNotes() {
    wx.showToast({
      title: '笔记功能开发中...',
      icon: 'none'
    })
  },

  // 跳转到留言
  goToMessages() {
    wx.showToast({
      title: '留言功能开发中...',
      icon: 'none'
    })
  },

  // 跳转到提醒
  goToReminders() {
    wx.showToast({
      title: '提醒功能开发中...',
      icon: 'none'
    })
  },

  // 跳转到个人中心
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  }
})
