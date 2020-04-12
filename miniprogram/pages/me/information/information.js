import Notify from '@vant/weapp/notify/notify';
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['湖北商贸学院', '武汉大学', '华中科技大学', '中国地质大学'],
    array1: ['经济学院', '会计学院', '管理学院', '计算机学院', '生物学院'],
    objectArray: [{
        id: 0,
        name: '湖北商贸学院'
      },
      {
        id: 1,
        name: '武汉大学'
      },
      {
        id: 2,
        name: '华中科技大学'
      },
      {
        id: 3,
        name: '中国地质大学'
      }
    ],
    objectArray1: [{
        id: 0,
        name: '经济学院'
      },
      {
        id: 1,
        name: '会计学院'
      },
      {
        id: 2,
        name: '管理学院'
      },
      {
        id: 3,
        name: '计算机学院'
      },
      {
        id: 4,
        name: '生物学院'
      },
    ],
    school: "请选择学校", //学校
    institute: "请选择学院", //学院
    name: '', //姓名
    phoneId:'',//手机号或者微信号
    sId: '', //学号
    sclass: '', //班级
    profession: '', //专业
    dataid: '' //该用户的_id
  },
  //选择器picker
  bindPickerChange: function(e) {
    var index = e.detail.value;
    var id = this.data.objectArray[index].id;
    var name = this.data.objectArray[index].name;
    console.log(id + " " + name) //当前的数据
    this.setData({
      school: this.data.array[e.detail.value]
    })
  },

  bindPickerChange1: function(e) {
    var index1 = e.detail.value;
    var id = this.data.objectArray1[index1].id;
    var name = this.data.objectArray1[index1].name;
    console.log(id + " " + name) //当前的数据
    this.setData({
      institute: this.data.array1[e.detail.value]
    })
  },
  // 完善信息后点击确认事件
  onClickRight() {
    wx.showToast({
      title: '信息提交成功',
      icon: 'sucess'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  //输入框失焦时更新id的值
  losephoneId: function (e) {
    //若没有输入手机号或者微信号
    if (e.detail.value == '') {
      wx.showToast({
        title: '号码不能为空',
        icon: 'none',
        duration: 1500
      })
    }
    //手机号或者微信号不为空执行
    else {
      this.setData({
        phoneId: e.detail.value
      })
    }
  },

  loseId: function(e) {
    //若没有输入学号
    if (e.detail.value == '') {
      wx.showToast({
        title: '学号不能为空',
        icon: 'none',
        duration: 1500
      })
    }
    //学号不为空执行
    else {
      this.setData({
        sId: e.detail.value
      })
    }
  },
  //输入框失焦时更新name的值
  loseName: function(e) {
    //若没有输入姓名
    if (e.detail.value == '') {
      wx.showToast({
        title: '姓名不能为空',
        icon: 'none',
        duration: 1500
      })
    }
    //姓名不为空执行
    else {
      this.setData({
        name: e.detail.value
      })
    }
  },
  //输入框失焦时更新class的值
  loseClass: function(e) {
    //若没有输入班级
    if (e.detail.value == '') {
      wx.showToast({
        title: '班级不能为空',
        icon: 'none',
        duration: 1500
      })
    }
    //班级不为空执行
    else {
      this.setData({
        sclass: e.detail.value
      })
    }
  },
  //输入框失焦时更新profession的值
  loseProfession: function(e) {
    //若没有输入专业
    if (e.detail.value == '') {
      wx.showToast({
        title: '专业不能为空',
        icon: 'none',
        duration: 1500
      })
    }
    //专业不为空执行
    else {
      this.setData({
        profession: e.detail.value
      })
    }
  },
  //点击取消时触发
  bindCancel: function(e) {
    wx.showToast({
      title: '请输入学校',
      icon: 'none',
      duration: 2000
    })
  },
  bindCancel: function(e) {
    wx.showToast({
      title: '请输入学院',
      icon: 'none',
      duration: 2000
    })
  },
  submitInfo: function(e) {
    //若有信息没有填写，则要求完善所有信息后提交
    if (this.data.school == '请选择学校' || this.data.institute == '请选择学院' || this.data.phoneId == '' || this.data.name == '' || this.data.sId == '' || this.data.sclass == '' || this.data.profession == '') {
      //弹出框提示完善所有信息
      wx.showToast({
        title: '请完善所有信息',
        icon: 'none',
        duration: 2000
      })
    } else {
      //完善用户信息传入到数据库
      db.collection('user').doc(this.data.dataid).update({
        data: {
          //将输入的数据更新到数据库中
          school: this.data.school, //学校
          college: this.data.institute, //学院
          name: this.data.name, //姓名
          phoneId:this.data.phoneId, //手机号或者微信号
          sId: this.data.sId, //学号
          sclass: this.data.sclass, //班级
          profession: this.data.profession //专业
        }
      }).then(res => {
        console.log(res)
      })
      wx.navigateBack({
        delta: 1
      })
      wx.showToast({ //弹出框
        title: '提交成功！', //显示内容
        icon: 'sucess',
        duration: 2000
      })
    }
  },
  onLoad: function() {
    //获取当前用户的_id
    db.collection('user').get().then(res => {
      this.setData({
        dataid: res.data[0]._id, //获取该用户的_id
        school: res.data[0].school, //学校
        institute: res.data[0].college, //学院
        name: res.data[0].name, //姓名
        phoneId:res.data[0].phoneId, //手机号或者微信号
        sId: res.data[0].sId, //学号
        sclass: res.data[0].sclass, //班级
        profession: res.data[0].profession //专业
      })
    })
  },
})