# 个人文档中心的nodejs登录后台

> 个人文档中心的nodejs登录后台

# 开发指导

基于`express4.X` `mongoosejs` 构建的全栈式web开发框架

## 环境搭建

### nodejs 安装

下载安装包 node-v0.12.4-x64.msi或者下载最新安装包

+ [下载 https://nodejs.org/download/](https://nodejs.org/download/) 

安装完成后cmd中使用`node -v`和`npm -v`进行验证是否安装成功

### 重要配置

设置代理（taobao）

    npm config set registry http://registry.npm.taobao.org

### 关键全局包安装

experss 安装

    npm install -g express-generator@4

supervisor安装

    npm install supervisor -g
### 数据库 mongodb

#### 安装

下载mongodb或者下载最新安装包

+ [下载 https://www.mongodb.org/downloads](https://www.mongodb.org/downloads) 

#### 启停

如安装路径为： `D:\db\mongodb` 数据存储路径为 `D:\db\mongodb\data\test`

安装目录下生成如下bat 执行

    D:\db\mongodb\bin\mongod.exe -dbpath D:\db\mongodb\data\test

#### 打包成windows服务方式

安装目录下生成如下bat 执行

    sc.exe create MongoDB binPath= "\"D:\db\mongodb\bin\mongod.exe\" --service --config=\"D:\db\mongodb\mongod.cfg\"" DisplayName= "MongoDB" start= "auto"

mongod.cfg 文件内容
    
    logpath=D:\db\mongodb\log\mongod.log
    dbpath=D:\db\mongodb\data\test

#### 可视化客户端 Robomongo

可视化的客户端使用 Robomongo 下载最新安装包

+ [外网下载 http://www.robomongo.org/](http://www.robomongo.org/)

### 其他

版本控制工具统一为git

## 起步

### 脚手架

下载最新的空项目，地址：  

    https://github.com/JiaXingBinggan/login-node-session.git


### 数据库

数据库配置文件： 复制`db/db.default.js`到同级目录下，文件名为`db.js`  中修改用户名密码ip端口数据库名称（注释的部分为简写）

    var mongoose = require('mongoose');
    //mongoose.connect('mongodb://localhost/database');
    mongoose.connect('mongodb://user:pass@localhost:port/database');
    module.exports = mongoose
    


### 分层

代码文档结构如下

    |--bin
        |--www //启动
    |--common
    |--db
        |--db.default.js //数据库配置模板
        |--db.js //数据库配置
    |--docs
    	|--数据库说明文档.md // 数据库设计文档
    	|--api设计文档.md // api设计文档
    |--middlewares // 中间件
    	|--captcha.js // 验证码中间件
    	|--common.js // 通用中间件
    	|--encrypt.js // 加密中间件
    	|--gtCaptcha.js // 极验验证码中间件
    	|--page.js // 分页中间件
    	|--randomword.js // 随机字符串中间件
    	|--restmsg.js // http标准返回中间件
    	|--sendmail.js // 发送邮件中间件
    |--model // model层
    	|--common
    		|--modelGenerator.js // model操作通用方法
    	|--captcha.js
    	|--user.js
    |--node_modules
    |--public //静态文件
    |--routes  //路由层
        |--api.js 
        |--auth // 用户登录验证模块路由层
            |--auth.router.js
        |--captcha // 验证码模块路由层
            |--captcha.router.js
        |--file // 文件模块路由层
            |--file.router.js
        |--user // 用户模块路由层
            |--user.router.js
    |--views //ejs模板
    |--.gitignore
    |--app.js
    |--config.default.js // 公用配置文件
    |--config.js // 用户配置文件
    |--package.json
    
代码文档结构如上，后端服务端代码主要分为两层 路由层和model层

#### 路由层

路由层主要职责为定制url规范，交互前后端数据，设置请求拦截器

#### model层

服务层主要职责为对象模块提供相应的业务逻辑。供路由层使用

使用mongodb进行对象模块操作的和数据库交互也在该层，数据库层面的数据交互参考`mongoosejs`  [官方文档http://mongoosejs.com/docs/api.html](http://mongoosejs.com/docs/api.html)

## 运行

两种方式运行 

node原生运行方式 ，配合IDE可以进行断点跟踪，修改代码后必须重新运行

    node bin/www
    
supervisor 运行，可以实现热部署功能，修改代码或者代码异常后自动重启

    supervisor bin/www
    
web访问（端口在bin/www中可以修改）
    
    http://localhost:3000/
    
## 待完善

