/**
 * Created by Lijiaxing on 2017/6/10.
 */

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/vueDemo");
// mongoose.connect("mongodb://user:pwd@localhost/vueDemo");

module.exports = mongoose;