/**
 * Created by lijiaxing on 2017/6/28.
 */

var mongoose = require("../db/db");

var docSchema = mongoose.Schema({
    'label': String, // 节点名称
    'p_id': String, // 父节点id
    'children': Array, // 子节点数组
    'doc_type': Boolean, // 文档类型
    'level': String, // 节点所处层级,最多三级
    'relation': String, // 拼接祖宗节点的ID信息
    'desc': String, // 描述
    'doc_content': String // 文档内容
},{
	versionKey:false,
	'timestamps': {
		createdAt: 'create_time',   //创建时间
        updatedAt: 'update_time'    //修改时间
	}
})

var doc = mongoose.model('docs', docSchema, 'docs');

module.exports = doc;