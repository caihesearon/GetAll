/**
 * 根据postid来获取评论列表
 * 或评论总数
 */
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud-test-tnjps'
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { postId, currPage, pageCount, mode } = event

  if(mode == 'getCount'){
    return await db.collection('comments')
      .where({
        "postId": postId
      })
      .count()
  }
  return await db.collection('comments')
    .where({
      "postId": postId
    })
    .orderBy('loveCount', 'desc')
    .skip(currPage * pageCount)
    .limit(pageCount)
    .get()
}