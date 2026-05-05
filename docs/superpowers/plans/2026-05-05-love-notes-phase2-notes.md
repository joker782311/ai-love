# Phase 2: 笔记 CRUD 功能 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现笔记的创建、查看、编辑、删除功能，以及笔记列表展示

**Architecture:** 
- 笔记列表页展示所有笔记（时间线排序）
- 笔记详情页展示单篇笔记及留言
- 创建/编辑笔记使用独立页面
- 云函数处理笔记的 CRUD 操作

**Tech Stack:** 
- 微信小程序原生框架
- 微信云开发（云数据库）
- 云函数处理数据逻辑

---

## File Structure

### 新增文件

```
ai-love-miniprogram/
├── cloud/
│   ├── login/
│   ├── createNote/        # 创建笔记云函数
│   ├── getNotes/          # 获取笔记列表云函数
│   ├── getNoteDetail/     # 获取笔记详情云函数
│   ├── updateNote/        # 更新笔记云函数
│   └── deleteNote/        # 删除笔记云函数
├── images/
│   └── default-avatar.png
└── pages/
    ├── index/             # 首页（修改为笔记列表）
    ├── note-detail/       # 笔记详情页
    └── create-note/       # 创建/编辑笔记页
```

### 数据库集合

- `notes` - 笔记集合（新增）

---

## Tasks

### Task 1: 创建笔记云函数 - CreateNote

**Files:**
- Create: `ai-love-miniprogram/cloud/createNote/index.js`
- Create: `ai-love-miniprogram/cloud/createNote/package.json`
- Create: `ai-love-miniprogram/cloud/createNote/config.json`

- [ ] **Step 1: 创建云函数入口 index.js**

```javascript
// cloud/createNote/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  
  const { content, images, category } = event
  
  // 参数校验
  if (!content || content.trim() === '') {
    return {
      success: false,
      error: '笔记内容不能为空'
    }
  }
  
  try {
    const result = await db.collection('notes').add({
      data: {
        authorId: OPENID,
        content: content.trim(),
        images: images || [],
        category: category || 'thought', // 'idea' | 'thought' | 'memory'
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })
    
    return {
      success: true,
      noteId: result._id,
      message: '笔记创建成功'
    }
  } catch (err) {
    console.error('Create note error:', err)
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
  "name": "createNote",
  "version": "1.0.0",
  "description": "创建笔记云函数",
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
git commit -m "feat(phase2): 创建 createNote 云函数"
```

---

### Task 2: 创建笔记云函数 - GetNotes

**Files:**
- Create: `ai-love-miniprogram/cloud/getNotes/index.js`
- Create: `ai-love-miniprogram/cloud/getNotes/package.json`
- Create: `ai-love-miniprogram/cloud/getNotes/config.json`

- [ ] **Step 1: 创建云函数入口 index.js**

```javascript
// cloud/getNotes/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 10, category } = event
  
  try {
    const dbQuery = db.collection('notes')
      .orderBy('createdAt', 'desc')
    
    // 按分类筛选
    if (category && category !== 'all') {
      dbQuery.where({ category: category })
    }
    
    // 分页
    const skipCount = (page - 1) * pageSize
    const notesResult = await dbQuery
      .skip(skipCount)
      .limit(pageSize)
      .get()
    
    // 获取作者信息
    const authorIds = [...new Set(notesResult.data.map(note => note.authorId))]
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
    
    // 合并作者信息
    const notes = notesResult.data.map(note => ({
      ...note,
      author: userMap[note.authorId] || { nickName: '未知用户', avatarUrl: '' }
    }))
    
    return {
      success: true,
      notes: notes,
      hasMore: notesResult.data.length === pageSize
    }
  } catch (err) {
    console.error('Get notes error:', err)
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
  "name": "getNotes",
  "version": "1.0.0",
  "description": "获取笔记列表云函数",
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
git commit -m "feat(phase2): 创建 getNotes 云函数"
```

