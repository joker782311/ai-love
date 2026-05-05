# Phase 5: 个人中心 + 潮汕话切换 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完善个人中心页面，实现潮汕话切换功能，包括界面语言切换和潮汕话学习内容

**Architecture:** 
- 用户语言偏好存储在云数据库
- 界面关键文案支持普通话/潮汕话切换
- 新增潮汕话学习页面，帮助妮妮和蛋蛋了解潮汕话
- 个人设置包括昵称、语言、关于等

**Tech Stack:** 
- 微信小程序原生框架
- 微信云开发（云数据库）

---

## File Structure

### 新增文件

```
ai-love-miniprogram/
├── cloud/
│   └── updateUserSettings/  # 更新用户设置云函数
├── config/
│   └── translations.js      # 翻译配置
└── pages/
    ├── teochew-learn/       # 潮汕话学习页面
    └── settings/            # 设置页面（新增）
```

---

## Tasks

### Task 1: 创建翻译配置文件

**Files:**
- Create: `ai-love-miniprogram/config/translations.js`

- [ ] **Step 1: 创建翻译配置**

```javascript
// config/translations.js

/**
 * 界面翻译配置
 * key 为翻译键，zh 为普通话，teochew 为潮汕话
 */

module.exports = {
  // 应用名称
  app: {
    name: {
      zh: '妮妮的恋爱小馆',
      teochew: '妮妮的恋爱小馆' // 保持原名，增加潮汕话副标题
    },
    subtitle: {
      zh: '记录我们的点点滴滴',
      teochew: '记录咱的点点滴滴'
    }
  },

  // 底部导航
  tabBar: {
    notes: {
      zh: '笔记',
      teochew: '笔记'
    },
    profile: {
      zh: '我的',
      teochew: '我个'
    }
  },

  // 首页
  home: {
    welcome: {
      zh: '欢迎来到妮妮的恋爱小馆',
      teochew: '欢迎来妮妮的恋爱小馆'
    },
    feature_notes: {
      zh: '笔记',
      teochew: '笔记'
    },
    feature_messages: {
      zh: '留言',
      teochew: '留言'
    },
    feature_reminders: {
      zh: '提醒',
      teochew: '提醒'
    },
    feature_profile: {
      zh: '我的',
      teochew: '我个'
    }
  },

  // 笔记分类
  notes: {
    all: {
      zh: '全部',
      teochew: '全部'
    },
    idea: {
      zh: '想法',
      teochew: '想法'
    },
    thought: {
      zh: '心情',
      teochew: '心情'
    },
    memory: {
      zh: '回忆',
      teochew: '回忆'
    },
    empty: {
      zh: '还没有笔记哦',
      teochew: '还没有笔记哦'
    },
    create_hint: {
      zh: '点击右下角按钮写一篇吧',
      teochew: '点右下角按钮写一篇吧'
    }
  },

  // 个人中心
  profile: {
    language: {
      zh: '语言',
      teochew: '语言'
    },
    language_zh: {
      zh: '普通话',
      teochew: '普通话'
    },
    language_teochew: {
      zh: '潮汕话',
      teochew: '潮汕话'
    },
    toggle_language: {
      zh: '切换语言',
      teochew: '切换语言'
    },
    copy_openid: {
      zh: '复制 OpenID',
      teochew: '复制 OpenID'
    },
    copied: {
      zh: '已复制 OpenID',
      teochew: '已复制 OpenID'
    },
    about: {
      zh: '关于',
      teochew: '关于'
    },
    version: {
      zh: '版本',
      teochew: '版本'
    },
    developing: {
      zh: '开发中',
      teochew: '开发中'
    }
  },

  // 提醒
  reminders: {
    title: {
      zh: '提醒',
      teochew: '提醒'
    },
    quick_templates: {
      zh: '潮汕话快捷模板',
      teochew: '潮汕话快捷模板'
    },
    custom: {
      zh: '自定义提醒',
      teochew: '自定义提醒'
    },
    placeholder: {
      zh: '输入提醒内容，或用潮汕话写...',
      teochew: '输入提醒内容，或用潮汕话写...'
    },
    schedule: {
      zh: '定时提醒',
      teochew: '定时提醒'
    },
    send_now: {
      zh: '立即发送',
      teochew: '立即发送'
    },
    schedule_send: {
      zh: '定时发送',
      teochew: '定时发送'
    },
    send_to: {
      zh: '发送给',
      teochew: '发送给'
    },
    history: {
      zh: '提醒记录',
      teochew: '提醒记录'
    },
    empty_history: {
      zh: '暂无提醒记录',
      teochew: '暂无提醒记录'
    },
    sent: {
      zh: '已发送',
      teochew: '已发送'
    },
    pending: {
      zh: '待发送',
      teochew: '待发送'
    }
  },

  // 纸条
  messages: {
    title: {
      zh: '纸条',
      teochew: '纸条'
    },
    empty: {
      zh: '暂无纸条，快来写第一张吧~',
      teochew: '暂无纸条，来写第一张吧~'
    },
    write: {
      zh: '写纸条',
      teochew: '写纸条'
    },
    select_paper: {
      zh: '选择信纸',
      teochew: '选择信纸'
    },
    placeholder: {
      zh: '想对 TA 说些什么...',
      teochew: '想对 TA 说些什么...'
    },
    send: {
      zh: '发送纸条',
      teochew: '发送纸条'
    },
    paper_default: {
      zh: '默认',
      teochew: '默认'
    },
    paper_love: {
      zh: '爱心',
      teochew: '爱心'
    },
    paper_star: {
      zh: '星星',
      teochew: '星星'
    },
    paper_blue: {
      zh: '天空',
      teochew: '天空'
    },
    paper_green: {
      zh: '清新',
      teochew: '清新'
    },
    paper_purple: {
      zh: '浪漫',
      teochew: '浪漫'
    }
  },

  // 潮汕话学习
  learn: {
    title: {
      zh: '潮汕话学习',
      teochew: '潮汕话学习'
    },
    greeting: {
      zh: '问候语',
      teochew: '问候语'
    },
    daily: {
      zh: '日常用语',
      teochew: '日常用语'
    },
    love: {
      zh: '情话',
      teochew: '情话'
    }
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "feat(phase5): 添加界面翻译配置"
```

