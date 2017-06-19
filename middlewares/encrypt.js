/**
 * Created by lijiaxing on 2017/6/13.
 *
 * 加密工具
**/
var crypto = require('crypto');
var encrypt = {};

/**
 * sha1算法加盐(新增时使用)
 * @param {str|需要加密的字符串}
 * @param {salt|密钥}
 */
encrypt.sha1Hash = function (str, callback) {
	crypto.randomBytes(32, function (err, salt) {
	    if (err) { 
	    	callback(err);
	    }
	    salt = salt.toString('hex'); // 生成salt

	    // 将加密与盐同时作为hash值传回
	    var hash = crypto.createHmac('sha1', salt).update(str).digest('hex')+ '.' + salt;
	    callback(null, hash);
	})
}

/**
 * sha1算法加盐(验证时使用)
 * @param {str|需要加密的字符串}
 * @param {salt|密钥}
 */
encrypt.sha1HashCompare = function (str, salt) {
    // 将加密与盐同时作为hash值传回
    return crypto.createHmac('sha1', salt).update(str).digest('hex')+ '.' + salt;
}

/**
 * md5算法加密
 * @param {str|需要加密的字符串}
 */
encrypt.md5Hash = function (str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * des-ede算法加密
 * @param {str|需要加密的字符串}
 */
encrypt.encode = function (str) {
	var cipher = crypto.createCipher('des-ede', key);
    var crypted = cipher.update(str, 'utf8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
}

/**
 * des-ede算法解密
 * @param {str|需要解密的字符串}
 */
encrypt.decode = function (str) {
	var decipher = crypto.createDecipher('des-ede', key);
    var dec = decipher.update(str, 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

module.exports = encrypt;