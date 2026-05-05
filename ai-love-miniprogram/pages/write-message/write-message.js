// pages/write-message/write-message.js
const app = getApp()

Page({
  data: {
    noteId: '',
    content: '',
    images: [],
    currentPaper: 'default',
    paperGradient: 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)',
    submitting: false,
    papers: [
      { value: 'default', name: '默认', gradient: 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)' },
      { value: 'love', name: '爱心', gradient: 'linear-gradient(135deg, #ffe6e6 0%, #fff0f0 100%)' },
      { value: 'star', name: '星星', gradient: 'linear-gradient(135deg, #fff8e6 0%, #fffbe6 100%)' },
      { value: 'blue', name: '天空', gradient: 'linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%)' },
      { value: 'green', name: '清新', gradient: 'linear-gradient(135deg, #e6ffe6 0%, #f0fff0 100%)' },
      { value: 'purple', name: '浪漫', gradient: 'linear-gradient(135deg, #f3e6ff 0%, #f8f0ff 100%)' }
    ]
  },

  onLoad: function (options) {
    if (options.noteId) {
      this.setData({ noteId: options.noteId })
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  // 选择信纸
  selectPaper(e) {
    const value = e.currentTarget.dataset.value
    const gradient = e.currentTarget.dataset.gradient

    this.setData({
      currentPaper: value,
      paperGradient: gradient
    })
  },

  // 内容输入
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 选择图片
  chooseImage() {
    const remaining = 3 - this.data.images.length

    wx.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    this.data.images.splice(index, 1)
    this.setData({
      images: this.data.images
    })
  },

  // 提交留言
  submitMessage() {
    if (this.data.submitting) return

    const content = this.data.content.trim()
    if (!content && this.data.images.length === 0) {
      wx.showToast({
        title: '请输入内容或选择图片',
        icon: 'none'
      })
      return
    }

    this.setData({ submitting: true })

    // 上传图片（如果有）
    if (this.data.images.length > 0) {
      this.uploadImages().then(imageUrls => {
        this.doSubmit(imageUrls)
      }).catch(() => {
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
        this.setData({ submitting: false })
      })
    } else {
      this.doSubmit([])
    }
  },

  // 上传图片
  async uploadImages() {
    const uploadPromises = this.data.images.map(path => {
      return wx.cloud.uploadFile({
        cloudPath: `messages/${Date.now()}_${Math.random()}.jpg`,
        filePath: path
      })
    })

    const results = await Promise.all(uploadPromises)
    return results.map(res => res.fileID)
  },

  // 执行提交
  doSubmit(imageUrls) {
    wx.cloud.callFunction({
      name: 'createMessage',
      data: {
        noteId: this.data.noteId,
        content: this.data.content.trim(),
        images: imageUrls,
        paperStyle: this.data.currentPaper
      },
      success: res => {
        this.setData({ submitting: false })
        if (res.result.success) {
          wx.showToast({
            title: '发送成功',
            icon: 'success'
          })
          setTimeout(() => wx.navigateBack(), 1500)
        } else {
          wx.showToast({
            title: res.result.error || '发送失败',
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
  }
})
