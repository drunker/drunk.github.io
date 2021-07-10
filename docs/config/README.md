# 配置项

DCE配置分为公共配置与项目配置，公共配置位于`APP_COMMON . 'config/config.php'`，项目配置位于对应项目下的config/config.php。数组配置通过返回PHP数组的文件定义，示例如下：
```php
<?php
// [SomeProject]/config/config.php
return [
    'app' => ['id' => 'app1'],
    'bootstarp' => function () {
        \dce\pool\PoolAbstract::setChannelClass(\dce\pool\CoroutineChannel::class);
    }
];
```
所有配置项皆以蛇底形式书写，DCE会自动将其转换为`\dce\base\DceConfig`对象，且会以小驼峰的形式转换为对象属性，如数组配置为`['app_id'=>1]`，则转为对象后为`DceConfig->appId`，即原生支持的数组配置项为下述类属性的蛇底形式。



## \dce\config\DceConfig

DCE配置类（下述标有 **`c`** 标记的项表示仅在公共配置中有效，无法在项目中覆盖配置）


### `->app`
`string` **`c`** 应用配置。
```php
'app' => [
    'id' => 'string', // 应用ID, 用于多个应用部署于同一台机器时区分他们, 若未定义则会自动生成
    'name' => 'string|Stringable', // 应用名
    'lang' => 'string', // 默认语言码
    'country' => 'string', // 默认国家码
    'lang_parse' => 'callable(Request):string', // 语言码解析器, 返回语言码
    'country_parse' => 'callable(Request):string', // 国家码解析器, 返回国家码
    'lang_mapping' => 'callable(int|string):[int|string=>string]', // 语种映射工厂, 根据语种文本实例ID返回语言码与语种文本的映射表, 以此扩展更多语种
],
```

### `->bootstarp`
`Closure|null` **`c`** 引导回调。可以在此做全局初始化工作, 如设置池通道, 设置数据库代理等。

### `->prepare`
`Closure|null` 项目预备回调。可以做项目初始化相关工作（在服务器应用中，只会在第一次请求项目接口前执行该方法）

### `->projectPaths`
`array|null` **`c`** 扩展项目路径。若某些项目不在默认项目根目录下，可以通过此配置单独指定。若以斜杠结尾, 视为根目录, 将扫描其下全部目录作为自定义项目；无斜杠, 则作为一个单独的自定义项目，如：
```php
'project_paths' => [
    '../other_projects/',
    './another_project',
],
```

### `->node`
`array` **`c`** 节点配置
```php
'node' => [
    'cache' => false, // 是否缓存节点, 建议注解式节点的Cgi应用在生产环境中开启, 但节点改动时需清除一次缓存
    'deep' => 4, // 控制器注解式节点扫描深度
],
```

### `->template`
`array` 模板配置
```php
'template' => [
    'status' => DCE_ROOT . 'engine/project/render/template/status.php', // 结果页模板（成功失败反馈页）
    'exception' => DCE_ROOT . 'engine/project/render/template/exception.php', // 异常页模板（如HTTP500）
],
```

### `->rewriteMode`
`bool` 是否重写模式。用于使用url生成函数生成伪静态Url（如`Url::make('home/news', ['id'=>1])`可通过node配置生成，真：`/news/1.html`；假：`/?/news/1.html`），默认为假。

### `->jsonpCallback`
`string` jsonp请求时的回调方法键名。默认为`callback`。

### `->lockClass`
`string` **`c`** 继承自`\dce\base\Lock`的并发锁类名（Dce初始化时会实例化该类绑定到`\dce\Dce::$lock`属性上）

