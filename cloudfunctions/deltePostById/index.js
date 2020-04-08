// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud-test-tnjps'
})

const db = cloud.database()

//获取fileid
async function getFileId(id){
  return db.collection('userPost').doc(id)
    .field({
      contentImg: true
    })
    .get()
}
//根据fileId删除图片
async function delImgByfileId(fileId){
  const fileIDs = [fileId]
  return cloud.deleteFile({
    fileList: fileIDs,
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  //获取post的id
  const {id} = event;
  //根据id获取该post是否有fileid
  const postInfo = await getFileId(id)
  //获取fileid
  const fileId = postInfo.data.contentImg  
  //如果有图片就先删除图片
  if(fileId != ''){
    //根据fileid删除图片
    const delImgResult = await delImgByfileId(fileId)
    // status = delImgResult.fileList[0].status
  }
  //根据id删除post数据
  return await db.collection('userPost').doc(id).remove()
}