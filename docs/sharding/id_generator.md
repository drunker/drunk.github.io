# ID生成器

ID生成器是为分库中间件提供服务的一个组件，对于数据分库，需要主动生成ID而不能用数据库的自增ID，所以开发ID生成器为分库中间件提供支持。



## 简介

分库分表一般通过ID来分发路由查询请求，这个ID需要是唯一且均匀分布的，这个时候数据表的自增字段无法满足需求。当然有很多方案解决这个问题，如单独建库专门提供ID生成服务，如给各分库划分各自的ID起始生成范围等。这些方案确实能解决问题，但相对比较性能低下或不够灵活。肯定也有成熟可靠的ID生成器，但它们与Dce集成需要比较大的代价，使框架变得难以上手。

Dce的ID生成器是一个分布式的ID生成组件，组件各端都支持分布式部署，可以几乎以无上限的性能生成ID。这些ID是绝对全球唯一的Bigint范围的ID，你可以使用bigint字段储存，占用空间少、索引性能好。ID值趋势递增、支持时间因子，使你需要排序的业务几乎不受影响，甚至能兼任时间筛选的职能。

ID生成器分为服务端与客户端，以及他们的通信组件“请求器”。但一般情况下你无需接触他们，因为Dce对其做了深度集成，你仅需简单配置即可无感的使用该组件，但还是建议你学习了解其原理，以便更得心应手的应用。



## 配置

配置分为ID生成配置与自启动配置，ID生成器配置则配置ID的生成规则，自启动配置配置ID生成器的客户端或服务端自行启动。


### ID生成配置

ID生成配置用于配置ID的生成规则，以单独的PHP文件定义数组式配置，文件存于`\dce\sharding\id_generator\DceIdGenerator::$serverConfigDir`目录下

**`\dce\sharding\id_generator\bridge\IdgBatch` ID生成配置类**

#### `->type`
`string` ID类型，{increment: 自增型ID, time: 时间因子型ID}

#### `->moduloBitWidth`
`int` 基因模数位宽（如按用户名分库时，可将用户名转为number，截取装入指定位宽ID。当按模分库时将以ID与分库数取模得到目标分库号）（位宽宽度表示最大支持的按模分库库数，如设为`8`则表示最大支持`256`个分库）

***PHP Bigint最大支持`63`个二进制位，请合理配置各个段的位宽***

#### `->batchBitWidth`
`int` 批次池位宽（仅用于time型ID，increment型ID批次池不限位宽）（宽度表示一秒内可生成ID的上限量，如设为`20`则表示一秒最多能生成`1,048,576`个ID）

#### `->batchCount`
`int` 客户端单批申请ID数

#### `->serverId`
`int` 服务ID（当你需要向全球提供业务支持时，可能一个ID生成服务无法支撑巨量业务，或者延迟较大造成阻塞，这时可以部署多个服务，命名不同服务ID，这些服务可以并行处理任务而无需同步）

#### `->serverBitWidth`
`int` 服务ID位宽（宽度表示最大部署并行服务量）


### 自启动配置

Dce可以通过配置自行启动实例化ID生成器，你可以直接通过生成器实例调用ID生成服务，分库中间件也是通过这个实例获得的ID服务。如果你不需要Dce自动启动客户端或服务端，则无需配置。在不配置的情况下，你仍然可以手动实例化对象启动服务。

**`\dce\sharding\id_generator\DceIdGenerator` 自启动配置类**

#### `->clientRpcHosts`
`array = ['host' => RpcUtility::DEFAULT_TCP_HOST, 'port' => RpcUtility::DEFAULT_TCP_PORT]` ID生成器客户端的远程服务主机集（若配置了则表示需要通过RPC请求客户端服务，否则直接调用本地服务）（由于RPC依赖Swoole，所以此配置仅在有Swoole的环境下有效，否则会抛出异常）

#### `->clientStorage`
`string = '\dce\sharding\id_generator\bridge\IdgStorageFile'` ID生成器客户端的储存器（若配置了，且`clientRpcHosts`时则会自动创建一个新进程并启动ID生成器客户端服务）

