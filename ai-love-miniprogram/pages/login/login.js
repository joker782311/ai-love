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
    console.log('开始登录，身份:', this.data.identity, '昵称:', nickName)

    // 调用登录云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {
        identity: this.data.identity,
        nickName: nickName
      },
      success: res => {
        console.log('云函数返回:', res)
        if (res.result.success) {
          app.globalData.userInfo = res.result.user
          app.globalData.openid = res.result.user._openid
          console.log('用户信息已保存:', app.globalData.userInfo)

          wx.showToast({
            title: `欢迎 ${nickName} ❤️`,
            icon: 'success'
          })

          setTimeout(() => {
            console.log('跳转到首页')
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }, 1500)
        } else {
          console.error('登录失败:', res.result.error)
          wx.showToast({
            title: res.result.error || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('Login error:', err)
        wx.showToast({
          title: '网络错误：' + (err.errMsg || ''),
          icon: 'none'
        })
      }
    })
  }
})
