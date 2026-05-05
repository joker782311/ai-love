// pages/login/login.js
const app = getApp()

Page({
  data: {
    identity: '',
    needsIdentity: false,
    loading: true
  },

  onLoad: function () {
    // 检查登录状态和是否需要选择身份
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        if (res.result.success) {
          const user = res.result.user

          // 如果已设置身份，直接跳转到首页
          if (!res.result.needsIdentity && user.identity) {
            app.globalData.userInfo = user
            app.globalData.openid = user._openid

            wx.reLaunch({
              url: '/pages/index/index'
            })
          } else {
            // 需要选择身份（新用户或老用户未设置身份）
            this.setData({
              needsIdentity: true,
              loading: false
            })
          }
        } else {
          console.error('检查登录状态失败:', res.result.error)
          this.setData({ loading: false })
        }
      },
      fail: err => {
        console.error('检查登录状态失败:', err)
        this.setData({ loading: false })
      }
    })
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
