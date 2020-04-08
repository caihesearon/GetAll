/**
 * 修改post的赞
 */
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud-test-tnjps'
})
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  const { postId, num } = event
  return await db.collection('userPost').doc(postId)
    .update({
      data: {
        loveCount: _.inc(num)
      }
    })
}