/**
 * Created by lijiaxing on 2017/6/28.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var async = require('async');
var common = require('../../middlewares/common');
var qiniu = require('../../middlewares/qiniu');
var config = require("../../config");
var docModel = require('../../model/doc'); // 引入user的model
var RestMsg = require('../../middlewares/RestMsg');
var modelGenerator = require('../../model/common/modelGenerator'); // 引入model公共方法对象
var Docs = modelGenerator(docModel, '_id');
var _privateFun = router.prototype;

//Model 转 VO 继承BO的字段方法2，并且进行相关字段的扩展和删除
_privateFun.prsBO2VO2 = function(obj){
    var result = obj.toObject({ transform: function(doc, ret, options){
        return {
            _id: ret._id,
            doc_type: ret.doc_type,
            level: ret.level,
            relation: ret.relation,
            desc: ret.desc,
            doc_content: ret.doc_content,
            p_id: ret.p_id,
            children: ret.children
        }
    } });
    return result;
}

// 子节点字段过滤器
function childNodeFilter (model) {
  var childNode = {
    _id: model._id,
    label: model.label,
    level: model.level,
    relation: model.relation,
    p_id: model.p_id,
    children: model.children
  }
  return childNode;
}

router.route('/')
  .get(function (req, res, next) {
    var restmsg = new RestMsg();
    var ownerEmail = req.query.ownerEmail;
    var query = {
      level: 1,
      owner_email: ownerEmail
    }
    var showOptions = {
      create_time: 0,
      update_time: 0
    }
    Docs.find(query, showOptions, function (err, objs) {
      if (err) {
        restmsg.errorMsg(err);
        res.send(restmsg);
        return;
      }
      restmsg.successMsg();
      restmsg.setResult(objs);
      res.send(restmsg);
    })
  })
  .post(function (req, res, next) {
    var restmsg = new RestMsg();
    var isRoot = req.body.isRoot; // 0->创建根节点,1->创建子节点
    var nodepId = req.body.pId;
    var label = req.body.label;
    var desc = req.body.desc;
    var docContent = req.body.docContent;
    var docType = req.body.docType;
    var ownerEmail = req.body.ownerEmail;

    var newNode = {
      label: label,
      desc: desc,
      doc_content: docContent,
      doc_type: docType,
      owner_email: ownerEmail
    };

    if (isRoot == 0) {
      var rootPid = 0;
      newNode.p_id = rootPid;
      newNode.relation = '0.';
      newNode.level = 1;
      Docs.save(newNode, function (err, obj) {
        if (err) {
          restmsg.errorMsg(err);
          res.send(restmsg);
          return;
        }
        restmsg.successMsg();
        restmsg.setResult(obj._id);
        res.send(restmsg);
      })
    } else {
      newNode.p_id = nodepId;
      async.waterfall([
         function (cb) {
          Docs.findOne({_id: nodepId}, function (err, ret) {
            cb(null, ret);
          })},
          function (ret, cb) {
            if (ret.p_id == 0) {
              newNode.level = 2;
              newNode.relation = '0.' + nodepId + '.';
              cb(null, newNode);
            } else {
              newNode.level = 3;
              newNode.relation = ret.relation + '.' + nodepId + '.';
              cb(null, newNode);
            }
          },
      ], function (err, result) {
        if (err) {
          restmsg.errorMsg(err);
          res.send(restmsg);
          return;
        }
        Docs.save(result, function (err, ret) { // 保存新节点
          if (err) {
            restmsg.errorMsg(err);
            res.send(restmsg);
            return;
          }
          var obj = ret;
          if(obj){
              obj = childNodeFilter(obj);
          }
          // 更新新节点对应根节点children数组
          if (obj.level == 2) {
            // 二级新节点直接更新对应根节点children数组
            async.waterfall([
              function (cb) {
                Docs.findOne({_id: obj.p_id}, function (err, ret) {
                  cb(null, ret.children);
                })
              },
              function (children, cb) {
                children.push(obj);
                var updateNode = {
                  children: children
                };
                Docs.update({_id: obj.p_id}, updateNode, function (err, ret) {
                  cb(null, ret);
                })
              }
            ], function (err, result) {
              if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
              }
              restmsg.successMsg();
              restmsg.setResult(result);
              res.send(restmsg);
            })
          }
          if (obj.level == 3) {
            // 三级新节点首先更新上一级节点children数组,再更新对应根节点内children数组
            var idArr = obj.relation.split('.');
            var rootId = idArr[1];
            async.waterfall([
              function (cb) {
                Docs.findOne({_id: obj.p_id}, function (err, ret) {
                  cb(null, ret.children); // 二级节点子节点数组
                })
              },
              function (chil, cb) {
                chil.push(obj);
                var updateNode = {
                  children: chil
                };
                Docs.update({_id: obj.p_id}, updateNode, function (err, ret) {
                  Docs.findOne({_id: obj.p_id}, function (err, doc) {
                    cb(null, doc); // 二级节点
                  })
                })
              },
              function (doc, cb) {
                var query = {
                  _id: rootId,
                  childrenId: doc._id
                }
                Docs.pullDoc(query, function (err, ret) {
                    Docs.findOne({_id: rootId}, function (err, rootdoc) {
                      var obj = doc;
                      if(obj){
                          obj = childNodeFilter(obj);
                      }
                      rootdoc.children.push(obj);
                      var updateNode = {
                        children: rootdoc.children
                      };
                      Docs.update({_id: rootId}, updateNode, function (err, ret) {
                        cb(null, ret);
                      })
                    })
                })
              }
            ], function (err, result) {
              if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
              }
              restmsg.successMsg();
              restmsg.setResult(result);
              res.send(restmsg);
            })
          }
        })
      })
    }
  })

router.route('/:id')
  .get(function(req, res, next) {
    var restmsg = new RestMsg();
    var nodeId = req.params.id;
    var query = {
      _id: nodeId
    }
    Docs.findOne(query, function (err, obj) {
      if (err) {
        restmsg.errorMsg(err);
        res.send(restmsg);
        return;
      }
      restmsg.successMsg();
      restmsg.setResult(obj);
      res.send(restmsg);
    })
  })
  .put(function(req, res, next) {
    var restmsg = new RestMsg();
    var nodeId = req.params.id;
    var updateLabel = req.body.updateLabel;
    var updateDesc = req.body.updateDesc;
    var updateDoc = req.body.updateDoc;
    var updateNode = {
      label: updateLabel,
      desc: updateDesc,
      doc_content: updateDoc
    }

    Docs.update({_id: nodeId}, updateNode, function (err, ret) {
      if (err) {
        restmsg.errorMsg(err);
        res.send(restmsg);
        return;
      }
      Docs.findOne({_id: nodeId}, function (err, doc) {
        if (err) {
          restmsg.errorMsg(err);
          res.send(restmsg);
          return;
        }
        var obj = doc;
        if(obj){
            obj = childNodeFilter(obj);
        }
        if (obj.level == 2) {
          var query = {
            _id: obj.p_id,
            childrenId: obj._id
          }
          async.waterfall([
            function (cb) {
              Docs.pullDoc(query, function (err, ret) {
                Docs.findOne({_id: obj.p_id}, function (err, doc) {
                  cb(null, doc.children);
                })
              })
            },
            function (chil, cb) {
              chil.push(obj);
              var updateNode = {
                children: chil
              }
              Docs.update({_id: obj.p_id}, updateNode, function (err, ret) {
                cb(null, ret);
              })
            }
          ], function (err, result) {
            if (err) {
              restmsg.errorMsg(err);
              res.send(restmsg);
              return;
            }
            restmsg.successMsg();
            restmsg.setResult(result);
            res.send(restmsg);
          })
        }
        if (obj.level == 3) {
          var query = {
            _id: obj.p_id,
            childrenId: obj._id
          }
          async.waterfall([
            function (cb) {
              Docs.pullDoc(query, function (err, ret) {
                Docs.findOne({_id: obj.p_id}, function (err, doc) {
                  cb(null, doc.children);
                })
              })
            },
            function (chil, cb) {
              chil.push(obj);
              var updateNode = {
                children: chil
              }
              Docs.update({_id: obj.p_id}, updateNode, function (err, ret) {
                Docs.findOne({_id: obj.p_id}, function (err, doc) {
                  var obj = doc;
                  if (obj) {
                      obj = childNodeFilter(obj);
                  }
                  cb(null, obj);
                })
              })
            },
            function (level2obj, cb) {
              var query = {
                _id: level2obj.p_id,
                childrenId: level2obj._id
              }
              Docs.pullDoc(query, function (err, ret) {
                Docs.findOne({_id: level2obj.p_id}, function (err, level1obj) {
                  var tempNode = {
                    rootNodeChild: level1obj.children,
                    level2node: level2obj
                  }
                  cb(null, tempNode);
                })
              })
            },
            function (node, cb) {
              node.rootNodeChild.push(node.level2node);
              var updateNode = {
                children: node.rootNodeChild
              }
              Docs.update({_id: node.level2node.p_id}, updateNode, function (err, ret) {
                cb(null, ret);
              })
            }
          ], function (err, result) {
            if (err) {
              restmsg.errorMsg(err);
              res.send(restmsg);
              return;
            }
            restmsg.successMsg();
            restmsg.setResult(result);
            res.send(restmsg);
          })
        }
      })
    })
  })
  .delete(function(req, res, next) {
    var restmsg = new RestMsg();
    var nodeId = req.params.id; 

    Docs.findOne({_id: nodeId}, function (err, obj) {
      if (err) {
        restmsg.errorMsg(err);
        res.send(restmsg);
        return;
      }
      if (obj.level == 1) {
          var query = {
            "$or": [{
                relation: new RegExp(obj._id)
            }, {
                _id: obj._id
            }]
          }  
          Docs.delete(query, function (err, ret) {
            if (err) {
              restmsg.errorMsg(err);
              res.send(restmsg);
              return;
            }
            restmsg.successMsg();
            restmsg.setResult(ret);
            res.send(restmsg);
          })  
      }
      if (obj.level == 2) {
        var query = {
            "$or": [{
                relation: new RegExp(obj._id)
            }, {
                _id: obj._id
            }]
          }  
        async.waterfall([
          function (cb) {
            Docs.delete(query, function (err, ret) {
              cb(null, ret);
            })
          },
          function (ret, cb) {
            var query = {
              _id: obj.p_id,
              childrenId: obj._id
            }
            Docs.pullDoc(query, function (err, ret) {
              cb(null, ret);
            })
          }
        ], function (err, result) {
          if (err) {
            restmsg.errorMsg(err);
            res.send(restmsg);
            return;
          }
          restmsg.successMsg();
          restmsg.setResult(result);
          res.send(restmsg);
        })
      }
      if (obj.level == 3) {
        async.waterfall([
          function (cb) {
            Docs.findOne({_id: nodeId}, function (err, level3obj) {
              cb(null, level3obj);
            })
          },
          function (obj, cb) {
            Docs.delete({_id: obj._id}, function (err, ret) {
              cb(null, obj);
            })
          },
          function (obj, cb) {
            var query = {
              _id: obj.p_id,
              childrenId: obj._id
            }
            Docs.pullDoc(query, function (err, ret) {
              Docs.findOne({_id: query._id}, function (err, level2obj) {
                cb(null, level2obj);
              })
            })
          },
          function (obj, cb) {
            var query = {
              _id: obj.p_id,
              childrenId: obj._id
            }
            Docs.pullDoc(query, function (err, ret) {
              Docs.findOne({_id: obj._id}, function (err, level2obj) {
                cb(null, level2obj);
              })
            })
          },
          function (obj, cb) {
            Docs.findOne({_id: obj.p_id}, function (err, level1obj) {
              var ret = level1obj;
              if(ret){
                  ret = childNodeFilter(ret);
              }
              ret.children.push(obj);
              var updateNode = {
                children: ret.children
              }
              Docs.update({_id: obj.p_id}, updateNode, function (err, ret) {
                cb(null, ret);
              })
            })
          }
        ], function (err, result) {
          if (err) {
            restmsg.errorMsg(err);
            res.send(restmsg);
            return;
          }
          restmsg.successMsg();
          restmsg.setResult(result);
          res.send(restmsg);
        })
      }
    })
  })

module.exports = router;

