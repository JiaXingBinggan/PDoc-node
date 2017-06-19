/**
 * Created by lijiaxing on 2017/6/10.
 */

var mongoose = require("../db/db");

var userSchema = mongoose.Schema({
    'accountName': String, // 用户账户名称
    'password': String, // 用户账户密码
    'email': String, // 用户邮箱
    'emailCaptcha': String, // 用户注册邮箱的验证码
    'emailCapExpires': String, // 邮箱验证码过期时间
},{
	versionKey:false,
	'timestamps': {
		createdAt: 'create_time',   //创建时间
        updatedAt: 'update_time'    //修改时间
	}
})

var user = mongoose.model('users', userSchema, 'users');

module.exports = user;