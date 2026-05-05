// cloud/getReminders/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  const { senderId, type } = event // type: 'sent' | 'received'

  try {
    let query
    if (type === 'received') {
      // 获取发送给当前用户的提醒
      query = db.collection('reminders').where({
        receiverId: OPENID
      })
    } else {
      // 获取当前用户发送的提醒（默认）
      query = db.collection('reminders').where({
        senderId: senderId || OPENID
      })
    }

    const reminders = await query
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    // 获取发送者和接收者信息
    const userIds = [...new Set(reminders.data.map(r => type === 'received' ? r.senderId : r.receiverId))]
    const usersResult = await db.collection('users')
      .where({
        _openid: db.command.in(userIds)
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

    // 合并用户信息
    const result = reminders.data.map(reminder => ({
      ...reminder,
      targetUser: userMap[type === 'received' ? reminder.senderId : reminder.receiverId] || { nickName: '未知用户', avatarUrl: '' }
    }))

    return {
      success: true,
      reminders: result
    }
  } catch (err) {
    console.error('Get reminders error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
