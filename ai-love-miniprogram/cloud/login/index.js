// cloud/login/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  try {
    // 查询用户是否已存在
    const userResult = await db.collection('users').where({
      _openid: OPENID
    }).get()

    if (userResult.data.length > 0) {
      // 用户已存在，检查是否已设置身份
      const user = userResult.data[0]
      if (!user.identity || user.identity === '') {
        // 老用户但没有身份，返回需要选择身份
        return {
          success: true,
          isNewUser: false,
          needsIdentity: true,
          user: user
        }
      }
      // 已设置身份，直接返回用户信息
      return {
        success: true,
        isNewUser: false,
        needsIdentity: false,
        user: user
      }
    } else {
      // 新用户，需要设置身份
      const identity = event.identity // 'nini' | 'dandan'
      if (!identity) {
        return {
          success: false,
          error: '新用户需要选择身份'
        }
      }

      const nickName = identity === 'nini' ? '妮妮' : '蛋蛋'
      const userInfo = event.userInfo || {}

      const result = await db.collection('users').add({
        data: {
          _openid: OPENID,
          nickName: nickName,
          identity: identity,
          realName: '',
          avatarUrl: userInfo.avatarUrl || '',
          language: 'zh',
          createdAt: db.serverDate()
        }
      })

      return {
        success: true,
        isNewUser: true,
        needsIdentity: false,
        user: {
          _id: result._id,
          _openid: OPENID,
          nickName: nickName,
          identity: identity,
          avatarUrl: userInfo.avatarUrl || '',
          language: 'zh'
        }
      }
    }
  } catch (err) {
    console.error('Login error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
