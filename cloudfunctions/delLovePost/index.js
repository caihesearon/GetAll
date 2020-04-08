/**
 * 删除用户收藏的帖子
 */
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud-test-tnjps'
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { openid, postId} = event
  return await db.collection('userLovePost')
    .where({
      "_openid": openid,
      "postId": postId,
    }).remove()
}