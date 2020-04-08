// miniprogram/index/index.js
const app = getApp()
const db = wx.cloud.database()
//引入登陆拦截器
let filter = require('../utils/filter.js');
Page({
  /**
   * 页面的初始数据
   * 
   * 上线时需要修改 imagesrc 的值
   */ 
  data: {
    "value": '', //文本的内容
    "placeholder": "说点什么吧...",
    "maxlength": -1, // 最大输入长度，设置为 -1 的时候不限制最大长度
    "focus": true,
    "auto-height": true, // 是否自动增高，设置auto-height时，style.height不生效
    "adjust-position": true, // 键盘弹起时，是否自动上推页面
    "imagesrc": "cloud://cloud-test-tnjps.636c-cloud-test-tnjps-1300299389/image/addimage.PNG", //图片地址
    "radiotext": '', //分类的值  1代表技能 2代表知识 3代表心情分享
    "radio":'0',        //单选框的值
    "timestamp": '', // 时间戳 timestamp 
  },

  // 表单提交
  formSubmit(e) { 
    //进行登录拦截
    const flag = filter.identityFilter() 
    if(!flag){
      return false;
    }
    const { value } = e.detail
    // console.log(value)
    if (value.category == '' || value.question == '') {
      wx.showModal({
        title: '提示',
        content: '请完成所有的信息描述',
      })
      return
    }
    wx.showLoading({
      title: '发表中',
    })
    // console.log('dema')
    //判断图片是否被改变  --------  后期需要修改
    if (value.img == 'cloud://cloud-test-tnjps.636c-cloud-test-tnjps-1300299389/image/addimage.PNG') {
      // 用户没有上传图片 则设置为空
      value.img = ''
    } else {
      //修改 fileId
      value.img = app.globalData.fileID
    }
    //获取所有的信息后需要加入数据库中
    // console.log(value)
    //获取本地的用户信息
    const uInfo = wx.getStorageSync('userInfo')
    //获取用户头像
    const avatarUrl = uInfo.avatarUrl
    //获取用户昵称
    const nickName = uInfo.nickName
    //获取系统时间
    wx.cloud.callFunction({
      name: 'getSystemDate'
    }).then(res => {
      this.setData({
        timestamp: res.result
      })
      //添加问题
      db.collection('userPost').add({
        data:{
          "timestamp": this.data.timestamp, //时间戳
          "loveCount": 0,         //点赞数
          "clickCount": 0,        //点击量
          "avatarUrl": avatarUrl, //用户头像
          "nickName": nickName,   //用户昵称
          "content": value.question,//问题的文本 -- 内容
          "category": value.category, //问题的分类
          "contentImg":value.img,   //内容的配图
        },
        success(res){
          wx.hideLoading()
          //放回到我的提问
          wx.navigateBack({
            delta: 1
          })   
          // console.log(res)
        },
        fail(err){
          console.log(err)
        }
      })
      wx.hideLoading()
    })

    /**
     * value里面有  文章内容  用户图片  分类
     * 
     * 提交问题描述
     *  文章id postId _id -- 不需要
     *  时间戳 timestamp 
     *  点赞数 loveCount
     *  点击量  clickCount
     *  头像url 
     *  昵称
     *  创建日期
     *  用户openid
     *  问题的文本
     *  问题的图片
     *  问题的分类
     *  
     */
  },
  onShow: function(e) {
    wx.cloud.init({
      env: 'cloud-test-tnjps',
    })

    // console.log(this.data.imagesrc)
    const radio = this.data.radio    
    if (radio == 1) {
      this.setData({
        radiotext: "技能需求"
      })
    } else if (radio == 2) {
      this.setData({
        radiotext: "问答板块"
      })
    }else if(radio == 3){
      this.setData({
        radiotext:"心情分享"
      })
    }
  },
  // 添加图片
  addimage(e) {
    const that = this
    // 用来临时保存上传图片的地址
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 要上传文件资源的路径
        const filePath = res.tempFilePaths[0]
        // 正则表达式，获取文件扩展名
        let suffix = /\.[^\.]+$/.exec(filePath)[0]; 
        const tempPath = filePath.split('.')
        //去掉斜杠
        var temp = tempPath[tempPath.length - 2].split('/')
        //去掉 ：
        temp = temp[0].split(':')
        // 云存储路径
        const cloudPath = 'userUploadImage/could-img-'+ new Date().getTime() + temp[0] + suffix
        // 替换掉之前的图片-- 使图片回显
        that.setData({
          imagesrc: filePath
        })
        wx.cloud.uploadFile({
          "cloudPath": cloudPath,
          "filePath": filePath,
          success: res => {
            wx.showLoading({
              title: '上传中',
            })
            app.globalData.fileID = res.fileID
          },
          fail: err => {
            console.log('上传失败 '+err)
          },
          complete: com => {
            wx.hideLoading()
          }
        })
        
      }
    })
  },
  //替换掉之前的图片 -- 使图片回显
  setImage() {
    this.setData({
      imagesrc: app.globalData.fileID
    })
    return
  },
  onClickRight() {
    wx.showToast({
      title: '提交成功',
      icon: 'success'
    });
  },
  

})