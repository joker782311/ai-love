// pages/note-detail/note-detail.js
const app = getApp()

Page({
  data: {
    noteId: '',
    note: null,
    messages: [],
    messageInput: '',
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
          const messages = res.result.messages

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

  // 留言输入
  onMessageInput(e) {
    this.setData({
      messageInput: e.detail.value
    })
  },

  // 发送留言
  sendMessage() {
    const content = this.data.messageInput.trim()

    if (!content) {
      wx.showToast({
        title: '留言内容不能为空',
        icon: 'none'
      })
      return
    }

    wx.cloud.callFunction({
      name: 'createMessage',
      data: {
        noteId: this.data.noteId,
        content: content
      },
      success: res => {
        if (res.result.success) {
          this.setData({
            messageInput: ''
          })
          this.loadNoteDetail()
          wx.showToast({
            title: '留言成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: res.result.error || '留言失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('Send message error:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
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
            data: {
              noteId: this.data.noteId
            },
            success: res => {
              if (res.result.success) {
                wx.showToast({
                  title: '已删除',
                  icon: 'success'
                })
                setTimeout(() => wx.navigateBack(), 1500)
              } else {
                wx.showToast({
                  title: res.result.error || '删除失败',
                  icon: 'none'
                })
              }
            },
            fail: err => {
              console.error('Delete note error:', err)
              wx.showToast({
                title: '网络错误',
                icon: 'none'
              })
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

    wx.previewImage({
      current: images[index],
      urls: images
    })
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

    if (diff < minute) {
      return '刚刚'
    } else if (diff < hour) {
      return Math.floor(diff / minute) + '分钟前'
    } else if (diff < day) {
      return Math.floor(diff / hour) + '小时前'
    } else if (diff < 7 * day) {
      return Math.floor(diff / day) + '天前'
    } else {
      return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
  }
})
