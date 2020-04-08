const app = getApp()
const db = wx.cloud.database()
var util = require("../../utils/common.js")
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
    name: "", //当前评论的用户的id
    phonenum: "" //评论者的电话号码
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
  onPullDownRefresh: function() {
    this.page = 0
    this.getCommentList(true)
    wx.stopPullDownRefresh()
  },
  onReachBottom: function() {
    //页面加1
    this.page += 1
    this.getCommentList()
  },
  //获取当前帖子的评论
  getCommentList(isInit) {
    //每次刷新显示的个数
    const pageCount = 5
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
    //获取当前评论用户的openid
    const {
      openid,
      avatarUrl,
      nickName
    } = app.globalData.uInfo
    //获取时间    
    const date = new Date().getTime()
    console.log(date)
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
        "timestamp": date, //时间戳
        "isLove": false //临时保存是否点赞
      }
    }).then(res => {
      //成功时候需要添加到comments数组中
      this.getCommentList(true)
      //并更新评论总数
      this.getCommentCount()
      wx.showToast({
        title: '成功',
        icon: 'success'
      })
    })
    // })
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
  giveproblem: function(e) {
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
  givecontent: function(e) {
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
  givestar: function(e) {
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
      const date = new Date().getTime()
      // 添加到数据库中
      db.collection('userLovePost').add({
        data: {
          "postId": postId,
          "timestamp": date //1570166355151
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
  getphoneid(e) {
    console.log(e.currentTarget.id)
    const commitcard = e.currentTarget.id
    var openid = ""
    db.collection('comments')
      .where({
        "_id": commitcard
      }).get().then(res => {
        wx.cloud.callFunction({
          name: "getPhoneByOpendid",
          data: {
            "openid": res.data[0].openid
          },
        }).then(ress => {
          wx.showModal({
            title: '用户的姓名：' + ress.result.data[0].name,
            content: '是否继续联系',
            success: function(res) {
              // 如果用户点击确定 则将用户号码复制到张贴版上
              if (res.confirm) {
                wx.setClipboardData({
                  data: ress.result.data[0].phoneId,
                  sucess(re) {
                    wx.showToast({
                      title: '用户号码已复制',
                      icon: "none"
                    })
                  }
                })
              }
            }
          })
          // ress.result.data[0].name,
          // ress.result.data[0].phoneId 
        })
      })
      wx.getClipboardData({
        sucess(res) {
          if(res.data == ""){
            wx.showToast({
              title:"暂无该用户任何信息",
              icon:"none"
            })
          }
        }
      })
  }

})