### `->idGenerator`
`\dce\sharding\id_generator\DceIdGenerator` **`c`** Id生成器，Dce会自动将数组型配置转换为DceIdGenerator对象
```php
// 默认配置（由于Dce的惰性实例化配置类属性的机制，仅当属性有对应的配置时才会被实例化，所以你如果没有独立配置，则不会自动实例化idGenerator属性）
'id_generator' => [
    'client_rpc_hosts' => [ // RPC客户端主机，若配置了则为远程客户端
        'host' => \dce\rpc\RpcUtility::DEFAULT_TCP_HOST, // 默认为Unix Domain Socket主机
        'port' => \dce\rpc\RpcUtility::DEFAULT_TCP_PORT,
    ],
    'client_storage' => '\dce\sharding\id_generator\bridge\IdgStorageFile', // 客户端储存器，若为Rpc客户端，则将自动以该储存器在新进程创建客户端Rpc服务
    'client_storage_arg' => APP_RUNTIME . 'didg/', // 客户端储存器实例化参数
    'redis_index' => null, // Redis储存器数据库号
    'requester' => null, // ID生成器服务请求器
    'server_rpc_hosts' => [], // RPC服务端主机，若配置了则为远程服务端
    'server_storage' => '\dce\sharding\id_generator\bridge\IdgStorageFile', // 服务端储存器，若为Rpc服务端，则将自动以该储存器在新进程创建服务端Rpc服务
    'server_storage_arg' => APP_COMMON . 'config/didg/data/', // 服务端储存器实例化参数
    'server_config_dir' => APP_COMMON . 'config/didg/', // ID生成规则配置文件所在目录
],

// 如果你需要以默认配置实例化idGenerator对象，可以配个空数组
'id_generator' => [], // 空数组将与默认配置合并

// 如果你需要使用本地客户端及服务端的全本都ID生成器，可以用以下方式覆盖掉默认的client_rpc_hosts配置
'id_generator' => [
    'client_rpc_hosts' => SplFixedArray::fromArray([]), // 将以空数组替换掉默认配置
],
```

### `->cache`
`array` **`c`** 系统缓存配置。此项为公共配置，不支持在项目下单独配置。具体配置项如下：
```php
'cache' => [
    'default' => 'file', // 默认缓存器名 (file, redis, memcache, memcached)
    'file' => [
        'dir' => APP_RUNTIME .'cache/', // 文件缓存目录
        'template_dir' => APP_RUNTIME . 'tpl/', // PHP模板文件缓存目录
    ],
    'memcache' => [
    //     'host' => '', // 缓存服务器
    //     'port' => 0, // 缓存服务端口
        'backup_on' => false, // 是否备份
    ],
    'memcached' => [
    //     'host' => '', // 缓存服务器
    //     'port' => 0, // 缓存服务端口
        'backup_on' => false, // 是否备份
    ],
    'redis' => [
        'index' => 0, // Redis缓存数据库号
    ],
],
```

### `->session`
`array` **`c`** Session配置。默认值如下：
```php
'session' => [
    'name' => 'dcesid', // Session ID名
    'auto_open' => 0, // 是否自动启动（默认不自启）
    'ttl' => 3600, // Session存活时间
    'long_ttl' => 0, // 较长的Session存活时间
    'class' => '', // 未指定Session类则Dce自行选择
    'root' => APP_RUNTIME . 'session/', // 文件型Session处理器根目录
    'index' => 0, // RedisSession处理器库号
    'manager_class' => '', // 留空表示Dce执行选择SessionManager类
    'manager_index' => 0, // SessionManagerRedis库号
    'valid' => [Utility::class, 'noop'], // session有效性校验方法，若返回false，则表示该session异常（如非法异地登录），Dce将自动清除这个session
],
```

### `->redis`
`array` **`c`** Redis配置。格式如下：
```php
'redis' => [
    'host' => '127.0.0.1',
    'port' => 6379,
    'password' => 'password',
    'index' => 0, // 默认库号
],
```

### `->mysql`
`\dce\database\connector\MysqlConfig` **`c`** Mysql配置，Dce会将自动将其转换为MysqlConfig对象。格式如下：
```php
// 单库版
'mysql' => [
    'host' => '127.0.0.1', // 主机地址
    'db_user' => 'root', // 数据库用户名
    'db_password' => 'password', // 数据库密码
    'db_name' => 'default_db', // 库名
    'db_port' => 3306, // 数据库端口
    'max_connection' => 8, // 连接池容量
],

// 分库版
'mysql' => [
    'default' => [ // 默认库配置, 用于简单代理的数据查询, 或者分库代理数据查询时的非分库数据查询 (当完全无分库需求时可以将此配置上移一层, 即如上单库版的'mysql'=>[...])
        'host' => '127.0.0.1', // 主机地址
        'db_user' => 'root', // 数据库用户名
        'db_password' => 'password', // 数据库密码
        'db_name' => 'default_db', // 库名
        'db_port' => 3306, // 数据库端口
        'max_connection' => 8, // 连接池容量
    ],
    '127.0.0.1' => [ // 分库1配置, 一个配置可以表示某个区间分库, 多个子配置表示该区间库有多个副本, 若有标志is_master则表示为主库, 若皆无标志则全部为主库 (default库亦适用)
        [
            'label' => '127.0.0.1:33061', // 标记别名
            'host' => '127.0.0.1',
            'db_user' => 'root',
            'db_password' => 'password',
            'db_name' => 'sharding_db',
            'db_port' => 33061,
            'is_master' => 1, // 是否主库
        ],
        [
            'label' => '127.0.0.1:33062',
            'host' => '127.0.0.1',
            'db_user' => 'root',
            'db_password' => 'password',
            'db_name' => 'sharding_db',
            'db_port' => 33062,
        ],
    ]
],
```

