// cloud/getReminders/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { senderId, receiverId } = event

  try {
    const query = {}
    if (senderId) {
      query.senderId = senderId
    }
    if (receiverId) {
      query.receiverId = receiverId
    }

    const remindersResult = await db.collection('reminders')
      .where(query)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()

    return {
      success: true,
      reminders: remindersResult.data
    }
  } catch (err) {
    console.error('Get reminders error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
