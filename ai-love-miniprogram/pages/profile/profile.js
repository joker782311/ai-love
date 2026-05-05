// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    nickName: '',
    avatarUrl: '/images/default-avatar.png',
    openid: '',
    language: 'zh',
    languageText: '普通话'
  },

  onLoad: function () {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo

    if (userInfo) {
      this.setData({
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl || '/images/default-avatar.png',
        openid: userInfo._openid,
        language: userInfo.language || 'zh',
        languageText: userInfo.language === 'zh' ? '普通话' : '潮汕话'
      })
    } else {
      // 重新登录
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          if (res.result.success) {
            app.globalData.userInfo = res.result.user
            this.loadUserInfo()
          }
        }
      })
    }
  },

  // 切换语言
  toggleLanguage() {
    const newLanguage = this.data.language === 'zh' ? 'teochew' : 'zh'
    const languageText = newLanguage === 'zh' ? '普通话' : '潮汕话'

    this.setData({
      language: newLanguage,
      languageText: languageText
    })

    // TODO: 更新云数据库中的用户语言偏好
    wx.showToast({
      title: `已切换到${languageText}`,
      icon: 'success'
    })

    // 更新全局状态
    if (app.globalData.userInfo) {
      app.globalData.userInfo.language = newLanguage
    }
  },

  // 复制 OpenID
  copyOpenid() {
    wx.setClipboardData({
      data: this.data.openid,
      success: () => {
        wx.showToast({
          title: '已复制 OpenID',
          icon: 'success'
        })
      }
    })
  }
})
