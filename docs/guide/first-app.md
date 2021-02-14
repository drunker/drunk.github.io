# 第一个应用

## Cgi版Hello World

### 新建项目

1. 在项目根目录下建立一个hello目录

2. 在新建hello目录下建立config、controller、view目录

此时的项目目录结构如下:

```
├─project                       项目根目录
│  ├─hello                      自定义的名为hello的项目
│  │  ├─config                  项目配置目录
│  │  ├─controller              项目控制器目录
│  │  ├─view                    项目视图目录
```

### 配置节点

1. 在项目配置目录下建立nodes.php

2. 在nodes.php中输入如下节点配置

``` php
return [
    [
        'path' => 'hello',
        'controller' => 'DefaultController::index'
    ],
];
```

### 新建控制器

1. 在项目控制器目录下建立DefaultController.php

2. 将下面的脚本替换填充到DefaultController.php中

``` php
namespace hello\controller;

use dce\project\view\engine\ViewHttpJson;

class DefaultController extends ViewHttpJson {
    public function index() {
        $this->assign("message", "Hello World !");
    }
}
```

### 访问

1. 访问之前需先部署，如果你不清楚如何部署，请先查阅 [部署](/deploy/) 篇

2. 部署完成可访问你部署的地址（如，http://127.0.0.1/?/hello），得到如下json结果，表示访问成功。（Dce为了得到友好的Url，做了最简Url设计，如左，只比静态多了/?，当然你也可以配置Url重写去掉/?依赖）

``` json
{"data":{"message":"Hello World !"}}
```

### 新建布局视图

上面的例子，我们响应的json，是一个接口型页面。Dce当然也支持响应传统的Html页面，按下述步骤可以建立一个Html页面。

