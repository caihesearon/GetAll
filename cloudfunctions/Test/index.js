// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {
    // env: cloud.DYNAMIC_CURRENT_ENV
    env: 'cloud-test-tnjps'
  }
) 
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  return await db.collection('user').get()


  // let { school } = event
  // return school;
  // return await db.collection('user').add({
  //   data:{
  //     school:'湖北商贸'
  //   }
  // })

  // const wxContext = cloud.getWXContext()

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}