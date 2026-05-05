# Phase 3: 留言（纸条）功能优化 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将留言功能优化为"纸条模式"，增加拆信封动效、信纸样式选择，提升互动仪式感

**Architecture:** 
- 留言列表以"小纸条"形式展示
- 新增"写纸条"页面，可选择信纸样式
- 拆信封动效使用 CSS 动画实现
- 云函数支持信纸样式存储和查询

**Tech Stack:** 
- 微信小程序原生框架
- CSS 动画实现交互动效
- 微信云开发（云数据库）

---

## File Structure

### 新增文件

```
ai-love-miniprogram/
├── cloud/
│   └── getMessages/       # 获取留言列表云函数（新增）
├── images/
│   ├── paper-default.png  # 默认信纸
│   ├── paper-love.png     # 爱心信纸
│   ├── paper-star.png     # 星星信纸
│   └── envelope.png       # 信封图标
└── pages/
    └── write-message/     # 写纸条页面（新增）
```

### 修改文件

- `pages/note-detail/note-detail.wxml` - 留言展示改为纸条模式
- `pages/note-detail/note-detail.wxss` - 增加拆信封动效样式

---

## Tasks

### Task 1: 创建获取留言云函数 - GetMessages

**Files:**
- Create: `ai-love-miniprogram/cloud/getMessages/index.js`
- Create: `ai-love-miniprogram/cloud/getMessages/package.json`
- Create: `ai-love-miniprogram/cloud/getMessages/config.json`

- [ ] **Step 1: 创建云函数入口 index.js**

