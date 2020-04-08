const app = getApp()
const db = wx.cloud.database()
//引入登陆拦截器
let filter = require('../../utils/filter.js');
Page({
  data: {
    postList: [],  //帖子列表
  },
  onShow: function (options) {
    //进行登录拦截
    const flag = filter.identityFilter()  
    if(flag){
      this.page = 0 
      this.getMyPostList(true)
    }          
  },
  onPullDownRefresh: function () {
    this.page = 0
    this.getMyPostList(true)
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {
    this.page += 1
    this.getMyPostList()
  },
  //获取当前用户的所有post
  getMyPostList(isInit){
    const pageCount = 6
    wx.showLoading({
      title: '加载中',
    })
    db.collection('userPost')
      .skip(this.page * pageCount)
      .limit(pageCount)
      .get()
      .then(res=>{
        if(isInit){
          this.setData({
            postList: res.data
          })
        }else{
          this.setData({
            postList: this.data.postList.concat(res.data)
          })
        }
      }).catch(err=>{
        console.log(err)
      })    
    wx.hideLoading()
  },
  //用户点击卡片事件
  postTap(e){
    if (this.endTime - this.startTime < 350) {
      //获取当前帖子的 _id
      const id = e.currentTarget.id
      //根据id从postList中获取帖子的全部信息
      var arr = this.data.postList
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
        url: '../myPostdetail/myPostdetail',
      })        
    }    
  },
  //删除postList数组中的数据
  deletePostListById(id){
    //获取当前数据的index
    var arr = this.data.postList
    var index = -1
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]._id == id) {
        index = i
      }
    }
    //将下标为第index的元素删除
    arr.splice(index, 1, '')
    this.setData({
      postList: arr
    })
  },
  //用户长按卡片事件
  postLongTap(e){    
    wx.showModal({
      title: '提示',
      content: '确定删除',
      success:res=>{
        if(res.confirm){
          //需要删除当前数据库中的数据和云存储中的图片
          //获取当前数据的id
          const id = e.currentTarget.id   
          console.log(id)       
          //根据id来删除数据
          wx.cloud.callFunction({
            name:'deltePostById',
            data:{
              "id":id
            }
          }).then(res=>{
            console.log(res)
          })
          //page里的postList也需要删除
          this.deletePostListById(id)
        }else{
          console.log('取消')
        }
      }
    })
  },
  //记录什么时候开始触摸
  postTouchStart(e){
    this.startTime = e.timeStamp;
  },
  //记录什么时候结束触摸
  postTouchEnd(e){
    this.endTime = e.timeStamp;
  },
  onReady: function () {

  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onShareAppMessage: function () {

  }
})