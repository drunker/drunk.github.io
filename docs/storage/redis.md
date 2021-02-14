# Redis

Redis库依赖phpredis扩展


## \dce\storage\redis\RedisConnector

Redis连接器


### `__construct()`
构造函数

- 参数
  - `array|ArrayAccess $config` 配置（`{host, port, password, index: 库号}`）
  - `bool $persistent = true` 是否创建可复用连接

- 示例
```php
$redis = (new RedisConnector([
    'host' => '127.0.0.1',
    'port' => 6379,
]))->getRedis();
$redis->set('name', 'Dce');
test($redis->get('name'));
// 1-1    string(3) "Dce"
```


### `->getRedis()`
取Redis实例

- 返回`\Redis`



## \dce\storage\redis\RedisPool

Redis连接池类


### `produce()`
生产方法，生产Redis实例

- 参数
  - `PoolProductionConfig $config` 生产配置类（由Pool基类实例化配置）

- 返回`\Redis`


### `->fetch()`
从实例池取一个空闲Redis实例

- 返回`\Redis`


### `::inst()`
取连接池实例

- 参数
  - `string ... $identities` 识别标识

- 返回`self`


## \dce\storage\redis\RedisPoolProductionConfig

Redis实例生产配置类


### `->host`
`string` Redis服务主机地址

### `->port`
`int` Redis服务端口

### `->token`
`string` Redis授权密码


### `__construct()`
构造方法，主用于从配置中提取对应Redis服务的最大连接

- 参数
  - `array|ArrayAccess $config` 数组型配置

- 示例
```php
public function __construct($config) {
    parent::__construct($config, intval($config['max_connection'] ?? 0) ?: self::CAPACITY_DEFAULT);
}
```


### `match()`
配置匹配方法，用于供Pool类比对生产配置与新的配置是否匹配，决定是否调整池组（实例池基类自动调用）

- 参数
  - `array|ArrayAccess $config` 数组型配置

- 返回`bool`

- 示例
```php
public function match($config): bool {
    return $this->matchWithProperties($config, ['host', 'port']);
}
```


## Redis连接池使用示例

```php
// 取连接池实例
$pool = RedisPool::inst()->setConfigs([
  ['host' => '127.0.0.1', 'port' => 6379],
  ['host' => '192.168.111.111', 'port' => 6379],
], false);
// 从连接池取Redis实例
$redis = $pool->fetch();
// 执行Redis相关业务操作
$redis->set('homepage', 'https://drunkce.com');
// ...
// Redis相关操作完毕
// 将Redis实例放回实例池
$pool->put($redis);
```