// pages/teochew-learn/teochew-learn.js
Page({
  data: {
    currentTab: 'greeting',
    greetings: [
      { key: '早上好', zh: '早上好', teochew: '早安，囡仔', pinyin: 'Za mung, nou a' },
      { key: '晚上好', zh: '晚上好', teochew: '晚安，好梦', pinyin: 'Mung an, ho bang' },
      { key: '你好吗', zh: '你好吗', teochew: '汝好无', pinyin: 'Lu ho bo' }
    ],
    daily: [
      { key: '吃饭', zh: '吃饭了吗', teochew: '食饭未', pinyin: 'Zia bung bue' },
      { key: '睡觉', zh: '早点睡', teochew: '困早', pinyin: 'Kun za' },
      { key: '喝水', zh: '多喝水', teochew: '呷水', pinyin: 'Jia zui' },
      { key: '穿衣', zh: '加衣服', teochew: '加衫', pinyin: 'Ga sann' },
      { key: '休息', zh: '休息一下', teochew: '休息', pinyin: 'Hioh ziah' }
    ],
    love: [
      { key: '想你', zh: '想你', teochew: '想汝', pinyin: 'Siu lu' },
      { key: '爱你', zh: '我爱你', teochew: '我爱你', pinyin: 'Wa ai lu' },
      { key: '宝贝', zh: '宝贝', teochew: '囡仔', pinyin: 'Nou a' },
      { key: '亲爱的', zh: '亲爱的', teochew: '亲爱的', pinyin: 'Cin ai e' }
    ]
  },

  // 切换 Tab
  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab
    })
  }
})
