/**
 * Created by lijiaxing on 2017/6/12.
 */
var express = require('express');
var router = express.Router();
var encrypt = require('../../middlewares/encrypt');
var common = require('../../middlewares/common');
var crypto = require('crypto');
var userModel = require('../../model/user');
var modelGenerator = require('../../model/common/modelGenerator');
var User = modelGenerator(userModel, '_id');
var RestMsg = require('../../middlewares/restmsg');

// 登录相关
router.route('/login')
	.post(function(req, res, next) {
		var restmsg = new RestMsg();
		var email = req.body.email;
		var password = req.body.password;
		var captcha = req.body.captcha;
		var query = {
			'email': email
		}

		if (email == '') {
            restmsg.errorMsg('请输入您的账户邮箱!');
            res.send(restmsg);
            return;
        }
        if (password == '') {
            restmsg.errorMsg('请输入您的密码!');
            res.send(restmsg);
            return;
        }
        if (captcha == '') {
        	restmsg.errorMsg('请输入验证码');
        	res.send(restmsg);
        	return;
        }
		User.findOne(query, function(err, obj) {
			if (err) {
				restmsg.errorMsg(err);
				res.send(restmsg);
				return;
			}

			if (obj) {
				var hashPass = obj.password; // 数据库密码
				var hashSalt = hashPass.split('.')[1]; // 对应用户盐值
				var hash = encrypt.sha1HashCompare(password, hashSalt); // 用于比较的hash值
				var captchaEqStatus = common.strCompare(captcha, req.session.loginCaptcha); // 前端验证码验证结果
				if (hashPass === hash) {
					if (captchaEqStatus == false) {
						restmsg.errorMsg('您的验证码输入错误!');
						res.send(restmsg);
						return;
					}
					req.session.loginCaptcha = null;
					req.session.uid = obj._id;
					restmsg.successMsg();
					restmsg.setResult(req.session)
	        		res.send(restmsg);
				} else {
					restmsg.errorMsg('您的账户名或密码错误!');
					res.send(restmsg);
					return;
				}
			} else {
				restmsg.errorMsg('无此账户,请确认您的账户名是否正确');
				res.send(restmsg);
				return;
			}
		})
	})

// 退出登录
router.route('/loginOut')
	.get(function(req, res, next) {
		var restmsg = new RestMsg();
		if (req.session) {
	        req.session.uid = null;
	        res.clearCookie('uid');
	        req.session.destroy();
	        restmsg.successMsg('退出成功');
		    restmsg.setResult();
		    res.send(restmsg);
	    }
	})

module.exports = router;