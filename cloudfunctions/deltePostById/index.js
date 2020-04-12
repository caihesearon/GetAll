// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud-test-tnjps'
})

const db = cloud.database()



/**
 * 根据传入的fileIds数组删除图片
 * id删除帖子
 */
exports.main = async (event, context) => {
  //获取post的id
  const {
    fileIds
  } = event;
  const {
    id
  } = event;
  //根据id获取该post是否有fileid
  // const postInfo = await getFileId(id)
  //先删除数据库中的数据
  if(id != ''){
    await db.collection('userPost').doc(id).remove()
  }
  if (fileIds.length > 0) {
    //然后删除云存储中的图片
    return await cloud.deleteFile({
      fileList: fileIds
    })
  }
  return 
  
}