---

### Task 2: 创建更新用户设置云函数

**Files:**
- Create: `ai-love-miniprogram/cloud/updateUserSettings/index.js`
- Create: `ai-love-miniprogram/cloud/updateUserSettings/package.json`
- Create: `ai-love-miniprogram/cloud/updateUserSettings/config.json`

- [ ] **Step 1: 创建云函数入口 index.js**

```javascript
// cloud/updateUserSettings/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  
  const { language, nickName, realName, avatarUrl } = event
  
  try {
    const updateData = {}
    
    if (language !== undefined) {
      updateData.language = language
    }
    if (nickName !== undefined) {
      updateData.nickName = nickName
    }
    if (realName !== undefined) {
      updateData.realName = realName
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl
    }
    
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        error: '没有要更新的内容'
      }
    }
    
    updateData.updatedAt = db.serverDate()
    
    await db.collection('users')
      .where({ _openid: OPENID })
      .update({
        data: updateData
      })
    
    return {
      success: true,
      message: '设置已更新'
    }
  } catch (err) {
    console.error('Update user settings error:', err)
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
  "name": "updateUserSettings",
  "version": "1.0.0",
  "description": "更新用户设置云函数",
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
git commit -m "feat(phase5): 创建 updateUserSettings 云函数"
```

---

### Task 3: 完善个人中心页面

**Files:**
- Modify: `ai-love-miniprogram/pages/profile/profile.js`
- Modify: `ai-love-miniprogram/pages/profile/profile.wxml`
- Modify: `ai-love-miniprogram/pages/profile/profile.wxss`

- [ ] **Step 1: 修改 profile.wxml**