#### `->clientStorageArg`
`string = APP_RUNTIME . 'didg/'` 客户端储存器参数（数据储存目录或Redis键前缀）

#### `->requester`
`string` 请求器，可不配置，会根据`serverRpcHosts`配置自动选择相应请求器

#### `->serverRpcHosts`
`array = []` ID生成器服务端的远程服务主机集（若配置了则表示需要通过RPC请求服务端服务，否则直接调用本地实例化服务）

#### `->serverStorage`
`string = '\dce\sharding\id_generator\bridge\IdgStorageFile'` ID生成器服务端的储存器（在配置了`serverRpcHosts`时有效，配置了则会自动创建一个新进程并启动ID生成器服务端服务）

#### `->serverStorageArg`
`string = APP_COMMON . 'config/didg/data/'` 服务端储存器参数（数据储存目录或Redis键前缀）

#### `->serverConfigDir`
`string = APP_COMMON . 'config/didg/'` ID生成配置的储存目录

#### IDG配置逻辑图
---
![IDG配置逻辑图](./idg-config-logic.svg)

#### IDG服务请求逻辑图
---
![IDG服务请求逻辑图](./idg-api-logic.svg)


### 示例

#### 配置ID生成规则

```php
// uid.php
return [
    'type' => 'time',
    'modulo_bit_width' => 8,
    'batch_bit_width' => 20,
    'batch_count' => 65536, // 客户端向服务端每次申请65536个ID
    'server_id' => 0,
    'server_bit_width' => 8,
];
```

```php
// log_id.php
return [
    'type' => 'increment',
    'modulo_bit_width' => 0,
    'batch_bit_width' => 0,
    'batch_count' => 65536,
    'server_id' => 0,
    'server_bit_width' => 8,
];
```

#### 配置自启动

##### 纯本地ID生成服务（唯一支持在Windows无Swoole环境下运行的配置）

配置

```php
// 由于Dce默认配置了‘远程客户端本地服务端’，所以仅需置空覆盖掉客户端rpc配置即可实现纯本地服务。你可以到`\dce\sharding\id_generator\DceIdGenerator`查看所有默认配置
'id_generator' => [
    // 普通数组配置值会被合并，但这里需要替换，所以用数组对象配置，它将替换掉默认值而不是合并
    'client_rpc_hosts' => SplFixedArray::fromArray([]),
],
```

应用
```php
$mid = Dce::$config->idGenerator->generate('mid');
test(
    $mid,
    Dce::$config->idGenerator->getClient('mid')->parse('mid', $mid)->arrayify(),
);
/*
1-1    int(432781296176561664)
1-2    array(3) {
         ["serverId"] => int(0)
         ["batchId"] => int(2430)
         ["timeId"] => int(1612235964)
       }
*/
```


##### 本地客户端远程服务端（RPC需在Linux的Swoole下运行）

配置
```php
'id_generator' => [
    'client_rpc_hosts' => SplFixedArray::fromArray([]),
    'server_rpc_hosts' => ['host' => '127.0.0.1', 'port' => '20466'],
],
// 该配置将在本地实例化客户端, 需要调用服务端接口时会Rpc请求远程实例化服务端, 本地客户端处理远程响应的结果, 然后返回给调用方
// 注意，由于默认配置了`serverStorage`，所以上述配置下会自动创建实例化IdgServer的RpcServer，如果你的服务端位于真正的远程服务器，无需自动在本地创建，则需配置`serverStorage`为''
```

应用
```php
// 由于RPC服务用了TCP连接池，而连接池用到了协程通道，所以服务必须在协程容器中运行
Co\run(function () {
    $mid = Dce::$config->idGenerator->generate('mid');
    test(
        $mid,
        Dce::$config->idGenerator->getClient('mid')->parse('mid', $mid)->arrayify(),
    );
});
/*
1-1    int(432782108193504512)
1-2    array(3) {
         ["serverId"] => int(0)
         ["batchId"] => int(1213)
         ["timeId"] => int(1612238989)
       }
*/
```

##### 远程客户端本地服务端

