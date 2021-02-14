# 查询器

查询器类，数据库操作核心类。


## \dce\db\Query

### `->__construct()`
查询器构造方法

- 参数
  - `null|string|DbProxy $proxy = null` 代理实例或者指定库名

- 示例
```php
$query = new \dce\db\Query();
```


### `\db()`
实例化查询器的全局快捷方法（后续示例皆以快捷方法书写）

- 参数
  - `string|null $tableName = null` 目标查询表
  - `string|null $alias = null` 表别名
  - `string|null $dbAlias = null` 目标查询库（对于分库表查询将无视此参数）

- 返回`\dce\db\Query`

- 示例
```php
$query = db();
$query = db('member', 'm');
```


### `->getProxy()`
获取/生成当前对象代理器

- 参数
  - `null|string|DbProxy $proxy = null` 代理实例或者指定库名
    - `null` 未指定代理器，将调用`->getProxy()`生成默认代理器（默认实例化分库代理器，若环境不支持则实例化简易代理器）
    - `string` 字符串参，表示指定了目标库，将调用`->getProxy()`生成绑定了目标库的代理器（若为分库代理器，且目标表为分库表，则无视此目标库参数，而是根据分库规则路由到目标分库）
    - `DbProxy` 用户指定代理器

- 返回`\dce\db\proxy\DbProxy`

- 示例
```php
$query = db();
$proxy = $query->getProxy();
```


### `->getQueryBuilder()`
取当前对象绑定的查询构造器对象

- 返回`\dce\db\query\QueryBuilder`

- 示例
```php
$query = db();
$queryBuilder = $query->getQueryBuilder();
```


### `->table()`
指定目标查询表 *（分库多表联合查询支持不完善，详情见分库相关章节）*

- 参数
  - `string|RawBuilder|SelectStatement $tableName` 表名
    - `string` 普通数据表表名
    - `RawBuilder` 可以为普通表名，也可以用sql语句子查询作为临时表
    - `SelectStatement` 查询实例，子查询作为临时表
  - `string|null $alias = null` 设置表别名

- 返回`self`

- 示例
```php
$query = db()->table('member', 'm');
// 等同于
$query = db('member', 'm');

// 多表
$query = db('member', 'm')->table('member_role', 'mr')->table('role', 'r');
```


### `->join()`
内联合查询 *（分库多表联合查询支持不完善，详情见分库相关章节）*

- 参数
  - `string|RawBuilder|SelectStatement $tableName` 表名
    - `string` 普通数据表表名
    - `RawBuilder` 可以为普通表名，也可以用sql语句子查询作为临时表
    - `SelectStatement` 查询实例，子查询作为临时表
  - `string|null $alias` 设置表别名
  - `string|array|RawBuilder|WhereSchema $on` 联合条件
    - `string` 字符串式条件（注意，为方便使用，纯字符串式条件会被自动用`raw()`包装，请确保你的条件是安全的sql语句）
    - `array` 数组式where条件，具体可参见where注解
    - `RawBuilder` 原始语句对象
    - `WhereSchema` Where实体条件

- 返回`self`

- 示例
```php
// string $on
$select = db('member', 'm')->join('member_role', 'mr', 'mr.mid = m.mid')->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
1-1    string(84) "SELECT * FROM `member` AS `m` INNER JOIN `member_role` AS `mr` ON (mr.mid = m.mid)  "
 */

// array $on
$select = db('member', 'm')->join('member_role', 'mr', ['mr.mid', raw('m.mid')])->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
2-1    string(86) "SELECT * FROM `member` AS `m` INNER JOIN `member_role` AS `mr` ON `mr`.`mid` = (m.mid)"
 */

// RawBuilder $on 等同于上述的 "string $on"
$select = db('member', 'm')->join('member_role', 'mr', raw('mr.mid = m.mid'))->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
3-1    string(84) "SELECT * FROM `member` AS `m` INNER JOIN `member_role` AS `mr` ON (mr.mid = m.mid)  "
 */

// WhereSchema $on
$whereSchema = new WhereSchema();
$whereSchema->addCondition('mr.mid', '=', raw('m.mid'), 'AND');
$select = db('member', 'm')->join('member_role', 'mr', $whereSchema)->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
4-1    string(86) "SELECT * FROM `member` AS `m` INNER JOIN `member_role` AS `mr` ON `mr`.`mid` = (m.mid)"
 */
```


