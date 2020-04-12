/**
 * 用于获取用户所有的帖子
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
  // const { currPage, pageCount} = event
  const {currPage} = event
  return await db.collection('userPost')
    .orderBy('clickCount', 'desc')    
    .get()    
    // .skip(currPage * pageCount)
    // .limit(pageCount)
}