var Geetest = require('gt3-sdk');
var config = require('../config');

var captcha = new Geetest({
    geetest_id: config.geetest.id,
    geetest_key: config.geetest.key
});

module.exports = captcha;