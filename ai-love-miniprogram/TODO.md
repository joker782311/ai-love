# Phase 1 待办事项 - 需要手动操作

## Task 6: 配置云开发数据库

### Step 1: 打开微信开发者工具
1. 打开微信开发者工具
2. 导入项目：选择 `ai-love-miniprogram` 目录
3. 填入你的小程序 AppID
4. 点击"云开发"按钮
5. 开通云开发环境（如未开通）
6. 记录云环境 ID，并更新 `app.js` 中的 `env: 'ai-love-xxx'`

### Step 2: 创建 users 集合
1. 在云开发控制台，点击"数据库"
2. 点击"添加集合"
3. 输入集合名称：`users`
4. 点击确定

### Step 3: 设置数据库权限
在 `users` 集合的"权限设置"中，选择以下之一：

**开发阶段（推荐）：**
- 选择"所有用户可读写"

**生产阶段：**
- 选择"自定义安全规则"
```json
{
  "read": "auth.openid == doc._openid",
  "write": "auth.openid == doc._openid"
}
```

### Step 4: 上传并部署云函数
1. 在微信开发者工具中，右键点击 `cloud/login` 目录
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成
4. 在云开发控制台 -> 云函数中确认 login 函数状态为"部署成功"

---

## Task 7: 测试登录功能

### Step 1: 编译并预览
1. 在微信开发者工具中点击"编译"
2. 确保没有报错

### Step 2: 真机预览
1. 点击"预览"按钮
2. 使用微信扫描二维码
3. 在手机上查看是否正常显示

### Step 3: 验证登录功能
1. 打开小程序
2. 查看是否自动调用登录云函数
3. 进入"我的"页面，查看用户信息是否正确显示

### Step 4: 检查云数据库
1. 在云开发控制台查看 `users` 集合
2. 确认已创建用户记录
3. 验证用户信息是否正确

### Step 5: 记录 OpenID
在云数据库中查看创建的用户记录，记录：

```
妮妮的 OpenID: ____________________
蛋蛋的 OpenID: ____________________
```

记录后，更新 `cloud/login/index.js` 中的默认昵称映射：
```javascript
const defaultNicknames = {
  'ovxxxxxxxxx1': '妮妮', // 替换为实际 openid
  'ovxxxxxxxxx2': '蛋蛋'  // 替换为实际 openid
}
```

---

## 验收标准

- [ ] 小程序可以正常编译和预览
- [ ] 云开发环境配置完成
- [ ] 登录云函数正常工作
- [ ] 用户信息正确保存到数据库
- [ ] 首页和个人中心可以正常导航
- [ ] 妮妮和蛋蛋的 OpenID 已记录
- [ ] 云函数已上传部署

---

# Phase 2 待办事项 - 需要手动操作

## Task 5: 创建 notes 集合并设置权限

### Step 1: 创建 notes 集合
在微信开发者工具云开发控制台：
1. 点击"数据库"
2. 点击"添加集合"
3. 输入集合名称：`notes`
4. 点击确定

### Step 2: 设置数据库权限
在 `notes` 集合的"权限设置"中：
```json
{
  "read": true,
  "write": "auth.openid == doc._openid"
}
```

### Step 3: 上传并部署所有云函数
在微信开发者工具中：
1. 右键点击 `cloud/createNote` → "上传并部署：云端安装依赖"
2. 右键点击 `cloud/getNotes` → "上传并部署：云端安装依赖"
3. 右键点击 `cloud/getNoteDetail` → "上传并部署：云端安装依赖"
4. 右键点击 `cloud/updateNote` → "上传并部署：云端安装依赖"
5. 右键点击 `cloud/deleteNote` → "上传并部署：云端安装依赖"

---

## Task 10: 创建 messages 集合并测试

### Step 1: 创建 messages 集合
在微信开发者工具云开发控制台：
1. 点击"数据库"
2. 点击"添加集合"
3. 输入集合名称：`messages`
4. 点击确定

### Step 2: 设置数据库权限
在 `messages` 集合的"权限设置"中：
```json
{
  "read": true,
  "write": "auth.openid == doc._openid"
}
```

### Step 3: 上传并部署 createMessage 云函数
在微信开发者工具中：
1. 右键点击 `cloud/createMessage` → "上传并部署：云端安装依赖"

### Step 4: 完整测试
1. 创建一篇新笔记
2. 查看笔记列表是否显示
3. 点击进入详情页
4. 发送一条留言
5. 验证留言显示

---

## Phase 2 验收标准

- [ ] 可以创建新笔记（支持文字 + 图片）
- [ ] 笔记列表正确显示（时间线排序）
- [ ] 笔记详情可以查看和留言
- [ ] 作者可以编辑和删除自己的笔记
- [ ] 分类筛选功能正常
- [ ] 留言功能正常

---

# Phase 3 待办事项 - 需要手动操作

## Task 2: 上传并部署 GetMessages 云函数

### Step 1: 上传云函数
在微信开发者工具中：
1. 右键点击 `cloud/getMessages` → "上传并部署：云端安装依赖"

### Step 2: 测试云函数
在微信开发者工具控制台测试：
```javascript
wx.cloud.callFunction({
  name: 'getMessages',
  data: { noteId: 'test-note-id' }
})
```

## Task 3: 创建 messages 集合并设置权限（Phase 3）

### Step 1: 确认 messages 集合存在
在微信开发者工具云开发控制台：
1. 点击"数据库"
2. 确认 `messages` 集合已创建
3. 如未创建，添加集合并设置权限

