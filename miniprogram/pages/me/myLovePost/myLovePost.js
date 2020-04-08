const app = getApp()
const db = wx.cloud.database()
//引入登陆拦截器
let filter = require('../../utils/filter.js');
Page({
  data: {
    postIdList: [], //帖子Id列表
    postList: [], //帖子列表
  },
  onLoad(){   
  },
  onShow: function(options) {
    //进行登录拦截
    const flag = filter.identityFilter()     
    if(flag){
      this.setData({
        postList:[]
      })
      this.getMyPostList()
    }
  },
  onPullDownRefresh: function() {
    this.getMyPostList()
    wx.stopPullDownRefresh()
  }, 
  //获取当前用户收藏的所有post
  getMyPostList() {
    const arr = []
    var arrIndex = 0
    wx.showLoading({
      title: '加载中',
    })
    //获取用户收藏的所有的post的id
    // .orderBy('timestamp','desc')
    // .get()
    //const { openid } = app.globalData.uInfo
    console.log(app.globalData.uInfo)
    db.collection('userLovePost')     
      .get()
      .then(res => {
        this.setData({
          postIdList: res.data
        })
               
        for(var i = 0; i < res.data.length; i++){
          wx.cloud.callFunction({
            name: 'getLovePost',
            data:{
              postId: res.data[i].postId
            }
          }).then(ress =>{                        
            this.setData({
              postList: this.data.postList.concat(ress.result.data[0])
            })
          })          
        }                
      })
     
    wx.hideLoading()
  },

  //用户点击卡片事件
  postTap(e) {
    if (this.endTime - this.startTime < 350) {
      //获取当前帖子的 _id
      const id = e.currentTarget.id
      //根据id从postList中获取帖子的全部信息
      var arr = this.data.postList
      console.log(arr)
      var index = -1
      for (var i = 0; i < arr.length; i++) {
        if (arr[i]._id == id) {
          index = i
        }
      }
      this.setData({
        postList: arr
      })
      //将获取的postInfo放入全局变量中
      app.globalData.postInfo = arr[index]
      wx.navigateTo({
        url: '../../postdetail/postdetail',
      })
    }
  },  
  //用户长按卡片事件
  postLongTap(e) {
   
  },
  //记录什么时候开始触摸
  postTouchStart(e) {
    this.startTime = e.timeStamp;
  },
  //记录什么时候结束触摸
  postTouchEnd(e) {
    this.endTime = e.timeStamp;
  },
  onReady: function() {

  },
  onHide: function() {

  },
  onUnload: function() {

  },
  onShareAppMessage: function() {

  }
})