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

      // 根据 openid 设置默认昵称
      let nickName = '小伙伴'
      if (OPENID === '9756e76169f9abc10100fda80961c580') {
        nickName = '妮妮'
      } else if (OPENID === '482e95cf69f9ac3a0101703f04bb1f41') {
        nickName = '蛋蛋'
      } else if (userInfo.nickName) {
        nickName = userInfo.nickName
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