---

### Task 3: 创建笔记云函数 - GetNoteDetail

**Files:**
- Create: `ai-love-miniprogram/cloud/getNoteDetail/index.js`
- Create: `ai-love-miniprogram/cloud/getNoteDetail/package.json`
- Create: `ai-love-miniprogram/cloud/getNoteDetail/config.json`

- [ ] **Step 1: 创建云函数入口 index.js**

```javascript
// cloud/getNoteDetail/index.js
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
    // 获取笔记详情
    const noteResult = await db.collection('notes')
      .doc(noteId)
      .get()
    
    if (!noteResult.data) {
      return {
        success: false,
        error: '笔记不存在'
      }
    }
    
    // 获取作者信息
    const userResult = await db.collection('users')
      .where({ _openid: noteResult.data.authorId })
      .field({
        _openid: true,
        nickName: true,
        avatarUrl: true
      })
      .get()
    
    const author = userResult.data[0] || { nickName: '未知用户', avatarUrl: '' }
    
    // 获取留言列表
    const messagesResult = await db.collection('messages')
      .where({ noteId: noteId })
      .orderBy('createdAt', 'asc')
      .get()
    
    // 获取留言作者信息
    const messageAuthorIds = [...new Set(messagesResult.data.map(msg => msg.authorId))]
    const msgUsersResult = await db.collection('users')
      .where({
        _openid: db.command.in(messageAuthorIds)
      })
      .field({
        _openid: true,
        nickName: true,
        avatarUrl: true
      })
      .get()
    
    const msgUserMap = {}
    msgUsersResult.data.forEach(user => {
      msgUserMap[user._openid] = user
    })
    
    const messages = messagesResult.data.map(msg => ({
      ...msg,
      author: msgUserMap[msg.authorId] || { nickName: '未知用户', avatarUrl: '' }
    }))
    
    return {
      success: true,
      note: {
        ...noteResult.data,
        author: author
      },
      messages: messages
    }
  } catch (err) {
    console.error('Get note detail error:', err)
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
  "name": "getNoteDetail",
  "version": "1.0.0",
  "description": "获取笔记详情云函数",
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
git commit -m "feat(phase2): 创建 getNoteDetail 云函数"
```

---

### Task 4: 创建笔记云函数 - UpdateNote 和 DeleteNote

**Files:**
- Create: `ai-love-miniprogram/cloud/updateNote/index.js`
- Create: `ai-love-miniprogram/cloud/updateNote/package.json`
- Create: `ai-love-miniprogram/cloud/updateNote/config.json`
- Create: `ai-love-miniprogram/cloud/deleteNote/index.js`
- Create: `ai-love-miniprogram/cloud/deleteNote/package.json`
- Create: `ai-love-miniprogram/cloud/deleteNote/config.json`

- [ ] **Step 1: 创建 updateNote 云函数 index.js**

```javascript
// cloud/updateNote/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  
  const { noteId, content, images, category } = event
  
  if (!noteId) {
    return {
      success: false,
      error: '笔记 ID 不能为空'
    }
  }
  
  try {
    // 验证作者权限
    const note = await db.collection('notes').doc(noteId).get()
    
    if (note.data.authorId !== OPENID) {
      return {
        success: false,
        error: '无权限修改此笔记'
      }
    }
    
    // 更新笔记
    const updateData = {
      updatedAt: db.serverDate()
    }
    
    if (content !== undefined) {
      updateData.content = content.trim()
    }
    if (images !== undefined) {
      updateData.images = images
    }
    if (category !== undefined) {
      updateData.category = category
    }
    
    await db.collection('notes')
      .doc(noteId)
      .update({
        data: updateData
      })
    
    return {
      success: true,
      message: '笔记更新成功'
    }
  } catch (err) {
    console.error('Update note error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
```

- [ ] **Step 2: 创建 updateNote package.json 和 config.json**

