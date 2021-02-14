# 调试工具

## drunk\debug\Debug

请求响应式调试类，支持html、cli、log模式输出调试结果。可以比较方便的调试结果以及获取步耗时。


## DebugShortcut.php

推荐通过`\drunk\debug\Debug::enableShortcut()`开启快捷调试，各快捷调试方法如下：


### `test()`
断点打印调试

- 参数
  - `mixed $_ = null` 需打印的参数，不限参

- 返回`void`

- 示例
```php
test(1);
// int(1)

test(1, []);
// int(1)
// array(0) {}
```


### `testPass()`
不断点打印调试

- 参数
  - `mixed $_ = null` 需打印的参数，不限参

- 返回`void`

- 示例
```php
sleep(1);
testPass();
sleep(1);
testPass();
// 此代码第一次后打印会隔一秒再第二次打印，第二次步耗时为 2 秒
```


### `testPoint()`
逐步点印（可多点即时打印并正确显示步耗时，不兼容cgi模式）

- 参数
  - `mixed $_ = null` 需打印的参数，不限参

- 返回`void`

- 示例
```php
sleep(1);
testPoint();
sleep(1);
testPoint();
// 此代码第一次后打印会隔一秒再第二次打印，第二次步耗时为 1 秒
```


### `testStep()`
按阶批量打印（调用的次数大于`DebugMatrix->stepThreshold`时清空并打印一次，用于大量打印内容时降低调试对业务代码的性能影响）

- 参数
  - `mixed $_ = null` 需打印的参数，不限参

- 返回`void`

- 示例
```php
testStep(1);
testStep(2);
testDump();
```


### `testMark()`
标记调试点

- 参数
  - `mixed $_ = null` 需打印的参数，不限参

- 返回`void`

- 示例
```php
testMark(1);
```


### `testDump()`
调试输出

- 参数
  - `mixed $_ = null` 需打印的参数，不限参

- 返回`void`

- 示例
```php
testMark(1);
testDump(2);
// int(1)
// int(2)
```


### `testDumpPass()`
不断点调试输出

- 参数
  - `mixed $_ = null` 需打印的参数，不限参

- 返回`void`

- 示例
```php
testMark(1);
testDumpPass(2);
// int(1)
// int(2)
```


### `testGet()`
取Debug实例

- 参数
  - `string|bool|null $identity = null` 实例标识
    - `string` 按给定标识取实例
    - `bool|null` {true: 按默认短标识，else：按默认长标识}

- 返回`\drunk\debug\Debug`

- 示例
```php
$debug = testGet('id1');
$debug->mark(1);
$debug->dump(2);
// int(1)
// int(2)
```


### `testSetFile()`
设置文件型Debug储存引擎（方便你调试Http型异步回调接口，如异步支付回调）

- 参数
  - `string $path` 文件的相对路径
  - `string $root = ''` 指定文件根目录（不用默认配置目录）
  - `string|bool $identity = false` 识别标识

- 返回`\drunk\debug\Debug`

- 示例
```php
testSetFile('debug');
testMark('hello');
testMark('dce');
testDump();
// 输出内容，并在 Dce::$config->debug['file_root'] 目录会生成一个debug的文件，里面记录调试内容结果
```


### `testSetHttp()`
设置Http型Debug储存引擎（用法与testSetFile完全一致，不同的是本方法设置远程Http型储存引擎。方便你调试Http型异步回调接口，如异步支付回调）

- 参数
  - `string $path` 文件的相对路径
  - `string $root = ''` 指定文件根Url地址（不用默认地址）
  - `string|bool $identity = false` 识别标识

- 返回`\drunk\debug\Debug`

- 示例
```php
testSetFile('debug')->test('Hello world');
// 输出内容，并在 Dce::$config->debug['url_root'] 路径下会生成一个debug的文件，里面记录调试内容结果（若为默认配置，则最终记录路径为 https://logger.drunkce.com/_/debug/debug）
```


## \drunk\debug\storage\HttpStorage

Http型记录储存器，Dce官方储存器接口地址为<https://logger.drunkce.com>，Dce框架的默认Http型Debug记录将储存至该地址，使用方式到可以查看其首页说明。如果你的调试内容有私密信息，建议使用文件型储存器或者搭建自己的Http型储存器，你可以到<https://github.com/idrunk/http-logger>获取Dce开源的Http记录器源码。


