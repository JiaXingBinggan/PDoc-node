/**
 * Created by lijiaxing on 2017/6/14.
 */

var express = require('express');
var router = express.Router();
var encrypt = require('../../middlewares/encrypt');
var imgCaptcha = require('../../middlewares/captcha');
var common = require('../../middlewares/common');
var captchaModel = require('../../model/captcha'); // 引入user的model
var RestMsg = require('../../middlewares/RestMsg');
var randomWord = require('../../middlewares/randomword');
var sendMailer = require('../../middlewares/sendmail');
var modelGenerator = require('../../model/common/modelGenerator'); // 引入model公共方法对象
var Captcha = modelGenerator(captchaModel, '_id');

router.route('/')
	.get(function(req, res, next) {
		var restmsg = new RestMsg();
        var captchaEmail = req.query.email;
        var newCaptcha = { 
            'email': captchaEmail
        }
        var query = { // 查询条件
            'email': captchaEmail
        }
        var captchaCode = randomWord.getRandomWord(4);
        newCaptcha.captcha = captchaCode;

        // 邮箱验证码过期时间为半个小时
        newCaptcha.captchaExpires = new Date().getTime() + 1800*1000;
        Captcha.findOne(query, function (err, obj) {
            if (err) {
                restmsg.errorMsg('邮件发送失败');
                res.send(restmsg);
                return;
            }
            if (obj) {
                var nowDate = new Date().getTime();
                if (nowDate > obj.captchaExpires) {
                    // 创建新的
                    var newCaptchaCode = randomWord.getRandomWord(4);
                    var updateCaptcha = {
                        'captcha': newCaptchaCode,
                        'captchaExpires': nowDate + 1800*1000
                    }
                    Captcha.update(query, updateCaptcha, function(err, ret) {
                        if (err) {
                            restmsg.errorMsg('邮件发送失败');
                            res.send(restmsg);
                            return;
                        }
                        sendMailer.sendMailToUser(captchaEmail, newCaptchaCode);
                        restmsg.successMsg();
                        restmsg.setResult(ret);
                        res.send(restmsg);
                    })
                } else {
                    restmsg.successMsg();
                    restmsg.setResult(obj);
                    res.send(restmsg);
                }
            } else {
                Captcha.save(newCaptcha, function (err, ret) {
                    if (err) {
                        restmsg.errorMsg('邮件发送失败');
                        res.send(restmsg);
                        return;
                    }
                    sendMailer.sendMailToUser(captchaEmail, captchaCode);
                    restmsg.successMsg('邮件发送成功');
                    restmsg.setResult(ret);
                    res.send(restmsg);
                })
            }
        })
	})
	.post(function(req, res, next) {
		var restmsg = new RestMsg();
        var captchaEmail = req.body.email;
        var captcha = req.body.captcha; // 前端输入的邮箱验证码
        
        if (captchaEmail == '') {
            restmsg.errorMsg('请输入正确的邮箱地址!');
            res.send(restmsg);
            return;
        }
        if (captcha == '') {
            restmsg.errorMsg('请输入邮箱验证码!');
            res.send(restmsg);
            return;
        }
        var query = {
            'email': captchaEmail
        }

        Captcha.findOne(query, function(err, obj) {
            if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }
            
            if (common.strCompare(captcha, obj.captcha)) {
                restmsg.successMsg();
                res.send(restmsg);
            } else {
                restmsg.errorMsg('验证码输入错误!');
                res.send(restmsg);
                return;
            }
        })
	})

router.route('/imgCaptcha')
    .get(function(req, res, next) {
        var restmsg = new RestMsg();

        var imgCaptchaCode = imgCaptcha.createCap();
        if (!imgCaptchaCode) {
            restmsg.errorMsg('验证码生成失败');
            res.send(restmsg);
            return;
        } else {
            req.session.loginCaptcha = imgCaptchaCode;
            restmsg.successMsg();
            restmsg.setResult(imgCaptchaCode);
            res.send(restmsg);
        }
    })
    .post(function(req, res, next) {
        
    })

module.exports = router;