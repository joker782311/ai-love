// cloud/sendSubscribeMessage/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { touser, templateId, page, data, miniprogramState } = event

  try {
    console.log('发送订阅消息:', { touser, templateId, page })

    await cloud.openapi.subscribeMessage.send({
      touser: touser,
      templateId: templateId,
      miniprogramState: miniprogramState || 'formal',
      page: page,
      data: data
    }, {
      // 使用统一消息推送的凭证
      $url: 'tcb'
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
