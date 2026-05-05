// pages/profile/profile.js
const app = getApp()
const translations = require('../../config/translations.js')

Page({
  data: {
    nickName: '',
    avatarUrl: '/images/default-avatar.png',
    openid: '',
    language: 'zh',
    languageText: '普通话',
    t: translations.profile // 当前页面的翻译
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
      this.updateTranslations(userInfo.language || 'zh')
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

  // 更新翻译
  updateTranslations(language) {
    const t = {}
    Object.keys(translations).forEach(key => {
      if (typeof translations[key] === 'object') {
        t[key] = translations[key][language] || translations[key].zh
      }
    })
    this.setData({ t, language })
  },

  // 切换语言
  toggleLanguage() {
    const newLanguage = this.data.language === 'zh' ? 'teochew' : 'zh'
    const languageText = newLanguage === 'zh' ? '普通话' : '潮汕话'

    // 更新到云数据库
    wx.cloud.callFunction({
      name: 'updateUserSettings',
      data: {
        language: newLanguage
      },
      success: res => {
        if (res.result.success) {
          this.setData({
            language: newLanguage,
            languageText: languageText
          })
          this.updateTranslations(newLanguage)

          // 更新全局状态
          if (app.globalData.userInfo) {
            app.globalData.userInfo.language = newLanguage
          }

          wx.showToast({
            title: `已切换到${languageText}`,
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: res.result.error || '切换失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('Update language error:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到潮汕话学习
  goToTeochewLearn() {
    wx.navigateTo({
      url: '/pages/teochew-learn/teochew-learn'
    })
  },

  // 复制 OpenID
  copyOpenid() {
    wx.setClipboardData({
      data: this.data.openid,
      success: () => {
        wx.showToast({
          title: this.data.t.profile.copied || '已复制 OpenID',
          icon: 'success'
        })
      }
    })
  }
})
