// miniprogram/pages/index/index.js
var that
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    content: '',
    images: [],
    imgList: [], //临时存储空间
    user: {},
    isLike: false,
    vote: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    that.jugdeUserLogin(); //判断用户是否登录
  },
  /**
   * 获取填写的内容
   */
  getTextAreaContent: function (event) {
    that.data.content = event.detail.value;
  },

  /**
   * 选择图片 上传至云空间
   * 偶尔失败，原因未查明
   */
  

  /**
   * 选择图片
   */
  chooseImage: function(event) {
    wx.chooseImage({
      count: 9,
      success: function(res) {
        // 设置图片
        that.setData({
          images: res.tempFilePaths,
        })
        that.data.images = []
        console.log(res.tempFilePaths)
        for (var i in res.tempFilePaths) {
          // 将图片上传至云存储空间
          wx.cloud.uploadFile({
            // 指定要上传的文件的小程序临时文件路径
            cloudPath: that.timetostr(new Date()),
            filePath: res.tempFilePaths[i],
            // 成功回调
            success: res => {
              that.data.images.push(res.fileID)
            },
          })
        }
      },
    })
  },

  //删除图片
  DeleteImg(e) {
    wx.showModal({
      title: '要删除这张照片吗？',
      content: '',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.images.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            images: this.data.images
          })
        }
      }
    })
  },

  /**
   * 图片路径格式化
   */
  timetostr(time) {
    var randnum = Math.floor(Math.random() * (9999 - 1000)) + 1000;
    var str = randnum + "_" + time.getMilliseconds() + ".png";
    return str;
  },
  /**
   * 发布
   */
  formSubmit: function (e) {
    console.log('图片：', that.data.images)
    console.log(this.data.images.length)
    this.data.content = e.detail.value['input-content'];
    console.log('images:', this.data.images)
    if (this.data.canIUse) {
      //如果图数量2张以上可以成功
      if (this.data.images.length > 2) {
        this.saveDataToServer();
      } else if (this.data.images.length < 2) {
        wx.showToast({
          icon: 'none',
          title: '请至少上传两张图片~',
        })
      } else if (this.data.content.trim() != '') {
        //输入不为空
        this.saveDataToServer();
      } else {
        wx.showToast({
          icon: 'none',
          title: '写点东西吧',
        })
      }
    } else {
      this.jugdeUserLogin();
    }
  },
  //格式化存入日期
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
  /**
   * 保存到发布集合中
   */
  saveDataToServer: function (event) {
    var date = this.dateFormat(new Date())

    db.collection('share').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: that.data.content,
        date: date,
        images: that.data.images,
        user: that.data.user,
        isLike: that.data.isLike,
        vote: that.data.vote, //先留着吧
      },
      success: function (res) {
        // 保存到发布历史
        that.saveToHistoryServer();

        // 清空数据
        that.data.content = "";
        that.data.images = [];

        that.setData({
          textContent: '',
          images: [],
        })
        that.showTipAndSwitchTab();
      },
    })
  },
  /**
   * 添加成功添加提示，切换页面
   */
  showTipAndSwitchTab: function (event) {
    wx.showToast({
      title: '新增记录成功',
    })
    wx.switchTab({
      url: '../index/index',
    })
  },
  /**
   * 删除图片
   */
  removeImg: function (event) {
    var position = event.currentTarget.dataset.index;
    this.data.images.splice(position, 1);
    // 渲染图片
    this.setData({
      images: this.data.images,
    })
  },
  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      //当前显示图片
      current: this.data.images[index],
      //所有图片
      urls: this.data.images
    })
  },

  /**
   * 添加到发布历史集合中
   */
  saveToHistoryServer: function (event) {
    var date = this.dateFormat(new Date())
    db.collection('history').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        id: that.data.id,
        content: that.data.content,
        date: date,
        images: that.data.images,
        user: that.data.user,
        isLike: that.data.isLike,
        vote: that.data.vote
      },
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      },
      fail: console.error
    })
  },

  /**
   * 判断用户是否登录
   */
  jugdeUserLogin: function (event) {
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              that.data.user = res.userInfo;
              console.log(that.data.user)
            }
          })
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    return {
      title: '光盘圈',
      path: '/pages/publish/publish',
      success: function (res) {
        // // 转发成功
        // that.shareClick();
        // if(res.hasOwnProperty('shareTickets')){
        //   console.log(res.shareTickets[0])
        //   //分享到群
        //   that.data.isshare = 1
        // }else{
        //   //分享到个人
        //   that.data.isshare = 0
        // }
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