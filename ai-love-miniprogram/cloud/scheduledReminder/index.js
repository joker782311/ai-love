// cloud/scheduledReminder/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口 - 由云开发定时任务触发
exports.main = async (event, context) => {
  try {
    // 获取当前时间（转换为北京时间 UTC+8）
    const now = new Date()
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    const currentHour = String(beijingTime.getHours()).padStart(2, '0')
    const currentMinute = String(beijingTime.getMinutes()).padStart(2, '0')
    const currentTime = `${currentHour}:${currentMinute}`

    console.log('定时任务触发，当前北京时间:', currentTime)

    // 查询所有待发送的定时提醒
    const tasks = await db.collection('scheduledTasks')
      .where({
        status: 'pending',
        scheduledTime: currentTime
      })
      .get()

    console.log('待发送任务数量:', tasks.data.length)

    const results = []

    for (const task of tasks.data) {
      try {
        // 使用云函数方式发送订阅消息（支持统一消息推送）
        await cloud.callFunction({
          name: 'sendSubscribeMessage',
          data: {
            touser: task.receiverId,
            templateId: 'EC0i9nFMk7d4VSnWbHdtejQN8oVkDqSjNDowcIAy8dI',
            page: 'pages/reminders/reminders',
            data: {
              thing2: { value: task.content.length > 20 ? task.content.substring(0, 20) + '...' : task.content },
              time3: { value: `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')} ${currentTime}` },
              date4: { value: `${beijingTime.getFullYear()}年${String(beijingTime.getMonth() + 1).padStart(2, '0')}月${String(beijingTime.getDate()).padStart(2, '0')}日` }
            }
          }
        })

        console.log('消息发送成功:', task._id)

        // 更新提醒状态
        if (task.reminderId) {
          await db.collection('reminders').doc(task.reminderId).update({
            data: {
              isSent: true,
              sentAt: db.serverDate()
            }
          })
        }

        // 更新任务状态
        await db.collection('scheduledTasks').doc(task._id).update({
          data: {
            status: 'completed',
            completedAt: db.serverDate()
          }
        })

        results.push({ taskId: task._id, success: true })
      } catch (sendErr) {
        console.error('发送失败:', sendErr, 'taskId:', task._id)
        results.push({ taskId: task._id, success: false, error: sendErr.message })
      }
    }

    return {
      success: true,
      total: tasks.data.length,
      results: results
    }
  } catch (err) {
    console.error('定时任务执行失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// HTTP 触发器入口
exports.http = async (event, context) => {
  try {
    const result = await exports.main({}, context)
    return {
      statusCode: 200,
      data: result
    }
  } catch (err) {
    return {
      statusCode: 500,
      data: { error: err.message }
    }
  }
}
