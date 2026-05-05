# Phase 4: 提醒功能（定时 + 手动）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现手动提醒和定时提醒功能，支持潮汕话模板，通过微信订阅消息推送

**Architecture:** 
- 手动提醒：即时发送订阅消息给对方
- 定时提醒：云函数定时触发器 + 待发送队列
- 潮汕话模板：预设常用提醒短语
- 订阅消息：需要用户主动订阅消息模板

**Tech Stack:** 
- 微信小程序原生框架
- 微信云开发（云数据库、云函数、定时触发器）
- 微信订阅消息 API

---

## File Structure

### 新增文件

```
ai-love-miniprogram/
├── cloud/
│   ├── createReminder/      # 创建提醒云函数
│   ├── sendReminder/        # 发送提醒云函数
│   └──定时触发器配置/
├── pages/
│   └── reminders/           # 提醒页面
└── config/
    └── teochew-phrases.js   # 潮汕话短语配置
```

### 数据库集合

- `reminders` - 提醒集合（新增）

---

## 订阅消息模板配置

需要在微信公众平台申请订阅消息模板：

### 模板 1：日常提醒（模板 ID 需申请）
```
模板标题：日常提醒
关键词：{{thing1.DATA}}（提醒内容）
        {{time2.DATA}}（提醒时间）
        {{character3.DATA}}（发送人）
```

---

## Tasks

### Task 1: 创建潮汕话短语配置

**Files:**
- Create: `ai-love-miniprogram/config/teochew-phrases.js`

- [ ] **Step 1: 创建潮汕话短语配置**

```javascript
// config/teochew-phrases.js

/**
 * 潮汕话提醒短语配置
 * 拼音为潮汕话罗马字（Peng'im）
 */

module.exports = {
  // 三餐提醒
  meals: {
    breakfast: {
      teochew: '早，食早未？',
      chinese: '早，吃早餐了吗？',
      pinyin: 'Za, zia za bue?'
    },
    lunch: {
      teochew: '食饭未？',
      chinese: '吃饭了吗？',
      pinyin: 'Zia bung bue?'
    },
    dinner: {
      teochew: '暗顿食未？',
      chinese: '晚餐吃了吗？',
      pinyin: 'Am dung zia bue?'
    }
  },

  // 日常关怀
  daily: {
    sleep_early: {
      teochew: '记得困早',
      chinese: '记得早点睡',
      pinyin: 'Gi de kun za'
    },
    drink_water: {
      teochew: '爱呷水',
      chinese: '要多喝水',
      pinyin: 'Ai jia zui'
    },
    add_clothes: {
      teochew: '今日天冷，记得加衫',
      chinese: '今天天冷，记得加衣服',
      pinyin: 'Gin ri tin lang, gi de ga sann'
    },
    rest: {
      teochew: '孥仔，休息一下',
      chinese: '宝贝，休息一下',
      pinyin: 'Nou a, hioh ziah zioh'
    }
  },

  // 情话/问候
  love: {
    miss_you: {
      teochew: '想汝',
      chinese: '想你',
      pinyin: 'Siu lu'
    },
    good_morning: {
      teochew: '早安，囡仔',
      chinese: '早安，宝贝',
      pinyin: 'Za mung, nou a'
    },
    good_night: {
      teochew: '晚安，好梦',
      chinese: '晚安，好梦',
      pinyin: 'Mung an, ho bang'
    },
    love_you: {
      teochew: '我爱你',
      chinese: '我爱你',
      pinyin: 'Wa ai lu'
    }
  },

  // 称呼
  nicknames: {
    girl: '囡仔', // 对女孩的爱称
    boy: '查某囝', // 对男孩的爱称
    baby: '宝贝',
    dear: '亲爱的'
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "feat(phase4): 添加潮汕话短语配置"
```

---

### Task 2: 创建提醒云函数 - CreateReminder

**Files:**
- Create: `ai-love-miniprogram/cloud/createReminder/index.js`
- Create: `ai-love-miniprogram/cloud/createReminder/package.json`
- Create: `ai-love-miniprogram/cloud/createReminder/config.json`

- [ ] **Step 1: 创建云函数入口 index.js**

