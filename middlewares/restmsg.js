/**
 * 标准返回
 * @constructor
 */
function RestMsg(){
    this.code = 0;
    this.msg = '';
    this.result = {};
}

RestMsg.prototype._RECODE_OK = 1;//正常
RestMsg.prototype._RECODE_FAIL = -1;//异常
RestMsg.prototype._NO_LOGIN = -2;//未登录
RestMsg.prototype._RECODE_OK_MSG = 'success';//成功提示信息
RestMsg.prototype._RECODE_FAIL_MSG = 'success';//失败默认提示信息

/**
 * api返回设置成功状态
 * @param {msg|api请求成功返回信息（默认为1）}
 */
RestMsg.prototype.successMsg = function(msg){
    this.code = this._RECODE_OK;
    if(msg){
        this.msg = msg;
    }else{
        this.msg = this._RECODE_OK_MSG;
    }
    return this;
}

/**
 * api返回设置失败状态
 * @param {msg|api请求失败返回信息（默认为-1）}
 */
RestMsg.prototype.errorMsg = function(msg){
    this.code = this._RECODE_FAIL;
    if(msg){
        this.msg = msg;
    }else{
        this.msg = this._RECODE_FAIL_MSG;
    }
    delete this.result;
    return this;
}

/**
 * api请求返回结果
 * @param {result|api请求返回结果}
 */
RestMsg.prototype.setResult = function(result){
    this.result = result;
}

module.exports = RestMsg;
