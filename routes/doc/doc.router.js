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
            label: ret.label,
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

router.route('/')
  .get(function (req, res, next) {
    var restmsg = new RestMsg();
    var query = {
      level: 1
    }
    Docs.find(query, function (err, objs) {
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
    var isRoot = req.body.isRoot;
    var nodepId = req.body.pId;
    var label = req.body.label;
    var desc = req.body.desc;
    var docContent = req.body.docContent;
    var docType = req.body.docType;

    var newNode = {
      label: label,
      desc: desc,
      doc_content: docContent,
      doc_type: docType
    };

    if (isRoot) {
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
        Docs.save(result, function (err, obj) { // 保存新节点
          if (err) {
            restmsg.errorMsg(err);
            res.send(restmsg);
            return;
          }
          // 更新新节点对应根节点children数组
          if (obj.level == 2) {
            // 二级新节点直接更新对应根节点children数组
            async.waterfall([
              function (cb) {
                Docs.findOne({_id: obj.p_id}, function (err, ret) {
                  var doc = ret;
                  if(doc){
                      doc = _privateFun.prsBO2VO2(doc);
                  }
                  cb(null, doc.children);
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
                  var doc = ret;
                  if(doc){
                      doc = _privateFun.prsBO2VO2(doc);
                  }
                  cb(null, doc.children); // 二级节点子节点数组
                })
              },
              function (chil, cb) {
                var objvo = obj;
                if(objvo){
                    objvo = _privateFun.prsBO2VO2(objvo);
                }
                chil.push(objvo);
                var updateNode = {
                  children: chil
                };
                Docs.update({_id: obj.p_id}, updateNode, function (err, ret) {
                  Docs.findOne({_id: obj.p_id}, function (err, doc) {
                    var obj = doc;
                    if(obj){
                        obj = _privateFun.prsBO2VO2(obj);
                    }
                    cb(null, obj); // 二级节点
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
                      var ret = rootdoc;
                      if(ret){
                          ret = _privateFun.prsBO2VO2(ret);
                      }
                      ret.children.push(doc);
                      var updateNode = {
                        children: ret.children
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
    Docs.findOne(query, function (err, objs) {
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

    async.waterfall([
      function (cb) {
        Docs.update({_id: nodeId}, updateNode, function (err, ret) {
          Docs.findOne({_id: nodeId}, function (err, obj) {
            var ret = obj;
            if(ret){
                ret = _privateFun.prsBO2VO2(ret);
            }
            cb(null, ret);
          })
        })
      }], function (err, result) {
        if (err) {
          restmsg.errorMsg(err);
          res.send(restmsg);
          return;
        }
        if (result.level == 2) {
          var query = {
            _id: result.p_id,
            childrenId: nodeId
          }
          Docs.pullDoc(query, function (err, ret) {
            var tempChild = [];
            tempChild.push(result); // level2的节点
            var updateChildNode = {
              children: tempChild
            }
            Docs.update({_id: result.p_id}, updateChildNode, function (err, ret) {
              if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
              }
              restmsg.successMsg();
              restmsg.setResult(ret);
              res.send(restmsg);
            })
          })
        }
        if (result.level == 3) {
          var query = {
            _id: result.p_id,
            childrenId: result._id
          }
          async.waterfall([
            function (cb) { // 对二级节点操作
              Docs.pullDoc(query, function (err, ret) {
                Docs.findOne({_id: result.p_id}, function (err, obj) {
                  var ret = obj;
                  if(ret){
                      ret = _privateFun.prsBO2VO2(ret);
                  }
                  cb(null, ret.children);
                })
              })
            },
            function (level2Chil, cb) {
              level2Chil.push(result);
              var updateNode = {
                children: level2Chil
              }
              Docs.update({_id: result.p_id}, updateNode, function (err, ret) {
                Docs.findOne({_id: result.p_id}, function (err, obj) {
                  var ret = obj;
                  if(ret){
                      ret = _privateFun.prsBO2VO2(ret);
                  }
                  cb(null, ret);
                })
              })
            },
            function (level2Node, cb) {
              var query = {
                _id: level2Node.p_id,
                childrenId: level2Node._id
              }
              Docs.pullDoc(query, function (err, ret) {
                Docs.findOne({_id: level2Node.p_id}, function (err, obj) {
                  var ret = obj;
                  if(ret){
                      ret = _privateFun.prsBO2VO2(ret);
                  }
                  var result = {
                    updateLevel2: level2Node,
                    children: ret.children,
                    _id: ret._id
                  }
                  cb(null, result);
                })
              })
            },
            function (level1Ret, cb) {
              level1Ret.children.push(level1Ret.updateLevel2);
              var updateNode = {
                children: level1Ret.children
              }
              console.log(updateNode)
              Docs.update({_id: level1Ret._id}, updateNode, function (err, ret) {
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
  .delete(function(req, res, next) {
    var restmsg = new RestMsg();
    var nodeId = req.params.id;
  })

module.exports = router;

