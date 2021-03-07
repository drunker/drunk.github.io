# Session

## \dce\project\request\Session;

Session基类，抽象类，封装了Session基础属性方法


### `->newByRequest()`
根据Request开启Session（实现对自动开启Session的支持）

- 参数
  - `\dce\project\request\Request $request` 请求对象

- 返回`static`


### `->newBySid()`
在长连接建立时生成一个Session实例，或在外部实例化Session并设置好Sid，如在Session管理器等外部中操作Session

- 参数
  - `string|true $sid` 指定sid，或传`true`自动生成一个

- 返回`static`


### `->getSidName()`
取Session ID在Cookie的键名（若静态属性尚未绑定则取到后会赋到该属性上）

- 返回`string`


### `->setId()`
设置Session ID

- 参数
  - `string $sid` Session ID

- 返回`$this`


### `->getId()`
取Session ID

- 返回`string|null`


### `->open()`
开启Session并初始化

- 参数
  - `\dce\project\request\Request $request` 请求对象

- 返回`void`


### `->set();`
设置Session值

- 参数
  - `string $key` 键
  - `mixed $value` 值

- 返回`void`


### `->isAlive();`
判断Session是否存活

- 返回`bool`


### `->get();`
取某Session键的值

- 参数
  - `string $key`

- 返回`mixed`


### `->getAll();`
取全部Session数据

- 返回`array`


### `->delete();`
删除某个Session值

- 参数
  - `string $key`

- 返回`void`


### `->destroy();`
销毁/关闭Session

- 返回`void`


### `->touch();`
更新最后接触时间，给Session续命

- 参数
  - `mixed $param1 = null` 附加参数，供子类传参

- 返回`void`



## \dce\project\request\SessionFile

文件版Session储存器。Session数据将储存在脚本所在服务器，分布式服务器间不能共享，因此用户请求如果从原服务器转到新服务器时，会话数据将丢失，所以若你的程序需分布式部署，则不能使用此储存器。


#### 示例
```php
$logInfo = ['mid' => 1];
$request->session->set('log_info', $logInfo);
test($request->session->getAll());
// ['log_info' => ['mid' => 1]]
```



## \dce\project\request\SessionRedis

Redis版Session储存器。Session数据将储存于Redis服务器，分布式服务器只要连接相同的或者分布式Redis，则可以共享数据而不会丢失会话，并且能获得较好的性能，因此推荐使用该储存器。

若Redis可用`if (\dce\storage\redis\DceRedis::isAvailable())`（即你配置了[Redis主机端口](/config/#redis)），则Dce会默认使用Redis储存器，否则默认使用文件储存器。你可以自定义其他储存器，只需要继承实现`\dce\project\request\Session;`类定义的抽象方法，然后通过[Session配置](/config/#session)`\dce\config\DceConfig::$session['class']`将类设置为你实现的类即可。