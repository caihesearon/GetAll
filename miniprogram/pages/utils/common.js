const app = getApp()
const db = wx.cloud.database()




//设置本地存储并设置时间 
function setLocalStorage(key){  
  var value = parseInt(Date.parse(new Date())) + 50000  
  wx.setStorageSync(key, value)
}
//获得本地存储并判断时间
function getLocalStorage(key){
  var currentTime = Date.parse(new Date()); //当前时间戳      
  if (currentTime < wx.getStorageSync(key)) {
    // console.log("缓存存在 " + wx.getStorageSync(key))
    return true
  } else {
    wx.removeStorageSync(key)
    // console.log("缓存时间已过期") 
    return false
  }
}
//格式化时间
/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
*/
function formatTime(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}
function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

/**
 * 获取当前用户发布的所有问题的个数 
 */
function getMyPostCount(){
  return new Promise(function (resolve, reject){
     db.collection("userPost").count().then(res => {
       resolve(res.total)      
     })
   }) 
}
/**
 * 获取当前用户所有的评论消息的个数
 */
function getMyAnswerCount(openid){  
  const temp = wx.getStorageSync("userInfo").openid;
  return db.collection('comments')
  .where({
    "openid": temp
  })
  .count()
}
/**
 * 获取当前用户收藏的所有帖子的个数
 */
function getMyLovePageCount(){
  return db.collection('userLovePost').count()
}

module.exports = {
  setLocalStorage,
  getLocalStorage,
  formatTime,
  getMyPostCount,
  getMyAnswerCount,
  getMyLovePageCount
}


// module.exports.setLocalStorage = setLocalStorage
// module.exports.getLocalStorage = getLocalStorage
// module.exports.formatTime = formatTime
// module.exports.getMyPostCount = getMyPostCount
