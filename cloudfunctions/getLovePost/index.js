/**
 * 根据用户收藏的postid来查询post
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
  const { postId } = event
  
  return await db.collection('userPost')
    .where({
      _id: postId
    }).get()

}