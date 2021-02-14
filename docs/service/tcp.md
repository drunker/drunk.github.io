# TCP/UDP服务器

本章介绍Tcp/Udp服务器，前两章介绍的Http、Websocket服务器也能同时开启Tcp/Udp服务，而本章介绍的是专用的Tcp/Udp服务器。（其实也能通过各种配置实现支持Http、Websocket，但相对于直接使用相应服务器来说比较复杂）

TCP/UDP服务器是以内置项目的形式封装于`dce/project/tcp`目录下，支持自定义配置、扩展等。该服务依赖于[\Swoole\Server](/other/links.md#tcp-udp服务器)，你必须在Swoole环境才能开启此服务器。


## 配置

Tcp项目下配置了Tcp/Udp服务器的默认配置值，你可以创建`APP_COMMON . 'config/tcp.php'`文件自定义覆盖默认配置。下述为默认配置

```php
return [
    'tcp' => [
        'service' => '\tcp\service\TcpServer', // Tcp/Udp服务器类名，你可以在自定义扩展配置中覆盖定义为服务器子类
        'host' => '0.0.0.0', // 监听主机地址
        'port' => 20462, // 监听端口
        'mode' => SWOOLE_PROCESS, // Swoole服务器运行模式, 具体参考Swoole文档
        'sock_type' => SWOOLE_SOCK_TCP, // 指定服务器类型, 具体参见Swoole文档
        'extra_ports' => [['host' => '0.0.0.0', 'port' => 20463, 'sock_type' => SWOOLE_SOCK_UDP]], // 需要额外监听的Tcp/Udp端口
        // 'api_host' => '', // 服务器Api主机，如果需要远程管理你的服务器，可以通过此Rpc接口实现
        // 'api_port' => '', // 服务器Api端口
        // 'api_password' => '', // 服务器Api Rpc密匙
    ],
    'swoole_tcp' => [], // Swoole\Server的配置，将直接传递给\Swoole\Server::set方法使用
    '#extends' => [
        APP_COMMON . 'config/tcp.php', // 给用户自定义的项目扩展配置路径
    ],
];
```

上述配置中的`tcp.mode`、`tcp.sock_type`及`swoole_tcp`为Swoole配置，具体请参考[Swoole文档](/other/links.md#tcp-udp服务器)



## 接口

Tcp/Udp服务器通过控制器`\tcp\controller\TcpServerController`暴露接口，这些接口通过节点配置了仅允许以命令行的方式请求。


### start

开启Tcp/Udp服务器

```shell
# Swoole环境运行
php run tcp start
# Docker/Podman运行Swoole镜像
docker run --rm --name server -it -v /mnt/f/App/Mine/dce/backend/dce/:/app/ -p 20462:20462 -p 20463:20463/udp idrunk/swoole /app/run tcp start
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman run --rm --name server -it -v /mnt/f/App/Mine/dce/backend/dce/:/app/ -p 20462:20462 -p 20463:20463/udp idrunk/swoole /app/run tcp start

# 成功响应
# Tcp server started with 0.0.0.0:20462.
```

#### 测试连接

Tcp
```shell
nc 127.0.0.1 20462

# 
# {"data":{"info":"恭喜！服务端收到了你的消息并给你作出了回应"}}
```

Udp
```shell
nc -u 127.0.0.1 20463

# 
# {"data":{"info":"恭喜！服务端收到了你的消息并给你作出了回应"}}

# 作者在Windows下用netcat测试udp时无法正常进行，切换到linux后正常测试通过
```



### stop

关闭Tcp/Udp服务器

```shell
# Swoole环境运行
php run tcp stop
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman exec server /app/run tcp stop

# 成功响应
# Tcp server was stopped.
```


### reload

重载Tcp/Udp服务器

```shell
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman exec server /app/run tcp reload

# 成功响应
# Tcp server was reloaded.
```


### status

查看Tcp/Udp服务器状态信息

```shell
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman exec server /app/run tcp status

# {
#     "server": {
#         "start_time": 1613032233,
#         "connection_num": 0,
#         "accept_count": 1,
#         "close_count": 1,
#         "worker_num": 16,
#         "idle_worker_num": 16,
#         "task_worker_num": 0,
#         "tasking_num": 0,
#         "request_count": 4,
#         "dispatch_count": 1,
#         "worker_request_count": 0,
#         "worker_dispatch_count": 0,
#         "coroutine_num": 2
#     }
# }
```


## 服务类库

### `\tcp\service\TcpServer`

Tcp/Udp服务器类，继承于[服务器基类](/service/README.md#服务器基类)，主要在此类中实例化了[`\Swoole\Server`](/other/links.md#tcp-udp服务器)类，并绑定接入了各种Dce业务流。

此类即上述[配置](#配置)中`service`属性的默认值，如果你需要拓展此类或需自定义类作为Tcp/Udp服务器类，可以将该配置值设置为你的完整类名，这时调用`tcp start`接口将实例化你配置的类。



### `\tcp\service\RawRequestTcp`

Swoole版Tcp原始请求类，本类继承于[长连接原始请求类](/service/README.md#dce-service-server-rawrequestconnection)，实现了该类及各父辈类的抽象方法，完成了相关Tcp请求参数的填充。

你可以自定义Tcp/Udp服务器类，并定义`\dce\service\server\ServerMatrix::$rawRequestTcpClass`属性值为继承拓展此类或自定义原始请求类的类名类，以此方式实现自定义Tcp原始请求类。



### `\tcp\service\RawRequestUdp`

Swoole版Udp原始请求类，本类继承于[长连接原始请求类](/service/README.md#dce-service-server-rawrequestconnection)，实现了该类及各父辈类的抽象方法，完成了相关Udp请求参数的填充。

你可以自定义Tcp/Udp服务器类，并定义`\dce\service\server\ServerMatrix::$rawRequestUdpClass`属性值为继承拓展此类或自定义原始请求类的类名类，以此方式实现自定义Udp原始请求类。

