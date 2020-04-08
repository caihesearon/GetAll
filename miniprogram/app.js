//app.js
App({
  globalData: {
    uInfo:{}
  },
  onLaunch: function (e) {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud-test-tnjps',
        traceUser: true,  //是否在将用户访问记录到用户管理中，在控制台中可见
      })
    }

    
    
    // //调用云函数login获取用户的信息
    // wx.cloud.callFunction({
    //   name: 'login',
    //   data: {},
    //   success(res) {
    //     // console.log(e)
    //     //需要获取本地的用户信息
    //     console.log(res)
    //     wx.getUserInfo({
    //       suceess(r){
    //         console.log(r)
    //       },
    //       fail(){
    //         console.log('失败')
    //       }
    //     })
    //   }
    // })    

    
  },
  onShow(e) {
    
  }, 

})
