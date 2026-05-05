# Phase 1: 项目初始化 + 云开发配置 + 用户登录 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 初始化微信小程序项目，配置云开发环境，实现用户登录功能

**Architecture:** 
- 使用微信开发者工具创建原生小程序项目
- 启用微信云开发（Cloud Base），无需自建服务器
- 用户登录基于微信 openid，自动创建用户记录

**Tech Stack:** 
- 微信小程序原生框架 (WXML + WXSS + JavaScript)
- 微信云开发 (云数据库、云函数)
- 微信登录 API (wx.login)

---

## File Structure

### 创建的文件

```
ai-love-miniprogram/
├── app.js                 # 小程序入口，云开发初始化
├── app.json               # 全局配置
├── app.wxss               # 全局样式
├── sitemap.json           # 索引配置
├── project.config.json    # 项目配置
├── project.private.config.json
├── cloud/                 # 云函数目录
│   └── login/
│       ├── index.js       # 登录云函数
│       ├── package.json
│       └── config.json
└── pages/
    ├── index/             # 首页（笔记列表，Phase 2）
    └── profile/           # 个人中心（Phase 5）
```

### 数据库集合

- `users` - 用户信息集合

---

## Tasks

### Task 1: 创建小程序项目结构

**Files:**
- Create: `ai-love-miniprogram/app.js`
- Create: `ai-love-miniprogram/app.json`
- Create: `ai-love-miniprogram/app.wxss`
- Create: `ai-love-miniprogram/sitemap.json`

- [ ] **Step 1: 创建项目目录**

```bash
mkdir -p ai-love-miniprogram
cd ai-love-miniprogram
mkdir -p cloud/login
mkdir -p pages/index
mkdir -p pages/profile
```

- [ ] **Step 2: 创建 app.js**

```javascript
// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'ai-love-xxx', // TODO: 替换为你的云环境 ID
        traceUser: true,
      })
    }

    this.globalData = {}
  },

  globalData: {
    userInfo: null,
    openid: null,
  }
})
```

- [ ] **Step 3: 创建 app.json**

```json
{
  "pages": [
    "pages/index/index",
    "pages/profile/profile"
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

- [ ] **Step 4: 创建 app.wxss**

```wxss
/* app.wxss - 全局样式 */
page {
  background-color: #FFF3E0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
}

.container {
  padding: 20rpx;
}

/* 温暖可爱风 - 粉色主题 */
.primary-color {
  color: #FF6B8A;
}

.primary-bg {
  background-color: #FF6B8A;
}

/* 圆角卡片样式 */
.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}
```

- [ ] **Step 5: 创建 sitemap.json**

```json
{
  "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html",
  "rules": [{
    "action": "allow",
    "page": "*"
  }]
}
```

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat(phase1): 创建小程序基础项目结构"
```

---

### Task 2: 创建项目配置文件

**Files:**
- Create: `ai-love-miniprogram/project.config.json`
- Create: `ai-love-miniprogram/project.private.config.json`

- [ ] **Step 1: 创建 project.config.json**

```json
{
  "description": "妮妮的恋爱小馆 - 微信小程序项目配置",
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "setting": {
    "bundle": false,
    "userConfirmedBundleSwitch": false,
    "urlCheck": true,
    "scopeDataCheck": false,
    "coverView": true,
    "es6": true,
    "postcss": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "preloadBackgroundData": false,
    "minified": true,
    "autoAudits": false,
    "newFeature": false,
    "uglifyFileName": false,
    "uploadWithSourceMap": true,
    "useIsolateContext": true,
    "nodeModules": false,
    "enhance": true,
    "useMultiFrameRuntime": true,
    "showShadowRootInWxmlPanel": true,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "showES6CompileOption": false,
    "minifyWXML": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    }
  },
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "wxxxxxxxxxxx",
  "projectname": "ai-love-miniprogram",
  "condition": {},
  "editorSetting": {
    "tabIndent": "insertSpaces",
    "tabSize": 2
  }
}
```

