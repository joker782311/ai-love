// cloud/getMessages/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { noteId } = event

  if (!noteId) {
    return {
      success: false,
      error: '笔记 ID 不能为空'
    }
  }

  try {
    // 获取留言列表
    const messagesResult = await db.collection('messages')
      .where({ noteId: noteId })
      .orderBy('createdAt', 'asc')
      .get()

    // 获取留言作者信息
    const authorIds = [...new Set(messagesResult.data.map(msg => msg.authorId))]
    const usersResult = await db.collection('users')
      .where({
        _openid: db.command.in(authorIds)
      })
      .field({
        _openid: true,
        nickName: true,
        avatarUrl: true
      })
      .get()

    const userMap = {}
    usersResult.data.forEach(user => {
      userMap[user._openid] = user
    })

    const messages = messagesResult.data.map(msg => ({
      ...msg,
      author: userMap[msg.authorId] || { nickName: '未知用户', avatarUrl: '' }
    }))

    return {
      success: true,
      messages: messages
    }
  } catch (err) {
    console.error('Get messages error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
