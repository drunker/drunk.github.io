# 会话管理器


## 介绍

会话管理器（SessionManager）顾名思义能帮助你管理会话，能让你非常方便的按用户维护会话状态、向长连接用户发送消息等。


### 架构设计

实时改变一个用户的状态需要用户与其会话信息，用户信息可以直接查到，但其对应的会话信息却不得而知。如果是一个长连接用户，你还需要找到他的连接。为了方便找出关系数据，作者设计了会话管理器，来维护这三要素（`mid`、`sid`与`fdid`）的实时关系。

标识 | 所属 | 说明
:--: | :--: | :--
mid | 用户资料 | 用户ID，一个用户只有一个ID，但可能有多个会话`sid`
sid | 会话 | 会话ID，一次会话只会有一个ID，但可能会在会话上建立多个长连接，如请求一个站点时只会生成一个会话，但打开多个页面时可能建立多个长连接
fdid | 长连接 | 连接ID，一个连接只会有一个ID

#### 会话管理器业务关系图
![会话管理器业务关系图](./session-manager-business-relation.svg)


### 维护会话状态

传统编程中，经常会遇到这样的情况：为了减少数据库IO，常常从Session中取用户展示信息或鉴权，但当用户的信息更新时，其Session却无法同步更新，导致你为了解决这个问题而不得不实时查数据库取信息，使Session变成一个鸡肋。而会话管理器就能解决这个问题，它将登录用户与会话做了绑定，可以让你非常方便的按用户设置会话信息而无需知道会话ID。


### 维护长连接用户

假设有这样一个场景：“A用户连接着`服务器1`，B用户连接着`服务器2`，A需要向B发送消息时，他们之间因为没有建立连接无法直接发送，而是需要A先发消息到服务器，服务器再转发给B。又因为A与B连接的不是同一服务器，导致A的`服务器1`无法直接给B发消息”。
这个时候需要将“服务器发消息给B”的这个过程拆分为：“1. `服务器1`查找B所在的服务器。2. `服务器1`向找到的`服务器2`提供的接口发送消息，`服务器2`转发消息给与其连接的B用户”。而会话管理器就对登录用户与其连接的服务器做了映射，有了这个映射表，你可以非常方便的找到用户的连接服务器。

当然，如果你的分布式服务器会部署很多台（如大于10台），建议你利用消息队列实现用户消息通信，因为SessionManager集成的通信功能极限情况下会与其他所有服务器建立连接，100台服务器每台需要建立99个连接，总共就9900个连接，有些浪费。如果你使用消息队列，则仅需与中间件建立1个连接，100台也一共仅需100个连接，可以节省资源。但即使使用中间件，会话管理器维护的连接信息也可以帮助你更方便的编程，因为你的业务总归得知道用户连接的服务器，你得知道消息要发给谁或者由谁所发。



## \dce\project\session\SessionManager;
会话管理器基类。

### `::inst()`
实例化一个单例会话管理器对象

- 返回`static`


### `->clear()`
清空FdForm，服务器初始化时自动调用，防止前次服务器发生异常导致未正常断开连接而留下垃圾数据。

- 参数
  - `string $apiHost`
  - `int $apiPort`

- 返回`void`


### `->connect()`
连接时同步会话状态，Dce在连接建立时自动调用

- 参数
  - `string $sid` 会话ID
  - `int $fd` 连接文件描述符
  - `string $apiHost` 服务器接口主机
  - `int $apiPort` 服务器接口端口
  - `string $extra` 扩展信息（默认为服务器类型，['ws', 'tcp']）

- 返回`void`


### `->disconnect()`
断开连接时同步会话状态，Dce在连接断开时自动调用

- 参数
  - `int $fd` 连接文件描述符
  - `string $apiHost` 服务器接口主机
  - `int $apiPort` 服务器接口端口

- 返回`void`


### `->login()`
处理HTTP登录，标记相关信息，需要在你的HTTP登录业务中手动调用

- 参数
  - `int $mid` 用户ID
  - `string $sid` 会话ID

- 返回`void`

- 示例
```php
$signer = Member::login($username, $password);
// 标记用户与会话映射
SessionManager::inst()->login($signer['mid'], $request->session->getId());
```


### `->fdLogin()`
处理长连接登录，标记mid相关信息，需要你在长连接的登录业务中手动调用

- 参数
  - `int $mid` 用户ID
  - `int $fd` 连接文件描述符
  - `string $apiHost` 服务器接口主机
  - `int $apiPort` 服务器接口端口

- 返回`void`

- 示例
```php
$signer = Member::login($username, $password);
// 标记用户与会话及连接映射
SessionManager::inst()->fdLogin($signer['mid'], $request->fd, $request->rawRequest->getServer()->apiHost, $request->rawRequest->getServer()->apiPort);
```


### `->logout()`
退出登录

- 参数
  - `string $sid` 会话ID

- 返回`void`

- 示例
```php
SessionManager::inst()->logout($request->session->getId());
```


### `->setSession()`
设置用户的全部Session信息（当用户Session源信息改变时，调用此方法同步更新该用户的全部Session信息）

- 参数
  - `int $mid` 用户ID
  - `string $key` Session键
  - `mixed $value` 待存Session值

