# 查询构造器

查询构造器用于构造查询语句对象`\dce\db\query\builder\StatementAbstract`，查询语句对象实现了转字符串式语句及取占位参数的接口`\dce\db\query\builder\StatementInterface`。构造器相关类较多，但在开发中很少直接接触，所以这块不细说。本章节仅对一些关键类作简述，如果你想更深入的了解，可以自行阅读源码。


## \dce\db\query\QueryBuilder

查询语句构造器类。本类是一个工厂类，主用于将各个查询元素组装成查询语句对象，以供查询代理器操作数据库。你一般不会直接接触到此类。

#### 示例
```php
$queryBuilder = new \dce\db\query\QueryBuilder();
$queryBuilder->addTable('member', null);
$queryBuilder->addWhere('id', 1, false, 'and');
$queryBuilder->addWhere(['id', 2], false, false, 'or');
$selectStatement = $queryBuilder->buildSelect('*', false, false);
test((string) $selectStatement, $selectStatement->getParams());
// 将会打印出下述内容
/*
1-1    string(49) "SELECT * FROM `member` WHERE `id` = ? OR `id` = ?"
1-2    array(2) {
         [0] => int(10000)
         [1] => int(99999)
       }
*/
```



## \dce\db\query\builder\RawBuilder

原始语句类。由于查询构造器会对相关语句元素做简单合法性校验等，导致某些你确定合法的复杂语句抛出异常，或者你的查询条件等公式型的右值被当做普通字符串处理。为了解决这些问题，作者设计了原始语句类包装它们，凡是被包装的语句，Dce不会做校验、也不会被当做字符串型右值，而是保持原样。所以，在使用原始语句对象时，需先确定被包装的语句是绝对安全的（如写死的，不是从用户的入参获取的），如果你无法确定安全性而使用，则可能得不偿失。

### `->__construct()`
构造方法

- 参数
  - `string $statement` 原始语句
  - `bool|array $autoParenthesis = true` 是否自动用小括号包裹
  - `array $params = []` 绑定参数

- 示例
```php
use dce\db\query\builder\RawBuilder;

$raw1 = new RawBuilder('select * from member where id = 10000');
$raw2 = new RawBuilder('select * from member where id = 10000', false);
$raw3 = new RawBuilder('select * from member where id = ? or id = ?', [10000, 9999]);
$raw4 = new RawBuilder('select * from member where id = :id1 or id = :id2', false, ['id1' => 10000, 'id2' => 99999]);
test(
    (string) $raw1, $raw1->getParams(),
    (string) $raw2, $raw2->getParams(),
    (string) $raw3, $raw3->getParams(),
    (string) $raw4, $raw4->getParams(),
);
// 将会打印出下述内容
/*
1-1    string(39) "(select * from member where id = 10000)"
1-2    array(0) {
       }
1-3    string(37) "select * from member where id = 10000"
1-4    array(0) {
       }
1-5    string(45) "(select * from member where id = ? or id = ?)"
1-6    array(2) {
         [0] => int(10000)
         [1] => int(9999)
       }
1-7    string(43) "select * from member where id = ? or id = ?"
1-8    array(2) {
         [0] => int(10000)
         [1] => int(99999)
       }
*/
```



### `\raw()`
原始语句类全局快捷实例化方法。由于原始语句对象比较常用，普通实例化比较繁琐，所以定义了此全局快捷方法。

- 参数
  - `string $statement` 原始语句
  - `bool|array $autoParenthesis = true` 是否自动用小括号包裹
  - `array $params = []` 绑定参数

- 返回`dce\db\query\builder\RawBuilder`

- 示例
```php
$raw1 = raw('select * from member where id = 10000');
test((string) $raw1, $raw1->getParams());
// 将会打印出下述内容
/*
1-1    string(39) "(select * from member where id = 10000)"
1-2    array(0) {
       }
*/
```