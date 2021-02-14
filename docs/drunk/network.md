# 网络工具

## \dce\Network

### `__construct()`
CURL请求构造方法

- 参数
  - `? array $options = null` CURL配置集

### `->setOption()`
设置CURL配置

- 参数
  - `int|array $key` 配置键
    - `int` 配置键常量
    - `array` 配置键值对
  - `mixed $value = null` 配置值

- 返回`$this`

### `->send()`
发送请求返回响应数据

- 参数
  - `string $url` 请求地址
  - `array|string $postData` 表单数据（有此参数自动转为POST请求）

- 返回`string`

### `->sendAndSave()`
发送请求并将响应数据存为文件

- 参数
  - `string $path` 数据文件储存路径
  - `string $url` 请求地址
  - `array|string $postData` 表单数据

- 返回`bool`

### `->response()`
取响应信息

- 参数
  - `? string $option = null` 取特定某类数据

- 返回`mixed`


### `::sendGet()`
Get请求的快捷方法

- 参数
  - `string $url` 请求地址

- 返回`string`

### `::sendPost()`
Post请求的快捷方法

- 参数
  - `string $url` 请求地址
  - `string|array|bool $postData = true` Post表单数据

- 返回`string`

### `::ip()`
取请求IP（仅支持cgi模式，不建议使用此方法，请从Request对象取IP）

- 参数
  - `bool $long = false` 是否取长整型

- 返回`string|int`

### `::isLocalIp()`
判断是否本地IP

- 参数
  - `string $ip`

- 返回`bool`