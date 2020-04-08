/**
 * 为点击的post增加一个点击量
 */
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'cloud-test-tnjps'
})
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  const { postId} = event
  return await db.collection('userPost').doc(postId)
    .update({
      data: {
        clickCount: _.inc(1)
      }
    })
}