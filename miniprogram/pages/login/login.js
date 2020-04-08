// pages/login/login.js
const app = getApp()
// 获取默认环境的数据库的引用：
const db = wx.cloud.database()
Page({
  data: {
    isHide: true,
    postList: [], //帖子列表
    // 轮播 
    tops: [{ 
        _id: 1,
        url: 'cloud://cloud-test-tnjps.636c-cloud-test-tnjps/tops/top_1.jpg'
      },
      {
        _id: 2,
        url: 'cloud://cloud-test-tnjps.636c-cloud-test-tnjps-1300299389/tops/281933-106.jpg'
      },
      
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 4000,
    duration: 1000,
  },
  onLoad: function(options) {
    
    //设置当前的页码
    this.page = 0
    //第一次获取post
    this.getPostList(true)
    //获取本地的用户信息
    const uInfo = wx.getStorageSync('userInfo')
    //如果用户已登录过
    if (uInfo) {
      //显示下方Tabbar
      // wx.showTabBar({
      //   animation: true        
      // })
      //直接显示首页
      this.setData({
        isHide: false,
      })
      app.globalData.uInfo = uInfo
    } else {
      //隐藏下方Tabbar
      // wx.hideTabBar({
      // })
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.page = 0
    this.getPostList(true)
    wx.stopPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    //页面加1
    this.page += 1
    this.getPostList()
  },
  //获取的post列表
  getPostList(isInit) {
    //每次刷新显示的个数
    const pageCount = 5
    //当前页码
    const currPage = this.page
    wx.showLoading({
      title: '加载中',
    })
    //需要调用云函数根据点赞数获取用户的所有的问题
    wx.cloud.callFunction({
      name: 'getAllPost',
      data: {
        currPage,
        pageCount
      }
    }).then(res => {
      if (isInit) {
        this.setData({
          postList: res.result.data
        })
      } else {
        //拼接
        this.setData({
          postList: this.data.postList.concat(res.result.data)
        })
      }
      wx.hideLoading()
      // console.log(res)
    }).catch(err => {
      console.log(res)
    })
  },
  onGetUserInfo(e) {
    //调用云函数login获取用户的信息
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        //如果用户同意了授权
        //设置当前的页码
        this.page = 0
        //第一次获取post
        this.getPostList(true)
        //显示下方Tabbar
        // wx.showTabBar({
        //   animation: true,
        // })
        if (e.detail.userInfo) {
          e.detail.userInfo.openid = res.result.wxInfo.OPENID
          //设置isHide显示首页
          // this.setData({
          //   isHide: false
          // })
          //将用户的信息存入本地
          wx.setStorageSync('userInfo', e.detail.userInfo)
          //将用户的信息存入数据库
          const user = e.detail.userInfo
          //需要判断数据库中是否存在该用户
          db.collection('user').get().then(res => {
            //如果用户不存在 -- 防止用户重复加入数据库
            // console.log(res.data[0]==null)
            if (res.data[0] == null) {
              db.collection('user').add({
                data: {
                  avatarUrl: user.avatarUrl, //头像
                  city: user.city, //城市
                  province: user.province, //省份
                  country: user.country, //国家
                  gender: user.gender, //性别
                  nickName: user.nickName, //昵称
                  school: '', //学校
                  college: '', //学院
                  sId: '', //学号
                  profession: '', //专业
                  name: '', //姓名
                  sclass: '', //班级
                  // lovePosts:[]  //我收藏的帖子
                },
                success: res => {
                  // console.log(res)
                }
              })
            }
          })
          //如果用户拒绝了授权
        } else {
          //用户按了拒绝按钮
          wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
            showCancel: false,
            confirmText: '返回授权',
            success: function(res) {
              // 用户没有授权成功，不需要改变 isHide 的值
              if (res.confirm) {
                console.log('用户点击了“返回授权”');
              }
            }
          })
        }
      }
    })
  },
  //用户点击了详情 -- 需要为这个文章增加一个点击量
  showDetail(e){
    //获取当前帖子的 _id
    const id = e.currentTarget.id
    //根据 _id 为当前帖子增加一个点击量
    wx.cloud.callFunction({
      name:'incClickCount',
      data:{
        postId:id
      }
    })
    //根据id从postList中获取帖子的全部信息
    var arr = this.data.postList
    var index = -1
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]._id == id) {
        arr[i].clickCount += 1
        index = i
      }
    }
    this.setData({
      postList: arr
    })
    //将获取的postInfo放入全局变量中
    app.globalData.postInfo = arr[index]
    // console.log(app.globalData.postInfo)
    wx.navigateTo({
      url: '../postdetail/postdetail',
    })    
  },
  
  showSkill(){
    wx.navigateTo({
      url: '../me/Wantanswer/Wantanswer',
    }) 
  },
  showQUestion(){
    wx.navigateTo({
      url: '../Submitquestion/Submitquestion',
    }) 
  },
  showMood(){
    wx.navigateTo({
      url: '../me/myLovePost/myLovePost',
    }) 
  },
 








  testGetId() {
    wx.cloud.callFunction({
      name: 'Test'
    }).then(res => {
      console.log(res)
    })
    // db.collection('user').get().then(res=>{
    //   console.log(res.data[0]._id)
    // })
  },
  testAdd() {
    // wx.cloud.callFunction({
    //   name:'Test',
    //   data:{
    //     school:"湖北商贸学院"
    //   }
    // }).then(res=>{
    //   console.log(res)
    // })
  },
  testQuest() {
    wx.navigateTo({
      url: '../Submitquestion/Submitquestion',
    })
  },
  //测试
  test() {
    db.collection('user').get().then(res => {
      console.log(res)
      if (res) {
        console.log('tes')
      }
    })
    // db.collection('user')
    //   .where({
    //     _openid: app.globalData.uInfo.openid
    //   }).get().then(res =>{
    //     console.log(res)
    //     console.log(res.data[0].user)
    //   })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})