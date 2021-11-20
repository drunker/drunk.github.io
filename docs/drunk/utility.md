# 综合工具


## \drunk\Utility


### `::isArrayLike()`
判断值是否数组或可以按数组式访问

- 参数
  - `mixed $value` 需判断的值

- 返回`bool`


### `::isEmpty()`
递归判断对象是否为空（若为数组，则无元素、或仅有空数组的元素，亦视为空）

- 参数
  - `mixed $object` 需判断的值

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


### `::staticConstraint()`
限制静态方法必须在子类执行

- 参数
    - `string $parentClass` 父类命
    - `string $staticClass` 需断言的目标类名

- 返回`void`