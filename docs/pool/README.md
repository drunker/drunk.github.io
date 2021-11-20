# 实例池

DCE提供了实例池支持，且DCE的实例池不只是一个池子的概念，而是打包了多个池子，实现了能负载均衡的取实例的一个池子组。


## \dce\pool\Pool;

实例池基类，业务实例池继承本类并实现实例生产方法。DCE内置了Mysql、Redis与Tcp客户端连接池支持，你可以通过继承Pool基类实现更多的连接池，但这些连接必须支持Swoole的一键协程化，否则不能并发调用的连接池而意义不大。


### `::setChannelClass()`
设置实例通道类（早前版本考虑到可以支持不同的实例通道，后面意识到非协程实例通道意义不大，就默认设为了协程通道，所以你一般用不到此方法）

- 参数
  - `string $channelClass` 通道类名

- 返回`void`


### `::getInstance()`
`final protected` 取实例池的实例，供实现类中调用取返回值

- 参数
  - `string $configClass` 实现PoolProductionConfig的生产配置类名
  - `string ... $identities` 附加识别标识（同类实例可能需要生成多个不同的实例池，所以可以通过附加标识进行隔离）

- 返回`static`

- 示例
```php
// 不同的库生成不同的池，同组池之间负载均衡
// 下方表示取某个分片库的全部读库或写库的负载均衡实例池组
$pool = parent::getInstance(DbPoolProductionConfig::class, $dbAlias, $isWrite);
```


### `->setConfigs()`
设置配置（会以新的配置替换老的，若新的在老的中存在，则会复用，若不存在则会新建，若老的在新的中不存在，则会移除）

- 参数
  - `array $configs` 池组原始配置集（配置多个实现负载均衡实例池组）
  - `bool $forceReplace = false` 是否热配置（若主机成员发生了变化，上线或下线了主机时调用此方法并开启热配置，则会实时更新实例池组，生产新主机的连接实例）

- 返回`static`

- 示例
```php
// 单实例池
RedisPool::inst()->setConfigs(['host' => '127.0.0.1', 'port' => 6379], false);

// 负载均衡实例池组
RedisPool::inst()->setConfigs([
  ['host' => '127.0.0.1', 'port' => 6379],
  ['host' => '192.168.111,111', 'port' => 6379],
], false);
```


### `->getChannel()`
获取通道

- 参数
  - `int $index` 对应的池配置偏移

- 返回`\dce\pool\ChannelAbstract`


### `->put()`
回收到实例池中

- 参数
  - `object $instance` 实例

- 返回`bool`

- 示例
```php
// 从实例池取实例
$redis = RedisPool::inst()->setConfigs(['host' => '127.0.0.1', 'port' => 6379], false)->fetch();
$redis->set('homepage', 'https://drunkce.com');
// 将实例放回实例池
RedisPool::inst()->put($redis);
```


