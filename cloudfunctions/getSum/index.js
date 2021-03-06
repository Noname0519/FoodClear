// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 根据文章Id集合批量查询统计数据
exports.main = async (event, context) => {
  try {
    var result= await db.collection('likes').where({
      postId: _.in(event.posterId)
    }).get(); 
    return result.data 
  }
  catch(e)
  {
    console.error(e)
    return []
  }
}