```javascript
// cloud/createReminder/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  
  const { 
    receiverId, 
    content, 
    type = 'manual',
    scheduledTime,
    templateId
  } = event
  
  // 参数校验
  if (!receiverId) {
    return {
      success: false,
      error: '接收者 ID 不能为空'
    }
  }
  
  if (!content || content.trim() === '') {
    return {
      success: false,
      error: '提醒内容不能为空'
    }
  }
  
  try {
    const result = await db.collection('reminders').add({
      data: {
        senderId: OPENID,
        receiverId: receiverId,
        content: content.trim(),
        type: type, // 'manual' | 'scheduled'
        scheduledTime: scheduledTime || null,
        templateId: templateId || '',
        isSent: false,
        createdAt: db.serverDate()
      }
    })
    
    // 如果是手动提醒，立即发送
    if (type === 'manual') {
      // 获取接收者信息
      const userResult = await db.collection('users')
        .where({ _openid: receiverId })
        .field({ nickName: true })
        .get()
      
      const senderResult = await db.collection('users')
        .where({ _openid: OPENID })
        .field({ nickName: true })
        .get()
      
      const receiverNick = userResult.data[0]?.nickName || '亲爱的'
      const senderNick = senderResult.data[0]?.nickName || '某人'
      
      // 调用发送消息
      try {
        await cloud.callFunction({
          name: 'sendReminder',
          data: {
            receiverId: receiverId,
            content: content.trim(),
            senderNick: senderNick,
            templateId: templateId
          }
        })
        
        // 更新发送状态
        await db.collection('reminders')
          .doc(result._id)
          .update({
            data: { isSent: true }
          })
      } catch (sendErr) {
        console.error('Send reminder failed:', sendErr)
        // 发送失败不阻断创建
      }
    }
    
    return {
      success: true,
      reminderId: result._id,
      message: type === 'manual' ? '提醒已发送' : '定时提醒已设置'
    }
  } catch (err) {
    console.error('Create reminder error:', err)
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
  "name": "createReminder",
  "version": "1.0.0",
  "description": "创建提醒云函数",
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
    "openapi": [
      "subscribeMessage.send"
    ]
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat(phase4): 创建 createReminder 云函数"
```

---

### Task 3: 创建提醒云函数 - SendReminder

**Files:**
- Create: `ai-love-miniprogram/cloud/sendReminder/index.js`
- Create: `ai-love-miniprogram/cloud/sendReminder/package.json`
- Create: `ai-love-miniprogram/cloud/sendReminder/config.json`

- [ ] **Step 1: 创建云函数入口 index.js**

```javascript
// cloud/sendReminder/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { receiverId, content, senderNick, templateId } = event
  
  if (!receiverId || !content) {
    return {
      success: false,
      error: '参数错误'
    }
  }
  
  try {
    // 发送订阅消息
    const result = await cloud.openapi.subscribeMessage.send({
      touser: receiverId,
      templateId: templateId || 'YOUR_TEMPLATE_ID', // TODO: 替换为实际模板 ID
      data: {
        thing1: { value: content.substring(0, 20) },
        time2: { value: new Date().toLocaleString('zh-CN') },
        character3: { value: senderNick || '关心你的人' }
      },
      page: 'pages/index/index'
    })
    
    return {
      success: true,
      message: '发送成功',
      result: result
    }
  } catch (err) {
    console.error('Send reminder error:', err)
    
    // 订阅消息常见错误处理
    if (err.errCode === 43101) {
      return {
        success: false,
        error: '用户未订阅消息，请先订阅',
        needSubscribe: true
      }
    }
    
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
  "name": "sendReminder",
  "version": "1.0.0",
  "description": "发送提醒云函数",
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
    "openapi": [
      "subscribeMessage.send"
    ]
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat(phase4): 创建 sendReminder 云函数"
```

---

### Task 4: 创建提醒页面

**Files:**
- Create: `ai-love-miniprogram/pages/reminders/reminders.js`
- Create: `ai-love-miniprogram/pages/reminders/reminders.wxml`
- Create: `ai-love-miniprogram/pages/reminders/reminders.wxss`
- Create: `ai-love-miniprogram/pages/reminders/reminders.json`