```javascript
// cloud/getMessages/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { noteId } = event
  
  if (!noteId) {
    return {
      success: false,
      error: '笔记 ID 不能为空'
    }
  }
  
  try {
    // 获取留言列表
    const messagesResult = await db.collection('messages')
      .where({ noteId: noteId })
      .orderBy('createdAt', 'asc')
      .get()
    
    // 获取留言作者信息
    const authorIds = [...new Set(messagesResult.data.map(msg => msg.authorId))]
    const usersResult = await db.collection('users')
      .where({
        _openid: db.command.in(authorIds)
      })
      .field({
        _openid: true,
        nickName: true,
        avatarUrl: true
      })
      .get()
    
    const userMap = {}
    usersResult.data.forEach(user => {
      userMap[user._openid] = user
    })
    
    const messages = messagesResult.data.map(msg => ({
      ...msg,
      author: userMap[msg.authorId] || { nickName: '未知用户', avatarUrl: '' }
    }))
    
    return {
      success: true,
      messages: messages
    }
  } catch (err) {
    console.error('Get messages error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "getMessages",
  "version": "1.0.0",
  "description": "获取留言列表云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 3: 创建 config.json**

```json
{
  "permissions": {
    "openapi": []
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat(phase3): 创建 getMessages 云函数"
```

---

### Task 2: 上传并部署 GetMessages 云函数

- [ ] **Step 1: 上传云函数**

在微信开发者工具中：
1. 右键点击 `cloud/getMessages` → "上传并部署：云端安装依赖"

- [ ] **Step 2: 测试云函数**

在微信开发者工具控制台测试：
```javascript
wx.cloud.callFunction({
  name: 'getMessages',
  data: { noteId: 'test-note-id' }
})
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat(phase3): 部署 getMessages 云函数"
```

---

### Task 3: 创建写纸条页面

**Files:**
- Create: `ai-love-miniprogram/pages/write-message/write-message.js`
- Create: `ai-love-miniprogram/pages/write-message/write-message.wxml`
- Create: `ai-love-miniprogram/pages/write-message/write-message.wxss`
- Create: `ai-love-miniprogram/pages/write-message/write-message.json`

- [ ] **Step 1: 创建 write-message.json**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "写纸条"
}
```

- [ ] **Step 2: 创建 write-message.wxml**

```xml
<!--pages/write-message/write-message.wxml-->
<view class="container">
  <!-- 信纸选择 -->
  <view class="paper-section">
    <view class="section-title">选择信纸</view>
    <scroll-view scroll-x class="paper-scroll">
      <view class="paper-list">
        <view 
          wx:for="{{papers}}" 
          wx:key="value"
          class="paper-item {{currentPaper === item.value ? 'active' : ''}}"
          bindtap="selectPaper"
          data-value="{{item.value}}"
          data-gradient="{{item.gradient}}"
        >
          <view class="paper-preview" style="background: {{item.gradient}}"></view>
          <view class="paper-name">{{item.name}}</view>
        </view>
      </view>
    </scroll-view>
  </view>
  
  <!-- 内容输入 -->
  <view class="content-section card">
    <view class="preview-paper" style="background: {{paperGradient}}">
      <textarea
        class="content-textarea"
        placeholder="想对 TA 说些什么..."
        value="{{content}}"
        bindinput="onContentInput"
        maxlength="500"
        auto-height
      />
    </view>
  </view>
  
  <!-- 提交按钮 -->
  <view class="submit-section">
    <button class="submit-btn" bindtap="submitMessage" loading="{{submitting}}">
      发送纸条 💌
    </button>
  </view>
</view>
```

- [ ] **Step 3: 创建 write-message.wxss**

```wxss
/* pages/write-message/write-message.wxss */
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF3E0 0%, #FFE4E1 100%);
}

/* 信纸选择 */
.paper-section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.paper-scroll {
  white-space: nowrap;
}

.paper-list {
  display: inline-flex;
  gap: 16rpx;
}

.paper-item {
  display: inline-block;
  width: 140rpx;
  text-align: center;
}

.paper-preview {
  width: 140rpx;
  height: 100rpx;
  border-radius: 12rpx;
  border: 4rpx solid transparent;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.paper-item.active .paper-preview {
  border-color: #FF6B8A;
  transform: scale(1.05);
}

.paper-name {
  font-size: 24rpx;
  color: #666;
  margin-top: 8rpx;
}

/* 内容输入 */
.content-section {
  margin-bottom: 24rpx;
}

.preview-paper {
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.content-textarea {
  width: 100%;
  min-height: 300rpx;
  font-size: 30rpx;
  line-height: 1.8;
  background: transparent;
}

/* 提交按钮 */
.submit-section {
  padding: 20rpx;
}

.submit-btn {
  background: #FF6B8A;
  color: white;
  border-radius: 40rpx;
  font-size: 32rpx;
  padding: 20rpx;
}
```

- [ ] **Step 4: 创建 write-message.js**

```javascript
// pages/write-message/write-message.js
const app = getApp()

Page({
  data: {
    noteId: '',
    content: '',
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

  // 提交留言
  submitMessage() {
    if (this.data.submitting) return
    
    const content = this.data.content.trim()
    if (!content) {
      wx.showToast({
        title: '请输入留言内容',
        icon: 'none'
      })
      return
    }
    
    this.setData({ submitting: true })
    
    wx.cloud.callFunction({
      name: 'createMessage',
      data: {
        noteId: this.data.noteId,
        content: content,
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
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(phase3): 创建写纸条页面"
```

---

### Task 4: 改造笔记详情页为纸条模式

**Files:**
- Modify: `ai-love-miniprogram/pages/note-detail/note-detail.wxml`
- Modify: `ai-love-miniprogram/pages/note-detail/note-detail.wxss`
- Modify: `ai-love-miniprogram/pages/note-detail/note-detail.js`

- [ ] **Step 1: 修改 note-detail.wxml**

```xml
<!--pages/note-detail/note-detail.wxml-->
<view class="container">
  <!-- 笔记内容（保留原有结构） -->
  <view class="note-card card">
    <view class="note-header">
      <image class="note-avatar" src="{{note.author.avatarUrl}}" mode="aspectFill"></image>
      <view class="note-info">
        <view class="note-author">{{note.author.nickName}}</view>
        <view class="note-time">{{note.createdAtStr}}</view>
      </view>
      <view wx:if="{{isAuthor}}" class="note-actions">
        <view class="action-btn" bindtap="editNote">✏️</view>
        <view class="action-btn" bindtap="deleteNote">🗑️</view>
      </view>
    </view>
    
    <view class="note-content">{{note.content}}</view>
    
    <view wx:if="{{note.images && note.images.length > 0}}" class="note-images">
      <image 
        wx:for="{{note.images}}" 
        wx:key="*this"
        class="note-image"
        src="{{item}}"
        mode="aspectFill"
        bindtap="previewImage"
        data-index="{{index}}"
      ></image>
    </view>
    
    <view class="note-category-tag">
      <text wx:if="{{note.category === 'idea'}}">💡 想法</text>
      <text wx:if="{{note.category === 'thought'}}">💭 心情</text>
      <text wx:if="{{note.category === 'memory'}}">📸 回忆</text>
    </view>
  </view>
  
  <!-- 纸条留言区域 -->
  <view class="messages-section">
    <view class="messages-title">💌 纸条</view>
    
    <view wx:if="{{messages.length === 0}}" class="empty-messages">
      <view class="empty-envelope">📬</view>
      <view>暂无纸条，快来写第一张吧~</view>
    </view>
    
    <view wx:for="{{messages}}" wx:key="_id" class="message-wrapper">
      <view 
        class="message-card {{isOpened ? 'opened' : 'closed'}}"
        style="background: {{getPaperGradient(item.paperStyle)}}"
        bindtap="toggleMessage"
        data-index="{{index}}"
      >
        <!-- 信封/纸条内容 -->
        <view class="message-content-wrapper">
          <view wx:if="{{!isOpened}}" class="envelope-front">
            <view class="envelope-icon">💌</view>
            <view class="envelope-sender">{{item.author.nickName}}</view>
            <view class="envelope-hint">点击打开</view>
          </view>
          <view wx:if="{{isOpened}}" class="message-inner">
            <view class="message-header">
              <image class="message-avatar" src="{{item.author.avatarUrl}}" mode="aspectFill"></image>
              <view class="message-info">
                <view class="message-author">{{item.author.nickName}}</view>
                <view class="message-time">{{item.createdAtStr}}</view>
              </view>
            </view>
            <view class="message-content">{{item.content}}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
  
  <!-- 写纸条按钮 -->
  <view class="write-message-fab" bindtap="goToWriteMessage">
    <text>✍️</text>
  </view>
</view>
```

- [ ] **Step 2: 修改 note-detail.wxss**

```wxss
/* pages/note-detail/note-detail.wxss */
.container {
  padding: 20rpx;
  padding-bottom: 140rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF3E0 0%, #FFE4E1 100%);
}

/* 笔记卡片（保留原有样式） */
.note-card {
  margin-bottom: 24rpx;
}

.note-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.note-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.note-info {
  flex: 1;
}

.note-author {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.note-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.note-actions {
  display: flex;
}

.action-btn {
  padding: 8rpx 16rpx;
  font-size: 32rpx;
}

.note-content {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 16rpx;
  word-break: break-all;
}

.note-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.note-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
}

.note-category-tag {
  font-size: 24rpx;
  color: #999;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

/* 纸条留言区域 */
.messages-section {
  margin-top: 32rpx;
  margin-bottom: 60rpx;
}

.messages-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.empty-messages {
  text-align: center;
  padding: 80rpx 40rpx;
  background: white;
  border-radius: 16rpx;
  color: #999;
  font-size: 26rpx;
}

.empty-envelope {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

/* 纸条卡片 */
.message-wrapper {
  margin-bottom: 20rpx;
  perspective: 1000rpx;
}

.message-card {
  min-height: 200rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.4s ease;
}

.message-card.closed {
  transform: rotateY(0);
}

.message-card.opened {
  transform: rotateY(180deg);
}

.message-content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
}

/* 信封正面 */
.envelope-front {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  min-height: 200rpx;
  background: rgba(255, 255, 255, 0.9);
}

.envelope-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.envelope-sender {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.envelope-hint {
  font-size: 22rpx;
  color: #999;
}

/* 纸条内容 */
.message-inner {
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.95);
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.message-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.message-info {
  flex: 1;
}

.message-author {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.message-time {
  font-size: 20rpx;
  color: #999;
  margin-top: 4rpx;
}

.message-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  word-break: break-all;
}

/* 写纸条按钮 */
.write-message-fab {
  position: fixed;
  right: 40rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #FF6B8A;
  color: white;
  font-size: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 138, 0.4);
}
```

- [ ] **Step 3: 修改 note-detail.js**

```javascript
// pages/note-detail/note-detail.js
const app = getApp()

Page({
  data: {
    noteId: '',
    note: null,
    messages: [],
    openedMessages: {}, // 记录哪些纸条被打开了
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

  // 切换纸条打开/关闭状态
  toggleMessage(e) {
    const index = e.currentTarget.dataset.index
    const key = `openedMessages.${index}`
    
    this.setData({
      [key]: !this.data.openedMessages[index]
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

  // 编辑笔记（保留原有逻辑）
  editNote() {
    wx.navigateTo({
      url: `/pages/create-note/create-note?editId=${this.data.noteId}`
    })
  },

  // 删除笔记（保留原有逻辑）
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

  // 预览图片（保留原有逻辑）
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.note.images
    wx.previewImage({ current: images[index], urls: images })
  },

  // 格式化日期（保留原有逻辑）
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
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat(phase3): 改造笔记详情页为纸条模式"
```

---

### Task 5: 配置 tabBar 并更新 app.json

**Files:**
- Modify: `ai-love-miniprogram/app.json`

- [ ] **Step 1: 更新 app.json 添加 write-message 页面**

```json
{
  "pages": [
    "pages/index/index",
    "pages/note-detail/note-detail",
    "pages/create-note/create-note",
    "pages/write-message/write-message",
    "pages/profile/profile"
  ],
  "window": {
    "backgroundColor": "#FFF3E0",
    "navigationBarTitleText": "妮妮的恋爱小馆",
    "navigationBarBackgroundColor": "#FF6B8A",
    "navigationBarTextStyle": "white"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#FF6B8A",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "笔记",
        "iconPath": "images/note-icon.png",
        "selectedIconPath": "images/note-icon-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "images/profile-icon.png",
        "selectedIconPath": "images/profile-icon-active.png"
      }
    ]
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

> 注意：需要准备 tabBar 图标文件（可使用在线工具生成或临时用占位图）

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "feat(phase3): 更新 app.json 配置"
```

---

### Task 6: 测试纸条模式

- [ ] **Step 1: 编译并预览**

在微信开发者工具中：
1. 点击"编译"
2. 确保没有报错

- [ ] **Step 2: 测试纸条功能**

1. 创建一篇笔记
2. 进入详情页
3. 点击"写纸条"按钮
4. 选择信纸样式
5. 输入内容并发送
6. 点击查看纸条（拆信封动效）

- [ ] **Step 3: 验证不同信纸样式**

1. 发送 6 张不同信纸的纸条
2. 验证信纸样式正确显示

- [ ] **Step 4: 提交最终代码**

```bash
git add -A
git commit -m "feat(phase3): Phase 3 完成 - 纸条模式优化"
```

---

## Phase 3 验收标准

- [ ] 纸条列表以"信封"形式展示
- [ ] 点击纸条有"拆信封"的交互动效
- [ ] 写纸条时可以选择信纸样式（6 种）
- [ ] 不同信纸样式正确显示不同渐变背景
- [ ] 纸条模式体验流畅

---

## 下一步

Phase 3 完成后，进入 **Phase 4: 提醒功能（定时 + 手动）**
