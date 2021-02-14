# 字符串工具

## \drunk\Char

### `::camelize()`
将传入名字驼峰化

- 参数
  - `string $name` 需驼峰化的名字
  - `bool $toUpper = true` 是否大驼峰化，否则为小驼峰

- 返回`string`

### `::snakelike()`
将传入名字蛇底化

- 参数
  - `string $name` 需蛇底化的名字

- 返回`string`

### `::gbToUtf8()`
将gb系列编码转为utf8编码

- 参数
  - `string $str`

- 返回`string`

### `::isRegexp()`
校验字符串是否正则表达式

- 参数
  - `string $str`

- 返回`bool`