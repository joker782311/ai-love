// cloud/deleteNote/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  const { noteId } = event

  if (!noteId) {
    return {
      success: false,
      error: '笔记 ID 不能为空'
    }
  }

  try {
    // 验证作者权限
    const note = await db.collection('notes').doc(noteId).get()

    if (note.data.authorId !== OPENID) {
      return {
        success: false,
        error: '无权限删除此笔记'
      }
    }

    // 删除笔记
    await db.collection('notes')
      .doc(noteId)
      .remove()

    return {
      success: true,
      message: '笔记删除成功'
    }
  } catch (err) {
    console.error('Delete note error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