### `->sharding`
`\dce\database\middleware\ShardingConfig` **`c`** 分库规则配置。若无需分库查询支持则无需配置，格式如下：
```php
'sharding' => [
    'member' => [ // 分库别名 (按member划分的分库配置)
        'db_type' => 'mysql', // 数据库类型
        'type' => 'modulo', // 分库类型 (按模型分库)
        'cross_update' => true, // 是否允许跨库更新 (如set mid=2 where mid=1, 源数据位于库1, 但mid为2的数据应该储于库2, 开启这个开关后将会自动以插入+删除的方式移动数据, 否则会抛出无法update的异常)
        'allow_joint' => true, // 是否允许联表查询 (连表查询仅能联合主表所在的库来查询, 此开关可以关闭或开启该特性支持来避免开发人员的错误用法)
        'table' => [ // 适用于该分库规则的表名
            'member' => [
                'id_column' => 'mid', // 未配置sharding_column时将以id_column作为分库字段, 如果ID生成器tag名与字段名不一致, 则可以以数组的形式配置字段与tag, 如 ['name' => 'mid', 'tag' => 'mid'], sharding_column 亦如此
                'id_tag' => 'mid',
            ],
            'member_login' => [
                'id_column' => 'id', // 若配置了ID字段, 则将使用生成器生成ID, 若同时配置了sharding_column, 则该字段将作为ID的基因字段
                'id_tag' => 'ml_id',
                'sharding_column' => 'mid', // 若未配置ID字段, 则将不主动生成ID, 分库将仅以sharding_column字段划分
                'sharding_tag' => 'mid',
            ],
        ],
        'mapping' => [ // 分库与ID取模余数映射表, 标记取模值与路由库的映射关系
            '222:3306' => 0,
            '221:33065' => 1,
            '222:33065' => 2,
            '2:33068' => 3,
        ],
    ],
    'daily_log' => [
        'db_type' => 'mysql',
        'type' => 'range', // 分库类型 (区间型分库)
        'table' => [
            'member_login' => [
                'id_column' => 'id',
                'id_tag' => 'mlid',
            ],
        ],
        'mapping' => [ // 分库与ID区间起始值映射表, 标记ID处于哪个区间及对应哪个库
            '222:3306' => 0,
            '221:33065' => 15000000,
            '222:33065' => 30000000,
            '2:33068' => 45000000,
        ],
    ],
],
```

### `->shardingExtend`
`array` **`c`** 内置分库拓库工具配置。若无需拓库，或无需使用内置拓库脚本，则无需配置。格式如下：
```php
'sharding_extend' => [
    'volume_per_transfer' => 1000, // 每次向扩展表平均迁移量
    'mapping' => [ // 扩展分库规则映射表
        'member' => [
            '222:33065' => 1,
        ],
        'daily_log' => [
            '222:33065' => 60000000,
        ],
    ],
    'database' => [ // 扩展分库集
        '222:33065' => [
            'label' => '127.0.0.1:33065',
            'host' => '127.0.0.1',
            'db_user' => 'root',
            'db_password' => 'password',
            'db_name' => 'sharding_db',
            'db_port' => 33065,
        ],
    ],
],
```