> 注意：`appid` 需要替换为你在 [微信公众平台](https://mp.weixin.qq.com/) 注册的小程序 AppID

- [ ] **Step 2: 创建 project.private.config.json**

```json
{
  "description": "项目私有配置文件，不包含在版本控制中",
  "projectname": "ai-love-miniprogram",
  "setting": {
    "compileHotReLoad": true
  }
}
```

- [ ] **Step 3: 创建 .gitignore**

```bash
# 小程序
node_modules/
*.local

# 云函数
cloud/*/node_modules/

# 编译产物
dist/
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat(phase1): 添加项目配置文件"
```

---

### Task 3: 创建登录云函数

**Files:**
- Create: `ai-love-miniprogram/cloud/login/index.js`
- Create: `ai-love-miniprogram/cloud/login/package.json`
- Create: `ai-love-miniprogram/cloud/login/config.json`

- [ ] **Step 1: 创建云函数入口 index.js**

```javascript
// cloud/login/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  
  try {
    // 查询用户是否已存在
    const userResult = await db.collection('users').where({
      _openid: OPENID
    }).get()
    
    if (userResult.data.length > 0) {
      // 用户已存在，返回用户信息
      return {
        success: true,
        isNewUser: false,
        user: userResult.data[0]
      }
    } else {
      // 新用户，创建用户记录
      const defaultNicknames = {
        'ovxxxxxxxxx1': '妮妮', // TODO: 替换为妮妮的 openid
        'ovxxxxxxxxx2': '蛋蛋'  // TODO: 替换为蛋蛋的 openid
      }
      
      const nickName = defaultNicknames[OPENID] || '小伙伴'
      
      const result = await db.collection('users').add({
        data: {
          nickName: nickName,
          realName: '',
          avatarUrl: event.avatarUrl || '',
          language: 'zh', // 'zh' | 'teochew'
          createdAt: db.serverDate()
        }
      })
      
      const newUser = {
        _id: result._id,
        _openid: OPENID,
        nickName: nickName,
        realName: '',
        avatarUrl: event.avatarUrl || '',
        language: 'zh',
        createdAt: new Date()
      }
      
      return {
        success: true,
        isNewUser: true,
        user: newUser
      }
    }
  } catch (err) {
    console.error('Login error:', err)
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
  "name": "login",
  "version": "1.0.0",
  "description": "用户登录云函数",
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
git commit -m "feat(phase1): 创建登录云函数"
```

---

### Task 4: 创建首页（基础框架）

**Files:**
- Create: `ai-love-miniprogram/pages/index/index.js`
- Create: `ai-love-miniprogram/pages/index/index.wxml`
- Create: `ai-love-miniprogram/pages/index/index.wxss`
- Create: `ai-love-miniprogram/pages/index/index.json`

- [ ] **Step 1: 创建 index.json**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "妮妮的恋爱小馆"
}
```

- [ ] **Step 2: 创建 index.wxml**

```xml
<!--pages/index/index.wxml-->
<view class="container">
  <!-- 欢迎区域 -->
  <view class="welcome-section card">
    <view class="welcome-title">欢迎来到妮妮的恋爱小馆 🏠</view>
    <view class="welcome-subtitle">记录我们的点点滴滴</view>
  </view>
  
  <!-- 功能入口 -->
  <view class="feature-grid">
    <view class="feature-item card" bindtap="goToNotes">
      <view class="feature-icon">📝</view>
      <view class="feature-name">笔记</view>
    </view>
    <view class="feature-item card" bindtap="goToMessages">
      <view class="feature-icon">💌</view>
      <view class="feature-name">留言</view>
    </view>
    <view class="feature-item card" bindtap="goToReminders">
      <view class="feature-icon">⏰</view>
      <view class="feature-name">提醒</view>
    </view>
    <view class="feature-item card" bindtap="goToProfile">
      <view class="feature-icon">👤</view>
      <view class="feature-name">我的</view>
    </view>
  </view>
  
  <!-- 底部提示 -->
  <view class="footer-tip">
    <view>妮妮 ❤️ 蛋蛋</view>
  </view>
</view>
```

- [ ] **Step 3: 创建 index.wxss**

```wxss
/* pages/index/index.wxss */
.container {
  padding: 20rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF3E0 0%, #FFE4E1 100%);
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  padding: 40rpx 24rpx;
  margin: 20rpx;
}

.welcome-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B8A;
  margin-bottom: 16rpx;
}

.welcome-subtitle {
  font-size: 28rpx;
  color: #888;
}

/* 功能网格 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 20rpx;
  background: white;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 138, 0.2);
}

.feature-icon {
  font-size: 64rpx;
  margin-bottom: 12rpx;
}

.feature-name {
  font-size: 28rpx;
  color: #333;
}

/* 底部提示 */
.footer-tip {
  text-align: center;
  margin-top: 60rpx;
  padding: 20rpx;
  color: #FF6B8A;
  font-size: 24rpx;
}
```

- [ ] **Step 4: 创建 index.js**

```javascript
// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null
  },

  onLoad: function () {
    // 检查登录状态
    this.checkLogin()
  },

  // 检查登录状态
  async checkLogin() {
    const that = this
    
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      // 调用登录云函数
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          if (res.result.success) {
            app.globalData.userInfo = res.result.user
            app.globalData.openid = res.result.user._openid
            that.setData({
              userInfo: res.result.user
            })
            console.log('登录成功:', res.result.user)
          } else {
            console.error('登录失败:', res.result.error)
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'none'
            })
          }
        },
        fail: err => {
          console.error('登录请求失败:', err)
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
        }
      })
    }
  },

  // 跳转到笔记
  goToNotes() {
    wx.showToast({
      title: '笔记功能开发中...',
      icon: 'none'
    })
  },

  // 跳转到留言
  goToMessages() {
    wx.showToast({
      title: '留言功能开发中...',
      icon: 'none'
    })
  },

  // 跳转到提醒
  goToReminders() {
    wx.showToast({
      title: '提醒功能开发中...',
      icon: 'none'
    })
  },

  // 跳转到个人中心
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  }
})
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(phase1): 创建首页基础框架"
```

---

### Task 5: 创建个人中心页面

**Files:**
- Create: `ai-love-miniprogram/pages/profile/profile.js`
- Create: `ai-love-miniprogram/pages/profile/profile.wxml`
- Create: `ai-love-miniprogram/pages/profile/profile.wxss`
- Create: `ai-love-miniprogram/pages/profile/profile.json`

- [ ] **Step 1: 创建 profile.json**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "个人中心"
}
```

