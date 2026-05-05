// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'ai-love-xxx', // TODO: 替换为你的云环境 ID
        traceUser: true,
      })
    }

    this.globalData = {}
  },

  globalData: {
    userInfo: null,
    openid: null,
  }
})
