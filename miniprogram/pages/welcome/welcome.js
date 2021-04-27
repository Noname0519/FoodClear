// miniprogram/pages/welcome/welcome.js
const app = getApp()
wx.cloud.init();
const db = wx.cloud.database();

Page({
  data: {
    inputValue: "input",
    userDetail: undefined,
  },

  getUserInfo: function(e) {
    this.setData({
      userDetail: e.detail
    }, function() {
      wx.navigateTo({
        url: "/pages/index/index"
      })
    })
  },

  onLoad: function() {

  },
})