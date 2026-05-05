// cloud/checkAndSendReminders/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const wxContext = cloud.getWXContext()
const { OPENID } = wxContext

exports.main = async (event, context) => {
  try {
    // 获取当前时间（转换为北京时间 UTC+8）
    const now = new Date()
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    const currentHour = String(beijingTime.getHours()).padStart(2, '0')
    const currentMinute = String(beijingTime.getMinutes()).padStart(2, '0')
    const currentTime = `${currentHour}:${currentMinute}`

    console.log('检查定时提醒，当前北京时间:', currentTime, 'OPENID:', OPENID)

    // 查询当前用户的待发送定时提醒
    const tasks = await db.collection('scheduledTasks')
      .where({
        status: 'pending',
        scheduledTime: currentTime,
        receiverId: OPENID
      })
      .get()

    console.log('待发送任务数量:', tasks.data.length)

    let sentCount = 0

    for (const task of tasks.data) {
      try {
        // 发送订阅消息
        await cloud.openapi.subscribeMessage.send({
          touser: OPENID,
          templateId: 'EC0i9nFMk7d4VSnWbHdtejQN8oVkDqSjNDowcIAy8dI',
          miniprogramState: 'formal',
          page: 'pages/reminders/reminders',
          data: {
            thing2: { value: task.content.length > 20 ? task.content.substring(0, 20) + '...' : task.content },
            time3: { value: `${beijingTime.getFullYear()}-${String(beijingTime.getMonth() + 1).padStart(2, '0')}-${String(beijingTime.getDate()).padStart(2, '0')} ${currentTime}` },
            date4: { value: `${beijingTime.getFullYear()}年${String(beijingTime.getMonth() + 1).padStart(2, '0')}月${String(beijingTime.getDate()).padStart(2, '0')}日` }
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

        sentCount++
      } catch (sendErr) {
        console.error('发送失败:', sendErr, 'taskId:', task._id)
      }
    }

    return {
      success: true,
      count: sentCount
    }
  } catch (err) {
    console.error('检查提醒失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
