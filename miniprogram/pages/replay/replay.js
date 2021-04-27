// miniprogram/pages/replay/replay.js
var that
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    openid: '',
    content: '', //评论内容
    user: {}, //用户信息
    nickName: '', //评论者昵称
    avatarUrl: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.data.id = options.id;
    that.data.openid = options.openid;
    this.login()
  },
  
  bindKeyInput(e) {
    console.log(e.detail)
    that.data.content = e.detail.value;
    console.log("内容：" + that.data.content)
  },
  //授权登录
  login: function () {
    var that = this;
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log(res.userInfo),
                that.setData({
                  nickName: res.userInfo.nickName,
                  avatarUrl: res.userInfo.avatarUrl,
                  user: res.userInfo
                })
            }
          })
        }
      }
    })
  },
  bindGetUserInfo(e) {
    console.log(e.detail.userInfo)
  },
  dateFormat: function (date) { //author: meizz   
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds()
    var realMonth = month > 9 ? month : "0" + month
    return year + "-" + realMonth + "-" + day + " " + hour + ":" + minutes + ":" + seconds
  },
  //点击发布
  saveReplay: function () {
    that = this
    var date = that.dateFormat(new Date())
    if (!that.data.content || that.data.content.length < 6) {
      wx.showToast({
        icon: 'none',
        title: '内容过少',
      })
      return
    }

    db.collection('replay').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: that.data.content,
        date: date,
        r_id: that.data.id,
        u_id: that.data.openid,
        t_id: that.data.id,
        user: that.data.user
        // nickName: that.data.nickName,
        // avatarUrl: that.data.avatarUrl,
         
      },
      
      success: function (res) {
        wx.showToast({
          title: '发射成功',
        })
        setTimeout(function () {
          wx.navigateBack({
            url: "../homeDetail/homeDetail?id=" + that.data.id + "&openid=" + that.data.openid
          })
        }, 1500)
      },
      fail: console.error
    })
  }
})