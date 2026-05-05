// cloud/getNoteDetail/index.js
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
    // 获取笔记详情
    const noteResult = await db.collection('notes')
      .doc(noteId)
      .get()

    if (!noteResult.data) {
      return {
        success: false,
        error: '笔记不存在'
      }
    }

    // 获取作者信息
    const userResult = await db.collection('users')
      .where({ _openid: noteResult.data.authorId })
      .field({
        _openid: true,
        nickName: true,
        avatarUrl: true
      })
      .get()

    const author = userResult.data[0] || { nickName: '未知用户', avatarUrl: '' }

    // 获取留言列表
    const messagesResult = await db.collection('messages')
      .where({ noteId: noteId })
      .orderBy('createdAt', 'asc')
      .get()

    // 获取留言作者信息
    const messageAuthorIds = [...new Set(messagesResult.data.map(msg => msg.authorId))]
    const msgUsersResult = await db.collection('users')
      .where({
        _openid: db.command.in(messageAuthorIds)
      })
      .field({
        _openid: true,
        nickName: true,
        avatarUrl: true
      })
      .get()

    const msgUserMap = {}
    msgUsersResult.data.forEach(user => {
      msgUserMap[user._openid] = user
    })

    const messages = messagesResult.data.map(msg => ({
      ...msg,
      author: msgUserMap[msg.authorId] || { nickName: '未知用户', avatarUrl: '' }
    }))

    return {
      success: true,
      note: {
        ...noteResult.data,
        author: author
      },
      messages: messages
    }
  } catch (err) {
    console.error('Get note detail error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