- [ ] **Step 1: 创建 reminders.json**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "提醒"
}
```

- [ ] **Step 2: 创建 reminders.wxml**

```xml
<!--pages/reminders/reminders.wxml-->
<view class="container">
  <!-- 快捷提醒模板 -->
  <view class="quick-templates-section">
    <view class="section-title">💬 潮汕话快捷模板</view>
    
    <scroll-view scroll-x class="template-scroll">
      <view class="template-list">
        <view 
          wx:for="{{teochewTemplates}}" 
          wx:key="key"
          class="template-item"
          bindtap="selectTemplate"
          data-content="{{item.teochew}}"
        >
          <view class="template-teochew">{{item.teochew}}</view>
          <view class="template-chinese">{{item.chinese}}</view>
        </view>
      </view>
    </scroll-view>
  </view>
  
  <!-- 自定义提醒 -->
  <view class="custom-section card">
    <view class="section-title">✏️ 自定义提醒</view>
    
    <textarea
      class="custom-input"
      placeholder="输入提醒内容，或用潮汕话写..."
      value="{{customContent}}"
      bindinput="onCustomInput"
      maxlength="100"
      auto-height
    />
  </view>
  
  <!-- 定时选项 -->
  <view class="schedule-section card">
    <view class="section-title">⏰ 定时提醒</view>
    
    <view class="schedule-options">
      <view 
        class="schedule-option {{!isScheduled ? 'active' : ''}}"
        bindtap="toggleSchedule"
        data-scheduled="false"
      >
        立即发送
      </view>
      <view 
        class="schedule-option {{isScheduled ? 'active' : ''}}"
        bindtap="toggleSchedule"
        data-scheduled="true"
      >
        定时发送
      </view>
    </view>
    
    <view wx:if="{{isScheduled}}" class="time-picker">
      <picker mode="time" value="{{scheduledTime}}" bindchange="onTimeChange">
        <view class="time-display">🕐 {{scheduledTime}}</view>
      </picker>
    </view>
  </view>
  
  <!-- 接收人选择 -->
  <view class="receiver-section card">
    <view class="section-title">👤 发送给</view>
    
    <view class="receiver-option active">
      <text>妮妮</text>
      <text wx:if="{{receiverId === receiver2}}" class="check-mark">✓</text>
    </view>
  </view>
  
  <!-- 提交按钮 -->
  <view class="submit-section">
    <button class="submit-btn" bindtap="submitReminder" loading="{{submitting}}">
      {{isScheduled ? '设置定时提醒' : '发送提醒'}}
    </button>
  </view>
  
  <!-- 提醒记录 -->
  <view class="history-section">
    <view class="section-title">📜 提醒记录</view>
    
    <view wx:if="{{history.length === 0}}" class="empty-history">
      暂无提醒记录
    </view>
    
    <view wx:for="{{history}}" wx:key="_id" class="history-item card">
      <view class="history-content">{{item.content}}</view>
      <view class="history-meta">
        <text>{{item.createdAtStr}}</text>
        <text class="status {{item.isSent ? 'sent' : 'pending'}}">
          {{item.isSent ? '已发送' : '待发送'}}
        </text>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: 创建 reminders.wxss**

```wxss
/* pages/reminders/reminders.wxss */
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF3E0 0%, #FFE4E1 100%);
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

/* 快捷模板 */
.quick-templates-section {
  margin-bottom: 24rpx;
}

.template-scroll {
  white-space: nowrap;
}

.template-list {
  display: inline-flex;
  gap: 12rpx;
}

.template-item {
  display: inline-block;
  padding: 16rpx 24rpx;
  background: white;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.template-teochew {
  font-size: 28rpx;
  color: #FF6B8A;
  font-weight: bold;
}

.template-chinese {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

/* 自定义提醒 */
.custom-section,
.schedule-section,
.receiver-section {
  margin-bottom: 24rpx;
}

.custom-input {
  width: 100%;
  min-height: 160rpx;
  font-size: 30rpx;
  background: #fafafa;
  padding: 16rpx;
  border-radius: 12rpx;
}

/* 定时选项 */
.schedule-options {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.schedule-option {
  flex: 1;
  padding: 16rpx;
  text-align: center;
  background: white;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.schedule-option.active {
  background: #FF6B8A;
  color: white;
}

.time-picker {
  padding: 16rpx;
  background: white;
  border-radius: 12rpx;
}

.time-display {
  font-size: 32rpx;
  color: #333;
  text-align: center;
}

/* 接收人选择 */
.receiver-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: white;
  border-radius: 12rpx;
  font-size: 30rpx;
}

.check-mark {
  color: #FF6B8A;
  font-weight: bold;
}

/* 提交按钮 */
.submit-section {
  padding: 20rpx;
  margin-bottom: 32rpx;
}

.submit-btn {
  background: #FF6B8A;
  color: white;
  border-radius: 40rpx;
  font-size: 32rpx;
  padding: 20rpx;
}

/* 历史记录 */
.history-section {
  padding-bottom: 40rpx;
}

.empty-history {
  text-align: center;
  padding: 40rpx;
  color: #999;
}

.history-item {
  margin-bottom: 16rpx;
}

.history-content {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.history-meta {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #999;
}

.status.sent {
  color: #4CAF50;
}

.status.pending {
  color: #FF9800;
}
```

