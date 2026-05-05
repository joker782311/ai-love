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

    const templateId = 'EC0i9nFMk7d4VSnWbHdtejQN8oVkDqSjNDowcIAy8dI' // 订阅消息模板 ID
    const results = []

    for (const task of tasks.data) {
      try {
        // 格式化时间为微信要求的格式：YYYY-MM-DD HH:mm（北京时间）
        const beijingNow = new Date(now.getTime() + 8 * 60 * 60 * 1000)
        const timeStr = `${beijingNow.getFullYear()}-${String(beijingNow.getMonth() + 1).padStart(2, '0')}-${String(beijingNow.getDate()).padStart(2, '0')} ${String(beijingNow.getHours()).padStart(2, '0')}:${String(beijingNow.getMinutes()).padStart(2, '0')}`
        // date4 需要是日期格式：YYYY 年 MM 月 DD 日
        const dateStr = `${beijingNow.getFullYear()}年${String(beijingNow.getMonth() + 1).padStart(2, '0')}月${String(beijingNow.getDate()).padStart(2, '0')}日`

        // 发送订阅消息
        await cloud.openapi.subscribeMessage.send({
          touser: task.receiverId,
          templateId: templateId,
          data: {
            thing2: { value: task.content.length > 20 ? task.content.substring(0, 20) + '...' : task.content },
            time3: { value: timeStr },
            date4: { value: dateStr }
          }
        })

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
