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
