/**
 * 分页处理类
 * @constructor
 */
function Page(){
    this.total = 0;//记录总数
    this.page = 0;//当前页数
    this.row = 0;//当前每页条数
    this.totalpages = 0;//总页数
    this.data = {};//结果列表
}
/**
 * 增加分页数据
 * @param data
 */
Page.prototype.setData =  function(data){
    this.data = data;
}
/**
 * 增加页面信息
 * @param total
 * @param page
 * @param row
 * @param totalPages
 */
Page.prototype.setPageAttr =  function(total,page,row,totalPages){
    this.total = total
    this.page = page
    this.row = row
    this.totalpages = totalPages
}

module.exports = Page;
