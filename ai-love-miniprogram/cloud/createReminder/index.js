// cloud/createReminder/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  const { receiverId, content, type, scheduledTime } = event

  try {
    // 验证订阅消息模板
    const templateId = 'NfYbN5H3Qj8K9M2pL7vR4wX6' // TODO: 替换为实际的模板 ID

    // 创建提醒记录
    const reminder = await db.collection('reminders').add({
      data: {
        senderId: OPENID,
        receiverId: receiverId,
        content: content,
        type: type || 'manual', // 'manual' | 'scheduled'
        scheduledTime: scheduledTime, // 格式：'08:00'
        isSent: type === 'manual', // 立即发送的直接标记为已发送
        createdAt: db.serverDate()
      }
    })

    // 如果是立即发送，调用发送接口
    if (type === 'manual') {
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: receiverId,
          templateId: templateId,
          data: {
            thing1: { value: content.length > 20 ? content.substring(0, 20) + '...' : content },
            time2: { value: new Date().toLocaleString('zh-CN') }
          }
        })

        // 更新状态为已发送
        await db.collection('reminders').doc(reminder._id).update({
          data: {
            isSent: true,
            sentAt: db.serverDate()
          }
        })
      } catch (sendErr) {
        console.error('Send message error:', sendErr)
        // 发送失败不抛错，只是标记为未发送
      }
    } else if (type === 'scheduled') {
      // 定时任务：添加到定时任务集合
      await db.collection('scheduledTasks').add({
        data: {
          type: 'reminder',
          reminderId: reminder._id,
          receiverId: receiverId,
          content: content,
          scheduledTime: scheduledTime,
          status: 'pending',
          createdAt: db.serverDate()
        }
      })
    }

    return {
      success: true,
      message: type === 'manual' ? '提醒已发送' : '定时提醒已设置',
      reminderId: reminder._id
    }
  } catch (err) {
    console.error('Create reminder error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