### `->rpcServers`
`array` **`c`** Rpc服务配置。设置后在应用启动时, 将会自动启动Rpc服务监听, 并拦截处理Rpc请求方法。格式如下：
```php
'rpc_servers' => [
    [
        'hosts' => [ // 提供Rpc服务的服务器
            ['host' => RpcUtility::DEFAULT_TCP_HOST, 'port' => RpcUtility::DEFAULT_TCP_PORT],
        ],
        'wildcards' => [RpcUtility::DEFAULT_NAMESPACE_WILDCARD,] // 所需拦截处理的通配符名字空间
    ],
],
```

### `->websocket`
`array` 内置Websocket服务配置。所有内置服务皆以内置项目（于该目录下：`DCE_ROOT . 'project/'`）的形式构建，你可以到内置项目中查看默认配置及服务类库等。
```php
'websocket' => [
    'host' => '0.0.0.0', // 监听主机名
    'port' => 20461, // 监听端口
    'service' => '\\websocket\\service\\WebsocketServer', // 服务类
],
```

### `->swooleWebsocket`
`array` Swoole\Websocket\Server原生配置，详细请移步至Swoole官方wiki查看。

### `->http`
`array` 内置Http服务配置
```php
'http' => [
    'host' => '0.0.0.0',
    'port' => 20460,
    'service' => '\\http\\service\\HttpServer',
],
```

### `->swooleHttp`
`array` Swoole\Http\Server原生配置，详细请移步至Swoole官方wiki查看。

### `->tcp`
`array` 内置Tcp服务配置
```php
'tcp' => [
    'host' => '0.0.0.0',
    'port' => 20462,
    'mode' => SWOOLE_PROCESS,
    'sock_type' => SWOOLE_SOCK_TCP,
    'service' => '\\tcp\\service\\TcpServer',
    'extra_ports' => [
        ['host' => '0.0.0.0', 'port' => 20463, 'sock_type' => SWOOLE_SOCK_UDP], // 同时监听20463端口的Udp服务
    ],
],
```

### `->swooleTcp`
`array` Swoole\Tcp\Server原生配置，详细请移步至Swoole官方wiki查看。

### `->serverApiAuthMapping`
`array` 服务器接口授权密匙表，格式为`[host:port => password]`。

### `->iniSet`
`array` **`c`** 该配置将在引导时自动遍历作为参数给ini_set()调用
```php
'ini_set' => [
    'date.timezone' => 'PRC',
],
```

### `->debug`
`array` Debug配置
```php
'debug' => [
    'file_root' => APP_RUNTIME . 'log/debug/', // 默认Debug日志文件储存根目录
    'url_root' => 'https://logger.drunkce.com/debug/', // 默认Debug日志HTTP储存根地址
],
```

### `->log`
`array` 日志记录器配置
```php
'log' => [
    'access' => [ // 访问日志
        'request' => 'bool', // console，请求日志
        'response' => 'bool', // console，响应日志
        'connect' => 'bool', // console，连接日志，包括disconnect等
        'send' => 'bool', // console，消息推送日志，包括sentTo与push
    ],
    'db' => [ // 数据库日志
        'console' => false, // 是否在控制台输出日志
    ],
    'exception' => [ // 异常日志
        'console' => true, // 是否在控制台输出日志
        'log_file' => APP_RUNTIME . 'log/exception/%s.log', // 日志文件路径（若设置为空则不记录到文件）
        'log_name_format' => 'Y-m', // 日志文件按日期命名格式化模板
    ],
],
```



## 扩展配置

某些时候，你可能需要将配置写入不同的文件，以更好的分类不同的配置，或者你也可能需要在不同的环境使用不同的配置。Dce为了较解决这个问题，设计了一个特殊配置项`#extends`，其值为配置文件路径数组，DCE会在解析配置时自动遍历该数组，解析并使用`\drunk\Structure::arrayMerge()`合并扩展配置。

### `#extends`
`array` 扩展配置文件路径集，Dce会自动将这些配置扩展到主配置，如果配置文件无效，则不会扩展，也不会抛出异常。利用这个特性，你可以实现下面示例的特性。

- 细分配置
```php
'#extends' => [
    __DIR__ . '/databases.php',
    __DIR__ . '/sharding.php',
],
```

- 不同环境不同配置
```php
'#extends' => [
    __DIR__ . '/databases.php', // 公司环境数据库配置
    APP_ROOT . '.ignore/databases.php', // 自家环境数据库配置（git忽略掉.ignore目录，在家有该目录，将使用里面的覆盖配置，在公司没有，将使用公司环境配置）
],
```