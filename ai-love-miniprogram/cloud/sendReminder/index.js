// cloud/sendReminder/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { receiverId, content, senderNick, templateId } = event

  if (!receiverId || !content) {
    return {
      success: false,
      error: '参数错误'
    }
  }

  try {
    // 发送订阅消息
    const result = await cloud.openapi.subscribeMessage.send({
      touser: receiverId,
      templateId: templateId || 'YOUR_TEMPLATE_ID', // TODO: 替换为实际模板 ID
      data: {
        thing1: { value: content.substring(0, 20) },
        time2: { value: new Date().toLocaleString('zh-CN') },
        character3: { value: senderNick || '关心你的人' }
      },
      page: 'pages/index/index'
    })

    return {
      success: true,
      message: '发送成功',
      result: result
    }
  } catch (err) {
    console.error('Send reminder error:', err)

    // 订阅消息常见错误处理
    if (err.errCode === 43101) {
      return {
        success: false,
        error: '用户未订阅消息，请先订阅',
        needSubscribe: true
      }
    }

    return {
      success: false,
      error: err.message
    }
  }
}
