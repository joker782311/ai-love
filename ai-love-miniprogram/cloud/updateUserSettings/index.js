// cloud/updateUserSettings/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  const { language, nickName, realName, avatarUrl } = event

  try {
    const updateData = {}

    if (language !== undefined) {
      updateData.language = language
    }
    if (nickName !== undefined) {
      updateData.nickName = nickName
    }
    if (realName !== undefined) {
      updateData.realName = realName
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl
    }

    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        error: '没有要更新的内容'
      }
    }

    updateData.updatedAt = db.serverDate()

    await db.collection('users')
      .where({ _openid: OPENID })
      .update({
        data: updateData
      })

    return {
      success: true,
      message: '设置已更新'
    }
  } catch (err) {
    console.error('Update user settings error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
