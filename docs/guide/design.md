# 架构

## 目录结构

Dce的开源项目分为应用项目[idrunk/dce-app](https://github.com/idrunk/dce-app)与库项目[idrunk/dce](https://github.com/idrunk/dce)，应用项目面向框架用户，用户直接在该项目的基础上开发其应用，而库项目面向框架用户与Dce框架开发者。

### 应用目录结构
```
[ROOT]                          应用根目录（可在入口文件中定义APP_ROOT常量自定义）
├─common                        公共目录（可在入口文件中定义APP_COMMON常量自定义）
│  ├─config                     公共配置目录
│  │  ├─config.php              公共配置
│  │  ├─database.php            数据库配置
│  │  ├─http.php                Http服务配置
│  │  ├─redis.php               Redis配置
│  │  ├─tcp.php                 Tcp服务配置
│  │  ├─websocket.php           Websocket服务配置
│  ├─service                    公共服务库
│  ├─model                      公共模型库
├─project                       项目根目录（可在入口文件中定义APP_PROJECT_ROOT常量自定义）
│  ├─[PROJECT_NAME_1]           自定义项目1
│  │  ├─config                  项目配置目录
│  │  │  ├─config.php           项目配置
│  │  │  ├─nodes.php            项目节点配置
│  │  ├─controller              项目控制器目录
│  │  ├─service                 项目服务类库目录
│  │  ├─model                   项目模型目录
│  │  ├─template                渲染模板目录
├─runtime                       运行时目录（可在入口文件中定义APP_RUNTIME常量自定义）
│  ├─cache                      File缓存目录
│  ├─tpl                        编译模板缓存目录
├─vendor                        Composer库目录
├─www                           Web部署目录（可在config.php配置文件中定义www_path）
│  ├─.htaccess                  Apache重写配置
│  ├─index.php                  Cgi版Web入口文件
├─composer.json                 Composer配置
├─composer.phar                 Composer的PHP版工具文件
├─dce                           Linux版命令行工具及PHP命令行入口
├─dce.bat                       Windows版命令行工具
├─LICENSE                       授权文件
├─README.md                     说明文件
```


### 库目录结构
```
[ROOT]                          应用根目录（可在入口文件中定义APP_ROOT常量自定义）
├─drunk                         内置公共类库
├─engine                        框架核心类库
│  ├─run.php                    Dce入口文件
├─function                      公共方法目录
├─project                       内置项目
│  ├─dce                        内置综合工具
│  ├─http                       内置Http服务
│  ├─tcp                        内置Tcp服务
│  ├─websocket                  内置Websocket服务
├─vendor                        Composer库目录
├─composer.json                 Composer配置
├─LICENSE                       授权文件
├─README.md                     说明文件
```



## 架构图


### RCR架构流程图
---
![RCR架构流程图](./rcr.svg)


### Websocket服务器架构图
---
![Websocket服务器架构图](./websocket-server.svg)