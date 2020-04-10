/**
 * 添加用户评论
 * 配合ContentCheck云函数检查评论是否违规
 */
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud-test-tnjps'
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { timestamp, postId, commentText, openid, avatarUrl, nickName, loveCount} = event
  return await db.collection('comments').add({
    data:{
      "postId": postId,
      "commentText": commentText,
      "openid": openid,
      "avatarUrl": avatarUrl,
      "nickName": nickName,
      "loveCount": loveCount,
      "timestamp": timestamp
    }
  })
  
}