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

      // 根据微信昵称自动判断身份
      let nickName = userInfo.nickName || '小伙伴'
      const wechatNick = (userInfo.nickName || '').toLowerCase()

      // 如果微信昵称包含特定关键字，自动设置昵称
      if (wechatNick.includes('妮') || wechatNick.includes('ni')) {
        nickName = '妮妮'
      } else if (wechatNick.includes('蛋') || wechatNick.includes('dan')) {
        nickName = '蛋蛋'
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
