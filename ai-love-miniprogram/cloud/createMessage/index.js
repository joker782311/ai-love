// cloud/createMessage/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  const { noteId, content, images, paperStyle } = event

  // 参数校验
  if (!noteId) {
    return {
      success: false,
      error: '笔记 ID 不能为空'
    }
  }

  if ((!content || content.trim() === '') && (!images || images.length === 0)) {
    return {
      success: false,
      error: '留言内容或图片不能为空'
    }
  }

  try {
    // 验证笔记是否存在
    const note = await db.collection('notes').doc(noteId).get()

    if (!note.data) {
      return {
        success: false,
        error: '笔记不存在'
      }
    }

    const result = await db.collection('messages').add({
      data: {
        noteId: noteId,
        authorId: OPENID,
        content: content ? content.trim() : '',
        images: images || [],
        paperStyle: paperStyle || 'default',
        createdAt: db.serverDate()
      }
    })

    return {
      success: true,
      messageId: result._id,
      message: '留言成功'
    }
  } catch (err) {
    console.error('Create message error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
