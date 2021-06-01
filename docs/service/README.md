# 综合服务

Dce设计了内置项目的概念，所谓内置项目，就是内置在Dce框架中的[项目](/request/project.md)，根路径为`project`。这些项目下封装了些内置服务与工具，它们大多以命令行接口暴露，本组章节将介绍它们的使用方法。


## 服务器基类

服务基类是为Dce内置服务封装的抽象类，主要为内置服务抽象或实现了RCR架构化。


### `\dce\service\server\ServerMatrix;`

服务器基类，各种协议网络服务端基类，Dce的Http、Websocket、Tcp/Udp等皆继承于此，依赖Swoole。


#### `::rawRequestHttpClass`
`string = \http\service\RawRequestHttpSwoole::class` 定义RawRequestHttp类名（Http服务专用，可在子类覆盖此属性使用自定义RawRequest类）


#### `::rawRequestTcpClass`
`string = \tcp\service\RawRequestTcp::class` 定义RawRequestTcp类名（Tcp服务专用，可在子类覆盖）


#### `::rawRequestUdpClass`
`string = \tcp\service\RawRequestUdp::class` 定义RawRequestUdp类名（Udp服务专用，可在子类覆盖）


#### `->projectConfig`
`\dce\config\DceConfig` 当前Server项目配置


#### `->sessionManager`
`\dce\project\session\SessionManager` Session管理器


#### `->apiHost`
`string` 对外Api服务地址


#### `->apiPort`
`int` 对外Api服务端口


#### `->apiPassword`
`string` 对外Api服务的口令


#### `->genSessionManager()`
生成SessionManager实例（可在子类覆盖此方法使用自定义SessionManager类）

- 返回`\dce\project\session\SessionManager`


#### `->eventBeforeStart()`
服务启动前回调（可在子类覆盖自定义）

- 参数
  - `\Swoole\Server $server` Swoole服务器对象

- 返回`void`


#### `->eventOnConnect()`
开启连接回调（可在子类覆盖自定义）

- 参数
  - `\Swoole\Server $server` Swoole服务器对象
  - `int $fd` 连接文件描述符
  - `int $reactorId` 连接所在的 Reactor 线程 ID

- 返回`void`


#### `->eventOnClose()`
关闭连接回调（可在子类覆盖自定义）

- 参数
  - `\Swoole\Server $server` Swoole服务器对象
  - `int $fd` 连接文件描述符
  - `int $reactorId` 连接所在的 Reactor 线程 ID

- 返回`void`


#### `->eventsToBeBound()`
取用户自定义的需要监听的其他事件 (在子类覆盖自定义)

- 返回`array`


#### `->enableTcpPorts()`
启动Tcp/Udp支持（在Http/Websocket服务同时开启Tcp/Udp）

- 参数
  - `array $tcpPorts`
  - `array $swooleTcpConfig`

- 返回`void`


#### `->takeoverConnect()`
接管连接事件

- 参数
  - `\Swoole\Server $server` Swoole服务器对象
  - `int $fd` 连接文件描述符
  - `int $reactorId` 连接所在的 Reactor 线程 ID

- 返回`void`


#### `->takeoverRequest()`
让DCE接管Http请求

- 参数
  - `\Swoole\Http\Request` Swoole的Request对象
  - `\Swoole\Http\Response` Swoole的Response对像

- 返回`void`


#### `->takeoverReceive()`
让DCE接管Tcp消息

- 参数
  - `\Swoole\Server $server` Swoole服务器对象
  - `int $fd` 连接文件描述符
  - `int $reactorId` 连接所在的 Reactor 线程 ID
  - `string $data` 收到的数据

- 返回`void`


#### `->takeoverPacket()`
让DCE接管Udp消息

- 参数
  - `\Swoole\Server $server` Swoole服务器对象
  - `string $data` 收到的数据
  - `array $clientInfo` 客户端信息

- 返回`void`


#### `->takeoverClose()`
接管连接关闭事件

- 参数
  - `\Swoole\Server $server` Swoole服务器对象
  - `int $fd` 连接文件描述符
  - `int $reactorId` 连接所在的 Reactor 线程 ID

- 返回`void`


#### `->handleException()`
处理请求接口异常（目前默认只会中断程序打印异常，你可以在子类覆盖，实现你自己的异常处理逻辑）

- 参数
  - `Throwable $throwable`

- 返回`void`


#### `->send()`
向Tcp客户端推送数据

- 参数
  - `int $fd` 连接文件描述符
  - `mixed $value` 需要发送的数据
  - `string $path|false` 请求路径，`false`表示不响应路径

- 返回`bool`


#### `->sendTo()`
向Udp客户端推送数据

- 参数
  - `string $host` 目标主机
  - `int $port` 目标主机端口
  - `mixed $value` 需要发送的数据
  - `string $path|false` 请求路径，`false`表示不响应路径

- 返回`bool`


#### `->runApiService()`
启动服务器Api服务（自调用）

- 返回`void`


#### `->stop()`
停止服务

- 返回`void`


#### `->reload()`
重载服务

- 返回`void`


#### `->status()`
获取服务状态

- 返回`array`


#### `->start();`
启动服务

- 返回`void`


#### `->getServer();`
取Server实例

- 返回`\Swoole\Server`



### `\dce\service\server\RawRequestConnection`

长连接型原始请求类


#### `::PATH_SEPARATOR`
`string = ';'` 路径内容分隔符

#### `::REQUEST_SEPARATOR`
`string = ':'` 路径与请求ID分隔符

#### `->requestId`
`int|null` 请求响应模式的请求ID（路径中包含以`REQUEST_SEPARATOR`分隔的请求ID时，将视为请求响应模式，此模式下的长连接请求，将自动渲染并响应）


#### `->routeGetNode()`
路由并取节点（Dce默认根据解析的请求路径路由，你可以在子类中覆盖定义此方法实现自己的路由逻辑）

- 返回`\dce\project\node\Node`


#### `::pack()`
打包待推数据（默认会以`{$path};{:json_encode($data)}`的形式打包，你可以在子类覆盖此方法实现自己的打包规则）

- 参数
  - `string|false $path` 请求路径，`false`时不打包路径
  - `mixed $data` 待打包数据

- 返回`string`


#### `::unPack()`
拆包接收的数据（你可以在子类覆盖此方法实现自己的拆包规则）

- 参数
  - `string $data` 待拆包数据

- 返回`array`


#### `->isResponseMode()`
是否请求响应模式

- 返回`bool`


#### `->getServer();`
取Server对象，子类实现返回具体服务器类型

- 返回`\dce\service\server\ServerMatrix`


#### `->response();`
响应客户端，回发数据

- 返回`bool`



### `\dce\service\server\ServerApi`

服务Api，用于暴露运行服务接口，方便从程序外部维护

```bash
dce http start
dce http status
```