// cloud/scheduledReminder/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口 - 支持定时触发器和 HTTP 触发器
exports.main = async (event, context) => {
  try {
    // HTTP 触发器需要通过云函数 ID 获取访问令牌
    const wxContext = cloud.getWXContext()
    console.log('wxContext:', wxContext)
    console.log('OPENID:', wxContext?.OPENID)
    console.log('ENV:', wxContext?.ENV)

    // 如果是 HTTP 触发，返回 HTTP 响应
    const isHttp = event?.httpMethod === 'GET' || event?.httpMethod === 'POST'

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