- [ ] **Step 4: 创建 reminders.js**

```javascript
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
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(phase4): 创建提醒页面"
```

---

### Task 5: 创建获取提醒历史云函数 - GetReminders

**Files:**
- Create: `ai-love-miniprogram/cloud/getReminders/index.js`
- Create: `ai-love-miniprogram/cloud/getReminders/package.json`
- Create: `ai-love-miniprogram/cloud/getReminders/config.json`

- [ ] **Step 1: 创建云函数入口 index.js**

```javascript
// cloud/getReminders/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { senderId, receiverId } = event
  
  try {
    const query = {}
    if (senderId) {
      query.senderId = senderId
    }
    if (receiverId) {
      query.receiverId = receiverId
    }
    
    const remindersResult = await db.collection('reminders')
      .where(query)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()
    
    return {
      success: true,
      reminders: remindersResult.data
    }
  } catch (err) {
    console.error('Get reminders error:', err)
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
  "name": "getReminders",
  "version": "1.0.0",
  "description": "获取提醒历史云函数",
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
git commit -m "feat(phase4): 创建 getReminders 云函数"
```

---

### Task 6: 创建 reminders 集合并配置

- [ ] **Step 1: 创建 reminders 集合**

在微信开发者工具云开发控制台：
1. 点击"数据库"
2. 点击"添加集合"
3. 输入集合名称：`reminders`
4. 点击确定

- [ ] **Step 2: 设置数据库权限**

在 `reminders` 集合的"权限设置"中：
```json
{
  "read": "auth.openid == doc._openid || auth.openid == doc.senderId || auth.openid == doc.receiverId",
  "write": "auth.openid == doc._openid"
}
```

- [ ] **Step 3: 上传所有云函数**

在微信开发者工具中：
1. 右键点击 `cloud/createReminder` → "上传并部署：云端安装依赖"
2. 右键点击 `cloud/sendReminder` → "上传并部署：云端安装依赖"
3. 右键点击 `cloud/getReminders` → "上传并部署：云端安装依赖"

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat(phase4): 配置提醒数据库集合"
```

---

### Task 7: 申请订阅消息模板

- [ ] **Step 1: 登录微信公众平台**

访问 https://mp.weixin.qq.com/

- [ ] **Step 2: 进入订阅消息**

在左侧菜单选择"功能" → "订阅消息"

- [ ] **Step 3: 添加模板**

搜索并添加以下模板：
- 日常提醒（或其他合适的模板）

- [ ] **Step 4: 记录模板 ID**

将获取的模板 ID 更新到代码中：
- `cloud/sendReminder/index.js` 中的 `YOUR_TEMPLATE_ID`
- `pages/reminders/reminders.js` 中的 `YOUR_TEMPLATE_ID`

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(phase4): 配置订阅消息模板 ID"
```

---

### Task 8: 测试提醒功能

- [ ] **Step 1: 编译并预览**

在微信开发者工具中：
1. 点击"编译"
2. 确保没有报错

- [ ] **Step 2: 测试手动提醒**

1. 进入提醒页面
2. 选择快捷模板或输入自定义内容
3. 点击"立即发送"
4. 验证对方是否收到订阅消息

- [ ] **Step 3: 测试定时提醒**

1. 选择"定时发送"
2. 设置时间
3. 验证提醒是否保存到数据库

- [ ] **Step 4: 验证提醒记录**

1. 查看历史记录列表
2. 验证状态显示（已发送/待发送）

- [ ] **Step 5: 提交最终代码**

```bash
git add -A
git commit -m "feat(phase4): Phase 4 完成 - 提醒功能"
```

---

## Phase 4 验收标准

- [ ] 可以选择潮汕话模板快速发送提醒
- [ ] 可以自定义提醒内容
- [ ] 手动提醒可以立即发送
- [ ] 定时提醒可以设置时间（定时触发器需额外配置）
- [ ] 提醒历史记录正确显示
- [ ] 订阅消息正常推送

---

## 下一步

Phase 4 完成后，进入 **Phase 5: 个人中心 + 潮汕话切换**
