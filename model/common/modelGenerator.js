/**
 * Created by lijiaxing on 2017/6/12.
 */
 var Page = require('../../middlewares/page');

 var modelGenerator = function (model, key) {
 	var generator = {};

 	/**
	 * 查询所有数据
	 * @param query
	 * @param callback
	 */
 	generator.find = function (query, callback) {
 		if (!query) {
 			query = {};
 		}

 		model.find(query, function (err, ret) {
 			if (err) {
                return callback(err);
            }
            callback(null, ret);
 		})
 	}

 	/**
	 * 查询单条数据
	 * @param query
	 * @param callback
	 */
 	generator.findOne = function (query, callback) {
 		if (!query) {
 			query = {};
 		}

 		model.findOne(query, function (err, ret) {
 			if (err) {
                return callback(err);
            }
            callback(null, ret);
 		})
 	}

	/**
	 * 分页查询所有数据
	 * @param query
	 * @param callback
	 */
 	generator.findList = function (query, callback) {
 		if (!query) {
 			query = {};
 		}

 		var options = {'$slice':2};
 		options['limit'] = query.row;
 		options['skip'] = query.start;
 		options['sort'] = {'create_at': -1};
 		delete query.row;
 		delete query.start;
 		var page = new Page();
 		model.count(query, function (err, count) {
 			if (err) {
 				return callback(err);
 			}
 			if (count == 0) {
 				callback(null, page);
 				return;
 			}
 			model.find(query, null, options, function (err, objs) {
	 			if (err) {
	 				return callback(err);
	 			}
	 			page.setPageAttr(count);
	 			page.setData(objs);
	 			callback(null, page);
	 		})
 		})
 	}

 	/**
	 * 通过id查询数据
	 * @param value
	 * @param callback
	 */
 	generator.findById = function (value, callback) {
 		var query = {};
 		query[key] = value;

 		model.find(query, function (err, ret) {
 			if (err) {
 				return callback(err);
 			}
 			callback(null, ret);
 		})
 	}

 	/**
	 * 更新数据
	 * @param query
	 * @param bo
	 * @param callback
	 */
 	generator.update = function (query, bo, callback) {
 		if (!query) {
 			query = {};
 		}
 		if(typeof bo.toObject === 'function'){ // 若返回数据实体,则将其转化为数据对象
            bo = bo.toObject();
        }
        if(bo._id){
            delete bo._id;
        }
        model.update(query, bo, function (err, ret) {
        	if (err) {
        		return callback(err);
        	}
        	callback(null, ret);
        })
 	}

 	/**
	 * 新增一条数据
	 * @param bo
	 * @param callback
	 */
 	generator.save = function (bo, callback) {
 		var entity = new model(); // 创建当前model实体
 		// 循环赋值entity
 		for (var key in bo) {
 			if (key != '_id') {
 				entity[key] = bo[key];
 			}
 		}
 		entity.save(function (err, ret) {
 			if (err) {
 				return callback(err);
 			}
 			callback(null, ret);
 		})
 	}

 	/**
	 * 删除一条数据
	 * @param query
	 * @param callback
	 */
 	generator.delete = function (query, callback) {
 		if (!query) {
 			query = {};
 		}

 		model.remove(query, function (err, ret) {
 			if (err) {
 				return callback(err);
 			}
 			callback(null, ret);
 		})
 	}

 	return generator;
 }

 module.exports = modelGenerator;