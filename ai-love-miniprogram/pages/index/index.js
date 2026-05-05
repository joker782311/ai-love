// pages/index/index.js
const app = getApp()

Page({
  data: {
    notes: [],
    currentCategory: 'all',
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad: function () {
    this.loadNotes()
  },

  onShow: function () {
    // 每次显示时刷新数据
    this.refreshNotes()
  },

  // 加载笔记列表
  async loadNotes(isRefresh = false) {
    if (this.data.loading) return

    this.setData({ loading: true })

    const { page, pageSize, currentCategory } = this.data

    wx.cloud.callFunction({
      name: 'getNotes',
      data: {
        page: page,
        pageSize: pageSize,
        category: currentCategory
      },
      success: res => {
        if (res.result.success) {
          const notes = res.result.notes.map(note => ({
            ...note,
            createdAtStr: this.formatDate(note.createdAt)
          }))

          this.setData({
            notes: isRefresh ? notes : this.data.notes.concat(notes),
            hasMore: res.result.hasMore,
            page: isRefresh ? 2 : this.data.page + 1,
            loading: false
          })
        } else {
          wx.showToast({
            title: res.result.error || '加载失败',
            icon: 'none'
          })
          this.setData({ loading: false })
        }
      },
      fail: err => {
        console.error('Load notes error:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    })
  },

  // 刷新笔记
  refreshNotes() {
    this.setData({
      page: 1,
      notes: [],
      hasMore: true
    })
    this.loadNotes(true)
  },

  // 切换分类
  changeCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      page: 1,
      notes: [],
      hasMore: true
    })
    this.loadNotes(true)
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadNotes()
    }
  },

  // 跳转到详情页
  goToDetail(e) {
    const noteId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/note-detail/note-detail?id=${noteId}`
    })
  },

  // 跳转到创建页
  goToCreate() {
    wx.navigateTo({
      url: '/pages/create-note/create-note'
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
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
  }
})
