# Websocket服务器

Dce以内置项目的形式封装了Websocket服务器，项目位于`project/websocket`目录下，支持自定义配置、扩展等。该服务依赖于[\Swoole\WebSocket\Server](/other/links.md#Websocket服务器)，你必须在Swoole环境才能开启此服务器。

Websocket服务器能同时方便的提供HTTP、Tcp/Udp服务支持，所以如果你需要这些服务，实例化一个Websocket服务器即可。


## 配置

Websocket项目下配置了Websocket服务器的默认配置，你可以创建`APP_COMMON . 'config/websocket.php'`文件覆盖默认配置。下述为默认配置

```php
return [
    'websocket' => [
        'service' => '\\websocket\\service\\WebsocketServer', // Websocket服务器类名，你可以在自定义扩展配置中覆盖定义为服务器子类
        'host' => '0.0.0.0', // 监听主机地址
        'port' => 20461, // 监听端口
        // 'enable_http' => false, // 是否同时开启HTTP协议支持
        // 'extra_ports' => [['host' => '', 'port' => '']], // 需要额外监听的端口(Websocket,HTTP)
        // 'api_host' => '', // 服务器Api主机，如果需要远程管理你的Websocket服务器，可以通过此Rpc接口实现
        // 'api_port' => '', // 服务器Api端口
        // 'api_password' => '', // 服务器Api Rpc密匙
        // 'enable_tcp_ports' => [['host' => '', 'port' => '', 'sock_type' => 0]], // 需要额外监听的TCP端口集，配置后将同时开启TCP支持
    ],
    'swoole_websocket' => [ // Swoole\WebSocket\Server的配置，将直接传递给\Swoole\Server::set方法使用
        'enable_static_handler' => true,
        'document_root' => APP_WWW,
    ],
    '#extends' => [
        APP_COMMON . 'config/websocket.php', // 给用户自定义的项目扩展配置路径
    ],
];
```



## 接口

Websocket服务器通过控制器`\websocket\controller\WebsocketServerController`暴露接口，这些接口通过节点配置了仅允许以命令行的方式请求。


### start

开启Websocket服务器

```shell
# Swoole环境运行
dce websocket start
# Docker/Podman运行Swoole镜像
docker run --rm --name server -it -v /mnt/f/App/Mine/dce/backend/dce/:/app/ -p 20461:20461 idrunk/swoole /app/dce websocket start
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman run --rm --name server -it -v /mnt/f/App/Mine/dce/backend/dce/:/app/ -p 20461:20461 idrunk/swoole /app/dce websocket start

# 成功响应
# Websocket server started with 0.0.0.0:20461.
```

#### 尝试连接
```js
const ws = new WebSocket('ws://127.0.0.1:20461');
ws.onopen = () => ws.send('');
ws.onmessage = msg => console.log(msg.data);

// 若连接成功，将在控制台打印出下述消息
/*

{"data":{"info":"恭喜！服务端收到了你的消息并给你作出了回应"}}
*/
```


### stop

关闭Websocket服务器

```shell
# Swoole环境运行
dce websocket stop
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman exec server /app/dce websocket stop

# 成功响应
# Websocket server was stopped.
```


### reload

重载Websocket服务器

```shell
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman exec server /app/dce websocket reload

# 成功响应
# Websocket server was reloaded.
```


### status

查看Websocket服务器状态信息

```shell
# Windows10 Wsl2 Podman运行Swoole镜像
ubuntu run podman exec server /app/dce websocket status

# {
#     "server": {
#         "start_time": 1612953950,
#         "connection_num": 2,
#         "accept_count": 4,
#         "close_count": 2,
#         "worker_num": 16,
#         "idle_worker_num": 16,
#         "task_worker_num": 0,
#         "tasking_num": 0,
#         "request_count": 11,
#         "dispatch_count": 11,
#         "worker_request_count": 0,
#         "worker_dispatch_count": 0,
#         "coroutine_num": 2
#     }
# }
```


## 服务类库

### `\websocket\service\WebsocketServer`

Websocket服务器类，继承于[服务器基类](/service/README.md#服务器基类)，主要在此类中实例化了[`\Swoole\WebSocket\Server`](/other/links.md#WebSocket服务器)类，并绑定接入了各种Dce业务流。

此类即上述[配置](#配置)中`service`属性的默认值，如果你需要拓展此类或需自定义类作为Websocket服务器类，可以将该配置值设置为你的完整类名，这时调用`websocket start`接口将实例化你配置的类。


#### `->takeoverOpen()`
开启连接回调（可在子类覆盖自定义）

- 参数
  - `\Swoole\WebSocket\Server $server`
  - `\Swoole\Http\Request $request`

- 返回`void`


#### `->push()`
向客户端推送数据

- 参数
  - `int $fd`
  - `mixed $value`
  - `string|false $path`

- 返回`bool`



### `\websocket\service\RawRequestWebsocket`

Websocket原始请求类，本类继承于[长连接原始请求类](/service/#dce-service-server-rawrequestconnection)，实现了该类及各父辈类的抽象方法，完成了相关Websocket请求参数的填充。

你可以自定义Websocket服务器类，并定义`\websocket\service\WebsocketServer::$rawRequestWebsocketClass`属性值为继承拓展此类或自定义原始请求类的类名类，以此方式实现自定义Websocket原始请求类。



### `\rpc\websocket\service\WebsocketServerApi`

Websocket服务器接口类


#### `::push()`
向客户端推送消息

- 参数
  - `int $fd`
  - `mixed $value`
  - `string $path`

- 返回`bool`