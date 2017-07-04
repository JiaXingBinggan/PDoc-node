/**
 * create by lijiaxing on 2017/06/27
**/

var qiniu = require("qiniu");
var config = require('../config');

// 需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

var qn = {};

// 构建bucketmanager对象
var client = new qiniu.rs.Client();

/**
 * 构建上传策略函数
 * @bucket 要上传的空间
 * @key 上传到七牛后保存的文件名
 */
qn.uptoken = function (bucket, key) {
  	var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
  	return putPolicy.token();
}

/**
 * 构造上传函数
 * @uptoken 要上传的空间uptoken(bucket, key);
 * @key 上传到七牛后保存的文件名
 * @localFile 要上传文件的本地路径
 */
qn.uploadFile = function (uptoken, key, localFile, callback) {
  var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        var obj = {
        	hash: ret.hash,
        	key: ret.key,
        	persistentId: ret.persistentId
        }
        callback(null, obj);
        // console.log(ret.hash, ret.key, ret.persistentId);       
      } else {
        // 上传失败， 处理返回代码
        console.log(err);
        callback(err);
      }
  });
}

/**
 * 删除资源
 * @bucket 文件所在的空间
 * @key 上传到七牛后保存的文件名
 */
qn.deleteFile = function (bucket, key, callback) {
  client.remove(bucket, key, function(err, ret) {
    if (!err) {
      callback(null, '删除成功');
    } else {
      console.log(err);
      callback(err);
    }
  })
}

module.exports = qn;