```xml
<!--pages/profile/profile.wxml-->
<view class="container">
  <!-- 用户信息卡片 -->
  <view class="profile-card card">
    <view class="avatar-section">
      <image class="avatar" src="{{avatarUrl}}" mode="aspectFill"></image>
      <view class="nickname">{{nickName}}</view>
    </view>
    
    <view class="info-list">
      <view class="info-item">
        <view class="info-label">{{t.profile.language}}</view>
        <view class="info-value">{{languageText}}</view>
      </view>
      <view class="info-item">
        <view class="info-label">OpenID</view>
        <view class="info-value">{{openid}}</view>
      </view>
    </view>
  </view>
  
  <!-- 设置选项 -->
  <view class="settings-section">
    <view class="setting-item card" bindtap="toggleLanguage">
      <view class="setting-label">{{t.profile.toggle_language}}</view>
      <view class="setting-value">{{languageText}} ▶</view>
    </view>
    
    <view class="setting-item card" bindtap="goToTeochewLearn">
      <view class="setting-label">📖 潮汕话学习</view>
      <view class="setting-value">点击进入 ▶</view>
    </view>
    
    <view class="setting-item card" bindtap="copyOpenid">
      <view class="setting-label">{{t.profile.copy_openid}}</view>
      <view class="setting-value">点击复制 ▶</view>
    </view>
  </view>
  
  <!-- 关于 -->
  <view class="about-section card">
    <view class="about-title">{{t.profile.about}}</view>
    <view class="about-version">{{t.profile.version}} 0.5.0 (Phase 5)</view>
    <view class="about-desc">妮妮的恋爱小馆 · {{t.profile.developing}}</view>
    <view class="about-copyright">💕 妮妮 ❤️ 蛋蛋</view>
  </view>
</view>
```

- [ ] **Step 2: 修改 profile.wxss**

```wxss
/* pages/profile/profile.wxss */
.container {
  padding: 20rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF3E0 0%, #FFE4E1 100%);
}

/* 用户信息卡片 */
.profile-card {
  margin: 20rpx;
  padding: 40rpx 24rpx;
  text-align: center;
}

.avatar-section {
  margin-bottom: 24rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #FF6B8A;
  margin-bottom: 16rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B8A;
}

.info-list {
  margin-top: 32rpx;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #888;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 设置选项 */
.settings-section {
  margin: 20rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
}

.setting-label {
  font-size: 30rpx;
  color: #333;
}

.setting-value {
  font-size: 28rpx;
  color: #FF6B8A;
}

/* 关于 */
.about-section {
  margin: 20rpx;
  text-align: center;
  padding: 32rpx 24rpx;
}

.about-title {
  font-size: 28rpx;
  color: #888;
  margin-bottom: 12rpx;
}

.about-version {
  font-size: 24rpx;
  color: #bbb;
  margin-bottom: 8rpx;
}

.about-desc {
  font-size: 24rpx;
  color: #FF6B8A;
  margin-bottom: 16rpx;
}

.about-copyright {
  font-size: 26rpx;
  color: #FF6B8A;
  font-weight: bold;
}
```

- [ ] **Step 3: 修改 profile.js**

