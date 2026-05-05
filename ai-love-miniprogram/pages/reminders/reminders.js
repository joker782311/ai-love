// pages/reminders/reminders.js
const app = getApp()
const teochewPhrases = require('../../config/teochew-phrases.js')

Page({
  data: {
    receiverId: '', // 妮妮的 openid
    receiver2: '', // 蛋蛋的 openid（用于切换）
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
    // TODO: 从云数据库获取妮妮和蛋蛋的 openid
    // 这里先硬编码，后续从配置读取
    this.setData({
      receiverId: 'ovxxxxxxxxx1', // 妮妮的 openid
      receiver2: 'ovxxxxxxxxx2'   // 蛋蛋的 openid
    })

    this.loadHistory()
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
    const isScheduled = e.currentTarget.dataset.scheduled
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

    // 检查订阅状态
    wx.requestSubscribeMessage({
      tmplIds: ['YOUR_TEMPLATE_ID'], // TODO: 替换为实际模板 ID
      success: res => {
        if (res[Object.keys(res)[0]] === 'accept') {
          this.doSubmit()
        } else {
          wx.showToast({
            title: '需订阅消息才能接收提醒',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('Subscribe error:', err)
        wx.showToast({
          title: '订阅失败',
          icon: 'none'
        })
      }
    })
  },

  // 执行提交
  doSubmit() {
    this.setData({ submitting: true })

    wx.cloud.callFunction({
      name: 'createReminder',
      data: {
        receiverId: this.data.receiverId,
        content: this.data.customContent,
        type: this.data.isScheduled ? 'scheduled' : 'manual',
        scheduledTime: this.data.isScheduled ? this.data.scheduledTime : null
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
