/**
 * 登录拦截器
 * @param {*} pageObj 
 */
function identityFilter() {
  const userInfo = wx.getStorageSync('userInfo')
  if (!userInfo) {
    wx.showModal({
      title: '登录提示',
      content: '您需要登录后才能体验全部功能!',
      cancelText: '暂不登录',
      confirmText: '立即登录',
      success(res) {
        if (res.confirm) {
          //跳转到登陆页 
          wx.switchTab({
            url: '/pages/me/me'
          })
        } else if (res.cancel) {
          //返回
          wx.navigateBack({            
            delta: 1
          })
        }
      }
    })
  } else {
    return true;
  }
}

exports.identityFilter = identityFilter;