配置
```php
// 当前类型为默认配置，但因为Dce是根据用户配置执行自启动，若不配置则无法触发自启动，所以需要配置一个空数组，因为是普通数组，会被合并到默认配置，所以将以默认配置启动Idg
'id_generator' => [
//    'client_rpc_hosts' => ['host' => RpcUtility::DEFAULT_TCP_HOST, 'port' => RpcUtility::DEFAULT_TCP_PORT],
],
// 该配置下调用Id生成服务时，会Rpc请求远程实例化客户端，客户端需要调用服务端接口时在其环境直接实例化服务端，最后本地将远程客户端响应的结果返回给调用方
// 注意，如果你的客户端位于真正的远程服务器，无需自动在本地创建，则需配置`client_rpc_hosts`为真正的远程客户端主机地址，且将`clientStorage`配置为''
```

应用
```php
Co\run(function () {
    $mid = Dce::$config->idGenerator->generate('log_id');
    test(
        $mid,
        Dce::$config->idGenerator->getClient('log_id')->parse('log_id', $mid)->arrayify(),
    );
});
/*
1-1    int(256)
1-2    array(2) {
         ["serverId"] => int(0)
         ["batchId"] => int(1)
       }
*/
```

##### 远程客户端远程服务端

配置
```php
'id_generator' => [
//    'client_rpc_hosts' => ['host' => RpcUtility::DEFAULT_TCP_HOST, 'port' => RpcUtility::DEFAULT_TCP_PORT],
    'server_rpc_hosts' => ['host' => '127.0.0.1', 'port' => '20466'],
],
// 该配置下调用Id生成服务时，会Rpc请求远程实例化客户端，客户端需要调用服务端接口时会Rpc请求远程服务端, 远程客户端处理远程服务端响应的结果后响应给本地, 最后本地将远程客户端响应的结果返回给调用方
// 注意，见上述两条注意..
```

应用
```php
Co\run(function () {
    $mid = Dce::$config->idGenerator->generate('log_id');
    test(
        $mid,
        Dce::$config->idGenerator->getClient('log_id')->parse('log_id', $mid)->arrayify(),
    );
});
/*
1-1    int(17377280)
1-2    array(2) {
         ["serverId"] => int(0)
         ["batchId"] => int(67880)
       }
*/
```



## \dce\sharding\id_generator\DceIdGenerator

这个类在上面已经介绍过，是自启动配置类，但同时它也提供了几个接口方法，请求ID服务都是通过它们


### `->generate()`
生成ID

- 参数
  - `string $tag` ID标签名
  - `int|string $uid = 0` 基因用户ID

- 返回`int`

- 示例
```php
$mid = Dce::$config->idGenerator->generate('mid');
test($mid);
// 1-1    int(432782108193504512)
```


### `->batchGenerate()`
生成批量ID

- 参数
  - `string $tag` ID标签名
  - `int $count` 批量生成量
  - `int|string $uid = 0` 基因用户ID

- 返回`int[]`

- 示例
```php
$mids = Dce::$config->idGenerator->batchGenerate('mid', 10);
test($mids);
/*
1-1    array(10) {
         [0] => int(432785775022089728)
         [1] => int(432785775022089984)
         [2] => int(432785775022090240)
         [3] => int(432785775022090496)
         [4] => int(432785775022090752)
         [5] => int(432785775022091008)
         [6] => int(432785775022091264)
         [7] => int(432785775022091520)
         [8] => int(432785775022091776)
         [9] => int(432785775022092032)
       }
*/
```


### `->getClient()`
取ID生成器

- 参数
  - `string $tag` ID标签名

- 返回`\dce\sharding\id_generator\IdGenerator`

- 示例
```php
$client = Dce::$config->idGenerator->getClient('mid');
test($client);
/*
1-1    object(dce\sharding\id_generator\IdGenerator)#74 (3) {
         ["clientMapping":"dce\sharding\id_generator\IdGenerator":private] => array(1) {
           ["mid"] => object(dce\sharding\id_generator\client\IdgClientTime)#76 (7) {
...
*/
```


## \dce\sharding\id_generator\IdGenerator

生成ID的方法已在上个类中封装，如果你还需要解析ID等方法，可以通过上个类的`\dce\sharding\id_generator\DceIdGenerator::getClient`调用本类方法


