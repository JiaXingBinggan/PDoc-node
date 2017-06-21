/**
 * Created by lijiaxing on 2017/6/10.
 */

var mongoose = require("../db/db");

var userSchema = mongoose.Schema({
    'name': String, // 用户账户名称
    'password': String, // 用户账户密码
    'email': String, // 用户邮箱
    'tel': String, // 用户手机号码
    'sex': Number, // 用户性别(0->男,1->女)
    'birthdate': Date, // 用户出生日期
    'desc': String // 用户个人简介
},{
	versionKey:false,
	'timestamps': {
		createdAt: 'create_time',   //创建时间
        updatedAt: 'update_time'    //修改时间
	}
})

var user = mongoose.model('users', userSchema, 'users');

module.exports = user;