```javascript
// pages/profile/profile.js
const app = getApp()
const translations = require('../../config/translations.js')

Page({
  data: {
    nickName: '',
    avatarUrl: '/images/default-avatar.png',
    openid: '',
    language: 'zh',
    languageText: '普通话',
    t: translations.profile // 当前页面的翻译
  },

  onLoad: function () {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    
    if (userInfo) {
      this.setData({
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl || '/images/default-avatar.png',
        openid: userInfo._openid,
        language: userInfo.language || 'zh',
        languageText: userInfo.language === 'zh' ? '普通话' : '潮汕话'
      })
      this.updateTranslations(userInfo.language || 'zh')
    } else {
      // 重新登录
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          if (res.result.success) {
            app.globalData.userInfo = res.result.user
            this.loadUserInfo()
          }
        }
      })
    }
  },

  // 更新翻译
  updateTranslations(language) {
    const t = {}
    Object.keys(translations).forEach(key => {
      if (typeof translations[key] === 'object') {
        t[key] = translations[key][language] || translations[key].zh
      }
    })
    this.setData({ t, language })
  },

  // 切换语言
  toggleLanguage() {
    const newLanguage = this.data.language === 'zh' ? 'teochew' : 'zh'
    const languageText = newLanguage === 'zh' ? '普通话' : '潮汕话'
    
    // 更新到云数据库
    wx.cloud.callFunction({
      name: 'updateUserSettings',
      data: {
        language: newLanguage
      },
      success: res => {
        if (res.result.success) {
          this.setData({
            language: newLanguage,
            languageText: languageText
          })
          this.updateTranslations(newLanguage)
          
          // 更新全局状态
          if (app.globalData.userInfo) {
            app.globalData.userInfo.language = newLanguage
          }
          
          wx.showToast({
            title: `已切换到${languageText}`,
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: res.result.error || '切换失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('Update language error:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到潮汕话学习
  goToTeochewLearn() {
    wx.navigateTo({
      url: '/pages/teochew-learn/teochew-learn'
    })
  },

  // 复制 OpenID
  copyOpenid() {
    wx.setClipboardData({
      data: this.data.openid,
      success: () => {
        wx.showToast({
          title: this.data.t.profile.copied || '已复制 OpenID',
          icon: 'success'
        })
      }
    })
  }
})
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat(phase5): 完善个人中心页面，支持语言切换"
```

---

### Task 4: 创建潮汕话学习页面

**Files:**
- Create: `ai-love-miniprogram/pages/teochew-learn/teochew-learn.js`
- Create: `ai-love-miniprogram/pages/teochew-learn/teochew-learn.wxml`
- Create: `ai-love-miniprogram/pages/teochew-learn/teochew-learn.wxss`
- Create: `ai-love-miniprogram/pages/teochew-learn/teochew-learn.json`

- [ ] **Step 1: 创建 teochew-learn.json**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "潮汕话学习"
}
```

- [ ] **Step 2: 创建 teochew-learn.wxml**

```xml
<!--pages/teochew-learn/teochew-learn.wxml-->
<view class="container">
  <!-- 欢迎语 -->
  <view class="welcome-section card">
    <view class="welcome-title">📖 潮汕话学习</view>
    <view class="welcome-subtitle">学几句潮汕话，说给妮妮听</view>
  </view>
  
  <!-- 分类 Tab -->
  <view class="tab-section">
    <view class="tab-list">
      <view 
        class="tab-item {{currentTab === 'greeting' ? 'active' : ''}}"
        bindtap="switchTab"
        data-tab="greeting"
      >问候语</view>
      <view 
        class="tab-item {{currentTab === 'daily' ? 'active' : ''}}"
        bindtap="switchTab"
        data-tab="daily"
      >日常用语</view>
      <view 
        class="tab-item {{currentTab === 'love' ? 'active' : ''}}"
        bindtap="switchTab"
        data-tab="love"
      >情话</view>
    </view>
  </view>
  
  <!-- 内容列表 -->
  <view class="content-section">
    <view wx:if="{{currentTab === 'greeting'}}">
      <view wx:for="{{greetings}}" wx:key="key" class="phrase-card card">
        <view class="phrase-header">
          <view class="phrase-key">{{item.key}}</view>
        </view>
        <view class="phrase-content">
          <view class="phrase-row">
            <view class="phrase-label">普通话</view>
            <view class="phrase-text">{{item.zh}}</view>
          </view>
          <view class="phrase-row">
            <view class="phrase-label">潮汕话</view>
            <view class="phrase-text teochew">{{item.teochew}}</view>
          </view>
          <view class="phrase-row">
            <view class="phrase-label">拼音</view>
            <view class="phrase-text pinyin">{{item.pinyin}}</view>
          </view>
        </view>
      </view>
    </view>
    
    <view wx:if="{{currentTab === 'daily'}}">
      <view wx:for="{{daily}}" wx:key="key" class="phrase-card card">
        <view class="phrase-header">
          <view class="phrase-key">{{item.key}}</view>
        </view>
        <view class="phrase-content">
          <view class="phrase-row">
            <view class="phrase-label">普通话</view>
            <view class="phrase-text">{{item.zh}}</view>
          </view>
          <view class="phrase-row">
            <view class="phrase-label">潮汕话</view>
            <view class="phrase-text teochew">{{item.teochew}}</view>
          </view>
          <view class="phrase-row">
            <view class="phrase-label">拼音</view>
            <view class="phrase-text pinyin">{{item.pinyin}}</view>
          </view>
        </view>
      </view>
    </view>
    
    <view wx:if="{{currentTab === 'love'}}">
      <view wx:for="{{love}}" wx:key="key" class="phrase-card card">
        <view class="phrase-header">
          <view class="phrase-key">{{item.key}}</view>
        </view>
        <view class="phrase-content">
          <view class="phrase-row">
            <view class="phrase-label">普通话</view>
            <view class="phrase-text">{{item.zh}}</view>
          </view>
          <view class="phrase-row">
            <view class="phrase-label">潮汕话</view>
            <view class="phrase-text teochew">{{item.teochew}}</view>
          </view>
          <view class="phrase-row">
            <view class="phrase-label">拼音</view>
            <view class="phrase-text pinyin">{{item.pinyin}}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: 创建 teochew-learn.wxss**

