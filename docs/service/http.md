# HTTP服务器

Dce内置了HTTP服务器，是对[Swoole\Http\Server](/other/links.md#Http服务器)进行的封装，所以你必须在有Swoole的PHP环境下才能开启HTTP服务器。

HTTP服务器是以内置项目的形式封装在Dce里面，项目路径为`project/http`，支持自定义配置、扩展等。


## 配置

HTTP项目配置了HTTP服务器的默认配置，你可以创建`APP_COMMON . 'config/http.php'`文件自定义覆盖默认配置。下述为默认配置

```php
return [
    'http' => [
        'service' => '\\http\\service\\HttpServer', // HTTP服务器类名，你可以在自定义扩展配置中覆盖定义为服务器子类
        'host' => '0.0.0.0', // 监听主机地址
        'port' => 20460, // 监听端口
        // 'extra_ports' => [['host' => '', 'port' => '']], // 需要额外监听的HTTP端口
        // 'api_host' => '', // HTTP服务器Api主机，如果需要远程管理你的HTTP服务器，可以通过此Rpc接口实现
        // 'api_port' => '', // HTTP服务器Api端口
        // 'api_password' => '', // HTTP服务器Api Rpc密匙
        // 'enable_tcp_ports' => [['host' => '', 'port' => '', 'sock_type' => 0]], // 需要额外监听的TCP端口集，配置后将同时开启TCP支持
    ],
    'swoole_http' => [ // Swoole\Http\Server的配置，将直接传递给\Swoole\Server::set方法使用
        'enable_static_handler' => true,
        'document_root' => APP_WWW,
    ],
    '#extends' => [
        APP_COMMON . 'config/http.php', // 给用户自定义的项目扩展配置路径
    ],
];
```

上述的`swoole_http`配置为[Swoole\Http\Server](/other/links.md#Http服务器)的原生配置项，如开启SSL等，都是通过该配置实现，该配置选项众多，你可以到[Swoole官网](/other/links.md#Http服务器)查看详情。



## 接口

HTTP服务器通过控制器`\http\controller\HttpServerController`暴露接口，这些接口通过节点配置了仅允许以命令行的方式请求。


### start

开启HTTP服务器

```shell
# Swoole环境运行
php run http start
# Docker/Podman运行Swoole镜像
docker run --rm --name server -it -v /mnt/f/App/Mine/dce/backend/dce/:/app/ -p 20460:20460 idrunk/swoole /app/dce http start
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman run --rm --name server -it -v /mnt/f/App/Mine/dce/backend/dce/:/app/ -p 20460:20460 idrunk/swoole /app/dce http start

# 成功响应
# Http server started with 0.0.0.0:20460.
```

#### 测试访问
```cmd
curl http://127.0.0.1:20460/
```

请求成功将响应下述内容
```html
<!doctype html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<title>欢迎使用Dce (*´▽｀)ノノ</title>
</head>
<body>
<h1>欢迎使用Dce (*´▽｀)ノノ</h1>
<p>这是Dce默认HTTP响应页，当你看到它时，表示你的Dce框架成功运行。</p>
<p>本页面仅在你未配置根路径节点时才会显示，如果你配置了根节点，则会渲染显示该节点控制器的响应内容。</p>
<p>你可以通过`url_path_hidden`属性实现根节点效果，参考下述示例。</p>
<pre>
return [
    [
        "path" => "home",
        "url_path_hidden" => true,
        "controller" => "IndexController->index",
    ],
];
</pre>
<p>上述配置定义了名为`home`的项目的节点配置，通过设置`url_path_hidden`为`true`实现可隐藏路径访问，即你可以通过`http://127.0.0.1/`路径请求`IndexController->index`控制器方法。</p>
</body>
</html>
```


### stop

关闭HTTP服务器

```shell
# Swoole环境运行
php run http stop
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman exec server /app/dce http stop

# 成功响应
# Http server was stopped.
```


### reload

重载HTTP服务器

```shell
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman exec server /app/dce http reload

# 成功响应
# Http server was reloaded.
```


### status

查看HTTP服务器状态信息

```shell
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman exec server /app/dce http status

# {
#     "server": {
#         "start_time": 1612894126,
#         "connection_num": 0,
#         "accept_count": 0,
#         "close_count": 0,
#         "worker_num": 8,
#         "idle_worker_num": 8,
#         "task_worker_num": 0,
#         "tasking_num": 0,
#         "request_count": 0,
#         "dispatch_count": 0,
#         "worker_request_count": 0,
#         "worker_dispatch_count": 0,
#         "coroutine_num": 2
#     }
# }
```


## 服务类库

### `\http\service\HttpServer`

HTTP服务器类，继承于[服务器基类](/service/README.md#服务器基类)，主要在此类中实例化了[`\Swoole\Http\Server`](/other/links.md#Http服务器)类，并绑定接入了各种Dce业务流。

此类即上述[配置](#配置)中`service`属性的默认值，如果你需要拓展此类或需自定义类作为HTTP服务器类，可以将该配置值设置为你的完整类名，这时调用`http start`接口将实例化你配置的类。



### `\http\service\RawRequestHttpSwoole`

Swoole版HTTP原始请求类，本类继承于[HTTP原始请求类](/request/raw.md#dce-project-request-rawrequesthttp)，实现了该类及各父辈类的抽象方法，完成了相关HTTP请求参数的填充。

你可以自定义HTTP服务器类，并定义`\dce\service\server\ServerMatrix::$rawRequestHttpClass`属性值为继承拓展此类或自定义原始请求类的类名类，以此方式实现自定义HTTP原始请求类。



### `\http\service\CookieSwoole`

Swoole版Cookie类，继承并实现了[Cookie类](/request/cookie.md)



