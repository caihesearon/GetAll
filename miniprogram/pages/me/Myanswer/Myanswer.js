const app = getApp()
const db = wx.cloud.database()
var util = require("../../utils/common.js")
//引入登陆拦截器
let filter = require('../../utils/filter.js');
Page({
  data: {
    category: '技能需求',
    opid: '',
    allInfo: [], //保存评论内容和评论时间
    userPostName: [], //保存用户的时间和姓名
    flag: 0
  },
  onShow(e) {
    //进行登录拦截
    const flag = filter.identityFilter()     
    if(flag){
      db.collection('user').get().then(res => {
        this.setData({
          opid: res.data[0]._openid
        })
        this.page = 0
        this.getPostList()  
      })
    }    
  },
  // 侧边导航切换事件
  switchNav: function (e) {
    var page = this;
    var id = e.target.id;
    if (id == 0) {
      this.setData({
        category: '技能需求'
      })
      this.page = 0
      this.getPostList()
    } else if (id == 1) {
      this.setData({
        category: '问答板块'
      })
      this.page = 0
      this.getPostList()
    } else if (id == 2) {
      this.setData({
        category: '心情分享'
      })
      this.page = 0
      this.getPostList()
    }
    if (this.data.currentTab == id) {
      return false;
    } else {
      page.setData({
        currentTab: id
      });
    }
    page.setData({
      flag: id
    });
  },
  catchTouchMove: function (res) {
    return false
  },
  enter(e) {
    //获取当前帖子的 _id
    const id = e.currentTarget.id
    //根据 _id 为当前帖子增加一个点击量
    wx.cloud.callFunction({
      name: 'incClickCount',
      data: {
        postId: id
      }
    })
    //根据id从postList中获取帖子的全部信息
    var arr = this.data.userPostName
    var index = -1
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]._id == id) {
        arr[i].clickCount += 1
        index = i
      }
    }
    //将获取的postInfo放入全局变量中
    app.globalData.postInfo = arr[index]
    // console.log(app.globalData.postInfo)
    wx.navigateTo({
      url: '../../postdetail/postdetail',
    })

  },
  //点击点赞按钮
  givegood(e) {
    wx.showModal({
      title: '您不能为自己的评论点赞',
      content: '',
    })
  },
  //获取当前用户的所有post
  getPostList() {
    this.setData({
      userPostName: [],
      allinfo: []
    })
    const opd = this.data.opid
    const category = this.data.category
    wx.showLoading({
      title: '加载中',
    })
    //通过分类查询当前用户所有的评论
    wx.cloud.callFunction({
      name: 'getSkillAnswer',
      data: {
        opd,
        category
      }
    }).then(res => {
      this.setData({
        allInfo: res.result.data
      })
      var arr = this.data.allInfo
      //转换时间格式
      for (var i = 0; i < arr.length; i++) {
        arr[i].timestamp = util.formatTime(arr[i].timestamp, 'Y-M-D h:m:s')
      }
      this.setData({
        allInfo: arr
      })
      //遍历获取当前分类的所有评论对应的帖子id
      for (var j = 0; j < this.data.allInfo.length; j++) {
        var pid = this.data.allInfo[j].postId
        wx.cloud.callFunction({
          name: 'getSkillAnswerUser',
          data: {
            pid
          }
        }).then(res => {
          res.result.data[0].timestamp = util.formatTime(res.result.data[0].timestamp, 'Y-M-D h:m:s')
          this.setData({
            userPostName: this.data.userPostName.concat(res.result.data)
          })
          //如果帖子的长度和评论长度相等
          if (this.data.userPostName.length == this.data.allInfo.length) {
            var arrs = this.data.userPostName
            for (var k = 0; k < this.data.allInfo.length; k++) {
              for (var b = k; b < this.data.allInfo.length; b++) {
                if (this.data.userPostName[b]._id == this.data.allInfo[k].postId) {
                  var vtemp = arrs[b]
                  arrs[b] = arrs[k]
                  arrs[k] = vtemp
                }
              }
            }
            this.setData({
              userPostName: arrs
            })
          }
        }).catch(err => {})
      }
      wx.hideLoading()
    }).catch(err => {})
  },

  getit(e) {

  },

  
})