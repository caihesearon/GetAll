// miniprogram/index/moreselect/moreselect.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    test:'2',
    radio: '1'
  },
  //复选框事件
  onClick(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({
      radio: name
    });
  },
  //确定事件
  determine(e){
    let pages = getCurrentPages();
    //当前页面
    let prevPage = pages[pages.length - 2];
    //上一页面
    prevPage.setData({
      //直接给上移页面赋值
      radio: this.data.radio
    });
    wx.navigateBack({
      //返回
      delta: 1
    })    
  },

 
})