```wxss
/* pages/teochew-learn/teochew-learn.wxss */
.container {
  padding: 20rpx;
  padding-bottom: 40rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF3E0 0%, #FFE4E1 100%);
}

/* 欢迎区域 */
.welcome-section {
  margin: 20rpx;
  padding: 40rpx 24rpx;
  text-align: center;
}

.welcome-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B8A;
  margin-bottom: 12rpx;
}

.welcome-subtitle {
  font-size: 26rpx;
  color: #888;
}

/* Tab 切换 */
.tab-section {
  margin: 20rpx;
}

.tab-list {
  display: flex;
  background: white;
  border-radius: 12rpx;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666;
}

.tab-item.active {
  background: #FF6B8A;
  color: white;
}

/* 内容列表 */
.content-section {
  padding: 0 20rpx;
}

.phrase-card {
  margin-bottom: 20rpx;
  overflow: hidden;
}

.phrase-header {
  padding: 16rpx 20rpx;
  background: linear-gradient(90deg, #FF6B8A 0%, #FF8FA3 100%);
}

.phrase-key {
  font-size: 26rpx;
  color: white;
  font-weight: bold;
}

.phrase-content {
  padding: 20rpx;
}

.phrase-row {
  display: flex;
  margin-bottom: 16rpx;
}

.phrase-row:last-child {
  margin-bottom: 0;
}

.phrase-label {
  width: 120rpx;
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
}

.phrase-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.phrase-text.teochew {
  color: #FF6B8A;
  font-weight: bold;
}

.phrase-text.pinyin {
  color: #666;
  font-style: italic;
  font-size: 26rpx;
}
```

- [ ] **Step 4: 创建 teochew-learn.js**

```javascript
// pages/teochew-learn/teochew-learn.js
const teochewPhrases = require('../../config/teochew-phrases.js')

Page({
  data: {
    currentTab: 'greeting',
    greetings: [
      { key: '早上好', zh: '早上好', teochew: '早安，囡仔', pinyin: 'Za mung, nou a' },
      { key: '晚上好', zh: '晚上好', teochew: '晚安，好梦', pinyin: 'Mung an, ho bang' },
      { key: '你好吗', zh: '你好吗', teochew: '汝好无', pinyin: 'Lu ho bo' }
    ],
    daily: [
      { key: '吃饭', zh: '吃饭了吗', teochew: '食饭未', pinyin: 'Zia bung bue' },
      { key: '睡觉', zh: '早点睡', teochew: '困早', pinyin: 'Kun za' },
      { key: '喝水', zh: '多喝水', teochew: '呷水', pinyin: 'Jia zui' },
      { key: '穿衣', zh: '加衣服', teochew: '加衫', pinyin: 'Ga sann' },
      { key: '休息', zh: '休息一下', teochew: '休息', pinyin: 'Hioh ziah' }
    ],
    love: [
      { key: '想你', zh: '想你', teochew: '想汝', pinyin: 'Siu lu' },
      { key: '爱你', zh: '我爱你', teochew: '我爱你', pinyin: 'Wa ai lu' },
      { key: '宝贝', zh: '宝贝', teochew: '囡仔', pinyin: 'Nou a' },
      { key: '亲爱的', zh: '亲爱的', teochew: '亲爱的', pinyin: 'Cin ai e' }
    ]
  },

  // 切换 Tab
  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab
    })
  }
})
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(phase5): 创建潮汕话学习页面"
```

