# 远程调用

DCE利用PHP的自动加载特性，实现了较为简单优雅的RPC（远程过程调用），你可以很方便的做RPC开发。RPC依赖Swoole，只能在有Swoole的常驻内存环境使用。目前RPC的支持可能还不够完善，不太建议基础弱的开发者直接商用，后续会逐步完善之。


## \dce\rpc\RpcServer

RPC服务类，注册暴露支持RPC的服务接口


### `::new()`
创建一个服务实例

- 参数
  - `\dce\rpc\RpcHost $rpcHost` RPC主机实例

- 返回`self`


### `::host()`
创建一个RPC主机实例

- 参数
  - `string $host = RpcUtility::DEFAULT_TCP_HOST` 主机地址
  - `int $port = RpcUtility::DEFAULT_TCP_PORT` 绑定端口

- 返回`\dce\rpc\RpcHost`

- 示例
```php
$host = \dce\rpc\RpcServer::host();
```


### `->addHost()`
添加一个新主机

- 参数
  - `\dce\rpc\RpcHost $rpcHost` RPC主机实例

- 返回`$this`

- 示例
```php
$server = \dce\rpc\RpcServer::new(\dce\rpc\RpcServer::host());
$server->addHost(\dce\rpc\RpcServer::host('192.168.1.10', 20466));
```


### `->prepare()`
预加载Rpc命名空间

- 参数
  - `string $root` 名字空间下服务类根目录
  - `string $wildcard = RpcUtility::DEFAULT_NAMESPACE_WILDCARD` 名字空间通配符

- 返回`$this`

- 示例
```php
$server = \dce\rpc\RpcServer::new(\dce\rpc\RpcServer::host());
$server->prepare('service/rpc/', 'rpc\\*');
```


### `->preload()`
预加载Rpc类文件

- 参数
  - `string $filename` 需加载文件名

- 返回`$this`

- 示例
```php
$server = \dce\rpc\RpcServer::new(\dce\rpc\RpcServer::host());
$server->preload('service/HelloRemote.php');
```


### `->start()`
启动Rpc服务

- 参数
  - `? callable $callback = null` 新进程启动回调
  - `bool $runNewProcess = true` 是否在新建进程中启动
  - `bool $useAsyncServer = false` 是否使用异步Tcp服务
    - `true` 使用异步版Tcp
    - `false` 使用协程版Tcp

- 返回`void`

- 示例
```php
RpcServer::new(RpcServer::host())
  ->addHost(RpcServer::host('0.0.0.0', 20469)->setAuth('drunk'))
  ->addHost(RpcServer::host('0.0.0.0', 20468))
  ->prepare($this->request->project->path . "/service/rpc/", 'rpc\*')
  ->start();
```


## \dce\rpc\RpcHost

Rpc主机类，标记IP端口等信息


### `->setAuth()`
设置鉴权方案

- 参数
  - `string $password` 鉴权密码
  - `array $ipWhiteList = []` 限制客户端IP白名单
  - `bool $needNative = false` 是否仅允许同服务器环境客户端
  - `bool $needLocal = false` 是否仅允许同局域网环境客户端

- 返回`$this`

- 示例
```php
$host = RpcServer::host('0.0.0.0', 20469)->setAuth('drunk', [], false, true);
```


## \dce\rpc\RpcMatrix;

Rpc服务基类，Rpc服务接口必须继承该类才能提供远程调用。

Rpc服务接口实现类 **必须不能** 通过DCE`自动注册的自动加载`而被加载，这样当调用远程方法时，会因为本地已加载了而直接调用该方法，导致无法发起远程请求。

- ~~错误示例~~
```php
// 该类文件符合DCE自动加载，会直接调用该类方法而无法发起远程请求
// APP_COMMON . 'service/hello/HelloRemote.php'
namespace service\hello;

use dce\rpc\RpcMatrix;

class HelloRemote extends RpcMatrix {
    public static function hello(... $args) {
        return json_encode($args);
    }
}
```

- 正确示例
```php
// 该类不会自动加载，调用时会发起远程请求RPC服务端（服务端需先主动通过`->prepare或->preload`主动加载该类），服务端调用接口方法并将结果响应给客户端
// APP_COMMON . 'service/rpc/HelloRemote.php'
namespace rpc;

use dce\rpc\RpcMatrix;

class HelloRemote extends RpcMatrix {
    public static function hello(... $args) {
        return json_encode($args);
    }
}
```


