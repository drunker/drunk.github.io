# 结构数据工具


## \drunk\Structure

数据结构工具，加工处理复合结构型数据


### `::arrayMerge()`
递归合并数组

- 参数
  - `array $array` 合并目标数组
  - `array ... $arrays` 待合数组
    
  元素类型 | 处理方式
  :--: | :--:
  与目标数组皆为列表型数组 | 追加到目标数组尾部
  与目标数组有对应的数组型元素 | 递归合并
  非上述情况 | 将待合数组元素追加或覆盖到目标数组或元素

- 返回`array`

- 示例
```php
\drunk\Structure::arrayMerge(
    [1, 'a'=>[2]],
    [2],
    ['a'=>[2]],
    ['b'=>[3]],
    ['b'=>4]
);
// [0=>1, 'a'=>[2, 2], 1=>2, 'b'=>4]
```


### `::arraySearch()`
用回调函数在数组中查找匹配值的下标集

- 参数
  - `callable $needle` 比对方法，返回真即命中
  - `array $haystack` 查找源
  - `bool $lazyMode = true` 是否惰性查找
    - `true` 若找到，则直接返回其下标
    - `false` 遍历完后返回匹配元素的下标集

- 返回`array|string|int|false`


### `::arraySearchMatrix()`
查询 参1 在 参2 数组元素中是否有相同值, 返回其在参2中的索引值集

- 参数
  - `array $needle` 待查找值
  - `array $haystack` 查找源
  - `bool $lazyMode = true` 是否惰性查找
    - `true` 若找到，则直接返回其下标
    - `false` 遍历完后返回匹配元素的下标集

- 返回`array|string|int|false`

- 示例
```php
\drunk\Structure::arrayInArray([1, 'a'=>2], []);
// false

\drunk\Structure::arrayInArray([1, 'a'=>2], [[0=>1, 2, 'a'=>3], [1, 'a'=>2]]);
// 0

\drunk\Structure::arrayInArray([1, 'a'=>2], [[0=>1, 2, 'a'=>3], [1, 'a'=>2]], false);
// [0, 1]
```


### `::arraySplitKey()`
拆分解析字符串为根键与数组下标集

- 参数
  - `string $key`
  - `string & $rootKey`
  - `? array & $keyArray`

- 返回`void`

- 示例
```php
\drunk\Structure::arrayAssignKey('cache.redis.host', $rootKey, $keyArray);
// $rootKey: cache
// $keyArray: ['redis', 'host']
```


### `::arrayAssign()`
按结构数组下标对数组元素赋值

- 参数
  - `array $array` 目标数组
  - `array $keyArray` 下标树集
  - `mixed $value` 待赋值值

- 返回`array|false`

- 示例
```php
\drunk\Structure::arrayAssign([], ['a', 'b'], 1);
// ['a'=>['b'=>1]]

\drunk\Structure::arrayAssign(['a'=>1], ['a', 'b'], 1);
// false
```


### `::arrayIndexGet()`
按结构数组下标取数组元素

- 参数
  - `array $array` 目标数组
  - `array $$keyArray` 下标集

- 返回`array|null`

- 示例
```php
\drunk\Structure::arrayIndexGet(['a'=>['b'=>1]], ['a', 'b']);
// 1

\drunk\Structure::arrayIndexGet(['a'=>['b'=>1]], ['a', 'c']);
// null
```


### `::arrayIndexDelete()`
按结构数组下标集删除数组元素

- 参数
  - `array & $array` 目标数组
  - `array $keyArray` 下标集

- 返回`null|bool`

- 示例
```php
$target = ['a'=>['b'=>1]];

\drunk\Structure::arrayIndexDelete($target, ['a', 'b']);
// true
// $target: ['a'=>[]]

\drunk\Structure::arrayIndexDelete(['a'=>['b'=>1]], ['a', 'c']);
// false
// $target: ['a'=>['b'=>1]]
```


### `::arrayIsList()`
是否列表式数组

- 参数
  - `? array $array`

- 返回`bool`

- 示例
```php
\drunk\Structure::arrayIndexGet([0=>1, 1=>1]);
// true

\drunk\Structure::arrayIndexGet([2=>1, 3=>1]);
// false
```


### `::sortByColumnRef()`
按照矩阵列值集为参考，将矩阵按该参考值列表排序（常用语in查询时，查询结果与in元素顺序不一致，此时可以用此方法方便的排序）

- 参数
  - `array[]|ArrayAccess[] $matrix` 待排序的矩阵
  - `string $column` 排序参考列
  - `array $refValues` 排序参考值集

- 返回`array`
