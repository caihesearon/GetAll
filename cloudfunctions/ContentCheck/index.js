// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {
    env: 'cloud-test-tnjps'
  }
)
/**
 * 用户发帖内容和图片的审核
 * 用户评论的审核
 * msg: 文本内容
 * img：图片
 */
exports.main = async (event, context) => {
  try{
    //定义临时变量保存检查返回的结果
    var msgR = false;
    let imgR = false;
    //检查文本内容是否违规
    if(event.msg){
      msgR = await cloud.openapi.security.msgSecCheck({
        content: event.msg
      })
    }
    //检查图片内容是否违规
    if(event.img){
      imgR = await cloud.openapi.security.imgSecCheck({
        media:{
          header: {
            'Content-Type': 'application/octet-stream'
          },
          contentType: 'image/png',
          value: Buffer.from(event.img)
        }
      })
    }
    return {
      //因为违规返回的时候没有msgR 所以只返回errCode 方便判断
      msgErrCode:msgR.errCode,
      imgR
    }
  }catch(e){
    return e
  }

}