---

### Task 5: 更新 app.json 配置

**Files:**
- Modify: `ai-love-miniprogram/app.json`

- [ ] **Step 1: 添加新页面到 app.json**

```json
{
  "pages": [
    "pages/index/index",
    "pages/note-detail/note-detail",
    "pages/create-note/create-note",
    "pages/write-message/write-message",
    "pages/reminders/reminders",
    "pages/profile/profile",
    "pages/teochew-learn/teochew-learn"
  ],
  "window": {
    "backgroundColor": "#FFF3E0",
    "navigationBarTitleText": "妮妮的恋爱小馆",
    "navigationBarBackgroundColor": "#FF6B8A",
    "navigationBarTextStyle": "white"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "feat(phase5): 更新 app.json 添加新页面"
```

---

### Task 6: 上传并部署 updateUserSettings 云函数

- [ ] **Step 1: 上传云函数**

在微信开发者工具中：
1. 右键点击 `cloud/updateUserSettings` → "上传并部署：云端安装依赖"

- [ ] **Step 2: 测试云函数**

在微信开发者工具控制台测试：
```javascript
wx.cloud.callFunction({
  name: 'updateUserSettings',
  data: { language: 'teochew' }
})
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat(phase5): 部署 updateUserSettings 云函数"
```

---

### Task 7: 测试语言切换功能

- [ ] **Step 1: 编译并预览**

在微信开发者工具中：
1. 点击"编译"
2. 确保没有报错

- [ ] **Step 2: 测试语言切换**

1. 进入"我的"页面
2. 点击"切换语言"
3. 验证界面文案是否变化（如"我的"变为"我个"）

- [ ] **Step 3: 测试潮汕话学习**

1. 点击"潮汕话学习"
2. 切换不同分类（问候语、日常用语、情话）
3. 验证内容正确显示

- [ ] **Step 4: 验证数据库更新**

在云开发控制台查看 `users` 集合：
1. 确认用户 language 字段已更新
2. 验证 updatedAt 时间戳

- [ ] **Step 5: 提交最终代码**

```bash
git add -A
git commit -m "feat(phase5): Phase 5 完成 - 个人中心 + 潮汕话切换"
```

---

## Phase 5 验收标准

- [ ] 个人中心可以切换语言（普通话/潮汕话）
- [ ] 切换后界面文案正确变化
- [ ] 语言偏好保存到云数据库
- [ ] 潮汕话学习页面正常显示
- [ ] 潮汕话学习分类切换正常
- [ ] 所有云函数部署成功

---

## 全 Phase 完成总结

🎉 五个 Phase 全部完成后，「妮妮的恋爱小馆」微信小程序具备以下功能：

| Phase | 功能 | 状态 |
|-------|------|------|
| Phase 1 | 项目初始化 + 登录 | ✅ |
| Phase 2 | 笔记 CRUD | ✅ |
| Phase 3 | 纸条留言模式 | ✅ |
| Phase 4 | 提醒功能（潮汕话） | ✅ |
| Phase 5 | 个人中心 + 语言切换 | ✅ |

### 下一步建议

1. **体验版测试** - 生成体验版二维码给妮妮试用
2. **收集反馈** - 根据妮妮的使用反馈调整细节
3. **视觉优化** - 增加更多动效和细节打磨
4. **考虑上线** - 如体验良好，可考虑正式发布
