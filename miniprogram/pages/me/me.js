// miniprogram/pages/me/me.js
var app = getApp();
Page({

  /*
   * 在该回调中获取微信用户信息
   */
  onGotUserInfo: function (e) {
    console.log('onGotUserInfo()');
    console.log(e.detail.errMsg);
    console.log(e.detail.userInfo);
    console.log(e.detail.rawData);
    this.setData({
      show: false,
    })
  },

  //关闭mask
  closeMaskLayer: function () {
    this.setData({
      show: false,
    })
  },

  touchMove: function () {
  },
  maskTouchMove: function () {
  },

  onShow: function () {
    console.log("onShow()");
    this.setData({
      show: true
    })
  },

  actioncnt: function () {
    wx.showActionSheet({
      itemList: ['群聊', '好友', '朋友圈'],
      success: function (res) {
        console.log(res.tapIndex)
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 收藏列表
   */
  onCollectClick: function (event) {
    wx.navigateTo({
      url: '../collect/collect',
    })
  },
  /**
   * 发布历史
   */
  onHistoryClick: function (event) {
    wx.navigateTo({
      url: '../history/history',
    })
  },

  clickInvitivation: function (event) {
    this.actioncnt();
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function (event) {
  //   console.log(event);
  // }
    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    return {
      title: '光盘圈',
      path: '/pages/me/me',
      success: function (res) {
        if(res.errMsg == 'shareAppMessage:ok'){}
      },
      fail: function (res) {
        // 转发失败
        wx.showToast({
          title: '分享失败',
        })
      }
    }
  }
})