1. 将 [新建控制器](./#新建控制器) 中继承的父类改为 ViewHttpHtml

``` php
namespace hello\controller;

// use dce\project\view\engine\ViewHttpJson;
use dce\project\view\engine\ViewHttpHtml;

// class DefaultController extends ViewHttpJson {
class DefaultController extends ViewHttpHtml {
    public function index() {
        $this->assign("message", "Hello World !");
    }
}
```

2. 修改nodes.php配置，指定模版文件路径

``` php
return [
    [
        'path' => 'hello',
        'controller' => 'DefaultController::index',
        'php_template' => 'index.php',
    ],
];
```

3. 在view中建立模板文件index.php并填充为以下内容

``` php
<!doctype html>
<html lang="zh-cn">
<head>
<meta charset="UTF-8">
<title>Dce html response test</title>
</head>
<body>
控制器映射的变量$message的值为: <?=$message?>
</body>
</html>
```

4. 刷新之前的部署地址，看到如下内容，则表示你的Html页面创建成功

```
控制器映射的变量$message的值为: Hello World !
```

5. 最终目录结构

```
├─project                           项目根目录
│  ├─hello                          自定义的名为hello的项目
│  │  ├─config                      项目配置目录
│  │  │  ├─nodes.php                项目节点配置
│  │  ├─controller                  项目控制器目录
│  │  │  ├─DefaultController.php    自定义控制器
│  │  ├─view                        项目视图目录
│  │  │  ├─index.php                自定义Html模板
```

## 命令行（Cli）Hello World

命令行模式与Cgi模式的开发方式一样，下面是一些细微区别。

### 配置节点

``` php
return [
    'methods' => 'cli', // 属性的详细说明参见节点章
    'path' => 'hello/cli',
    'controller' => 'CliController::index',
];
```

### 新建控制器
1. 新建文件CliController.php

2. 填充脚本如下

``` php
namespace hello\controller;

use dce\project\view\ViewCli;

class CliController extends ViewCli {
    public function index() {
        $this->print("Hello World !");
    }
}
```

3. 访问测试

- 打开终端，进入应用根目录

``` bash
# {$APP_ROOT}替换为你的应用根目录
cd {$APP_ROOT}
```

- 执行你的控制器方法

``` bash
php run hello cli
```

- 看到如下响应则表示脚本正常执行成功

```
Hello World !
```

## Http服务器

Dce内置了Http服务，是基于Swoole的Http Server封装开发的，Swoole需要在Linux运行，本例后续所有服务皆需在Linux下运行。Dce Http被以内置项目的形式封装在Dce中，下述为启动执行步骤

1. 如上述 [cli类接口](./#打开终端，进入应用根目录)一样，打开终端，进入应用根目录

2. 启动Http服务

``` bash
php run http start
```

3. 访问之前的定义的接口：http://127.0.0.1:20460/?/hello（默认HttpServer端口为20460，可以通过common/config下的http.php自定义，详细参见 [内置Http服务](/http/) 篇）

4. 看到响应"Hello World !"表示Http服务正常启动成功

## Websocket服务器

Websocket也是以内置项目的形式封装的，Dce完全接管了websocket的message事件，将之作为请求响应式处理，当然你也可以只处理请求而不响应，或者异步响应。Dce会对数据以`explode(';', $data)`的形式拆包，第一部分将作为请求路径，会根据该路径定位Node节点，第二部分作为请求数据，如果该数据为json，则会自动解析为PHP数组存在`$request->request`上，你也可以通过`$request->rawData`取原始数据。当然这些拆包方法及定位Node等所有行为，你都可以自定义实现，完整介绍请参见 [内置Websocket服务](/websocket/)

1. 配置节点，在nodes.php追加下述内容

``` php
[
    'methods' => 'websocket',
    'path' => 'hello/websocket',
    'controller' => 'WebsocketController::index',
],
```

2. 创建控制器WebsocketController.php

``` php
namespace hello\controller;

use dce\server\ViewConnection;

class WebsocketController extends ViewConnection {
    public function index() {
        $this->assign("message", "Server received: {$this->request->rawData}");
        $this->response('client/path');
    }
}
```

3. 启动Websocket服务

``` bash
php run websocket start
```

4. 打开Chrome，按F12打开开发者工具，切换到Console，粘贴执行下述代码

``` javascript
const ws = new WebSocket("ws://127.0.0.1:20461/");
ws.onopen = () => {
    ws.send("hello/websocket;Data from client");
};
ws.onmessage = (evt) => {
    console.log("Received data from server: " + evt.data);
    ws.close();
};
```

5. 若看到打印的下述数据，则表示发送接收成功。（经历了连接-客户端发送-服务端接收-服务端解包-服务端定位并执行控制器-服务端打包-服务端发送-客户端接收这些过程）

```
Received data from server: client/path;{"data":{"message":"Server received: Data from client"}}
```

你可能会说你需要发送到指定的客户端而不仅仅是响应某个消息，Dce当然支持，你可以到 内置Websocket 篇查看完整介绍以了解。

## Tcp服务器

Tcp的封装与Websocket的非常相似，Dce完全接管了receive事件，打包拆包等用的与Websocket相同的默认工具。完整介绍请参见 [内置Tcp/Udp服务](/tcp/)

1. 配置节点，在nodes.php追加下述内容

``` php
[
    'methods' => ['tcp', 'udp'], // 兼容tcp/udp
    'path' => 'hello/tcp',
    'controller' => 'TcpController::index',
],
```

2. 创建控制器WebsocketController.php

``` php
namespace hello\controller;

use dce\server\ViewConnection;

class TcpController extends ViewConnection {
    public function index() {
        $this->assign("message", "Server received: {$this->request->rawData}");
        $this->response("client/path");
    }
}
```

3. 启动Websocket服务

``` bash
php run tcp start
```

4. 使用netcat测试Tcp/Udp服务器

``` bash
# 测试Tcp连接
./nc 127.0.0.1 20462
hello/tcp;Tcp data from client

# 测试Udp连接 (若为docker环境, 需要在映射端口指明为udp端口, 如-p 20463:20463/udp)
./nc -u 127.0.0.1 20463
hello/tcp;Udp data from client
```

5. 若看到打印的下述数据，则表示发送接收成功。（经历了连接-客户端发送-服务端接收-服务端解包-服务端定位并执行控制器-服务端打包-服务端发送-客户端接收这些过程）

```
# Tcp通信成功响应
client/path;{"data":{"message":"Server received: Tcp data from client\n"}}

# Udp通信成功响应
client/path;{"data":{"message":"Server received: Udp data from client\n"}}
```
