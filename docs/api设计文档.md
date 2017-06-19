# api说明文档 #

----------
版本：
> api设计及定义

说明：

> *表示必输字段

> 随着框架搭建进行变化
----------

## 一、用户管理api ##
### 1.1 `GET` api/users ###
1. 简介

	获取所有用户信息(后期拓展后台管理界面使用,不分页)

2. 参数

	无

3. 返回结果

	- 格式

			{
		    	code: <返回结果>,
		    	msg: <返回信息>,
		    	result: [{
					"email": "test@xxun.site", 
					"name": "halo"
				}]
			}

	- 实例

			{
			    code: 1,
			    msg: "success",
			    result:[{
					"email": "test@xxun.site", 
					"name": "halo"
				}]
			}

### 1.2 `POST`  api/users ###
1. 简介

	新增用户

2. 参数

	email: String, //用户注册使用的邮箱
	password: String //用户密码


3. 返回结果

	- 格式

			{
		    	code: <返回结果>,
		    	msg: <返回信息>,
		    	result: {}
			}

	- 实例

			{
			    code: 1,
			    msg: "success",
			    result:{
					"_id":"55ecfdb00e10a608147f93e5"
				}
			}


### 2.1 用户列表管理api ###
#### 2.1.1 `GET` api/users/userlist ####
1. 简介

	获取用户列表(分页)

2. 参数

	row: Number, //每页显示条数 
	start: Number, //起始数字  

3. 返回结果

	- 格式

			{
		    	code: <返回结果>,
		    	msg: <返回信息>,
		    	result: ""
			}

	- 实例

			{
			    code: 1,
			    msg: "success",
			    result:[{
					"email": "test@xxun.site", 
					"name": "halo"
				}]
			}

### 3.1 注册用户管理api ###
#### 3.1.1 `GET` api/users/register/:email ####
1. 简介

	注册时使用email查询该邮箱是否已注册

2. 参数

	email: String, //注册页面用户输入的邮箱 

3. 返回结果

	- 格式

			{
		    	code: <返回结果>,
		    	msg: <返回信息>,
		    	result: ""
			}

	- 实例

			{
			    code: 1,
			    msg: "success",
			    result:{
					"email": "test@xxun.site", 
					"name": "halo"
				}
			}

### 4.1 单个用户管理api ###
#### 4.1.1 `GET` api/users/:id ####
1. 简介

	通过id查询用户

2. 参数

	无

3. 返回结果

	- 格式

			{
		    	code: <返回结果>,
		    	msg: <返回信息>,
		    	result: ""
			}

	- 实例

			{
			    code: 1,
			    msg: "success",
			    result:{
					"email": "test@xxun.site", 
					"name": "halo"
				}
			}
#### 4.1.2 `PUT` api/users/:id ####
1. 简介

	修改单个用户信息

2. 参数

	email: String, // 用户想要修改的邮箱
	name: String // 用户想要修改的名称 

3. 返回结果

	- 格式

			{
		    	code: <返回结果>,
		    	msg: <返回信息>,
		    	result: ""
			}

	- 实例

			{
			    code: 1,
			    msg: "success",
			    result:{
					
				}
			}
#### 4.1.3 `DELETE` api/users/:id ####
1. 简介

	删除单个用户

2. 参数

	无

3. 返回结果

	- 格式

			{
		    	code: <返回结果>,
		    	msg: <返回信息>,
		    	result: ""
			}

	- 实例

			{
			    code: 1,
			    msg: "success",
			    result:{
					
				}
			}

### 5.1 用户密码管理api ###
#### 5.1.1 `PUT` api/users/password/:id ####
1. 简介

	用户修改密码

2. 参数

	password: String // 用户修改的密码

3. 返回结果

	- 格式

			{
		    	code: <返回结果>,
		    	msg: <返回信息>,
		    	result: ""
			}

	- 实例

			{
			    code: 1,
			    msg: "success",
			    result:{}
			}

## 二、登录管理api ##
### 1.1 `POST` api/auth/login ###
1. 简介

	登录api

2. 参数

	email: String, // 用户登录的邮箱
	password: String, // 用户登录的密码
	captcha: String // 用户前端输入的验证码

3. 返回结果

	- 格式

			{
		    	code: <返回结果>,
		    	msg: <返回信息>,
		    	result: {}
			}

	- 实例

			{
			    code: 1,
			    msg: "success",
			    result:{}
			}
### 1.2 `GET` api/auth/loginOut ###
1. 简介

	登录退出api

2. 参数

	无

3. 返回结果

	- 格式

			{
		    	code: <返回结果>,
		    	msg: <返回信息>,
		    	result: {}
			}

	- 实例

			{
			    code: 1,
			    msg: "success",
			    result:{}
			}