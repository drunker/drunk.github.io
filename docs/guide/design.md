# 架构图

## 目录结构

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
├─dce                           Dce框架目录
│  ├─drunk                      内置公共类库
│  ├─engine                     框架核心类库
│  ├─function                   内置公共方法
│  ├─project                    内置服务项目
│  │  ├─dce                     内置综合工具
│  │  ├─http                    内置Http服务
│  │  ├─tcp                     内置Tcp服务
│  │  ├─websocket               内置Websocket服务
│  ├─dce.php                    Dce入口文件
├─project                       项目根目录（可在入口文件中定义APP_PROJECT_ROOT常量自定义）
│  ├─[PROJECT_NAME_1]           自定义项目1
│  │  ├─config                  项目配置目录
│  │  │  ├─config.php           项目配置
│  │  │  ├─nodes.php            项目节点配置
│  │  ├─controller              项目控制器目录
│  │  ├─service                 项目服务类库目录
│  │  ├─model                   项目模型目录
│  │  ├─view                    项目视图目录
├─runtime                       运行时目录（可在入口文件中定义APP_RUNTIME常量自定义）
│  ├─cache                      File缓存目录
│  ├─tpl                        编译模板缓存目录
├─vendor                        Composer库目录（可在入口文件中定义COMPOSER_ROOT常量自定义）
├─www                           Web部署目录（可在config.php配置文件中定义www_path）
│  ├─.htaccess                  Apache重写配置
│  ├─index.php                  Web入口文件
├─composer.json                 Composer配置
├─run                           Linux版命令行工具及PHP命令行入口
├─run.cmd                       Windows版命令行工具
├─LICENSE.txt                   授权文件
├─README.md                     说明文件
```

## 命名规则

### 名字空间