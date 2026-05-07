// cloud/saveLocation/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  const { nickName, location } = event

  try {
    const result = await db.collection('user_locations').add({
      data: {
        _openid: OPENID,
        nickName: nickName,
        location: location,
        createdAt: db.serverDate()
      }
    })

    return {
      success: true,
      _id: result._id
    }
  } catch (err) {
    console.error('saveLocation error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
