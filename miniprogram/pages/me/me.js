const app = getApp()

// 获取默认环境的数据库的引用：
const db = wx.cloud.database()
import Dialog from '@vant/weapp/dialog/dialog';
var util = require("../utils/common.js")
Page({
  data: {
    signature: "纸上得来终觉浅 绝知此事要躬行",
    avatarUrl: 'cloud://cloud-test-tnjps.636c-cloud-test-tnjps-1300299389/image/user-unlogin.png',
    nickName: '昵称',
    logined: false,    
    myPostCount: 0, //我的提问个数
    myAnswerCount: 0, //我的回答个数
    myLovePageCount: 0, //我的收藏个数
    myAttentionCount: 0, //我的关注个数
    fileList2:[],    
  },
  afterRead(event) {
    const { file, name } = event.detail;
    console.log(event.detail)
    const fileList = this.data[`fileList${name}`];

    this.setData({ [`fileList${name}`]: fileList.concat(file) });
  },
  delete(event) {
    console.log(event)
    const { index, name } = event.detail;
    const fileList = this.data[`fileList${name}`];
    fileList.splice(index, 1);
    this.setData({ [`fileList${name}`]: fileList });
  },
  onLoad: function(e) {
   
  },
  login(){
    wx.getUserInfo({
      complete: (userInfo) => {
        if(userInfo.userInfo != null){
          //console.log(userInfo)
          //console.log('登录成功')
          //登录成功改变登录状态 记录用户信息
          // this.logined = true;
          const uInfo = userInfo.userInfo
          app.globalData.uInfo = uInfo
          this.setData({
            avatarUrl: uInfo.avatarUrl,
            nickName: uInfo.nickName,
            logined: true
          })
          //将用户的信息存入本地
          wx.setStorageSync('userInfo', uInfo)
           //将用户的信息存入数据库
           const user = uInfo
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
        }else{
          //console.log('登录失败')
        }
      },
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(e) {    
    //判断用户是否已经登录    
    const uInfo = wx.getStorageSync('userInfo')
    app.globalData.uInfo = uInfo
    
    //const uInfo = util.checkLoginStatus()   
    //如果登录直接获取用户信息
    if (uInfo) {
      //修改信息      
      this.setData({
        avatarUrl: uInfo.avatarUrl,
        nickName: uInfo.nickName,
        logined: true
      })
      util.getMyPostCount().then(res => {
        this.setData({
          myPostCount: res
        })
      })      
      util.getMyAnswerCount().then(res => {
        this.setData({
          myAnswerCount: res.total
        })
      })
      util.getMyLovePageCount().then(res => {
        this.setData({
          myLovePageCount: res.total
        })
      })
    }
  },
  //用户退出
  quitApp() {
    //wx.logout().then

    this.setData({
      avatarUrl: 'cloud://cloud-test-tnjps.636c-cloud-test-tnjps-1300299389/image/user-unlogin.png',
      nickName: '昵称',
      logined: false
    })
    wx.setStorageSync('userInfo', '')
  },

  //进入钱包
  enterMoneyBag() {
    wx.navigateTo({
      url: 'moneybag/moneybag',
    })
  },
  //完善信息
  conpleteInfo() {
    wx.navigateTo({
      url: 'information/information',
    })
  },
  //用户名片中的我的提问入口
  getMyPostPage() {
    wx.navigateTo({
      url: 'myPost/myPost',
    })
  },
  //用户名片中的我的回答入口
  getMyAnswerPage() {
    wx.navigateTo({
      url: 'Myanswer/Myanswer',
    })
  },
  //用户名片中的我的收藏入口
  getMyLovePostPage() {
    wx.navigateTo({
      url: 'myLovePost/myLovePost',
    })
  },
  //用户名片中的我的关注入口
  myAttention(){
    wx.showModal({
      title: '提示',
      content: '该功能还在开发中！',
    })
  },
 

})