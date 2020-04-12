// miniprogram/index/index.js
const app = getApp()
const db = wx.cloud.database()
//引入登陆拦截器
let filter = require('../utils/filter.js');
import Dialog from '../../@vant/weapp/dialog/dialog';
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
    "radiotext": '', //分类的值  1代表技能 2代表知识 3代表心情分享
    "radio": '0', //单选框的值
    "timestamp": '', // 时间戳 timestamp 
    fileList: [], //保存上传图片   
    fileIds: [], //保存上传文件的所有fileId   
    sizeType: ['compressed'] //'original',
  },
  //添加图片
  afterRead(event) {
    //从页面获取图片对象
    const {
      file
    } = event.detail
    //从页面获取当前图片的下标
    const {
      index
    } = event.detail
    //如果有多个图片一起上传就循环遍历上传
    for (let i = 0; i < file.length; i++) {
      //设置图片对象在页面中的状态
      file[i].status = 'uploading'
      file[i].message = '上传中'
      const fileList = this.data.fileList
      fileList[i + index] = file[i]
      //赋值到页面
      this.setData({
        fileList: fileList //.concat(file[i])
      });
      //上传图片   ---------------------------------
      // 要上传文件资源的路径
      const filePath = file[i].path
      // 正则表达式，获取文件扩展名
      let suffix = /\.[^\.]+$/.exec(filePath)[0];
      const tempPath = filePath.split('.')
      //去掉斜杠
      var temp = tempPath[tempPath.length - 2].split('/')
      //去掉 ：
      temp = temp[0].split(':')
      // 云存储路径
      const cloudPath = 'userUploadImage/could-img-' + new Date().getTime() + temp[0] + suffix
      //调用ContentCheck云函数检查图片是否违规
      wx.cloud.callFunction({
        name: 'ContentCheck',
        data: {
          img: filePath
        }
      }).then(res => {
        //定义一个detail对象 方便下面对图片进行的删除操作
        var detail = {
          index: i + index
        }
        //图片违规 状态码为0是正常
        if (res.result.imgErrCode != 0) {
          //警告提醒
          Dialog.alert({
            title: '警告',
            message: '图片存在违规操作！'
          }).then(() => {});
          //违规就需要删掉                      
          this.delete(detail)
          //图片正常就执行文件的上传
        } else {
          wx.cloud.uploadFile({
            "cloudPath": cloudPath,
            "filePath": filePath,
          }).then(res => { //图片上传成功          
            //返回图片在云存储中的地址
            //app.globalData.fileID += res.fileID
            var fileIds = this.data.fileIds
            fileIds[i + index] = res.fileID
            this.setData({
              fileIds: fileIds //.push(res.fileID)
            })
            var t = this.data.fileList
            //之所以要加一个index就是为了保证设置状态的下标正确 因为i是for循环里的i index是fileList中的
            t[i + index].status = "done"
            t[i + index].message = ""
            //上传完图片后需要修改状态   //重新赋值        
            this.setData({
              fileList: t
            });
            // console.log(this.data.fileList)   
            // console.log(this.data.fileIds)             
          }).catch(error => { //图片上传失败
            //需要一个弹出框提醒用户
            Dialog.alert({
              title: '提示',
              message: '上传失败！'
            }).then(() => {});
            //删除fileList中的图片
            this.delete(detail)
          })
        }
      })
    }
  },
  //删除图片 ---------------------------------
  delete(event) {
    //这里分为两种删除 一种是用户的手动删除index=event.detail.index 另一种是图片存在违规行为index = event  (i+index这里的index是自己手动设置的对应67行
    var {
      index
    } = event
    if (index == null) {
      index = event.detail.index
    }
    const fileList = this.data.fileList
    fileList.splice(index, 1);
    this.setData({
      fileList: fileList
    });
  },
  // 表单提交
  formSubmit(e) {
    //进行登录拦截
    const flag = filter.identityFilter()
    if (!flag) {
      return false;
    }
    const {
      value
    } = e.detail
    //将上传的图片链接保存到value中
    value.fileIds = this.data.fileIds
    console.log(value)
    //检查信息是否完整    
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
    //先审核用户的发帖内容
    //调用ContentCheck云函数审核获取的评论内容
    wx.cloud.callFunction({
      name: 'ContentCheck',
      data: {
        msg: value.question
      }
    }).then(res => {
      //违规拦截
      if (res.result.msgErrCode != 0) {
        wx.hideLoading()
        //警告提醒
        Dialog.alert({
          title: '警告',
          message: '评论内容存在违规操作！'
        }).then(() => {
          //放回到我的提问
          wx.navigateBack({
            delta: 1
          })
        });
        //调用云函数删除已经上传的文件         
        wx.cloud.callFunction({
          name: 'deltePostById',
          data: {
            "id": '', //云函数已经设置了id为空的情况 只删除图片
            "fileIds": value.fileIds
          }
        }).then(res => {
          console.log(res)
        })
      } else {
        //获取本地的用户信息
        const uInfo = wx.getStorageSync('userInfo')
        // //获取用户头像
        const avatarUrl = uInfo.avatarUrl
        // //获取用户昵称
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
            data: {
              "timestamp": this.data.timestamp, //时间戳
              "loveCount": 0, //点赞数
              "clickCount": 0, //点击量
              "avatarUrl": avatarUrl, //用户头像
              "nickName": nickName, //用户昵称
              "content": value.question, //问题的文本 -- 内容
              "category": value.category, //问题的分类
              "contentsImg": value.fileIds, //内容的配图
            },
            success(res) {
              wx.hideLoading()
              //放回到我的提问
              wx.navigateBack({
                delta: 1
              })
              // console.log(res)
            },
            fail(err) {
              console.log(err)
            }
          })
          wx.hideLoading()
        })
      }
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
  onShow: function (e) {
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
    } else if (radio == 3) {
      this.setData({
        radiotext: "心情分享"
      })
    }
  },

  clickPreview() {},
  // 添加图片
  addimage(e) {
    const that = this
    // 用来临时保存上传图片的地址
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
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
        const cloudPath = 'userUploadImage/could-img-' + new Date().getTime() + temp[0] + suffix
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
            console.log('上传失败 ' + err)
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