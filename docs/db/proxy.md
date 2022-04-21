# 数据库代理

为了支持分库查询的同时也支持非分库查询，为了更好的扩展性，Dce抽象出了数据库代理层。作者实现了分库代理器与非分库代理器，你可以通过实现代理器应用自定义的连接器，你也可以通过代理器连接第三方 ~~分库中间件~~等。


## \dce\db\proxy\DbProxy;

数据库代理抽象类


### `::$max_statement_log_count`
`int = 32` 最大记录语句数


### `->logStatement()`
记录查询语句（用于调试时检查Sql语句，在代理器实现类中调用）

- 参数
  - `StatementInterface|string $statement`
  - `? array $params = null`

- 返回`void`


### `::getStatements()`
取全部记录的全部语句

- 返回`array`


### `::getLastStatement()`
取最后一条记录的语句

- 返回`array`


### `->queryAll();`
筛选取出全部数据

- 参数
  - `StatementInterface $statement`
  - `string|null $indexColumn`
  - `string|null $columnColumn`

- 返回`array`


### `->queryEach();`
迭代式取筛选数据

- 参数
  - `StatementInterface $statement`
  - `? Closure $decorator = null`

- 返回`Iterator`


### `->queryOne();`
取第一条筛选结果

- 参数
  - `StatementInterface $statement`

- 返回`array|false`


### `->queryColumn();`
取第一条筛选结果的第一个字段标量值

- 参数
  - `StatementInterface $statement`

- 返回`string|int|float|null|false`


### `->queryGetAffectedCount();`
取执行SQL所改变的记录数

- 参数
  - `StatementInterface $statement`

- 返回`int`


### `->queryGetInsertId();`
取插入语句的最后插入的记录ID

- 参数
  - `StatementInterface $statement`

- 返回`int|string`


### `->query();`
字符串式PDO查询取查询结果

- 参数
  - `string $statement`
  - `array $params`
  - `array $fetchArgs`

- 返回`array`


### `->execute();`
字符串式PDO查询取插入的ID或改变的记录数

- 参数
  - `string $statement`
  - `array $params`

- 返回`int|string`


### `->begin();`
开启一个事务

- 参数
  - `Query $query`

- 返回`\dce\db\proxy\Transaction`



## \dce\db\proxy\SimpleDbProxy

简易代理器。将Sql指令直接转发给连接器，不支持连接池及分库，但支持全部数据库原生特性（在传统CGI模式运行Dce时，仅支持通过该代理器操作数据库，如果你需要连接池及分库特性，则需在有Swoole环境的Cli模式下运行）

简易代理器实现了代理器抽象类的全部方法，一般情况下你不会直接调用代理器的方法，这里不再赘述。



## \dce\db\proxy\Transaction;

事务抽象类。为了支持分库事务，抽象出了此类。（事务类与代理器类对应，开启事务也是通过代理器开启）


### `::$time_to_expire`
`int = 60` 事务过期回收时长

### `::$pond`
`array = []` 事务实例池

### `->$createStamp`
`int` 当前事务创建时间戳

### `->$connector`
`DbConnector` 当前事务所属连接实例


### `->markConnector()`
标记数据库连接

- 参数
  - `DbConnector $connector`

- 返回`self`


### `->getConnector()`
取连接实例

- 返回`DbConnector`


### `->commit()`
提交事务

- 返回`bool`


### `->rollback()`
回滚事务

- 返回`bool`


### `->clearExpired()`
回滚超时的事务

- 返回`void`


### `->envValid();`
环境有效性校验

- 返回`void`


### 使用示例
```php
$transaction = $query->begin();
// 业务细节代码
if (/* 业务成功 */) {
    $transaction->commit();
} else {
    $transaction->rollback();
}
```


## \dce\db\proxy\SimpleTransaction

简易事务类。对应简易代理器，为其提供事务的支持。简易事务类支持原生数据库事务全部特性，而分库事务类对事务的支持不完善，详情请移步分库章节了解。


