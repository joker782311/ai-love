// cloud/sendSubscribeMessage/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { touser, templateId, page, data } = event

  try {
    console.log('发送订阅消息:', { touser, templateId, page })

    await cloud.openapi.subscribeMessage.send({
      touser: touser,
      templateId: templateId,
      miniprogramState: 'formal',
      page: page,
      data: data
    })

    console.log('订阅消息发送成功')

    return {
      success: true
    }
  } catch (err) {
    console.error('发送订阅消息失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
