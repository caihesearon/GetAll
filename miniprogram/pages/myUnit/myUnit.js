var util = require("../utils/common.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
      pagedate:"",
      n:0,
      talk:[
        "哈哈你又来了！\n心怀感恩会有好运哦~",
        "你又来看我啦！\n对我这么殷勤，我会膨胀的~",
        "小可爱~\n要成为更好的自己，加油！",
        "哈喽~\n今天过的怎么样。",
        "见到你真高兴~\n今天的你有点不一样哦。",
        "小可爱~\n愿你始终对生活保持赤诚和热爱！",
        "你要勇敢\n要敢于面对未知的困难",
        "Hurry Up~\n别让青春跑在了前面~",
        "你要相信~\n美好的事情即将发生！",
        "我又见到你了\n小可爱~"
      ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    const date = new Date().getTime()
    var num = Math.floor((Math.random() * 100000) % 10)
    this.setData({
      pagedate: util.formatTime(date, 'Y年M月D日'),
      n:num
    })
  },

  //添加post
  addPost() {
    wx.navigateTo({
      url: '../Submitquestion/Submitquestion',
    })
  },
  //进入我的收藏
  enterMyLove(){
    wx.navigateTo({
      url: '../me/myLovePost/myLovePost',
    })
  },
  //进入我要回答界面
  wantAnswer(){
    wx.navigateTo({
      url: '../me/Wantanswer/Wantanswer',
    })
  },
  //进入我的问题界面
  myQuestion(){
    wx.navigateTo({
      url: '../me/myPost/myPost',
    })
  },
  //进入我的回答
  myAnswer(){
    wx.navigateTo({
      url: '../me/Myanswer/Myanswer',
    })
  }
})