- [ ] **Step 2: 创建 profile.wxml**

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
        <view class="info-label">OpenID</view>
        <view class="info-value">{{openid}}</view>
      </view>
      <view class="info-item">
        <view class="info-label">语言</view>
        <view class="info-value">{{languageText}}</view>
      </view>
    </view>
  </view>
  
  <!-- 设置选项 -->
  <view class="settings-section">
    <view class="setting-item card" bindtap="toggleLanguage">
      <view class="setting-label">切换语言</view>
      <view class="setting-value">{{languageText}} ▶</view>
    </view>
    
    <view class="setting-item card" bindtap="copyOpenid">
      <view class="setting-label">复制 OpenID</view>
      <view class="setting-value">点击复制 ▶</view>
    </view>
  </view>
  
  <!-- 关于 -->
  <view class="about-section card">
    <view class="about-title">关于</view>
    <view class="about-version">Version 0.1.0 (Phase 1)</view>
    <view class="about-desc">妮妮的恋爱小馆 · 开发中</view>
  </view>
</view>
```

- [ ] **Step 3: 创建 profile.wxss**

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
}
```

- [ ] **Step 4: 创建 profile.js**

```javascript
// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    nickName: '',
    avatarUrl: '/images/default-avatar.png',
    openid: '',
    language: 'zh',
    languageText: '普通话'
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

  // 切换语言
  toggleLanguage() {
    const newLanguage = this.data.language === 'zh' ? 'teochew' : 'zh'
    const languageText = newLanguage === 'zh' ? '普通话' : '潮汕话'
    
    this.setData({
      language: newLanguage,
      languageText: languageText
    })
    
    // TODO: 更新云数据库中的用户语言偏好
    wx.showToast({
      title: `已切换到${languageText}`,
      icon: 'success'
    })
    
    // 更新全局状态
    if (app.globalData.userInfo) {
      app.globalData.userInfo.language = newLanguage
    }
  },

  // 复制 OpenID
  copyOpenid() {
    wx.setClipboardData({
      data: this.data.openid,
      success: () => {
        wx.showToast({
          title: '已复制 OpenID',
          icon: 'success'
        })
      }
    })
  }
})
```

- [ ] **Step 5: 创建默认头像图片目录**

```bash
mkdir -p ai-love-miniprogram/images
```

> 注意：需要一个默认头像图片，可以后续添加

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat(phase1): 创建个人中心页面"
```

---

### Task 6: 创建数据库集合

**Files:** (无代码文件，小程序控制台操作)

- [ ] **Step 1: 打开微信开发者工具**

在微信开发者工具中：
1. 点击"云开发"按钮
2. 进入云开发控制台

- [ ] **Step 2: 创建 users 集合**

在云开发控制台：
1. 点击"数据库"
2. 点击"添加集合"
3. 输入集合名称：`users`
4. 点击确定

- [ ] **Step 3: 设置数据库权限**

在 `users` 集合的"权限设置"中：
- 选择"所有用户可读写"（开发阶段）
- 或自定义规则：
```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

- [ ] **Step 4: 验证云函数**

在微信开发者工具中：
1. 右键点击 `cloud/login` 目录
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat(phase1): 配置云开发数据库"
```

---

### Task 7: 测试登录功能

**Files:** (测试任务)

- [ ] **Step 1: 编译并预览**

在微信开发者工具中：
1. 点击"编译"
2. 确保没有报错

- [ ] **Step 2: 真机预览**

1. 点击"预览"按钮
2. 使用微信扫描二维码
3. 在手机上查看是否正常显示

- [ ] **Step 3: 验证登录功能**

在手机上：
1. 打开小程序
2. 查看是否自动调用登录云函数
3. 进入"我的"页面，查看用户信息是否正确显示

- [ ] **Step 4: 检查云数据库**

在云开发控制台：
1. 查看 `users` 集合
2. 确认已创建用户记录
3. 验证用户信息是否正确

- [ ] **Step 5: 记录妮妮和蛋蛋的 OpenID**

在云数据库中查看创建的用户记录，记录两人的 OpenID，后续用于：
- 更新登录云函数中的默认昵称映射
- 定向发送提醒消息

```
妮妮的 OpenID: ____________________
蛋蛋的 OpenID: ____________________
```

- [ ] **Step 6: 提交最终代码**

```bash
git add -A
git commit -m "feat(phase1): Phase 1 完成 - 项目初始化 + 登录功能"
```

---

## Phase 1 验收标准

- [ ] 小程序可以正常编译和预览
- [ ] 云开发环境配置完成
- [ ] 登录云函数正常工作
- [ ] 用户信息正确保存到数据库
- [ ] 首页和个人中心可以正常导航
- [ ] 妮妮和蛋蛋的 OpenID 已记录

---

## 下一步

Phase 1 完成后，进入 **Phase 2: 笔记 CRUD 功能**
