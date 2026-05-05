// pages/reminders/reminders.js
const app = getApp()
const teochewPhrases = require('../../config/teochew-phrases.js')

Page({
  data: {
    receiverId: '', // 对方的 openid
    receiverNickName: '', // 对方昵称
    customContent: '',
    isScheduled: false,
    scheduledTime: '08:00',
    submitting: false,
    history: [],
    teochewTemplates: [
      { key: 'breakfast', teochew: '早，食早未？', chinese: '早餐吃了吗' },
      { key: 'lunch', teochew: '食饭未？', chinese: '吃饭了吗' },
      { key: 'dinner', teochew: '暗顿食未？', chinese: '晚餐吃了吗' },
      { key: 'sleep', teochew: '记得困早', chinese: '早点睡' },
      { key: 'water', teochew: '爱呷水', chinese: '多喝水' },
      { key: 'clothes', teochew: '记得加衫', chinese: '加衣服' },
      { key: 'miss', teochew: '想汝', chinese: '想你' },
      { key: 'love', teochew: '我爱你', chinese: '我爱你' }
    ]
  },

  onLoad: function () {
    this.getReceiverInfo()
    this.loadHistory()
  },

  // 获取接收人信息（从数据库获取对方）
  async getReceiverInfo() {
    const currentUserId = app.globalData.openid
    const currentIdentity = app.globalData.userInfo?.identity

    // 根据当前用户身份，确定接收人
    // 如果当前是妮妮，接收人就是蛋蛋；反之亦然
    const targetIdentity = currentIdentity === 'nini' ? 'dandan' : 'nini'

    try {
      const res = await wx.cloud.callFunction({
        name: 'login' // 复用 login 函数查询用户
      })

      if (res.result.success) {
        // 查询对方用户
        const db = wx.cloud.database()
        const userResult = await db.collection('users')
          .where({
            identity: targetIdentity
          })
          .get()

        if (userResult.data.length > 0) {
          const targetUser = userResult.data[0]
          this.setData({
            receiverId: targetUser._openid,
            receiverNickName: targetUser.nickName
          })
        }
      }
    } catch (err) {
      console.error('Get receiver error:', err)
      // 如果获取失败，使用默认值
      this.setData({
        receiverNickName: '对方'
      })
    }
  },

  // 选择快捷模板
  selectTemplate(e) {
    const content = e.currentTarget.dataset.content
    this.setData({
      customContent: content
    })
  },

  // 自定义输入
  onCustomInput(e) {
    this.setData({
      customContent: e.detail.value
    })
  },

  // 切换定时
  toggleSchedule(e) {
    const scheduledValue = e.currentTarget.dataset.scheduled
    // dataset 中的值可能是字符串或布尔值，需要兼容处理
    const isScheduled = (scheduledValue === true || scheduledValue === 'true')
    console.log('切换定时状态：', scheduledValue, typeof scheduledValue, '=>', isScheduled)
    this.setData({
      isScheduled: isScheduled
    })
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      scheduledTime: e.detail.value
    })
  },

  // 提交提醒
  submitReminder() {
    if (this.data.submitting) return

    const content = this.data.customContent.trim()
    if (!content) {
      wx.showToast({
        title: '请输入提醒内容',
        icon: 'none'
      })
      return
    }

    if (!this.data.receiverId) {
      wx.showToast({
        title: '获取接收人失败，请重试',
        icon: 'none'
      })
      return
    }

    // 请求订阅消息授权
    wx.requestSubscribeMessage({
      tmplIds: ['EC0i9nFMk7d4VSnWbHdtejQN8oVkDqSjNDowcIAy8dI'], // 订阅消息模板 ID
      success: res => {
        const tmplId = Object.keys(res)[0]
        if (res[tmplId] === 'accept') {
          // 用户同意订阅，发送提醒
          this.doSubmit()
        } else {
          // 用户拒绝，仍然保存提醒到数据库但不推送
          wx.showToast({
            title: '未订阅消息，提醒已保存',
            icon: 'none'
          })
          this.doSubmit(true) // 跳过推送
        }
      },
      fail: err => {
        console.error('Subscribe error:', err)
        // 订阅失败，仍然保存提醒到数据库
        this.doSubmit(true) // 跳过推送
      }
    })
  },

  // 执行提交
  doSubmit(skipPush = false) {
    this.setData({ submitting: true })

    wx.cloud.callFunction({
      name: 'createReminder',
      data: {
        receiverId: this.data.receiverId,
        content: this.data.customContent,
        type: this.data.isScheduled ? 'scheduled' : 'manual',
        scheduledTime: this.data.isScheduled ? this.data.scheduledTime : null,
        skipPush: skipPush // 是否跳过推送
      },
      success: res => {
        this.setData({ submitting: false })
        if (res.result.success) {
          wx.showToast({
            title: res.result.message,
            icon: 'success'
          })
          this.setData({ customContent: '' })
          this.loadHistory()
        } else {
          wx.showToast({
            title: res.result.error || '操作失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        this.setData({ submitting: false })
        console.error('Submit error:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  // 加载历史记录
  loadHistory() {
    wx.cloud.callFunction({
      name: 'getReminders',
      data: {
        senderId: app.globalData.openid
      },
      success: res => {
        if (res.result.success) {
          this.setData({
            history: res.result.reminders.map(r => ({
              ...r,
              createdAtStr: this.formatDate(r.createdAt)
            }))
          })
        }
      }
    })
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
})