- 返回`void`

- 示例
```php
$newInfo = [];
Member::update($mid, $newInfo);
SessionManager::inst()->setSession($mid, 'signer', $newInfo);
```


### `->deleteSession()`
删除登录用户的全部Session指定键值（可以在踢除或禁用某个用户时调用）

- 参数
  - `int $mid` 用户ID
  - `string $key` Session键

- 返回`void`


### `->destroySession()`
注销登录用户全部Session（可以在踢除或禁用某个用户时调用）

- 参数
  - `int $mid` 用户ID

- 返回`void`


### `->renewSession()`
更新Session（将原fd与mid绑定的sid更新为新的）

- 参数
  - `Session $session` 需renew的Session实例
  - `bool $longLive = false` 是否长存Session

- 返回`Session`


### `->sendMessage()`
向已连接的指定用户发送可跨服务器消息

- 参数
  - `int $mid` 用户ID
  - `mixed $message` 待发消息
  - `string|false $path` 响应路径

- 返回`bool|null`

- 示例
```php
// 向指定用户的全部连接推送新消息列表
SessionManager::inst()->sendMessage($mid, $newMessageList, 'project/im/load');
```


### `->sendMessageFd()`
向fdid发送消息

- 参数
  - `string $fdid` 目标fdid
  - `mixed $message` 待发消息
  - `string|false $path` 响应路径

- 返回`bool`

- 示例
```php
$fdFormList = SessionManager::inst()->listFdForm(limit: null);
foreach ($fdFormList as $fdid => $fdForm) {
    // 向全部在线用户(不一定已登录)推送新消息列表
    SessionManager::inst()->sendMessageFd($fdid, $newMessageList, 'project/im/load');
}
```


### `->getFdForm()`
取FdForm

- 参数
  - `string|int $fd` 连接文件描述符或fdid
  - `string $host = ''` 服务器接口主机
  - `int $port = 0` 服务器接口端口

- 返回`array|false`

- 示例
```php
$fdForm = SessionManager::inst()->getFdForm(10, '127.0.0.1', 20700);
// 或
$fdForm = SessionManager::inst()->getFdForm('127.0.0.1:20700/10');

// 返回如
// ["sid" => "176af13bd4e5c33996e296d1e9faf931efd34bef", "fd" => 10, "host" => "127.0.0.1", "port" => 20700, "extra" => "ws"]
```


### `->listFdForm()`
迭代式的取FdForm集（用于全站群推消息等）

- 参数
  - `int $offset = 0` 起始偏移量
  - `int|null $limit = 100` 需提取量，`null`表示取完
  - `string $pattern = '*'` 匹配fdid通配符

- 返回`array`

- 示例
```php
$fdFormList = SessionManager::inst()->listFdForm(limit: null);

/* 返回如
[
    '127.0.0.1:20700/10' => ["sid" => "176af13bd4e5c33996e296d1e9faf931efd34bef", "fd" => 10, "host" => "127.0.0.1", "port" => 20700, "extra" => "ws"],
    '127.0.0.1:20700/11' => ["sid" => "80336d5736bf685223289b752163877c27c53b0d", "fd" => 11, "host" => "127.0.0.1", "port" => 20700, "extra" => "ws"],
]
*/
```


### `->getSessionForm()`
根据sid取SessionForm

- 参数
  - `string $sid` 会话ID
  - `bool|null $fdidOrMid = false` 需要提取的元素，三相属性
    - `true` 取fdid集，如`["127.0.0.1:20700/10"]`
    - `false` 取mid，如`1000`
    - `null` 取整个SessionForm，如`["fdid"=>["127.0.0.1:20700/10"], "mid"=>1000]`

- 返回`array|int|false`


### `->getMemberForm()`
取mid对应的sid/fdid集

- 参数
  - `int $mid` 用户ID
  - `bool|null $fdidOrSid = true` 需要提取的元素，三相属性
    - `true` 取fdid集，如`["127.0.0.1:20700/10"]`
    - `false` 取sid集，如`["176af13bd4e5c33996e296d1e9faf931efd34bef"]`
    - `null` 取整个MemberForm，如`["fdid"=>["127.0.0.1:20700/10"], "sid"=>["176af13bd4e5c33996e296d1e9faf931efd34bef"]]`

- 返回`array|false`



## \dce\project\session\SessionManagerFile

文件版SessionManager数据储存器。数据将储存在脚本所在服务器，若你的程序需分布式部署，则不能使用此储存器。



## \dce\project\session\SessionManagerRedis

Redis版SessionManager数据储存器。数据将储存于Redis服务器，分布式服务器只要连接相同的或者分布式Redis，则可以共享数据并且能获得较好的性能，因此推荐使用该储存器。

若Redis可用`if (\dce\storage\redis\DceRedis::isAvailable())`（即你配置了[Redis主机端口](/config/#redis)），则Dce会默认使用Redis版会话管理器，否则默认使用文件会话管理器。你可以自定义其他管理器，只需要继承实现`\dce\project\session\SessionManager;`类定义的抽象方法，然后通过[Session配置](/config/#session)`\dce\config\DceConfig::$session['manager_class']`将类设置为你实现的类即可。