```json
{
  "name": "updateNote",
  "version": "1.0.0",
  "description": "更新笔记云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

```json
{
  "permissions": {
    "openapi": []
  }
}
```

- [ ] **Step 3: 创建 deleteNote 云函数 index.js**

```javascript
// cloud/deleteNote/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  
  const { noteId } = event
  
  if (!noteId) {
    return {
      success: false,
      error: '笔记 ID 不能为空'
    }
  }
  
  try {
    // 验证作者权限
    const note = await db.collection('notes').doc(noteId).get()
    
    if (note.data.authorId !== OPENID) {
      return {
        success: false,
        error: '无权限删除此笔记'
      }
    }
    
    // 删除笔记
    await db.collection('notes')
      .doc(noteId)
      .remove()
    
    return {
      success: true,
      message: '笔记删除成功'
    }
  } catch (err) {
    console.error('Delete note error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
```

- [ ] **Step 4: 创建 deleteNote package.json 和 config.json**

```json
{
  "name": "deleteNote",
  "version": "1.0.0",
  "description": "删除笔记云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

```json
{
  "permissions": {
    "openapi": []
  }
}
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(phase2): 创建 updateNote 和 deleteNote 云函数"
```

---

### Task 5: 创建笔记集合并设置权限

**Files:** (无代码文件，小程序控制台操作)

- [ ] **Step 1: 创建 notes 集合**

在微信开发者工具云开发控制台：
1. 点击"数据库"
2. 点击"添加集合"
3. 输入集合名称：`notes`
4. 点击确定

- [ ] **Step 2: 设置数据库权限**

在 `notes` 集合的"权限设置"中：
```json
{
  "read": true,
  "write": "auth.openid == doc._openid"
}
```

- [ ] **Step 3: 上传并部署所有云函数**

在微信开发者工具中：
1. 右键点击 `cloud/createNote` → "上传并部署：云端安装依赖"
2. 右键点击 `cloud/getNotes` → "上传并部署：云端安装依赖"
3. 右键点击 `cloud/getNoteDetail` → "上传并部署：云端安装依赖"
4. 右键点击 `cloud/updateNote` → "上传并部署：云端安装依赖"
5. 右键点击 `cloud/deleteNote` → "上传并部署：云端安装依赖"

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat(phase2): 配置笔记数据库集合"
```

---

### Task 6: 改造首页为笔记列表页

**Files:**
- Modify: `ai-love-miniprogram/pages/index/index.wxml`
- Modify: `ai-love-miniprogram/pages/index/index.wxss`
- Modify: `ai-love-miniprogram/pages/index/index.js`
- Modify: `ai-love-miniprogram/app.json`

- [ ] **Step 1: 修改 app.json 导航栏标题**

```json
{
  "pages": [
    "pages/index/index",
    "pages/profile/profile",
    "pages/note-detail/note-detail",
    "pages/create-note/create-note"
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

- [ ] **Step 2: 修改 index.wxml**

```xml
<!--pages/index/index.wxml-->
<view class="container">
  <!-- 分类筛选 -->
  <view class="filter-section">
    <scroll-view scroll-x class="filter-scroll">
      <view 
        class="filter-item {{currentCategory === 'all' ? 'active' : ''}}"
        bindtap="changeCategory"
        data-category="all"
      >全部</view>
      <view 
        class="filter-item {{currentCategory === 'idea' ? 'active' : ''}}"
        bindtap="changeCategory"
        data-category="idea"
      >💡 想法</view>
      <view 
        class="filter-item {{currentCategory === 'thought' ? 'active' : ''}}"
        bindtap="changeCategory"
        data-category="thought"
      >💭 心情</view>
      <view 
        class="filter-item {{currentCategory === 'memory' ? 'active' : ''}}"
        bindtap="changeCategory"
        data-category="memory"
      >📸 回忆</view>
    </scroll-view>
  </view>
  
  <!-- 笔记列表 -->
  <view class="notes-list">
    <view wx:if="{{notes.length === 0}}" class="empty-tip">
      <view class="empty-icon">📝</view>
      <view class="empty-text">还没有笔记哦</view>
      <view class="empty-hint">点击右下角按钮写一篇吧</view>
    </view>
    
    <view wx:for="{{notes}}" wx:key="_id" class="note-card card" bindtap="goToDetail" data-id="{{item._id}}">
      <view class="note-header">
        <image class="note-avatar" src="{{item.author.avatarUrl}}" mode="aspectFill"></image>
        <view class="note-info">
          <view class="note-author">{{item.author.nickName}}</view>
          <view class="note-time">{{item.createdAtStr}}</view>
        </view>
      </view>
      
      <view class="note-content">{{item.content}}</view>
      
      <view wx:if="{{item.images && item.images.length > 0}}" class="note-images">
        <image 
          wx:for="{{item.images}}" 
          wx:key="*this"
          class="note-image"
          src="{{item}}"
          mode="aspectFill"
        ></image>
      </view>
      
      <view class="note-footer">
        <view class="note-category">
          <text wx:if="{{item.category === 'idea'}}">💡 想法</text>
          <text wx:if="{{item.category === 'thought'}}">💭 心情</text>
          <text wx:if="{{item.category === 'memory'}}">📸 回忆</text>
        </view>
        <view class="note-message-count">💬 {{item.messageCount || 0}}</view>
      </view>
    </view>
  </view>
  
  <!-- 加载更多 -->
  <view wx:if="{{hasMore}}" class="load-more" bindtap="loadMore">
    <text>加载更多</text>
  </view>
</view>

<!-- 发布按钮 -->
<view class="fab-button" bindtap="goToCreate">
  <text>+</text>
</view>
```

- [ ] **Step 3: 修改 index.wxss**

```wxss
/* pages/index/index.wxss */
.container {
  padding-bottom: 140rpx;
  background: linear-gradient(180deg, #FFF3E0 0%, #FFE4E1 100%);
  min-height: 100vh;
}

/* 分类筛选 */
.filter-section {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg, #FFF3E0 0%, #FFF3E0 100%);
  padding: 20rpx;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-item {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  background: white;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666;
}

.filter-item.active {
  background: #FF6B8A;
  color: white;
}

/* 笔记列表 */
.notes-list {
  padding: 20rpx;
}

.empty-tip {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #bbb;
}

.note-card {
  margin-bottom: 24rpx;
  overflow: hidden;
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

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.note-category {
  font-size: 24rpx;
  color: #999;
}

.note-message-count {
  font-size: 24rpx;
  color: #999;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30rpx;
  color: #FF6B8A;
  font-size: 28rpx;
}

/* 发布按钮 */
.fab-button {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #FF6B8A;
  color: white;
  font-size: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 138, 0.4);
}
```

- [ ] **Step 4: 修改 index.js**

```javascript
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
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(phase2): 首页改造为笔记列表页"
```

---

### Task 7: 创建笔记详情页

**Files:**
- Create: `ai-love-miniprogram/pages/note-detail/note-detail.js`
- Create: `ai-love-miniprogram/pages/note-detail/note-detail.wxml`
- Create: `ai-love-miniprogram/pages/note-detail/note-detail.wxss`
- Create: `ai-love-miniprogram/pages/note-detail/note-detail.json`

- [ ] **Step 1: 创建 note-detail.json**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "笔记详情"
}
```

- [ ] **Step 2: 创建 note-detail.wxml**

```xml
<!--pages/note-detail/note-detail.wxml-->
<view class="container">
  <!-- 笔记内容 -->
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
  
  <!-- 留言区域 -->
  <view class="messages-section">
    <view class="messages-title">💌 留言</view>
    
    <view wx:if="{{messages.length === 0}}" class="empty-messages">
      <view>暂无留言，快来抢沙发吧~</view>
    </view>
    
    <view wx:for="{{messages}}" wx:key="_id" class="message-card card">
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
  
  <!-- 留言输入框 -->
  <view class="message-input-section">
    <input 
      class="message-input"
      placeholder="写留言..."
      value="{{messageInput}}"
      bindinput="onMessageInput"
      bindconfirm="sendMessage"
    />
    <view class="send-btn" bindtap="sendMessage">发送</view>
  </view>
</view>
```

- [ ] **Step 3: 创建 note-detail.wxss**

```wxss
/* pages/note-detail/note-detail.wxss */
.container {
  padding: 20rpx;
  padding-bottom: 140rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF3E0 0%, #FFE4E1 100%);
}

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

/* 留言区域 */
.messages-section {
  margin-top: 32rpx;
}

.messages-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.empty-messages {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}

.message-card {
  margin-bottom: 16rpx;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
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
  line-height: 1.5;
}

/* 留言输入框 */
.message-input-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: white;
  border-top: 1rpx solid #f0f0f0;
}

.message-input {
  flex: 1;
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.send-btn {
  margin-left: 16rpx;
  padding: 12rpx 24rpx;
  background: #FF6B8A;
  color: white;
  border-radius: 36rpx;
  font-size: 26rpx;
}
```

- [ ] **Step 4: 创建 note-detail.js**

```javascript
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
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(phase2): 创建笔记详情页"
```

---

### Task 8: 创建笔记页面（创建/编辑）

**Files:**
- Create: `ai-love-miniprogram/pages/create-note/create-note.js`
- Create: `ai-love-miniprogram/pages/create-note/create-note.wxml`
- Create: `ai-love-miniprogram/pages/create-note/create-note.wxss`
- Create: `ai-love-miniprogram/pages/create-note/create-note.json`

- [ ] **Step 1: 创建 create-note.json**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "写笔记"
}
```

- [ ] **Step 2: 创建 create-note.wxml**

```xml
<!--pages/create-note/create-note.wxml-->
<view class="container">
  <!-- 分类选择 -->
  <view class="category-section card">
    <view class="category-label">选择分类</view>
    <view class="category-options">
      <view 
        class="category-option {{category === 'idea' ? 'active' : ''}}"
        bindtap="selectCategory"
        data-category="idea"
      >💡 想法</view>
      <view 
        class="category-option {{category === 'thought' ? 'active' : ''}}"
        bindtap="selectCategory"
        data-category="thought"
      >💭 心情</view>
      <view 
        class="category-option {{category === 'memory' ? 'active' : ''}}"
        bindtap="selectCategory"
        data-category="memory"
      >📸 回忆</view>
    </view>
  </view>
  
  <!-- 内容输入 -->
  <view class="content-section card">
    <textarea
      class="content-textarea"
      placeholder="记录这一刻..."
      value="{{content}}"
      bindinput="onContentInput"
      maxlength="1000"
      auto-height
    />
  </view>
  
  <!-- 图片上传 -->
  <view class="image-section card">
    <view class="image-label">添加图片</view>
    <view class="image-list">
      <view wx:for="{{images}}" wx:key="*this" class="image-item">
        <image class="image-preview" src="{{item}}" mode="aspectFill"></image>
        <view class="image-delete" bindtap="deleteImage" data-index="{{index}}">×</view>
      </view>
      <view wx:if="{{images.length < 9}}" class="image-add" bindtap="chooseImage">
        <text>+</text>
      </view>
    </view>
  </view>
  
  <!-- 提交按钮 -->
  <view class="submit-section">
    <button class="submit-btn" bindtap="submitNote" loading="{{submitting}}">
      {{isEdit ? '保存修改' : '发表笔记'}}
    </button>
  </view>
</view>
```

- [ ] **Step 3: 创建 create-note.wxss**

```wxss
/* pages/create-note/create-note.wxss */
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF3E0 0%, #FFE4E1 100%);
}

.category-section,
.content-section,
.image-section {
  margin-bottom: 24rpx;
}

.category-label,
.image-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.category-options {
  display: flex;
  gap: 16rpx;
}

.category-option {
  flex: 1;
  padding: 16rpx;
  text-align: center;
  background: white;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
}

.category-option.active {
  background: #FF6B8A;
  color: white;
}

.content-textarea {
  width: 100%;
  min-height: 300rpx;
  font-size: 30rpx;
  line-height: 1.6;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 180rpx;
  height: 180rpx;
}

.image-preview {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.image-delete {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 40rpx;
  height: 40rpx;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.image-add {
  width: 180rpx;
  height: 180rpx;
  background: white;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64rpx;
  color: #FF6B8A;
}

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

.submit-btn[loading] {
  opacity: 0.8;
}
```

- [ ] **Step 4: 创建 create-note.js**

```javascript
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
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(phase2): 创建笔记编辑页"
```

---

### Task 9: 创建留言云函数 - CreateMessage

**Files:**
- Create: `ai-love-miniprogram/cloud/createMessage/index.js`
- Create: `ai-love-miniprogram/cloud/createMessage/package.json`
- Create: `ai-love-miniprogram/cloud/createMessage/config.json`

- [ ] **Step 1: 创建云函数 index.js**

```javascript
// cloud/createMessage/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  
  const { noteId, content, images, paperStyle } = event
  
  // 参数校验
  if (!noteId) {
    return {
      success: false,
      error: '笔记 ID 不能为空'
    }
  }
  
  if ((!content || content.trim() === '') && (!images || images.length === 0)) {
    return {
      success: false,
      error: '留言内容或图片不能为空'
    }
  }
  
  try {
    // 验证笔记是否存在
    const note = await db.collection('notes').doc(noteId).get()
    
    if (!note.data) {
      return {
        success: false,
        error: '笔记不存在'
      }
    }
    
    const result = await db.collection('messages').add({
      data: {
        noteId: noteId,
        authorId: OPENID,
        content: content ? content.trim() : '',
        images: images || [],
        paperStyle: paperStyle || 'default',
        createdAt: db.serverDate()
      }
    })
    
    return {
      success: true,
      messageId: result._id,
      message: '留言成功'
    }
  } catch (err) {
    console.error('Create message error:', err)
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
  "name": "createMessage",
  "version": "1.0.0",
  "description": "创建留言云函数",
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
git commit -m "feat(phase2): 创建 createMessage 云函数"
```

---

### Task 10: 创建 messages 集合并测试

**Files:** (无代码文件，小程序控制台操作)

- [ ] **Step 1: 创建 messages 集合**

在微信开发者工具云开发控制台：
1. 点击"数据库"
2. 点击"添加集合"
3. 输入集合名称：`messages`
4. 点击确定

- [ ] **Step 2: 设置数据库权限**

在 `messages` 集合的"权限设置"中：
```json
{
  "read": true,
  "write": "auth.openid == doc._openid"
}
```

- [ ] **Step 3: 上传并部署 createMessage 云函数**

在微信开发者工具中：
1. 右键点击 `cloud/createMessage` → "上传并部署：云端安装依赖"

- [ ] **Step 4: 完整测试**

1. 创建一篇新笔记
2. 查看笔记列表是否显示
3. 点击进入详情页
4. 发送一条留言
5. 验证留言显示

- [ ] **Step 5: 提交最终代码**

```bash
git add -A
git commit -m "feat(phase2): Phase 2 完成 - 笔记 CRUD 功能"
```

---

## Phase 2 验收标准

- [ ] 可以创建新笔记（支持文字 + 图片）
- [ ] 笔记列表正确显示（时间线排序）
- [ ] 笔记详情可以查看和留言
- [ ] 作者可以编辑和删除自己的笔记
- [ ] 分类筛选功能正常
- [ ] 留言功能正常

---

## 下一步

Phase 2 完成后，进入 **Phase 3: 留言（纸条）功能优化**
