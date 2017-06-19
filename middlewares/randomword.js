/**
 * Created by lijiaxing on 2017/6/14.
 *
 * 随机数产生
 */

 var randomWord = {};

/**
 * 随机数生成
 * @param n 随机数长度
 */
 randomWord.getRandomWord = function (n) {
	var str = "",
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    // 产生num位的随机字符串
    for(var i=0; i<n; i++){
        var pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
 }

 module.exports = randomWord;