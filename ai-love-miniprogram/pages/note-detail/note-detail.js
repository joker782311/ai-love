// pages/note-detail/note-detail.js
const app = getApp()

Page({
  data: {
    noteId: '',
    note: null,
    messages: [],
    openedMessages: [], // 记录哪些纸条被打开了（数组更可靠）
    isAuthor: false
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ noteId: options.id })
      this.loadNoteDetail()
    } else {
      wx.showToast({
        title: '笔记不存在',
        icon: 'none'
      })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  // 加载笔记详情
  async loadNoteDetail() {
    wx.cloud.callFunction({
      name: 'getNoteDetail',
      data: {
        noteId: this.data.noteId
      },
      success: res => {
        if (res.result.success) {
          const note = res.result.note
          const messages = res.result.messages || []

          this.setData({
            note: {
              ...note,
              createdAtStr: this.formatDate(note.createdAt)
            },
            messages: messages.map(msg => ({
              ...msg,
              createdAtStr: this.formatDate(msg.createdAt)
            })),
            isAuthor: note.authorId === app.globalData.openid
          })
        } else {
          wx.showToast({
            title: res.result.error || '加载失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('Load note detail error:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  // 切换纸条打开/关闭状态
  toggleMessage(e) {
    const index = e.currentTarget.dataset.index
    const opened = this.data.openedMessages[index] || false

    // 创建新数组，避免直接修改原数组
    const newOpened = [...this.data.openedMessages]
    newOpened[index] = !opened

    this.setData({
      openedMessages: newOpened
    })
  },

  // 获取信纸渐变
  getPaperGradient(paperStyle) {
    const gradients = {
      'default': 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)',
      'love': 'linear-gradient(135deg, #ffe6e6 0%, #fff0f0 100%)',
      'star': 'linear-gradient(135deg, #fff8e6 0%, #fffbe6 100%)',
      'blue': 'linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%)',
      'green': 'linear-gradient(135deg, #e6ffe6 0%, #f0fff0 100%)',
      'purple': 'linear-gradient(135deg, #f3e6ff 0%, #f8f0ff 100%)'
    }
    return gradients[paperStyle] || gradients.default
  },

  // 跳转到写纸条
  goToWriteMessage() {
    wx.navigateTo({
      url: `/pages/write-message/write-message?noteId=${this.data.noteId}`
    })
  },

  // 编辑笔记
  editNote() {
    wx.navigateTo({
      url: `/pages/create-note/create-note?editId=${this.data.noteId}`
    })
  },

  // 删除笔记
  deleteNote() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这篇笔记吗？',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'deleteNote',
            data: { noteId: this.data.noteId },
            success: res => {
              if (res.result.success) {
                wx.showToast({ title: '已删除', icon: 'success' })
                setTimeout(() => wx.navigateBack(), 1500)
              }
            }
          })
        }
      }
    })
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.note.images
    wx.previewImage({ current: images[index], urls: images })
  },

  // 预览纸条图片
  previewMessageImage(e) {
    const messageIndex = e.currentTarget.dataset.messageIndex
    const images = this.data.messages[messageIndex].images
    wx.previewImage({ current: images[0], urls: images })
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < minute) return '刚刚'
    else if (diff < hour) return Math.floor(diff / minute) + '分钟前'
    else if (diff < day) return Math.floor(diff / hour) + '小时前'
    else if (diff < 7 * day) return Math.floor(diff / day) + '天前'
    else return `${date.getMonth() + 1}/${date.getDate()}`
  }
})