### `->get()`
取实例 (需在子类实现[->fetch()](#fetch)方法返回此方法的调用，可限定返回类型)

- 参数
  - `array $config = []` 需要取的实例的原始生产配置（用于从实例组中的特定池取实例，默认是负载均衡的取）

- 返回`object`

- 示例
```php
// 从实例池取实例
$redis = RedisPool::inst()->setConfigs([
  ['host' => '127.0.0.1', 'port' => 6379],
  ['host' => '192.168.111.111', 'port' => 6379],
], false)->fetch(['host' => '192.168.111.111', 'port' => 6379]);
$redis->set('homepage', 'https://drunkce.com');
// 将实例放回实例池
RedisPool::inst()->put($redis);
```

::: warning 注意
从池中取完实例执行完业务后，必须调用`->put()`方法归还，否则可能会在并发下造成协程死锁。
:::


### `->getProduct()`
根据实例取其映射的配置通道等

- 参数
  - `object $object` 从池中取实例信息

- 返回`\dce\pool\PoolProduct`

- 示例
```php
$pool = RedisPool::inst()->setConfigs(['host' => '127.0.0.1', 'port' => 6379]);
$redis = $pool->fetch();
var_dump($pool->getProduct($redis)->config->port);
// 6379
$pool->put($redis);
```


### `->retryableContainer()`
重试容器，容器中代码执行时，若连接异常断开，则可被自动重新执行以便连接池重连

- 参数
  - `callable $callback` 需自动重试的代码容器
  - `ChannelAbstract $thrownChannel` 异常存储通道
  - `Barrier $barrier = null` Swoole协程屏障

- 返回`void`


### `->setConfigsInterface()`
子类可以覆盖此方法, 用于从配置中心动态取配置

- 返回`void`


### `->produce();`
`protected` 生产实例，抽象方法

- 参数
  - `PoolProductionConfig $config` 生产配置对象

- 返回`object`

- 示例
```php
namespace dce\storage\redis;

use dce\pool\PoolProductionConfig;
use dce\pool\Pool;
use dce\pool\PoolException;
use Redis;

class RedisPool extends Pool {
    public function produce(PoolProductionConfig $config): Redis {
        $instance = new Redis();
        if (isset($config->password)) {
            $instance->auth($config->password);
        }
        if (! $instance->connect($config->host, $config->port, 1)) {
            throw new PoolException('生成连接实例失败, 无法连接到Redis服务');
        }
        return $instance;
    }

    public function fetch(): Redis {
        return $this->get();
    }

    public static function inst(string ... $identities): self {
        return $this->getInstance(RedisPoolProductionConfig::class, ... $identities);
    }
}
```


### `->fetch();`
同[->get()](#get)，是对其的包装（子类实现限定返回类型，用于IDE上下文分析）

- 返回`object`


### `::inst();`
取实例池实例（在子类中返回调用`getInstance`的结果实现）

- 参数
  - `string ... $identities` 附加识别标识（用于隔离实例通道）

- 返回`static`

- 示例
```php
// 实现类见上述 ->produce 的示例，调用的示例往上翻也有很多
```


## \dce\pool\PoolProductionConfig;

生产器配置基类，定义子类继承本类实现生产器配置


### `__construct()`
构造方法（可在实现类中回调父类构造方法，方便从配置中提取池容量并传参给父方法）

- 参数
  - `array|ArrayAccess $config` 数组、类数组配置
  - `int $capacity` 池容量

- 示例
```php
namespace dce\storage\redis;

use ArrayAccess;
use dce\pool\PoolProductionConfig;

class RedisPoolProductionConfig extends PoolProductionConfig {
    public string $host;

    public int $port;

    public string $token;

    private const CAPACITY_DEFAULT = 16;

    public function __construct($config) {
        parent::__construct($config, intval($config['max_connection'] ?? 0) ?: self::CAPACITY_DEFAULT);
    }

    public function match($config): bool {
        return $this->matchWithProperties($config, ['host']);
    }
}
```


### `->match()`
判断配置是否与当前实例匹配（是否有对应的属性，且属性值相等，可在子类中覆盖该方法按自定逻辑判断）

- 参数
  - `array|ArrayAccess $config` 需匹配的源配置

- 返回`bool`


### `->matchWithProperties()`
判断传入配置与当前实例是否有指定的属性且属性值相等

- 参数
  - `array|ArrayAccess $config` 需匹配的源配置
  - `array $columns` 需比较的属性集

- 返回`bool`


## \dce\pool\ChannelAbstract;

通道基类


### `__construct()`

- 参数
  - `int $capacity = 0`


### `->setCapacity()`
设置容量

- 参数
  - `int $capacity`

- 返回`void`


### `->push();`
压入通道

- 参数
  - `mixed $object`

- 返回`bool`


### `->pop();`
从通道弹出

- 返回`mixed`


### `->isEmpty();`
判断是否空通道

- 返回`bool`


### `->getLength();`
取通道成员量

- 返回`int`


## \dce\pool\CoroutineChannel

Swoole协程协程版实例通道，实例池默认使用此通道。（DCE本来实现了数组版通道，并且为了兼容没有Swoole的环境而设为了默认实例通道，后面发现有无法自动调度协程等缺陷而放弃之，只保留了协程版通道）


## \dce\pool\TcpPool

Tcp连接池继承于Pool基类，主要实现了实例生产方法，详细自行查看源代码（`/dce/engine/pool/TcpPool.php`）


### `->fetch()`
取Tcp客户端实例

- 参数
  - `array $config = []` 按指定配置取

- 返回`\Swoole\Coroutine\Client`


### `::inst()`
取连接池实例

- 参数
  - `string ... $identities` 识别标识

- 返回`\dce\pool\TcpPool`