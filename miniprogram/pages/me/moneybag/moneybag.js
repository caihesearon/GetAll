// miniprogram/moneybag/moneybag.js
//引入登陆拦截器
let filter = require('../../utils/filter.js');
Page( {

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onShow: function(){
    // console.log("onShow")
    filter.identityFilter()   
  },
  click:function(){
    wx.showModal({
      title: '当前版本为免费版本',
      content: '后续更新可用',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.navigateTo({
            url: '',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }

    })
  }
  
})