### `->new()`
实例化一个单例客户端对象

- 参数
  - `\dce\sharding\id_generator\bridge\IdgStorage $storage`
  - `\dce\sharding\id_generator\bridge\IdgRequestInterface $request`

- 返回`\dce\sharding\id_generator\IdGenerator`


### `->wasLoaded()`
判断tag配置是否已加载


### `->getBatch()`
取tag配置

- 参数
  - `string $tag`

- 返回`\dce\sharding\id_generator\bridge\IdgBatch`

- 示例
```php
$batch = Dce::$config->idGenerator->getClient('mid')->getBatch('mid');
test($batch);
/*
1-1    object(dce\sharding\id_generator\bridge\IdgBatch)#75 (8) {
         ["type"] => string(4) "time"
         ["serverBitWidth"] => int(8)
         ["moduloBitWidth"] => int(0)
         ["batchBitWidth"] => int(20)
         ["batchCount"] => int(65536)
         ["serverId"] => int(0)
         ["batchFrom"] => uninitialized(int)
         ["batchTo"] => uninitialized(int)
         ["batchId"] => int(2224)
         ["timeId"] => uninitialized(int)
         ["batchApplyTime"] => int(1612252649)
         ["moduloId"] => uninitialized(int)
       }
*/
```


### `->parse()`
解析ID

- 参数
  - `string $tag`
  - `int $id`

- 返回`\dce\sharding\id_generator\bridge\IdgBatch`

- 示例
```php
$batch = Dce::$config->idGenerator->getClient('mid')->parse('mid', 432782108193504512);
test($batch, $batch->arrayify());
/*
1-1    object(dce\sharding\id_generator\bridge\IdgBatch)#77 (3) {
         ["type"] => uninitialized(string)
         ["serverBitWidth"] => uninitialized(int)
         ["moduloBitWidth"] => uninitialized(int)
         ["batchBitWidth"] => uninitialized(int)
         ["batchCount"] => uninitialized(int)
         ["serverId"] => int(0)
         ["batchFrom"] => uninitialized(int)
         ["batchTo"] => uninitialized(int)
         ["batchId"] => int(1213)
         ["timeId"] => int(1612238989)
         ["batchApplyTime"] => uninitialized(int)
         ["moduloId"] => uninitialized(int)
       }
1-2    array(3) {
         ["serverId"] => int(0)
         ["batchId"] => int(1213)
         ["timeId"] => int(1612238989)
       }
*/
```


### `->extractGene()`
根据ID提取分库基因ModuloId

- 参数
  - `string $tag`
  - `int $id`
  - `int $modulus = 0` 模数，若传入了则执行取模运算计算余数

- 返回`int`

- 示例
```php
$idg = Dce::$config->idGenerator->getClient('mid');
$geneID = $idg->extractGene('mid', 432782108193504512);
$geneID2 = $idg->extractGene('mid', 432782108193504512, 4);
test($geneID, $geneID2);
/*
1-1    int(1690555110130877)
1-2    int(1)
*/
```


### `->generate()`
生成ID

### `->generateHash()`
生成ID并hash化

### `->batchGenerate()`
生成批量ID



## \dce\sharding\id_generator\bridge\IdgStorage;

储存器抽象类


### `->lock()`
加锁

### `->unlock()`
解锁

### `->genKey();`
生成数据键

### `->load();`
加载数据

### `->save();`
保存数据



## \dce\sharding\id_generator\bridge\IdgRequestInterface;

请求器接口


### `->register();`
向服务端注册, 并获取ID池配置

### `->generate();`
向服务端申请ID池



## \dce\sharding\id_generator\server\IdgServer

ID生成器服务端


### `->new()`
取单例实例

- 参数
  - `IdgStorage $storage` 储存器
  - `string $configDir` 配置文件所在目录

- 返回`\dce\sharding\id_generator\server\IdgServer`


### `->register()`
客户端Tag注册

- 参数
  - `string $tag`

- 返回`\dce\sharding\id_generator\bridge\IdgBatch`


### `->generate()`
生成指定Tag ID池

- 参数
  - `string $tag`

- 返回`\dce\sharding\id_generator\server\IdgServer`