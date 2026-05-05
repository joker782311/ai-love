// pages/login/login.js
const app = getApp()

Page({
  data: {
    identity: '' // 'nini' | 'dandan' | ''
  },

  onLoad: function () {
    // 检查是否已经登录过
    if (app.globalData.userInfo) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  // 选择身份
  selectIdentity(e) {
    const identity = e.currentTarget.dataset.identity
    this.setData({ identity })
  },

  // 执行登录
  doLogin() {
    if (!this.data.identity) {
      wx.showToast({
        title: '请先选择身份',
        icon: 'none'
      })
      return
    }

    const nickName = this.data.identity === 'nini' ? '妮妮' : '蛋蛋'

    // 调用登录云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {
        identity: this.data.identity,
        nickName: nickName
      },
      success: res => {
        if (res.result.success) {
          app.globalData.userInfo = res.result.user
          app.globalData.openid = res.result.user._openid

          wx.showToast({
            title: `欢迎 ${nickName} ❤️`,
            icon: 'success'
          })

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.result.error || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('Login error:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  }
})
