# 连接数据库

在操作数据库前，需要做一些准备工作，包括数据库配置等。



## 数据库配置

数据库配置在前面的[概述](/db/#数据库配置)中有示例，这里不再赘述。你可以在[主配置文件](/config/#mysql)中配置`mysql`键的元素值，也可以单独建一个叫`database.php`或`mysql.php`的文件专门配置数据库，然后在主配置文件中通过特殊属性`#extends`，[扩展或应用](/config/#扩展配置)这些配置。如果你想以扩展配置中的数据库配置覆盖主配置，可以使用[`ArrayObject`等对象](/config/lib.md#set)包装你的数组配置，Dce合并配置时，会自动将被包装的配置，替换掉主配置中的数据库配置，具体可参考下述示例。

主配置`common/config/config.php`
```php
return [
    'mysql' => [
        'default' => [
            [
                // 公司开发环境默认写库配置
                'is_master' => 1,
            ],
            [
                // 公司开发环境默认读库配置
            ]
        ]
    ],
    '#extends' => [
        '../../.ignore/config.php'
    ],
];
```

扩展配置`.ignore/config.php`（将`.ignore`目录加入git忽略配置，让该目录仅在家庭开发环境有，在公司开发环境无）
```php
return [
    'mysql' => new ArrayObject([
        'default' => [
            // 家庭开发环境默认读写库配置
        ],
    ]),
]
```

上述示例的情况，在公司开发环境下由于没有`.ignore`目录，所以无法扩展，则会使用公司环境的数据库配置。而在家庭开发环境时，会加载扩展配置并合并，由于使用的`ArrayObject`包装了你的配置，所以Dce会直接将其覆盖掉主配置而不是合并，所以最终连接数据库会使用扩展的数据库配置。

*`Dce默认仅支持连接Mysql，后续看情况决定是否接入对其他数据库的支持。`*


### `\dce\db\connector\DbConfig`

配置对象类，用于将数组型配置转为对象，并对数据库配置进行管理。你一般情况下不会直接接触该类，这里不多赘述，你可以自己查看源代码了解更多。



## \dce\db\connector\DbConnector;

数据库连接器，顾名思义用于连接数据库，里面抽象了一些数据库查询方法，这些方法包装了数据库客户端（如PDO）的对应方法，并且埋了脚本记录器的钩子，用于记录SQL脚本。Dce封装了PDO版连接器`\dce\db\connector\PdoDbConnector`，该连接器使用PDO连接操作数据库。你一般不会直接用到连接器，除非你需要自己封装其他版本连接器，这种情况你可以继承DbConnector，实现里面抽象的方法实现自己的连接器。如果你需要直接操作PDO，可以调用连接器暴露的`getConnection`方法，该方法会返回PDO对象。你可以自己查看源代码了解更多。



## \dce\db\connector\ScriptLogger;

脚本记录器，用于截取Sql指令，用于记录Sql脚本或其他用途。Dce实现了Redis版记录器类`\dce\db\connector\ScriptLoggerRedis`，你也可以继承抽象类实现自己的记录器。


### `::addDriver()`
设置记录器。记录器抽象类通过静态属性实现了记录器容器，addDriver方法向容器添加记录器。

- 参数
  - `self $driver` 记录器实例

- 返回`void`

- 示例
```php
ScriptLogger::addDriver(new ScriptLoggerRedis());
```


### `::trigger()`
触发发送Sql指令事件，触发容器中全部记录器的log方法（该方法在连接器中自动调用）


### `::triggerUpdate()`
触发Sql执行完毕事件，触发容器中全部记录器的logUpdate方法（该方法在连接器中自动调用）


### `->log();`
记录Sql（该方法由触发器自动调用）

- 参数
  - `string $logId` 记录器生成的脚本ID
  - `mixed ... $args` 查询相关参数（如Sql脚本等）

- 返回`void`


### `->logUpdate();`
记录查询结果（该方法由触发器自动调用）

- 参数
  - `string $logId` 记录器生成的脚本ID
  - `mixed ... $args` 查询相关参数（如查询结果等）

- 返回`void`



## \dce\db\connector\DbPool;

数据库连接池，`DbConnector`类实例池，与生成配置类`\dce\db\connector\DbPoolProductionConfig`搭配工作。你可以自行查看源码了解更多。


