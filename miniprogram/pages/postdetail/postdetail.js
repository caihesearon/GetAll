const app = getApp()
const db = wx.cloud.database()
var util = require("../utils/common.js")
//引入登陆拦截器
let filter = require('../utils/filter.js');
import Dialog from '../../vant-weapp/dialog/dialog';
Page({
  data: {
    tex: "评论一句，为前排打call !",
    love: "like-o",
    isLove: false, // 是否收藏
    postInfo: {}, //用来保存当前帖子信息
    comments: [], //用来保存当前帖子所有的评论对象
    timestamp: '', //时间戳
    postCreateTime: '',
    commentTotal: 0,
    problemicon: "thumb-circle-o",
    commentContent: '', //输入框中的内容
    isfocus: false, //控制输入框是否弹起
  },
  onLoad(e) {    
    var postCreateTime = util.formatTime(app.globalData.postInfo.timestamp, 'Y-M-D')
    //将全局的postInfo赋值给当前页面的postInfo
    this.setData({
      postInfo: app.globalData.postInfo,
      postCreateTime: postCreateTime
    })
    //清空上次通信数据
    // app.globalData.postInfo = null  
    //设置当前的页码
    this.page = 0
    //第一次获取post
    this.getCommentList(true)
    //第一次获取评论总数
    this.getCommentCount()
    //获取本地缓存中是否有当前帖子的点赞信息
    var flag = util.getLocalStorage(this.data.postInfo._id)
    //如果赞存在
    if (flag) {
      this.setData({
        problemicon: "thumb-circle"
      })
    }
    //获取用户是否收藏该post    
    this.isLovePost()
  },
  onPullDownRefresh: function () {
    this.page = 0
    this.getCommentList(true)
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {
    //页面加1
    this.page += 1
    this.getCommentList()
  },
  //获取当前帖子的评论
  getCommentList(isInit) {
    //每次刷新显示的个数
    const pageCount = 10
    //当前页码
    const currPage = this.page
    //获取当前帖子的id postId
    const postId = this.data.postInfo._id
    //需要调用云函数根据postId获得评论列表
    wx.cloud.callFunction({
      name: 'getCommentByPostId',
      data: {
        postId,
        currPage,
        pageCount,
      }
    }).then(res => {
      if (isInit) {
        var arr = res.result.data
        //设置时间
        for (var i = 0; i < arr.length; i++) {
          arr[i].timestamp = util.formatTime(arr[i].timestamp, 'Y-M-D h:m:s')
          // console.log(arr[i].timestamp)
        }
        this.setData({
          comments: arr
        })
      } else {
        var arr = res.result.data
        for (var i = 0; i < arr.length; i++) {
          arr[i].timestamp = util.formatTime(arr[i].timestamp, 'Y-M-D h:m:s')
        }
        this.setData({
          comments: this.data.comments.concat(arr)
        })
      }
      // console.log(res)
    })
  },
  //获取当前帖子的评论总数
  getCommentCount() {
    //获取当前帖子的id postId
    const postId = this.data.postInfo._id
    wx.cloud.callFunction({
      name: 'getCommentByPostId',
      data: {
        postId,
        mode: 'getCount'
      }
    }).then(res => {
      this.setData({
        commentTotal: res.result.total
      })
    })
  },
  //点击图片 -- 使图片有一个放大的效果
  clickImg(e) {
    //获取data-src
    var src = e.currentTarget.dataset.src
    var imgList = []
    imgList[0] = src
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList
    })
  },
  //提交评论
  /**
   * 思路分析:
   *  需要获取当前用户的信息(app.globalData.uInfo存放了当前用户的信息)
   *  获取该post的id
   * 评论表里需要
   *  文章的id
   *  评论用户openid
   *  评论用户头像
   *  评论用户昵称
   *  评论内容
   *  评论的点赞数  timestamp  1570356505378
   */
  submitComment(e) {
    //进行登录拦截
    const flag = filter.identityFilter()
    if (!flag) {
      return false;
    }
    //获取当前评论用户的评论内容
    const {
      commentText
    } = e.detail.value
    //如果评论为空
    if (commentText.trim() == '') {
      return
    }
    //获取当前帖子的id postId
    const postId = this.data.postInfo._id
    const category = this.data.postInfo.category
    //获取当前评论用户的openid
    const {
      openid,
      avatarUrl,
      nickName
    } = app.globalData.uInfo
    //获取时间    
    const date = new Date().getTime()
    //调用ContentCheck云函数审核获取的评论内容
    wx.cloud.callFunction({
      name: 'ContentCheck',
      data: {
        msg: commentText
      }
    }).then(res => {      
      //违规拦截
      if (res.result.msgErrCode != 0) {        
        //警告提醒
        Dialog.alert({
          title: '警告',
          message: '评论内容存在违规操作！'
        }).then(() => {
          // on close
        });  
      } else {        
        //调用云函数向数据库中添加评论  
        wx.cloud.callFunction({
          name: "addComment",
          data: {
            "postId": postId,
            "commentText": commentText,
            "openid": openid,
            "avatarUrl": avatarUrl,
            "nickName": nickName,
            "loveCount": 0,
            "category": category,
            "timestamp": date, //时间戳
            "isLove": false //临时保存是否点赞
          }
        }).then(ress => {
          //成功时候需要当前的评论对象拼接到comments数组中            
          var newComment = {
            "postId": postId,
            "commentText": commentText,
            "openid": openid,
            "avatarUrl": avatarUrl,
            "nickName": nickName,
            "loveCount": 0,
            "category": category,
            "timestamp": date, //时间戳
            "isLove": false //临时保存是否点赞
          }
          this.setData({
            comments: this.data.comments.concat(newComment)
          })
          //并更新评论总数
          this.getCommentCount()
          wx.showToast({
            title: '成功',
            icon: 'success'
          })
        })
      }
    })  
    //将输入框中的内容清空
    this.setData({
      commentContent: ''
    })
  },
  /**
   * 逻辑：   
   * 将用户点过赞的postId存放到本地并设置时间
   * 用户点赞的时候（数据库也需要修改），如果本地有该postId就取消
   * 点赞（数据库也需要修改），如果没有就添加到本地并设置时间 
   */
  // 帖子点赞事件
  giveproblem: function (e) {
    //进行登录拦截
    const flag1 = filter.identityFilter()
    if (!flag1) {
      return false;
    }
    var num = 0
    const postId = this.data.postInfo._id
    //获取本地缓存中是否有当前帖子的点赞信息
    var flag = util.getLocalStorage(this.data.postInfo._id)
    if (flag) {
      //存在则是需要取消赞
      this.data.postInfo.loveCount--
      this.setData({
        problemicon: "thumb-circle-o",
        postInfo: this.data.postInfo
      })
      //取消赞后需要清除本地缓存
      wx.removeStorageSync(this.data.postInfo._id)
      num = -1
    } else {
      //不存在就需要向本地存储中添加信息
      util.setLocalStorage(this.data.postInfo._id)
      //并且还需要修改点赞数
      this.data.postInfo.loveCount++
      this.setData({
        problemicon: "thumb-circle",
        postInfo: this.data.postInfo
      })
      num = 1
    }
    //修改到数据库中
    wx.cloud.callFunction({
      name: 'upPostLoveCount',
      data: {
        postId,
        num
      }
    })
  },
  //点击评论弹出输入框
  givecontent: function (e) {
    this.setData({
      isfocus: true
    });
  },
  /**
   * 逻辑：
   *  需要一个表用来记录哪个用户收藏了该帖子
   * 用户的openId
   * 帖子的postId -- 这是一个数组
   */
  //收藏
  givestar: function (e) {
    //进行登录拦截
    const flag = filter.identityFilter()
    if (!flag) {
      return false;
    }
    //获取帖子的postId
    const postId = this.data.postInfo._id
    const {
      openid
    } = app.globalData.uInfo
    //如果没有收藏 就收藏 并添加到数据库中
    if (!this.data.isLove) {
      //修改当前收藏的状态
      this.setData({
        love: "like",
        isLove: true
      })
      // 添加到数据库中
      db.collection('userLovePost').add({
        data: {
          "postId": postId,
        }
      })
    } else { //如果收藏了 点击 就取消收藏 从数据库中删除
      this.setData({
        love: "like-o",
        isLove: false
      })
      // 从数据库中删除
      //需要调用云函数
      wx.cloud.callFunction({
        name: 'delLovePost',
        data: {
          "postId": postId,
          "openid": openid
        }
      }).then(res => {
        // console.log(res)
      })
    }
  },
  //获取当前用户是否收藏了该帖子
  isLovePost() {
    const postId = this.data.postInfo._id
    //获取帖子的postId
    db.collection('userLovePost')
      .where({
        "postId": postId
      }).count().then(res => {
        if (res.total == 1) {
          this.setData({
            love: "like",
            isLove: true
          })
        } else {
          this.setData({
            love: "like-o",
            isLove: false
          })
        }
      })
  },
  //评论点赞
  /**
   * 逻辑
   *  需要将用户点赞的评论的id和保存到本地中并设置时间
   */
  commentLove(e) {
    //进行登录拦截
    const flag = filter.identityFilter()
    if (!flag) {
      return false;
    }
    //获取用户点击的评论下标
    const index = e.currentTarget.dataset.index
    //首先从本地中根据评论的id获取是否已点赞
    //获取评论的id
    const commentId = e.currentTarget.id
    var num = 0
    var judge = util.getLocalStorage(commentId)
    // console.log(judge)
    //如果本地不存在就是需要点赞 -- 就添加到本地并修改数据库和图标
    if (!judge) {
      //修改当前点赞评论的图标
      this.changeCommentIcon(true, index)
      //保存到本地并设置时间
      util.setLocalStorage(commentId)
      //修改数据库
      num = 1
      //如果本地存在 -- 就移除
    } else {
      const that = this
      wx.showModal({
        title: '提示',
        content: '您今天已经点过赞了，是否取消点赞',
        success(res) {
          if (res.confirm) {
            that.changeCommentIcon(false, index)
            //取消点赞
            //取消赞后需要清除本地缓存
            wx.removeStorageSync(commentId)
            num = -1
            //修改到数据库中  参数：评论的id 是否点赞
            wx.cloud.callFunction({
              name: 'upCommentLoveCount',
              data: {
                commentId,
                num
              }
            })
          }
        }
      })
    }
    //修改到数据库中  参数：评论的id 是否点赞
    wx.cloud.callFunction({
      name: 'upCommentLoveCount',
      data: {
        commentId,
        num
      }
    })
  },
  //修改评论的点赞的按钮图标
  changeCommentIcon(flag, index) {
    //获取当前评论对象
    var arr = this.data.comments
    arr[index].isLove = flag;
    if (flag) {
      arr[index].loveCount++
    } else {
      arr[index].loveCount--
    }
    this.setData({
      comments: arr
    })
  },




  enter: function (e) {

  },

})