/**
 * 根据时间排序
 */
const cloud = require('wx-server-sdk')

cloud.init(
  {
    env: 'cloud-test-tnjps'
  }
)
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  // const { currPage, pageCount } = event

  return await db.collection('userPost')
    .orderBy('timestamp', 'desc')
    .get()
    // .skip(currPage * pageCount)
    // .limit(pageCount)
}