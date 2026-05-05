// cloud/createNote/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  const { content, images, category } = event

  // 参数校验
  if (!content || content.trim() === '') {
    return {
      success: false,
      error: '笔记内容不能为空'
    }
  }

  try {
    const result = await db.collection('notes').add({
      data: {
        authorId: OPENID,
        content: content.trim(),
        images: images || [],
        category: category || 'thought', // 'idea' | 'thought' | 'memory'
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })

    return {
      success: true,
      noteId: result._id,
      message: '笔记创建成功'
    }
  } catch (err) {
    console.error('Create note error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
