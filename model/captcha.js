/**
 * Created by lijiaxing on 2017/6/14.
 */

var mongoose = require("../db/db");

var captchaSchema = mongoose.Schema({
    'email': String, // 用户注册时使用的邮箱
    'captcha': String, // 用户注册时的验证码
    'captchaExpires': String, // 验证码过期时间
},{
	versionKey:false,
	'timestamps': {
		createdAt: 'create_time',   //创建时间
        updatedAt: 'update_time'    //修改时间
	}
})

var captcha = mongoose.model('captchas', captchaSchema, 'captchas');

module.exports = captcha;