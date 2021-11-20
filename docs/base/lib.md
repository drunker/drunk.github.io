# 综合类库

## \dce\base\TraitModel

简单模型基类，构建非魔术方法的实体属性模型继承于此类。


### `->setProperty()`
设置模型属性

- 参数
  - `string $name` 属性名
  - `mixed $value` 属性值

- 返回`$this`

### `->setPropertys()`
批量设置模型属性

- 参数
  - `array $properties` 需设置的属性与值的键值对

- 返回`$this`

### `->arrayify()`
以数组形式返回模型属性集

- 返回`array`



## \dce\base\Openly

公共标记接口，实现此接口的异常可以被自动响应到客户端



## \dce\base\Exception

Dce异常基类，异常处理器。本类实现了`\dce\loader\Decorator`接口，所以支持静态属性自动实例化及Language注解。


### `->openly`
`string[] = []` 公开异常码集（可自动抛出到用户端）

形式 | 说明 | 示例
:-: | :- | :-
单异常码 | 公开单个异常 | [10000, 10001]
横杠分隔的异常码 | 公开该区间（同类中的） | ['10000-10010']
头/尾横杠异常码 | 公开头/尾区间（同类中的） | ['10000-']
单横杠 | 全公开，等价于实现Openly接口 | ['-']

### `->closed`
`string[] = []` 非公开异常码集（会以HTTP500抛出到用户端）

### `->http`
`string[] = []` HTTP异常码集（将作为HTTP状态码响应，如401）


### `__construct()`
构造方法

- 参数
  - `int|string|Stringable $message = ''` 异常消息，若传入int且无code，则code为message且message为空
  - `int $code = 0` 异常代码，若非0且无消息，则尝试以code为Language ID查Language，以查到的Language对象为message
  - `Throwable $previous = null`

- 示例
```php
testPoint((new \dce\base\Exception(lang(['中文异常', 'Eng exception'])))->getMessage());
// 1-1    string(12) "中文异常"
```


### `->format()`
使用sprintf格式化异常消息

- 参数
  - `string|Stringable ...$parameters`

- 返回`static`

- 示例
```php
testPoint((new \dce\base\Exception(lang(['你好 %s !'])))->format('世界')->getMessage());
// 1-1    string(15) "你好 世界 !"
```


### `->lang()`
指定异常消息语种

- 参数
  - `string $lang`

- 返回`static`

- 示例
```php
testPoint((new \dce\base\Exception(lang(['你好 %s !', 'Hello %s !'])))->format(lang(['世界', 'world']))->lang('en')->getMessage());
// 1-1    string(13) "Hello world !"
```


### `->catchWarning()`
捕获异常作为警告打印到控制台

- 参数
  - `callable<Throwable, void>|bool $matched` 警告判定条件，支持判定结果布尔值或回调方法
  - `callable $callable` 需要捕获的过程回调
  - `mixed ... $params` 需传入捕获回调的参数

- 返回`void`



## \dce\base\QuietException

安静异常，在控制器及其事件内抛出安静异常时，将仅截停程序而不抛出



## \dce\base\Lock

并发锁


### `->procLock()`
跨进程协程锁上锁（悲观，自旋，不可重入）

- 参数
  - `string $identification`
  - `int $maximum = 1`

- 返回`bool`

- 示例
```php
\dce\Dce::$lock->procLock('id1');
// 并发进程IO写操作
// ...
// 写操作结束
\dce\Dce::$lock->procUnlock('id1');
```


### `->procUnlock()`
解跨进程协程锁

- 参数
  - `string $identification`

- 返回`void`


### `->coLock()`
协程锁上锁（悲观，自旋，不可重入）

- 参数
  - `string $identification`
  - `int $maximum = 1`

- 返回`bool`


### `->coUnlock()`
解协程锁

- 参数
  - `string $identification`

- 返回`void`


### `->distributedLock()`
分布式锁加锁（预留，尚未实现）


### `->distributedUnlock()`
分布式锁解锁（预留，尚未实现）



## \dce\base\SwooleUtility


### `::inSwoole()`
是否处于Swoole环境

- 返回`bool`


### `::inSwooleCli()`
是否处于SwooleCli环境

- 返回`bool`


### `::inCoroutine()`
判断是否处于协程上下文环境

- 返回`bool`


### `::eventExit()`
停止Swoole事件监听

- 返回`void`


### `::coroutineHook()`
开启协程钩子

- 参数
  - `int $hookFlags = SWOOLE_HOOK_ALL` 钩子类型（参见Swoole文档）

- 返回`void`


### `::coroutineValve()`
协程控流阀，当协程达道限定值后，程序执行到此方法时将停留在循环中，直到有协程处理完任务结束了生命周期时，被拦截在此的程序才会继续执行，创建调度新协程

- 参数
  - `int $maxCoroutine = 1000` 最大流量

- 返回`void`


### `::processLockInit()`
跨进程协程锁初始化（在调用`::processLock()`前必须先在根进程中调用此方法初始化跨进程映射表）。

- 返回`void`


### `::processLock()`
跨进程协程锁上锁（悲观，自旋，不可重入）

- 参数
  - `string|null $identification = null` 锁标识，若锁定与解锁不在同一个方法中，或者同一个方法中多处上锁，则需手动指定，解锁时传递相同标识参数
  - `int $maximum = 1` 全局可重入次数

- 返回`bool` （锁定总是成功，通过返回值的不同表示获得锁时的状态不同）
  - `true` 上锁前无其他锁，直接锁定
  - `false` 锁定前区块正被上把锁锁定，等待其解锁后才获得这把锁

::: tip
本方法总会成功获得锁，返回值仅表示是否未经等待就成功获得锁
:::


### `::processUnlock()`
跨进程协程锁解锁

- 参数
  - `string $identification` 锁标识，需传入与锁定时相同的标识参数

- 返回`void`


### `::coroutineLock()`
协程锁初始化（用法同`::processLock()`，不同的是当前锁不跨进程，仅在脚本执行的进程有效）

- 参数
  - `string|null $identification = null` 锁标识，若锁定与解锁不在同一个方法中，或者同一个方法中多处上锁，则需手动指定，解锁时传递相同标识参数
  - `int $maximum = 1` 全局可重入次数

- 返回`bool` （锁定总是成功，通过返回值的不同表示获得锁时的状态不同）
  - `true` 上锁前无其他锁，直接锁定
  - `false` 锁定前区块正被上把锁锁定，等待其解锁后才获得这把锁

::: tip
本方法总会成功获得锁，返回值仅表示是否未经等待就成功获得锁
:::


### `::coroutineUnlock()`
协程锁解锁

- 参数
  - `string $identification` 锁标识，需传入与锁定时相同的标识参数

- 返回`void`


### `::rootProcessConstraint()`
根进程环境校验

- 返回`void`