/**
 * 用于获取服务器时间
 * 生成时间戳
 */
const cloud = require('wx-server-sdk')

cloud.init(
  {
    env: 'cloud-test-tnjps'
  }
)
const db = cloud.database()
//生成时间戳
const date = new Date().getTime()
// 云函数入口函数
exports.main = async (event, context) => {
  return date;
}