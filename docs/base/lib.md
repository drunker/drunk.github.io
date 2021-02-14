# 综合类库

## \dce\base\TraitModel

实体模型基类，构建非魔术方法的实体属性模型继承于此类。


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



## \dce\base\Exception

Dce异常基类，异常处理器（其他异常皆继承于此类，尚未完善）。



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


### `::inCoroutine()`
判断是否处于协程上下文环境

- 返回`bool`


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