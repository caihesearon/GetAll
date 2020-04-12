const app = getApp()
const db = wx.cloud.database()
//引入登陆拦截器
let filter = require('../../utils/filter.js');
Page({
  data: {
    postList: [],  //帖子列表
  },
  onLoad: function (options) {
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
    // this.page += 1
    // this.getMyPostList()
  },
  //获取当前用户的所有post
  getMyPostList(isInit){
    const pageCount = 200
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
      //页面中拼接了id号和在postList中的下标号
      //获取当前帖子的 _id
      let str = e.currentTarget.id
      str = str.split('+')    
      const id = str[0]
      const index = str[1]
      //根据index从postList中获取帖子的全部信息
      var arr = this.data.postList
      //将获取的postInfo放入全局变量中
      app.globalData.postInfo = arr[index]        
      wx.navigateTo({
        url: '../myPostdetail/myPostdetail',
      })                   
    }    
  },
  
  //用户长按卡片事件
  postLongTap(e){       
    wx.showModal({
      title: '提示',
      content: '确定删除',
      success:res=>{
        if(res.confirm){
          var arr = this.data.postList
          //需要删除当前数据库中的数据和云存储中的图片
          //获取当前数据的id
          let str = e.currentTarget.id.split('+')           
          const id = str[0]
          const index = str[1]
          //根据index获取pageInfo
          const pageInfo = arr[index];
          //之所以有如下判断是因为图片的历史遗留问题
          //整理图片 使用一个fileIds数组进行保存
          var fileIds = []
          if(pageInfo.contentImg && pageInfo.contentImg!=''){//如果第一版本有图片            
            fileIds[0] = pageInfo.contentImg
          }else if(pageInfo.contentsImg[0]){//第二版本有图片
            fileIds = pageInfo.contentsImg
          }else{
            //第二版本没有图片 第一版本没有图片  都不用设置
          }           
          //根据id来删除数据
          wx.cloud.callFunction({
            name:'deltePostById',
            data:{
              "id":id,
              "fileIds": fileIds
            }
          }).then(res=>{
            console.log(res)
          })
          //page里的postList也需要删除          
          arr.splice(index, 1)
          this.setData({
            postList: arr
          })          
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