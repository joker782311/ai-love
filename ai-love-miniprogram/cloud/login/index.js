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
      const defaultNicknames = {
        'ovxxxxxxxxx1': '妮妮', // TODO: 替换为妮妮的 openid
        'ovxxxxxxxxx2': '蛋蛋'  // TODO: 替换为蛋蛋的 openid
      }

      const nickName = defaultNicknames[OPENID] || '小伙伴'

      const result = await db.collection('users').add({
        data: {
          nickName: nickName,
          realName: '',
          avatarUrl: event.avatarUrl || '',
          language: 'zh', // 'zh' | 'teochew'
          createdAt: db.serverDate()
        }
      })

      const newUser = {
        _id: result._id,
        _openid: OPENID,
        nickName: nickName,
        realName: '',
        avatarUrl: event.avatarUrl || '',
        language: 'zh',
        createdAt: new Date()
      }

      return {
        success: true,
        isNewUser: true,
        user: newUser
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
