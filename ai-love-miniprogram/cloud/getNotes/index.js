// cloud/getNotes/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 10, category } = event

  try {
    const dbQuery = db.collection('notes')
      .orderBy('createdAt', 'desc')

    // 按分类筛选
    if (category && category !== 'all') {
      dbQuery.where({ category: category })
    }

    // 分页
    const skipCount = (page - 1) * pageSize
    const notesResult = await dbQuery
      .skip(skipCount)
      .limit(pageSize)
      .get()

    // 获取作者信息
    const authorIds = [...new Set(notesResult.data.map(note => note.authorId))]
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

    // 合并作者信息和评论数
    const notes = await Promise.all(notesResult.data.map(async (note) => {
      // 统计评论数
      const messageCount = await db.collection('messages')
        .where({ noteId: note._id })
        .count()

      return {
        ...note,
        author: userMap[note.authorId] || { nickName: '未知用户', avatarUrl: '' },
        messageCount: messageCount.total
      }
    }))

    return {
      success: true,
      notes: notes,
      hasMore: notesResult.data.length === pageSize
    }
  } catch (err) {
    console.error('Get notes error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