### Step 2: 设置数据库权限
在 `messages` 集合的"权限设置"中：
```json
{
  "read": true,
  "write": "auth.openid == doc._openid"
}
```

**注意：** messages 集合需要支持以下字段：
- `noteId`: 关联的笔记 ID
- `authorId`: 作者 openid
- `content`: 留言内容
- `images`: 图片数组（云存储 fileID）
- `paperStyle`: 信纸样式（default/love/star/blue/green/purple）
- `createdAt`: 创建时间

## Task 6: 测试纸条模式

### Step 1: 编译并预览
1. 在微信开发者工具中点击"编译"
2. 确保没有报错

### Step 2: 测试纸条功能
1. 创建一篇笔记
2. 进入详情页
3. 点击"写纸条"按钮
4. 选择信纸样式
5. 输入内容并发送
6. 点击查看纸条（拆信封动效）

### Step 3: 验证不同信纸样式
1. 发送 6 张不同信纸的纸条
2. 验证信纸样式正确显示

### Step 4: 验证图片功能
1. 写纸条时上传图片（最多 3 张）
2. 验证图片正确显示在纸条中
3. 点击图片验证预览功能

---

## Phase 3 验收标准

- [x] 纸条列表以"信封"形式展示
- [x] 点击纸条有"拆信封"的交互动效
- [x] 写纸条时可以选择信纸样式（6 种）
- [x] 不同信纸样式正确显示不同渐变背景
- [ ] 纸条模式体验流畅（需手动测试）
- [x] 支持上传图片（最多 3 张）
- [ ] 纸条图片可点击预览（需手动测试）

**代码实现已完成，待手动操作：**
1. 在微信开发者工具中上传部署 `getMessages` 云函数
2. 在云开发控制台创建 `messages` 集合并设置权限
3. 编译预览并测试纸条功能

---

# Phase 4 待办事项 - 需要手动操作

## Task 6: 创建 reminders 集合并配置

### Step 1: 创建 reminders 集合
在微信开发者工具云开发控制台：
1. 点击"数据库"
2. 点击"添加集合"
3. 输入集合名称：`reminders`
4. 点击确定

### Step 2: 设置数据库权限
在 `reminders` 集合的"权限设置"中：
```json
{
  "read": "auth.openid == doc._openid || auth.openid == doc.senderId || auth.openid == doc.receiverId",
  "write": "auth.openid == doc._openid"
}
```

### Step 3: 上传并部署所有云函数
在微信开发者工具中：
1. 右键点击 `cloud/createReminder` → "上传并部署：云端安装依赖"
2. 右键点击 `cloud/sendReminder` → "上传并部署：云端安装依赖"
3. 右键点击 `cloud/getReminders` → "上传并部署：云端安装依赖"

### Step 4: 更新页面路径配置
在 `app.json` 的 `pages` 数组中添加：
```json
"pages/reminders/reminders"
```

---

## Task 7: 申请订阅消息模板

### Step 1: 登录微信公众平台
访问 https://mp.weixin.qq.com/

### Step 2: 进入订阅消息
在左侧菜单选择"功能" → "订阅消息"

### Step 3: 添加模板
搜索并添加以下模板：
- 日常提醒（或其他合适的模板）

推荐模板结构：
```
模板标题：日常提醒
关键词：{{thing1.DATA}}（提醒内容）
        {{time2.DATA}}（提醒时间）
        {{character3.DATA}}（发送人）
```

### Step 4: 记录模板 ID
将获取的模板 ID 更新到代码中：
- `cloud/sendReminder/index.js` 第 22 行的 `YOUR_TEMPLATE_ID`
- `pages/reminders/reminders.js` 第 95 行的 `YOUR_TEMPLATE_ID`

### Step 5: 配置定时触发器（可选，用于自动发送定时提醒）
在 `cloud/sendReminder` 目录下创建 `config.json` 添加定时触发器配置：
```json
{
  "triggers": [
    {
      "cronRule": "0 0 8,12,18 * * *",
      "name": "sendScheduledReminders",
      "timeout": 30
    }
  ]
}
```

---

## Task 8: 测试提醒功能

### Step 1: 编译并预览
1. 在微信开发者工具中点击"编译"
2. 确保没有报错

### Step 2: 测试手动提醒
1. 进入提醒页面
2. 选择快捷模板或输入自定义内容
3. 点击"立即发送"
4. 验证对方是否收到订阅消息

### Step 3: 测试定时提醒
1. 选择"定时发送"
2. 设置时间
3. 验证提醒是否保存到数据库

### Step 4: 验证提醒记录
1. 查看历史记录列表
2. 验证状态显示（已发送/待发送）

### Step 5: 更新接收人配置
在 `pages/reminders/reminders.js` 的 `onLoad` 中，将硬编码的 openid 替换为实际的：
- 妮妮的 openid
- 蛋蛋的 openid

---

## Phase 4 验收标准

- [ ] 可以选择潮汕话模板快速发送提醒
- [ ] 可以自定义提醒内容
- [ ] 手动提醒可以立即发送
- [ ] 定时提醒可以设置时间（定时触发器需额外配置）
- [ ] 提醒历史记录正确显示
- [ ] 订阅消息正常推送
- [ ] reminders 集合已创建并配置权限
- [ ] 所有云函数已上传部署
- [ ] 订阅消息模板已申请并配置

---