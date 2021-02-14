# 综合工具


## \drunk\Utility


### `::isArrayLike()`
判断值是否数组或可以按数组式访问

- 参数
  - `mixed $value` 需判断的值

- 返回`bool`


### `::printable()`
将传入值转为可打印的类型并返回

- 参数
  - `mixed $value` 需转换的值

- 返回`string`


### `::buildInstance()`
构建一个实例

- 参数
  - `string $className` 待实例化的类名
  - `array $arguments = []` 实例化参数

- 返回`false|object`


### `::noop()`
取一个空方法

- 返回`\Closure`