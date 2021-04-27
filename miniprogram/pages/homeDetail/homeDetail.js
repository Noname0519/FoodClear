// miniprogram/pages/homeDetail/homeDetail.js
var that
const db = wx.cloud.database();
const _ = db.command
Page({

  /**
   * 页面的初始数据
   * 
   */
  data: {
    topic: [],
    id: '',
    openid: '',
    isLike: false,
    vote: 0, //点赞数
    imgUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1599931324441&di=1e83e1275e48e77ff4f82262f0d18dac&imgtype=0&src=http%3A%2F%2Fbpic.588ku.com%2Felement_origin_min_pic%2F17%2F07%2F11%2F567ef1f47d9ca6460187aec85452c824.jpg'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    //接收前一个页面的值
    that.data.id = options.id;
    that.data.openid = options.openid;
    // 获取话题信息
    db.collection('share').doc(that.data.id).get({
      success: function (res) {
        that.topic = res.data;
        that.vote = res.data.vote
        that.setData({
          topic: that.topic,
          vote: res.data.vote,
          // isLike: that.isLike,

        })
      }
    })
  },

  //授权登录
  login: function () {
    that = this;
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

  onShow: function () {
    that = this
    // 获取回复列表
    that.getReplay()
  },

  // 获取回复列表
  getReplay: function () {
    that = this
    db.collection('replay')
      .where({
        t_id: that.data.id
      })
      .get({
        success: function (res) {
          // res.data 包含该记录的数据
          console.log(res)
          that.setData({
            replays: res.data
          })
        },
        fail: console.error
      })
  },

  /**
   * 刷新点赞icon 
   */
  refreshLikeIcon(isLike) {
    that = this
    that.data.isLike = isLike
    console.log('isLike:', isLike)
    that.setData({
      isLike: isLike,
    })
    // db.collection('share').doc(that.data.id).update({
    //   data:{
    //     isLike: isLike
    //   },
    //   success: function(res){
    //     console.log('更改isLike成功！',res)
    //   }
    // })
  },

  /**刷新页面 */
  getData: function(e){
    that = this;
    // 获取话题信息
    db.collection('share').doc(that.data.id).get({
      success: function (res) {
        that.topic = res.data;
        that.vote = res.data.vote
        console.log('res:',res.data)
        that.setData({
          topic: that.topic,
          vote: that.vote,
          // isLike: that.data.isLike
        })
      }
    })
  },


  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      //当前显示图片
      current: this.data.topic.images[index],
      //所有图片
      urls: this.data.topic.images
    })
  },

  /**
   * 喜欢点击
   */
  onLikeClick: function (event) {
    that = this
    if (that.data.isLike) {
      // 需要判断是否存在
      that.refreshLikeIcon(false)
      wx.cloud.callFunction({
        name: 'updateArticle',
        data: {
          collection: 'share',
          doc: that.data.id,
          data: "{vote: _.inc(-1)}"
        }
      }).then((res) => {
        //查看结果
        console.log(res);
        console.log('topic不可迭代？', this.data.topic)
        let id = that.data.topic.id
        let updated = res.result.stats.updated;
        console.log(updated)
        this.getData();
        if (updated) {
          //复制
          let cloneListData = this.data.topic;
          cloneListData.vote--;
          this.setData({
            topic: cloneListData
          })
        }
      })
      console.log('现在的库？', that.data)
      console.log('现在的点赞数多少嘛？', that.data.vote)
    } else {
      that.refreshLikeIcon(true)
      // console.log('event.target.dataset._id:' , id)
      wx.cloud.callFunction({
        name: 'updateArticle',
        data: {
          collection: 'share',
          doc: that.data.id,
          data: "{vote: _.inc(1)}"
        }
      }).then((res) => {
        console.log(res);
        let updated = res.result.stats.updated;
        console.log(updated)
        this.getData();
        if (updated) {
          //复制
          let cloneListData = this.data.topic;
          cloneListData.vote++;
          this.setData({
            topic: cloneListData
          })
        }
      })
    }
    
    console.log('现在的库？', that.data)
    console.log('现在的点赞数多少嘛？', that.data.vote)
  },

  /**
   * 跳转回复页面
   */
  onReplayClick() {
    wx.navigateTo({
      url: "../replay/replay?id=" + that.data.id + "&openid=" + that.data.openid
    })
  },
  /*
  统计点赞数
  */
  countLike: function (event) {
    db.collection('share').where({
      _id: this.data.id
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    return {
      title: '光盘圈',
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
        that.shareClick();
        if(res.errMsg == 'shareAppMessage:ok'){}
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})