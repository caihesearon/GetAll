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
  // const { currPage, pageCount } = event

  return await db.collection('userPost')
    .where({
      category:'问答板块'
    })
    .get()
    // .skip(currPage * pageCount)
    // .limit(pageCount)
}