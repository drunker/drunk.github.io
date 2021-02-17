# 获取


## 获取Dce


### 通过Composer获取

Composer是一个PHP包管理工具，你可以安装全局工具`composer`或者使用PHP版工具`composer.phar`，他们的使用方式如下

``` shell
# 全局工具
composer -v

# PHP版工具
php composer.phar -v
```

#### 初始化一个Dce应用环境

```shell
composer create-project idrunk/dce-app:@dev
# 如果你需要下载到 my-app 目录可以用以下命令
# composer create-project idrunk/dce-app:@dev my-app
# 下述命令将代码下载到当前目录
# composer create-project idrunk/dce-app:@dev ./
```

该命令会获取应用项目的master分支，该分支下有一个完整的Dce应用结构，它们会被下载到当前目录下新建的`dce-app`目录中，你可以以此开发你的应用。

在应用项目中还有一个用例分支`sample`，里面包含Dce框架各种组件的使用示例，可以帮助你更方便的学习使用Dce，按以下方式获取

```shell
composer create-project idrunk/dce-app:dev-sample dce-sample
```

上述命令将把用例分支下载到当前目录下新建的`dce-sample`目录中


#### 在非Dce项目中使用Dce库

``` shell
composer require idrunk/dce
# 或
php composer.phar require idrunk/dce
```


### 下载归档文件

作者推荐你使用composer工具获取Dce，但如果你的网络环境无法正常连接composer或github，你也可以通过下载归档文件获取Dce。

#### [Dce应用初始化环境归档](https://drunkce.com/archive/dce-app.zip)

#### [Dce用例项目归档](https://drunkce.com/archive/dce-sample.zip)



## 准备Swoole环境

Swoole是一个PHP扩展，你可以通过编译来安装该扩展，但相对较复杂，这里不展开讲，作者推荐你使用Docker镜像获取Swoole。


### 使用Docker镜像

Swoole官方提供了[Docker镜像](/other/links.md#docker镜像)，但该镜像没有集成PDO、Redis等扩展，Dce作者基于该镜像构建了对Dce友好的[Swoole Docker镜像](/other/links.md#dce-swoole-docker镜像)，推荐你使用该镜像。


#### 获取镜像
```shell
docker pull idrunk/swoole
```

或者使用Windows 10 Wsl2 Podman
```shell
ubuntu run podman pull idrunk/swoole
```


#### 通过镜像初始化Dce应用环境
假设我们要在`E:\Temp`目录下初始化一个名为`dce-app`的Dce应用项目，则Docker通过下述命令
```shell
docker run --rm --name server -it -v /e/Temp:/app idrunk/swoole composer create-project idrunk/dce-app:@dev /app/dce-app
```

或者使用Windows 10 Wsl2 Podman
```shell
ubuntu run podman run --rm --name server -it -v /mnt/e/Temp:/app idrunk/swoole composer create-project idrunk/dce-app:@dev /app/dce-app

# E:\Temp>ubuntu run podman run --rm --name server -it -v /mnt/e/Temp:/app idrunk/swoole composer create-project idrunk/dce-app:@dev /app/dce-app
# Do not run Composer as root/super user! See https://getcomposer.org/root for details
# Continue as root/super user [yes]? yes
# Creating a "idrunk/dce-app:@dev" project at "/app/dce-app"
# Installing idrunk/dce-app (dev-master e13b84d39ab61d3e59893af91e1ba656ce208041)
#   - Syncing idrunk/dce-app (dev-master e13b84d) into cache
#   - Installing idrunk/dce-app (dev-master e13b84d): Cloning e13b84d39a from cache
# Created project in /app/dce-app
# Loading composer repositories with package information
# Updating dependencies
# Lock file operations: 2 installs, 0 updates, 0 removals
#   - Locking idrunk/dce (v4.2.0)
#   - Locking swoole/ide-helper (4.6.3)
# Writing lock file
# Installing dependencies from lock file (including require-dev)
# Package operations: 2 installs, 0 updates, 0 removals
#   - Downloading swoole/ide-helper (4.6.3)
#   - Downloading idrunk/dce (v4.2.0)
#   - Installing swoole/ide-helper (4.6.3): Extracting archive
#   - Installing idrunk/dce (v4.2.0): Extracting archive
# Generating autoload files
# Do you want to remove the existing VCS (.git, .svn..) history? [Y,n]? y

# E:\Temp>dir dce-app
#  驱动器 E 中的卷是 Document
#  卷的序列号是 6809-FD33

#  E:\Temp\dce-app 的目录

# 2021-02-16  23:46    <DIR>          .
# 2021-02-16  23:46    <DIR>          ..
# 2021-02-16  23:45                55 .gitignore
# 2021-02-16  23:45    <DIR>          common
# 2021-02-16  23:45               419 composer.json
# 2021-02-16  23:45             3,828 composer.lock
# 2021-02-16  23:45         2,210,378 composer.phar
# 2021-02-16  23:45                88 dce
# 2021-02-16  23:45                69 dce.bat
# 2021-02-16  23:45               486 LICENSE
# 2021-02-16  23:45    <DIR>          project
# 2021-02-16  23:45                 9 README.md
# 2021-02-16  23:46    <DIR>          vendor
# 2021-02-16  23:45    <DIR>          www
#                8 个文件      2,215,332 字节
#                6 个目录 1,021,314,183,168 可用字节
```


#### 在Swoole容器中启动Dce HTTP服务器
```shell
docker run --rm --name server -it -v /e/Temp/dce-app:/app -p 20460-20462:20460-20462 -p 20463:20463/udp idrunk/swoole /app/dce http start
# Http server started with 0.0.0.0:20460.
```

或者使用Windows 10 Wsl2 Podman
```shell
docker ubuntu run podman run --rm --name server -it -v /mnt/e/Temp/dce-app:/app -p 20460-20462:20460-20462 -p 20463:20463/udp idrunk/swoole /app/dce http start
```

然后你就可以浏览器或者curl访问应用首页了
```shell
curl http://127.0.0.1:20460/

# <!doctype html>
# <html lang="zh">
# <head>
#     <meta charset="UTF-8">
#     <title>Dce Cgi Web测试页面</title>
# </head>
# <body>
# <h1>恭喜你成功访问了Web首页！</h1>
# <p>2021-02-16 23:58:43</p>
# </body>
# </html>
```