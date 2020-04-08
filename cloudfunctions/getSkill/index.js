/**
 * 获取技能需求的帖子
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
  const { category } = event

  return await db.collection('userPost')
    .where({
      "category": category
    })    
    .get()
}