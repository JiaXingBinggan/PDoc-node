/**
 * Created by lijiaxing on 2017/6/16.
 */

var common = {};

/**
 * 不区分大小写
 * @param str1 字符串1
 * @param str2 字符串2
 */
common.strCompare = function (str1, str2) {
	var reg = new RegExp(str2,'i'); //i表示不区分大小写
	return reg.test(str1);
}

module.exports = common;