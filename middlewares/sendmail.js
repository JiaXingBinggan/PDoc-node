/**
 * Created by lijiaxing on 2017/6/14.
 *
 * 发送邮件中间件
 */
var NodeMailer = require('nodemailer');
var SmtpTransport = require('nodemailer-smtp-transport');
var config = require('../config');
var sendMailer = {};

/**
 * 发送邮件通用方法
 * @param toEmail 收件人
 * @param subject 标题
 * @param content 内容，可为富文本
 * @param callback true-成功；false-失败
 */
sendMailer.sendMail = function (toEmail, subject, content, callback) {
	var transporter = NodeMailer.createTransport(SmtpTransport({
	    host: config.email_config.host,
	    port: config.email_config.port,
	    auth: {
	        user: config.email_config.user,
	        pass: config.email_config.pass
	    }
	}));

	var mailOptions = {
	    from: config.email_config.user, // 发送地址
	    to: toEmail, // 收件地址
	    subject: subject, // 邮件主体
	    html: content 
	};

	transporter.sendMail(mailOptions, function(err){
	    if(err){
	        callback(false);
	    }else{
	    	callback(true);
	    }
	});
}


/**
 * 发送邮件通用方法
 * @param toEmail 收件人
 * @param subject 验证码代码
 */
sendMailer.sendMailToUser = function (toEmail, captchaCode) {
	var toEmail = toEmail;
	var subject = '欢迎使用vue-demo'
	var captchaCode = captchaCode;
	var content = "<p>尊敬的用户：您的登录验证码为<p/>" +
        "<b>" +captchaCode + "</b><br>" +
        "<p>您的验证码半个小时后失效,请及时进行验证</p>"  
        // "<a href='http://" + config.web.domain + ":" + config.web.http_port + "'>" + config.web.domain + ":" + config.web.http_port + "</a><br>"
	this.sendMail(toEmail, subject, content, function (successStatus) {
		if (!successStatus) {
			return console.log('邮件发送失败');
		}
		return console.log('邮件发送成功')
	})
}

module.exports = sendMailer;