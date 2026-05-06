// cloud/scheduledReminder/index.js
// 定时检查器：仅检查待发送任务，不实际发送
// 实际发送由用户打开小程序时通过 checkAndSendReminders 完成
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口 - 由云开发定时任务触发
// 仅用于记录日志，实际发送由 checkAndSendReminders 处理
exports.main = async (event, context) => {
  try {
    // 获取当前时间（转换为北京时间 UTC+8）
    const now = new Date()
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    const currentHour = String(beijingTime.getHours()).padStart(2, '0')
    const currentMinute = String(beijingTime.getMinutes()).padStart(2, '0')
    const currentTime = `${currentHour}:${currentMinute}`

    console.log('定时检查器触发，当前北京时间:', currentTime)

    // 查询所有待发送的定时提醒（仅记录，不发送）
    const tasks = await db.collection('scheduledTasks')
      .where({
        status: 'pending',
        scheduledTime: currentTime
      })
      .get()

    console.log('待发送任务数量:', tasks.data.length)
    if (tasks.data.length > 0) {
      console.log('待发送任务 ID:', tasks.data.map(t => t._id))
      console.log('这些任务将在用户打开小程序时通过 checkAndSendReminders 发送')
    }

    return {
      success: true,
      total: tasks.data.length,
      message: '检查完成，待发送任务将在用户打开小程序时处理'
    }
  } catch (err) {
    console.error('定时检查器执行失败:', err)
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
