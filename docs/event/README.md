# 事件

## 示例

```php
// config.php
[
    'prepare' => function () {
        Event::on(Event::BEFORE_REQUEST, fn(RawRequest $rawRequest) => var_dump($rawRequest::class));
        Event::on('my_event', fn(... $args) => var_dump($args), [1, 2]);
    }
]

// [SOME_CONTROLLER->METHOD]()
Event::trigger('my_event', [3, 4]);
```


## \dce\event\Event

事件管理器类提供了事件的绑定与触发等接口，DCE对事件依赖很轻，仅内置了少数的事件埋点，大部分情况下你无需用到，当然，你也可以将之用于业务代码中的事件埋点。


### `::AFTER_DCE_INIT`
`string` Dce初始化完成时回调（此时基础组件已初始化完毕，可以在这里派生子进程，这里创建的子进程才能拥有对象完整的基础组件） `@callable()`

### `::BEFORE_REQUEST`
`string` Request对象初始化前回调 `@callable(RawRequest)`

### `::BEFORE_CONTROLLER`
`string` 进入控制器前回调 `@callable(Request)`

### `::ENTERING_CONTROLLER`
`string` 进入控制器时回调（控制器实例化后触发） `@callable(Controller)`

### `::AFTER_CONTROLLER`
`string` 控制器执行完毕回调 `@callable(Controller)`


### `::on()`
绑定事件、预埋点

- 参数
  - `string $eventName` 事件名
  - `callable $eventCallable` 触发时回调
  - `array $args = []` 附带参数
  - `bool $isPrepend = false` 是否向队列头部插入
  - `int $maxTriggerCount = 0` 最大触发次数
  - `int $expiredSeconds = 0` 过期时间

- 返回`int`


### `::one()`
绑定单次触发事件

- 参数
  - `string $eventName` 事件名
  - `callable $eventCallable` 触发时回调
  - `array $args = []` 附带参数
  - `bool $isPrepend = false` 是否向队列头部插入
  - `int $expiredSeconds = 0` 过期时间

- 返回`int`


### `::off()`
解绑事件

- 参数
  - `string $eventName` 事件名
  - `callable $eventCallable = null` 触发时回调

- 返回`bool|null`


### `::trigger()`
触发事件

- 参数
  - `string $eventName` 事件名
  - `mixed ... $args` 事件触发上下文参数（最终触发回调参数为 `附带参数 + 事件触发上下文参数`）

- 返回`bool`


### `::get()`
取事件回调

- 参数
  - `string $eventName` 事件名

- 返回`EventCallbacks|EventCallbacks[]|null`


### `::exists()`
校验事件是否存在

- 参数
  - `string $eventName` 事件名

- 返回`bool`


## \dce\event\EventCallbacks

事件回调类


### `->push()`
压入回调方法

- 参数
  - `callable $callback` 回调方法
  - `int $triggerCount = 0` 可触发次数
  - `int $expiredSeconds = 0` 有效时长
  - `array $args = []` 附带参数

- 返回`int`


### `->unshift()`
插入回调方法到队列首部

- 参数
  - `callable $callback` 回调方法
  - `int $triggerCount = 0` 可触发次数
  - `int $expiredSeconds = 0` 有效时长
  - `array $args = []` 附带参数

- 返回`int`


### `->remove()`
按回调函数移除队列项

- 参数
  - `callable $callback` 回调方法

- 返回`bool|null`


### `->isEmpty()`
返回队列是否为空

- 返回`bool`


### `->trigger()`
触发回调函数队列

- 参数
  - `mixed ... $args` 事件触发上下文参数

- 返回`bool`