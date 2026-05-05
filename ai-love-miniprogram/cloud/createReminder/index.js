// cloud/createReminder/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  const { receiverId, content, type, scheduledTime, skipPush } = event

  try {
    // 订阅消息模板 ID
    const templateId = 'EC0i9nFMk7d4VSnWbHdtejQN8oVkDqSjNDowcIAy8dI'

    // 创建提醒记录
    const reminder = await db.collection('reminders').add({
      data: {
        senderId: OPENID,
        receiverId: receiverId,
        content: content,
        type: type || 'manual', // 'manual' | 'scheduled'
        scheduledTime: scheduledTime, // 格式：'08:00'
        isSent: skipPush ? false : (type === 'manual'), // 跳过推送时标记为未发送
        createdAt: db.serverDate()
      }
    })

    // 如果是立即发送且不禁用推送，调用发送接口
    if (type === 'manual' && !skipPush) {
      try {
        console.log('准备发送消息:', {
          touser: receiverId,
          templateId: templateId,
          content: content
        })

        await cloud.openapi.subscribeMessage.send({
          touser: receiverId,
          templateId: templateId,
          data: {
            thing2: { value: content.length > 20 ? content.substring(0, 20) + '...' : content },
            time3: { value: new Date().toLocaleString('zh-CN') },
            date4: { value: scheduledTime || '立即' }
          }
        })

        console.log('消息发送成功')

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
