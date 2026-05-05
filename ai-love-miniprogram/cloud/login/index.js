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
      // 用户已存在，返回用户信息
      return {
        success: true,
        isNewUser: false,
        user: userResult.data[0]
      }
    } else {
      // 新用户，创建用户记录
      const userInfo = event.userInfo || {}
      const identity = event.identity // 'nini' | 'dandan'

      // 优先使用用户选择的身份，其次根据微信昵称自动判断
      let nickName = userInfo.nickName || '小伙伴'

      if (identity === 'nini') {
        nickName = '妮妮'
      } else if (identity === 'dandan') {
        nickName = '蛋蛋'
      } else {
        // 没有选择身份时，根据微信昵称自动判断
        const wechatNick = (userInfo.nickName || '').toLowerCase()
        if (wechatNick.includes('妮') || wechatNick.includes('ni')) {
          nickName = '妮妮'
        } else if (wechatNick.includes('蛋') || wechatNick.includes('dan')) {
          nickName = '蛋蛋'
        }
      }

      const result = await db.collection('users').add({
        data: {
          _openid: OPENID,
          nickName: nickName,
          realName: '',
          avatarUrl: userInfo.avatarUrl || '',
          language: 'zh',
          createdAt: db.serverDate()
        }
      })

      return {
        success: true,
        isNewUser: true,
        user: {
          _id: result._id,
          _openid: OPENID,
          nickName: nickName,
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
