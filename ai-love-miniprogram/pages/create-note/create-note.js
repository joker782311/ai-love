// pages/create-note/create-note.js
const app = getApp()

Page({
  data: {
    editId: '',
    isEdit: false,
    category: 'thought',
    content: '',
    images: [],
    submitting: false
  },

  onLoad: function (options) {
    if (options.editId) {
      this.setData({
        editId: options.editId,
        isEdit: true
      })
      this.loadNoteForEdit()
    }
  },

  // 加载笔记用于编辑
  loadNoteForEdit() {
    wx.cloud.callFunction({
      name: 'getNoteDetail',
      data: {
        noteId: this.data.editId
      },
      success: res => {
        if (res.result.success) {
          const note = res.result.note
          this.setData({
            category: note.category,
            content: note.content,
            images: note.images || []
          })
        } else {
          wx.showToast({
            title: '加载笔记失败',
            icon: 'none'
          })
          setTimeout(() => wx.navigateBack(), 1500)
        }
      }
    })
  },

  // 选择分类
  selectCategory(e) {
    this.setData({
      category: e.currentTarget.dataset.category
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
    const remaining = 9 - this.data.images.length

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

  // 提交笔记
  submitNote() {
    if (this.data.submitting) return

    const content = this.data.content.trim()
    if (!content) {
      wx.showToast({
        title: '请输入笔记内容',
        icon: 'none'
      })
      return
    }

    this.setData({ submitting: true })

    const cloudFunction = this.data.isEdit ? 'updateNote' : 'createNote'
    const callData = {
      content: content,
      category: this.data.category
    }

    if (this.data.isEdit) {
      callData.noteId = this.data.editId
    }

    // 上传图片（如果有）
    if (this.data.images.length > 0) {
      this.uploadImages().then(imageUrls => {
        callData.images = imageUrls
        this.callSubmit(cloudFunction, callData)
      }).catch(() => {
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
        this.setData({ submitting: false })
      })
    } else {
      this.callSubmit(cloudFunction, callData)
    }
  },

  // 上传图片
  async uploadImages() {
    const uploadPromises = this.data.images.map(path => {
      return wx.cloud.uploadFile({
        cloudPath: `notes/${Date.now()}_${Math.random()}.jpg`,
        filePath: path
      })
    })

    const results = await Promise.all(uploadPromises)
    return results.map(res => res.fileID)
  },

  // 调用提交
  callSubmit(cloudFunction, data) {
    wx.cloud.callFunction({
      name: cloudFunction,
      data: data,
      success: res => {
        this.setData({ submitting: false })
        if (res.result.success) {
          wx.showToast({
            title: this.data.isEdit ? '保存成功' : '发表成功',
            icon: 'success'
          })
          setTimeout(() => wx.navigateBack(), 1500)
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
  }
})
