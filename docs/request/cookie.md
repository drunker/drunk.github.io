# Cookie

## \dce\project\request\Cookie;

Cookie基类


### `->getAll();`
取全部Cookie数据

- 参数
  - `string $key`

- 返回`array`


### `->get();`
取某个Cookie值

- 参数
  - `string $key`

- 返回`mixed`


### `->set();`
设置Cookie值

- 参数
  - `string $key` 键
  - `string $value` 值
  - `int $expire` 有效时长
  - `string $path` 有效路径
  - `string $domain` 有效域名
  - `bool $secure` 是否仅支持HTTPS
  - `bool $httpOnly` 是否仅能通过HTTP协议访问

- 返回`void`


### `->delete();`
删除某个Cookie值

- 参数
  - `string $key`

- 返回`void`


## \dce\project\request\CookieCgi

Cgi版Cookie的实现类