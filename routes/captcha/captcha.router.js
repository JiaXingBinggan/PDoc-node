/**
 * Created by lijiaxing on 2017/6/14.
 */

var express = require('express');
var router = express.Router();
var encrypt = require('../../middlewares/encrypt');
var imgCaptcha = require('../../middlewares/captcha');
var gtCapthca = require('../../middlewares/gtCaptcha');
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

router.route('/gtCaptcha')
    .get(function (req, res, next) {
        gtCapthca.register(null, function (err, data) {
            if (err) {
                console.error(err);
                res.status(500);
                res.send(err);
                return;
            }

            if (!data.success) {
                // 进入 failback，如果一直进入此模式，请检查服务器到极验服务器是否可访问
                // 可以通过修改 hosts 把极验服务器 api.geetest.com 指到不可访问的地址

                // 为以防万一，你可以选择以下两种方式之一：

                // 1. 继续使用极验提供的failback备用方案
                req.session.fallback = true;
                res.send(data);

                // 2. 使用自己提供的备用方案
                // todo

            } else {
                // 正常模式
                req.session.fallback = false;
                res.send(data);
            }
        });
    })
    .post(function (req, res, next) {
        // 对ajax提供的验证凭证进行二次验证
        gtCapthca.validate(req.session.fallback, {
            geetest_challenge: req.body.geetest_challenge,
            geetest_validate: req.body.geetest_validate,
            geetest_seccode: req.body.geetest_seccode
        }, function (err, success) {

            if (err) {
                // 网络错误
                res.send({
                    status: "error",
                    info: err
                });

            } else if (!success) {

                // 二次验证失败
                res.send({
                    status: "fail",
                    info: '登录失败'
                });
            } else {

                res.send({
                    status: "success",
                    info: '登录成功'
                });
            }
        });
    })
module.exports = router;