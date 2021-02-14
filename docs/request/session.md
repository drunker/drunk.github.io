# Session

## \dce\project\request\Session;

Session基类，抽象类，封装了Session基础属性方法


### `::$sidName`
`string` Session ID在Cookie的键名


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


### `->openByRequest()`
根据Request开启Session（实现对自动开启Session的支持）

- 参数
  - `\dce\project\request\Request $request` 请求对象

- 返回`void`


### `->open();`
开启Session

- 参数
  - `\dce\project\request\Request $request` 请求对象

- 返回`void`


### `->set();`
设置Session值

- 参数
  - `string $key` 键
  - `mixed $value` 值

- 返回`void`


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


## \dce\project\request\SessionCgi

Cgi版Session实现类，封装了PHP原生的Session方法实现的基类定义的抽象方法


#### 示例
```php
$logInfo = ['mid' => 1];
$request->session->set('log_info', $logInfo);
test($request->session->getAll());
// ['log_info' => ['mid' => 1]]
```