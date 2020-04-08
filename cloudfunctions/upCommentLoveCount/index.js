// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud-test-tnjps'
})
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { commentId, num } = event
  return await db.collection('comments').doc(commentId)
    .update({
      data: {
        loveCount: _.inc(num)
      }
    })
}