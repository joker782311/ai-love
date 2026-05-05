// cloud/fixUserNicknames/index.js
// 一次性云函数：批量修复用户昵称

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const nicknames = {
      '9756e76169f9abc10100fda80961c580': '妮妮',
      '482e95cf69f9ac3a0101703f04bb1f41': '蛋蛋'
    }

    const results = []

    for (const [openid, nickname] of Object.entries(nicknames)) {
      const result = await db.collection('users')
        .where({ _openid: openid })
        .update({
          data: { nickName: nickname }
        })

      results.push({ openid, nickname, updated: result.stats.updated })
    }

    return {
      success: true,
      message: '昵称已更新',
      results
    }
  } catch (err) {
    console.error('Fix nicknames error:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
