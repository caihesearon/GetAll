const db = wx.cloud.database()
const app = getApp()
Page({
  data: {
    postList: [], //帖子列表
    state: false, //下拉框的状态
    first_click: false, //第一次下拉框的显示状态
    active: 0, //选中的标签   0 分类  1 热度  2 时间  3知识   4心情
    titleName: "分类 ◁", //分类 ▼
  },
  //点击事件  判断下拉框的状态
  toggle: function(e) {
    if ((e.detail.title == "分类 ◁") || (e.detail.title == "分类 ▼")) {
      var list_state = this.data.state,
        first_state = this.data.first_click;
      if (!first_state) {
        this.setData({
          first_click: true,
          titleName: "分类 ▼"
        });
      }
      if (list_state) {
        this.setData({
          state: false,
          titleName: "分类 ◁"
        });
      } else {
        this.setData({
          state: true,
          titleName: "分类 ▼"
        });
      }
    }
  },
  //下拉框中 的选择
  slect: function(e) {
    if (e.currentTarget.id == 1) {
      this.setData({
        active: 0
      })
      this.page = 0
      this.getPostList(true)
    } else if (e.currentTarget.id == 2) {
      this.setData({
        active: 3
      })
      this.page = 0
      this.getPostList(true)
    } else if (e.currentTarget.id == 3) {
      this.setData({
        active: 4
      })
      this.page = 0
      this.getPostList(true)
    }
    this.setData({
      state: false,
      titleName: "分类 ◁"
    });
  },
  //   //滑动事件
  onChange(event) {
    wx.showToast({
      title: `切换到标签 ${event.detail.title}`,
      icon: 'none'
    });
    if (event.detail.title == "热度") { //若当前标签是热度
      this.setData({
        active: 1
      })
      this.page = 0
      this.getPostList(true)
    }
    if (event.detail.title == "分类 ▼") { //判断当前标签是否为分类
      // console.log(event.detail)
      this.setData({
        hiddenName: false
      })
    }
    if (event.detail.title == "时间") { //若当前标签是时间
      this.setData({
        active: 2
      })
      this.page = 0
      this.getPostList(true)
    }
  },
  ishidden1(e) {
    this.setData({
      state: false,
      titleName: "分类 ◁"
    });
  },

  onShow: function(options) {
    this.page = 0
    this.getPostList(true)
  },
  onPullDownRefresh: function() {
    this.page = 0
    this.getPostList(true)
    wx.stopPullDownRefresh()
  },
  onReachBottom: function() {
    this.page += 1
    this.getPostList()
  },
  //获取当前用户的所有post
  getPostList(isInit) {
    //每次刷新显示的个数
    const pageCount = 6
    //当前页码
    const currPage = this.page
    wx.showLoading({
      title: '加载中',
    }) 
    //默认展示知识需求
    if (this.data.active == 0) {
      wx.cloud.callFunction({
        name: 'getKnowledge',
        data: {
          // currPage,
          // pageCount
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
      })
    }
    //如果用户点击了热度
    else if (this.data.active == 1) {
      wx.cloud.callFunction({
        name: 'getAllPost',
        data: {
          // currPage,
          // pageCount
        }
      }).then(res => {
        if (isInit) {
          this.setData({
            postList: res.result.data
          })
          // console.log(this.data.postList)
        } else {
          //拼接
          this.setData({
            postList: this.data.postList.concat(res.result.data)
          })
        }
        wx.hideLoading()
      })
    }
    //如果用户点击了时间
    else if (this.data.active == 2) {
      wx.cloud.callFunction({
        name: 'TimePost',
        data: {
          // currPage,
          // pageCount
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
      })
    } else if (this.data.active == 3) {
      const category = '技能需求'
      wx.cloud.callFunction({
        name: 'getSkill',
        data: {
          category,
          // currPage,
          // pageCount
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
      })
    } else if (this.data.active == 4) {
      const category = '心情分享'
      wx.cloud.callFunction({
        name: 'getSkill',
        data: {
          category,
          // currPage,
          // pageCount
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
      })
    }
  },

  showDetail(e) {
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
      url: '../../postdetail/postdetail',
    })
  },

  //删除postList数组中的数据
  deletePostListById(id) {
    //获取当前数据的index
    var arr = this.data.postList
    var index = -1
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]._id == id) {
        index = i
      }
    }
    // console.log(index)
    //将下标为第index的元素删除
    arr.splice(index, 1, '')
    this.setData({
      postList: arr
    })
  }
})