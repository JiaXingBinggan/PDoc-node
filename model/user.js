/**
 * Created by lijiaxing on 2017/6/10.
 */

var mongoose = require("../db/db");

var userSchema = mongoose.Schema({
    'name': String, // 用户账户名称
    'password': String, // 用户账户密码
    'email': String // 用户邮箱
},{
	versionKey:false,
	'timestamps': {
		createdAt: 'create_time',   //创建时间
        updatedAt: 'update_time'    //修改时间
	}
})

var user = mongoose.model('users', userSchema, 'users');

module.exports = user;