## \dce\rpc\RpcClient

Rpc客户端类，拦截Rpc服务，发起远程调用再返回结果


### `::prepare()`
拦截rpc命名空间的类，将其转到当前RPC客户端下的魔术方法处理

与服务端的区别是：服务端将RPC服务的名字空间注册到真实的类目录或文件，而客户端注册到回调函数，在该函数中访问服务端接口返回其结果。经过这个巧妙的小设计，让远程调用和本地调用形式完全一样，IDE的智能提示也完全可用，非常优雅。

- 参数
  - `array $hosts` 服务主机列表（DCE会根据这些主机创建连接池，而不是直接建立连接，配有多个主机时会自动负载均衡）
    - `{host, port, token}` token不填则表示非加密API，将不传递token，此map形式会自动转为下方的数组形式
    - `[{host, port, token, max_connection}]` 主机集形式，标准形式
  - `array $wildcards = [RpcUtility::DEFAULT_NAMESPACE_WILDCARD]` 远程服务名字空间通配符

- 返回`void`

- 示例
```php
// 注册拦截
RpcClient::prepare(['host' => self::LOCAL_API_HOST, 'port' => 0], ['rpc\http\*']);

// 调用远程服务
\rpc\http\HttpServerApi::status();
```


### `::preload()`
拦截rpc类，将其转到当前RPC客户端下的魔术方法处理（与`::prepare()`不同的是本方法直接拦截类名而不是命名空间）

- 参数
  - `array $hosts` 与`::prepare()`方法的该参数用法一致
  - `string $className` 注册的需拦截类名

- 返回`void`

- 示例
```php
RpcClient::preload($serverHosts, '\rpc\didg\IdgServerRpc');
```


### `::with()`
向特定的服务器请求远程方法（使用箭头函数将更方便，如`$mid = RpcClient::with(fn() => rpc\service\MidGenerator::generation(), '127.0.0.1', '2333')`）

- 参数
  - `string $host` 主机地址
  - `int $port` 主机端口
  - `callable $callback` 返回调用Rpc方法结果的匿名函数

- 返回`mixed`

- 示例
```php
// 注册拦截
RpcClient::prepare(['host' => self::LOCAL_API_HOST, 'port' => 0], ['rpc\*']);

// 调用指定主机的远程服务
$result = RpcClient::with(self::LOCAL_API_HOST, 0, fn() => \rpc\HelloRemote::hello(1, 2, 3));
```


## \dce\rpc\DceRpcClient

DCE Rpc客户端自动注册工具类，本类无需主动调用，配置好`rpc_servers`后DCE会在启动时自动调用。


- 示例
```php
// config.php
// 在config中注册后，DCE在启动时会自动注册这些RPC服务，无需主动调用RpcClient注册，直接调用远程接口方法即可
[
  'rpc_servers' => [
    [
      'hosts' => [ // 提供Rpc服务的服务器
        ['host' => RpcUtility::DEFAULT_TCP_HOST, 'port' => RpcUtility::DEFAULT_TCP_PORT],
      ],
      'wildcards' => ['rpc\*',] // 所需拦截处理的通配符名字空间
    ],
  ]
]

// [SOME_CONTROLLER->METHOD]()
// 直接在某控制器方法中调用远程接口方法
\rpc\SomeService::doJob();
```


## 完整RPC示例


### 定义远程接口类
```php
// APP_COMMON . 'service/rpc/RemoteApi.php'
namespace rpc;

use dce\rpc\RpcMatrix;

class RemoteApi extends RpcMatrix {
  public static function echo(... $arguments) {
    return sprintf("收到参数：%s", json_encode($arguments));
  }
}
```


### 启动服务
```php
// [SOME_CONTROLLER->METHOD]()
RpcServer::new(RpcServer::host())
  ->addHost(RpcServer::host('0.0.0.0', 20469)->setAuth('drunk'))
  ->preload(APP_COMMON . 'service/rpc/RemoteApi.php')
  ->start();
```


### 客户端注册拦截并调用
```php
// [SOME_CONTROLLER->METHOD]()
// 注册拦截
RpcClient::prepare(['host' => '127.0.0.1', 'port' => 0], ['rpc\*']);

// 调用远程服务
$result = \rpc\RemoteApi::echo(1, 2, 3);
test($result);
// 收到参数：[1,2,3]
```