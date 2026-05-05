// cloud/updateNote/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext

  const { noteId, content, images, category } = event

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
        error: '无权限修改此笔记'
      }
    }

    // 更新笔记
    const updateData = {
      updatedAt: db.serverDate()
    }

    if (content !== undefined) {
      updateData.content = content.trim()
    }
    if (images !== undefined) {
      updateData.images = images
    }
    if (category !== undefined) {
      updateData.category = category
    }

    await db.collection('notes')
      .doc(noteId)
      .update({
        data: updateData
      })

    return {
      success: true,
      message: '笔记更新成功'
    }
  } catch (err) {
    console.error('Update note error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