### `->leftJoin()`
左联合查询，入参同[内联合查询](#join)

- 参数
  - `string|RawBuilder|SelectStatement $tableName` 表名
  - `string|null $alias` 设置表别名
  - `string|array|RawBuilder|WhereSchema $on` 联合条件

- 返回`self`

- 示例
```php
$query = db('member', 'm')->leftJoin('member_role', 'mr', 'mr.mid = m.mid');
```


### `->rightJoin()`
右联合查询，入参同[内联合查询](#join)

- 参数
  - `string|RawBuilder|SelectStatement $tableName` 表名
  - `string|null $alias` 设置表别名
  - `string|array|RawBuilder|WhereSchema $on` 联合条件

- 返回`self`

- 示例
```php
$query = db('member', 'm')->rightJoin('member_role', 'mr', 'mr.mid = m.mid');
```


### `->where()`
添加AND逻辑查询条件

- 参数
  - `string|array|RawBuilder|WhereSchema $columnName` 查询条件或比较运算符左值
    - `array` 完整的数组式查询条件（支持多条件、嵌套逻辑等各种无所不能的姿势，详情见示例）
    - `string|RawBuilder|WhereSchema` 单条件的比较运算符左值
  - `string|int|float|false|RawBuilder|SelectStatement $operator = false` 比较运算符或比较运算符右值
    - `false` 无比较运算符或右值
    - `string|int|float|RawBuilder|SelectStatement` 比较运算符或比较运算符右值
  - `string|int|float|false|RawBuilder|SelectStatement $value = false` 比较运算符右值
    - `false` 无右值或右值顺移至`operator`参位置
    - `string|int|float|RawBuilder|SelectStatement` 比较运算符右值

- 返回`self`

- 示例
```php
// 参数式简单查询
$select = db('member')->where('mid', 10000)->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
1-1    string(38) "SELECT * FROM `member` WHERE `mid` = ?"
1-2    array(1) {
         [0] => int(10000)
       }
 */

// 标准参数式简单查询
$select = db('member')->where('mid', '=', 10000)->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
2-1    string(38) "SELECT * FROM `member` WHERE `mid` = ?"
2-2    array(1) {
         [0] => int(10000)
       }
 */

// 无左值参数式复合查询
$select = db('member')->where('exists', db('member_role')->where('mid', '=', raw('member.mid', false))->buildSelect(1))->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
3-1    string(90) "SELECT * FROM `member` WHERE EXISTS (SELECT 1 FROM `member_role` WHERE `mid` = member.mid)"
3-2    array(0) {
       }
 */

// 数组式简单查询
$select = db('member')->where(['mid', 10000])->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
4-1    string(38) "SELECT * FROM `member` WHERE `mid` = ?"
4-2    array(1) {
         [0] => int(10000)
       }
 */

// 数组式指定逻辑查询
$select = db('member')->where([['mid', 10000], 'or', ['mid', 99999]])->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
5-1    string(53) "SELECT * FROM `member` WHERE (`mid` = ? OR `mid` = ?)"
5-2    array(2) {
         [0] => int(10000)
         [1] => int(99999)
       }
 */

// 数组式嵌套条件查询（支持无限极嵌套条件）
$select = db('member')->where([
    ['register_time', 'between', ['2021-01-01', '2021-01-31 23:59:59']],
    [
        ['level', '>', 60],
        'or',
        ['vip', '>', 1],
    ],
])->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
6-1    string(93) "SELECT * FROM `member` WHERE (`register_time` BETWEEN ? AND ? AND (`level` > ? OR `vip` > ?))"
6-2    array(4) {
         [0] => string(10) "2021-01-01"
         [1] => string(19) "2021-01-31 23:59:59"
         [2] => int(60)
         [3] => int(1)
       }
 */

// 数组式复合查询
$select = db('member')->where([
    ['last_login_time', 'between', ['2021-01-01', '2021-01-01 23:59:59']],
    ['mid', 'in', raw('SELECT mid2 FROM friend_ship WHERE mid1 = ?', [ 10000 ])],
    ['is_deleted', 0],
])->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
7-1    string(144) "SELECT * FROM `member` WHERE (`last_login_time` BETWEEN ? AND ? AND `mid` IN (SELECT mid2 FROM friend_ship WHERE mid1 = ?) AND `is_deleted` = ?)"
7-2    array(4) {
         [0] => string(10) "2021-01-01"
         [1] => string(19) "2021-01-01 23:59:59"
         [2] => int(10000)
         [3] => int(0)
       }
 */
```


### `->andWhere()`
[->where()](#where)方法的别名

- 参数
  - `string|array|RawBuilder|WhereSchema $columnName` 查询条件或比较运算符左值
  - `string|int|float|false|RawBuilder|SelectStatement $operator = false` 比较运算符或比较运算符右值
  - `string|int|float|false|RawBuilder|SelectStatement $value = false` 比较运算符右值

- 返回`self`


### `->orWhere()`
添加OR逻辑查询条件（OR逻辑条件可以在[->where()](#where)中用数组式查询条件实现，两种方式没有优劣之分）

- 参数
  - `string|array|RawBuilder|WhereSchema $columnName` 查询条件或比较运算符左值
  - `string|int|float|false|RawBuilder|SelectStatement $operator = false` 比较运算符或比较运算符右值
  - `string|int|float|false|RawBuilder|SelectStatement $value = false` 比较运算符右值

- 返回`self`

- 示例
```php
$select = db('member')->where('mid', 10000)->orWhere('mid', 9999)->buildSelect();
test((string) $select, $select->getParams(),);
/* 输出
1-1    string(49) "SELECT * FROM `member` WHERE `mid` = ? OR `mid` = ?"
1-2    array(2) {
         [0] => int(10000)
         [1] => int(9999)
       }
*/
```


### `->group()`
添加分组条件

- 参数
  - `string|array|RawBuilder $columns` 分组依据字段
  - `bool $isAutoRaw = false` 是否自动用`raw()`包装字段

- 返回`self`

- 示例
```php
$select = db('member')->group('vip,level')->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
1-1    string(45) "SELECT * FROM `member` GROUP BY `vip`,`level`"
 */

$select = db('member')->group(['vip','level'])->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
2-1    string(45) "SELECT * FROM `member` GROUP BY `vip`,`level`"
 */

$select = db('member')->group(['date(last_login_time)'], true)->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
3-1    string(53) "SELECT * FROM `member` GROUP BY date(last_login_time)"
 */
```


### `->having()`
给Group添加Having条件，入参同[->where()](#where)

- 参数
  - `string|array|RawBuilder|WhereSchema $columnName` 查询条件或比较运算符左值
  - `string|int|float|false|RawBuilder|SelectStatement $operator = false` 比较运算符或比较运算符右值
  - `string|int|float|false|RawBuilder|SelectStatement $value = false` 比较运算符右值

- 返回`self`

- 示例
```php
$select = db('member')->group(raw('date(last_login_time)'))->having('level', '>=', 90)->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
3-1    string(75) "SELECT * FROM `member` GROUP BY (date(last_login_time)) HAVING `level` >= ?"
3-2    array(1) {
         [0] => float(90)
       }
*/
```


### `->order()`
设置排序条件

- 参数
  - `string|array|RawBuilder $column` 排序条件或排序列
  - `string|bool|null $order = null` 排序规则或是否自动`raw()`
  - `bool $isAutoRaw = false` 是否自动`raw()`包装

- 返回`self`

- 示例
```php
$select = db('member')->order('mid')->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
1-1    string(37) "SELECT * FROM `member` ORDER BY `mid`"
 */

$select = db('member')->order('mid', 'desc')->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
2-1    string(42) "SELECT * FROM `member` ORDER BY `mid` DESC"
 */

$select = db('member')->order([['vip', 'desc'], ['level', 'desc']])->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
3-1    string(55) "SELECT * FROM `member` ORDER BY `vip` DESC,`level` DESC"
 */

$select = db('member')->group('date(last_login_time)', true)->order([[raw('count(1)'), 'desc'], 'mid'])->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
4-1    string(84) "SELECT * FROM `member` GROUP BY date(last_login_time) ORDER BY (count(1)) DESC,`mid`"
 */

$select = db('member')->group('date(last_login_time)', true)->order([['count(1)', 'desc'], 'mid'], true)->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
5-1    string(82) "SELECT * FROM `member` GROUP BY date(last_login_time) ORDER BY count(1) DESC,`mid`"
 */
```


### `->limit()`
设置记录截取量

- 参数
  - `int $limit` 截取条数
  - `int $offset = 0` 起始截取偏移量

- 返回`self`

- 示例
```php
$select = db('member')->limit(10)->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
1-1    string(31) "SELECT * FROM `member` LIMIT 10"
 */

$select = db('member')->limit(10, 20)->buildSelect();
testPoint( (string) $select, $select->getParams(), );
/*
2-1    string(34) "SELECT * FROM `member` LIMIT 20,10"
 */
```


### `->union()`
连接查询

- 参数
  - `SelectStatement|RawBuilder $statement` 将要被连接的语句
  - `bool $isAll = true` 是否全连接（不排重）

- 返回`self`

- 示例
```php
$select = db('member')->union(db('vip_member')->buildSelect('mid,username'))->buildSelect('mid,username');
testPoint( (string) $select, $select->getParams(), );
/*
1-1    string(85) "(SELECT mid,username FROM `member`) UNION ALL (SELECT mid,username FROM `vip_member`)"
 */

$select = db('member')->union(db('vip_member')->buildSelect('mid,username'), false)->buildSelect('mid,username');
testPoint( (string) $select, $select->getParams(), );
/*
2-1    string(81) "(SELECT mid,username FROM `member`) UNION (SELECT mid,username FROM `vip_member`)"
 */
```


### `->buildSelect()`
构建查询语句实例

- 参数
  - `string|array|RawBuilder|null $columns = null` 待查之列
  - `bool $isDistinct = false` 是否对结果记录排重
  - `bool $isAutoRaw = true` 是否对所传字段参数做`raw()`包装

- 返回`\dce\db\query\builder\Statement\SelectStatement`

- 示例
```php
// 不自动包装则无法查询复杂字段
$select = db('member')->buildSelect('sum(mid),username', false, false);
testPoint( (string) $select, $select->getParams(), );
/*
1-1    string(27) "dce\db\query\QueryException"
1-2    string(38) "Code:0 筛选字段名"sum(mid)"无效"
 */
```


### `->select()`
多记录查询

- 参数
  - `string|array|RawBuilder|null $columns = null` 待查之列
    - `null` = *
    - `string` 逗号分隔的字段字符串
    - `array` 字段名为元素的数组
    - `RawBuilder` 原始语句对象
  - `string|RawBuilder|null $indexColumn = null` 以此字段作为查询结果数组下标
  - `bool $isDistinct = false` 是否对结果记录排重
  - `bool $isAutoRaw = true` 是否对所传字段参数做`raw()`包装

- 返回`array`

- 示例
```php
$result = db('tag')->limit(2)->select();
testPoint( $result, );
/*
1-1    array(2) {
         [0] => array(3) {
           ["id"] => int(1)
           ["name"] => string(3) "男"
           ["is_deleted"] => int(0)
         }
         [1] => array(3) {
           ["id"] => int(2)
           ["name"] => string(3) "女"
           ["is_deleted"] => int(0)
         }
       }
 */

$result = db('tag')->limit(2)->select('name');
$result = db('tag')->limit(2)->select(['name']);
$result = db('tag')->limit(2)->select(raw('name'));
testPoint( $result, );
/*
2-1    array(2) {
         [0] => array(1) {
           ["name"] => string(3) "男"
         }
         [1] => array(1) {
           ["name"] => string(3) "女"
         }
       }
 */

$result = db('tag')->limit(2)->select('name', 'id');
testPoint( $result, );
/*
3-1    array(2) {
         [1] => array(2) {
           ["name"] => string(3) "男"
           ["id"] => int(1)
         }
         [2] => array(2) {
           ["name"] => string(3) "女"
           ["id"] => int(2)
         }
       }
 */
```


### `->each()`
多记录查询，返回迭代器，惰性内存写读取结果

- 参数
  - `string|array|RawBuilder|null $columns = null` 待查之列
  - `bool $isDistinct = false` 是否对结果排重
  - `Closure|null $decorator = null` 结果装饰器，装饰改变返回结果
  - `bool $isAutoRaw = true` 是否对所传字段参数做`raw()`包装

- 返回`\Iterator`

- 示例
```php
$iterator = db('tag')->limit(2)->each();
// 这里仅返回迭代器，不取出全部结果
testPoint($iterator);
/*
1-1    object(dce\db\connector\DbEachIterator)#28 (4) {
         ["statement":"dce\db\connector\DbEachIterator":private] => object(PDOStatement)#27 (1) {
           ["queryString"] => string(27) "SELECT * FROM `tag` LIMIT 2"
         }
         ["offset":"dce\db\connector\DbEachIterator":private] => int(0)
         ["count":"dce\db\connector\DbEachIterator":private] => int(2)
         ["decorator":"dce\db\connector\DbEachIterator":private] => NULL
       }
 */
// 遍历时才从内存逐条取结果
foreach ($iterator as $item) {
    testPoint($item);
}
/*
2-1    array(3) {
         ["id"] => int(1)
         ["name"] => string(3) "男"
         ["is_deleted"] => int(0)
       }

3-1    array(3) {
         ["id"] => int(2)
         ["name"] => string(3) "女"
         ["is_deleted"] => int(0)
       }
 */
```


### `->find()`
单记录查询

- 参数
  - `string|array|RawBuilder|null $columns = null` 待查之列
  - `bool $isAutoRaw = true` 是否对所传字段参数做`raw()`包装

- 返回`array|false`

- 示例
```php
$result = db('tag')->limit(2)->find();
testPoint($result);
/*
1-1    array(3) {
         ["id"] => int(1)
         ["name"] => string(3) "男"
         ["is_deleted"] => int(0)
       }
 */
```


### `->column()`
按指定单列的多记录查询

- 参数
  - `string|array|RawBuilder|null $column` 待查指定列
  - `string|RawBuilder|null $indexColumn = null` 以此字段作为查询结果数组下标
  - `bool $isDistinct = false` 是否对结果排重
  - `bool $isAutoRaw = true` 是否对所传字段参数做`raw()`包装

- 返回`array`

- 示例
```php
$result = db('tag')->limit(2)->column('name', 'id');
testPoint($result);
/*
1-1    array(2) {
         [1] => string(3) "男"
         [2] => string(3) "女"
       }
 */
```


### `->value()`
按指定列的单记录查询

- 参数
  - `string|array|RawBuilder|null $column` 待查指定列
  - `bool $isAutoRaw = true` 是否对所传字段参数做`raw()`包装

- 返回`string|int|float|null|false`

- 示例
```php
$result = db('tag')->limit(2)->value('name');
testPoint($result);
/*
1-1    string(3) "男"
 */
```


### `->count()`
统计计数查询

- 参数
  - `string $column = '1'` 待统计列名

- 返回`int|null|false`

- 示例
```php
$result = db('tag')->limit(2)->count();
testPoint($result);
/*
1-1    float(6)
 */
```


### `->exists()`
存在与否查询

- 返回`bool`

- 示例
```php
$result = db('tag')->limit(2)->exists();
testPoint($result);
/*
1-1    bool(true)
 */
```


### `->max()`
最大值查询

- 参数
  - `string $column` 待查指定列

- 返回`string|int|float|null|false`

- 示例
```php
$result = db('tag')->max('id');
testPoint($result);
/*
1-1    float(6)
 */
```


### `->min()`
最小值查询

- 参数
  - `string $column` 待查指定列

- 返回`string|int|float|null|false`

- 示例
```php
$result = db('tag')->min('id');
testPoint($result);
/*
2-1    float(1)
 */
```


### `->avg()`
平均值查询

- 参数
  - `string $column` 待查指定列

- 返回`string|int|float|null|false`

- 示例
```php
$result = db('tag')->avg('id');
testPoint($result);
/*
3-1    string(6) "3.5000"
 */
```


### `->sum()`
列和值查询

- 参数
  - `string $column` 待查指定列

- 返回`string|int|float|null|false`

- 示例
```php
$result = db('tag')->sum('id');
testPoint($result);
/*
4-1    string(2) "21"
 */
```


### `->insert()`
插入数据

- 参数
  - `array $data` 待插入数据
  - `bool|null $ignoreOrReplace = null` 三相类型, 指定重复数据处理规则
    - `null` 普通插入，有唯一键重复则抛出异常
    - `true` 忽略插入，有唯一键重复则不会插入该数据
    - `false` 替换插入，若有唯一键重复，则将删除老数据，插入新数据

- 返回`int|string`
  - `单条插入` 返回新纪录的ID
  - `批量插入` 返回插入的数量

- 示例
```php
$insertId = db('tag')->insert(['name' => '插入单条']);
testPoint($insertId);
/*
1-1    string(1) "7"
 */

$affectedCount = db('tag')->insert([
    ['name' => '插入1'],
    ['name' => '插入2'],
]);
testPoint($affectedCount);
/*
2-1    int(2)
 */
```


### `->insertSelect()`
按查询结果插入数据

- 参数
  - `SelectStatement|RawBuilder $selectStatement` 查询语句
  - `string|array|null $columns = null` 写入数据对应字段，支持逗号分隔的字段名字符串，或字段名数组
  - `bool|null $ignoreOrReplace = null` 三相类型, 指定重复数据处理规则

- 返回`int`

- 示例
```php
$affectedCount = db('tag')->insertSelect(db('tag')->limit(1)->buildSelect('name'), 'name');
testPoint($affectedCount);
/*
1-1    int(1)
 */
```


### `->update()`
更新数据

- 参数
  - `array $data` 待更新的字段映射表
  - `bool|null $allowEmptyConditionOrMustEqual = null` 三相类型，安全更新控制规则
    - `null` 不允许不带where条件的更新
    - `true` 允许不带where条件的更新
    - `false` 不允许不带where等值(id = 1 或 id in (1, 2))条件的更新

- 返回`int`

- 示例
```php
$affectedCount = db('tag')->update(['name' => '被更新的名字']);
testPoint($affectedCount);
/*
1-1    string(27) "dce\db\query\QueryException"
1-2    string(49) "Code:1 当前设置不允许空条件更新全表"
 */

$affectedCount = db('tag')->where('id', '>', 10)->update(['name' => '被更新的名字'], false);
testPoint($affectedCount);
/*
1-1    string(27) "dce\db\query\QueryException"
1-2    string(55) "Code:1 当前设置不允许无等于条件更新数据"
 */

$affectedCount = db('tag')->where('id', 10)->update(['name' => '被更新的名字'], false);
testPoint($affectedCount);
/*
1-1    int(1)
 */
```


### `->delete()`
删除记录

- 参数
  - `string|array|null $tableNames = null` 需删除记录的表，支持逗号分隔的表名字符串，或表名数组
  - `bool|null $allowEmptyConditionOrMustEqual = false` 三相类型，安全删除控制规则
    - `null` 不允许不带where条件的删除
    - `true` 允许不带where条件的删除
    - `false` 不允许不带where等值(id = 1 或 id in (1, 2))条件的删除

- 返回`int`

- 示例
```php
$affectedCount = db('tag')->where('id', 9)->delete();
testPoint($affectedCount);
/*
1-1    int(1)
 */
```


### `->query()`
原生SQL查询 *（尚不支持分库查询，详情见分库相关章节）*

- 参数
  - `string $statement` SQL语句
  - `array $params = []` 占位参数映射表
  - `mixed $fetch_style = PDO::FETCH_BOTH` 从该参数起，按序为PDO::fetchAll参数

- 返回`array`

- 示例
```php
$result = db('tag')->query("SELECT * FROM tag WHERE id = ?", [ 1 ]);
testPoint($result);
/*
1-1    array(1) {
         [0] => array(6) {
           ["id"] => int(1)
           [0] => int(1)
           ["name"] => string(3) "男"
           [1] => string(3) "男"
           ["is_deleted"] => int(0)
           [2] => int(0)
         }
       }
 */
```


### `->execute()`
原生SQL执行 *（尚不支持分库查询，详情见分库相关章节）*

- 参数
  - `string $statement` SQL语句
  - `array $params = []` 占位参数映射表

- 返回`int|string`

- 示例
```php
$affectedCount = db('tag')->execute("UPDATE tag set name = ? WHERE id = ?", [ '更新ID为8的name', 8 ]);
testPoint($affectedCount);
/*
2-1    int(1)
 */
```


### `->begin()`
开启事务 *（分库事务支持不完善，详情见分库相关章节）*

- 返回`\dce\db\proxy\Transaction`

- 示例
```php
$transaction = db()->begin();
// ... 这里可能有你更多的业务逻辑 ...
if ($affectedCount = db('tag')->where('id', 6)->update(['name' => '事务中更新的'])) {
    $transaction->commit();
} else {
    $transaction->rollback();
}
test($affectedCount);
/*
1-1    int(1)
 */
```


### `->lastSql()`
取最后执行的SQL语句

- 返回`string`

- 示例
```php
db('tag')->find();
$lastSql = db()::lastSql();
testPoint($lastSql);
/*
1-1    string(27) "SELECT * FROM `tag` LIMIT 1"
 */
```


### `->executedSqlList()`
取已执行的所有SQL语句（最后的`\dce\db\proxy\DbProxy::$max_statement_log`条）

- 返回`string[]`

- 示例
```php
db('tag')->find();
$lastSql = db()::lastSql();
testPoint($lastSql);

db('tag')->find();
db('tag')->find();
$executedSqlList = db()::executedSqlList();
testPoint($executedSqlList);
/*
2-1    array(3) {
         [0] => string(27) "SELECT * FROM `tag` LIMIT 1"
         [1] => string(27) "SELECT * FROM `tag` LIMIT 1"
         [2] => string(27) "SELECT * FROM `tag` LIMIT 1"
       }
 */
```


### `->enableShortcut()`
开启数据库操作的快捷函数

- 返回`void`

