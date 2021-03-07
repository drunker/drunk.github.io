# 分库拓库

当分库数据量过大导致性能骤降、或为业务拓展做准备需要提升数据处理能力时，可能需要拓展分库数量。拓展分库需要移动数据，移动数据需要按照一定的规则，若手动操作很繁琐，所以作者出了这个专用来拓库的工具。

Dce分库中间件支持按模分库与按区间分库，按区间分库只需要增加分库及修改配置，无需移动数据，操作简单，所以未编写专门的工具作处理。本章介绍的工具是专门处理按模分库的拓库工具，工具以内置项目的形式封装与Dce中，暴露了一个cli接口，你仅需通过命令行访问这个接口，即可完成拓库。当然，拓库前你需要做一些准备工作，如配置拓库规则等，请继续往下看。


## 配置

拓库配置依赖分库配置，为了方便演示，本章将延续[上一章的配置](/sharding/db-middleware.svg#配置)，并在其基础上批量插入了40万条数据，均匀分布在两个分表，每个分表20万。后面示例将分库数量扩展为两倍，即4个库，并把数据迁移到新库表，迁移任务执行完后，每个分表的数据应该是10万。

```php {28-54}
return [
    'id_generator' => SplFixedArray::fromArray([]),
    'sharding' => new ArrayObject([
        'member' => [
            'type' => 'modulo',
            'db_type' => 'mysql',
            'cross_update' => true,
            'allow_joint' => true,
            'table' => [
                'member' => [
                    'id_column' => 'mid',
                ]
            ],
            'mapping' => [
                'default' => 0,
                'sharding_2' => 1,
            ],
        ],
    ]),
    'mysql' => new ArrayObject([
        'default' => [
            ...
        ],
        'sharding_2' => [
            ...
        ],
    ]),
    'sharding_extend' => new ArrayObject([ // 拓库配置
        'volume_per_transfer' => 2000, // 每次向扩展表平均迁移量
        'mapping' => [ // 分库规则映射拓展表
            'member' => [ // 分库别名
                'sharding_2_1' => 3, // 将别名为 sharding_2_1 的数据库映射为第 4 个分库, 按模运算余数为 3 时命中该分库
                'sharding_1_1' => 2,
            ],
        ],
        'database' => [ // 拓展库 (配置值格式与 mysql 配置值格式完全相同)
            'sharding_1_1' => [
                'label' => 'sharding_1_1',
                'host' => '192.168.1.222',
                'db_user' => 'root',
                'db_password' => 'drunk',
                'db_name' => 'sharding_1_1',
                'db_port' => 3306,
            ],
            'sharding_2_1' => [
                'label' => 'sharding_2_1',
                'host' => '192.168.1.222',
                'db_user' => 'root',
                'db_password' => 'drunk',
                'db_name' => 'sharding_2_1',
                'db_port' => 33065,
            ],
        ],
    ]),
];
```



## 拓库示例

### 统计现有数据

```php
Co\run(function () {
    $count1 = db(dbAlias: 'default')->query("select count(1) from member;")[0][0];
    $count2 = db(dbAlias: 'sharding_2')->query("select count(1) from member;")[0][0];
    $count = db('member')->count();
    testPoint($count1, $count2, $count);
});
/*
1-1    int(203643)
1-2    int(203644)
1-3    int(407287)
*/
// 可以看到目前两个分库各 20 万条记录
```

### 执行拓库脚本

Dce内置了按模分库拓库脚本，封装在内置项目`/project/dce`中，访问路径为`dce/sharding/extend`，执行前请先建好拓展库（无需建表），并且拓库配置已配好。

```bash {60}
ubuntu run podman run --rm -it -v /mnt/f/App/Mine/dce/backend/dce:/app idrunk/swoole /app/dce dce sharding extend

# [14:01:49] 扩展配置校验通过
# [14:01:49] 数据库已连接
# [14:01:50] 扩展表已就绪
# [14:01:50] 从源表sharding_2.member取出了4000条待处理数据...
# [14:01:50] 从源表default.member取出了4000条待处理数据...
# [14:01:50] 成功向sharding_1_1.member插入了2001条数据
# [14:01:51] 成功向sharding_2_1.member插入了2001条数据
# [14:01:51] 从源表sharding_2.member取出了4000条待处理数据...
# [14:01:51] 从源表default.member取出了4000条待处理数据...
# [14:01:51] 成功向sharding_1_1.member插入了2000条数据
# [14:01:51] 成功向sharding_2_1.member插入了2000条数据
# [14:01:52] 从源表sharding_2.member取出了4000条待处理数据...
# [14:01:52] 从源表default.member取出了4000条待处理数据...
# [14:01:52] 成功向sharding_1_1.member插入了2000条数据
# [14:01:52] 成功向sharding_2_1.member插入了2000条数据
# [14:01:52] 从源表sharding_2.member取出了4000条待处理数据...
# [14:01:52] 从源表default.member取出了4000条待处理数据...
# [14:01:53] 成功向sharding_1_1.member插入了2000条数据
# [14:01:53] 成功向sharding_2_1.member插入了2000条数据
# [14:01:53] 从源表sharding_2.member取出了4000条待处理数据...
# [14:01:53] 从源表default.member取出了4000条待处理数据...
# [14:01:53] 成功向sharding_1_1.member插入了2000条数据
# [14:01:54] 成功向sharding_2_1.member插入了1999条数据
# [14:01:54] 从源表sharding_2.member取出了4000条待处理数据...
# [14:01:54] 从源表default.member取出了4000条待处理数据...
# [14:01:54] 成功向sharding_1_1.member插入了2000条数据
# [14:01:54] 成功向sharding_2_1.member插入了2000条数据
# [14:01:54] 从源表sharding_2.member取出了4000条待处理数据...
# [14:01:55] 从源表default.member取出了4000条待处理数据...
# [14:01:55] 成功向sharding_1_1.member插入了1999条数据
# [14:01:55] 成功向sharding_2_1.member插入了2000条数据
# ...
# [14:02:24] 从源表sharding_2.member取出了4000条待处理数据...
# [14:02:24] 从源表default.member取出了4000条待处理数据...
# [14:02:25] 成功向sharding_1_1.member插入了1999条数据
# [14:02:25] 成功向sharding_2_1.member插入了1999条数据
# [14:02:25] 从源表sharding_2.member取出了4000条待处理数据...
# [14:02:25] 从源表default.member取出了4000条待处理数据...
# [14:02:26] 成功向sharding_1_1.member插入了2000条数据
# [14:02:26] 成功向sharding_2_1.member插入了2000条数据
# [14:02:26] 从源表sharding_2.member取出了4000条待处理数据...
# [14:02:26] 从源表default.member取出了4000条待处理数据...
# [14:02:26] 成功向sharding_1_1.member插入了2000条数据
# [14:02:27] 成功向sharding_2_1.member插入了2000条数据
# [14:02:27] 从源表sharding_2.member取出了4000条待处理数据...
# [14:02:27] 从源表default.member取出了4000条待处理数据...
# [14:02:27] 成功向sharding_1_1.member插入了2000条数据
# [14:02:28] 成功向sharding_2_1.member插入了2000条数据
# [14:02:28] 从源表sharding_2.member取出了4000条待处理数据...
# [14:02:28] 从源表default.member取出了4000条待处理数据...
# [14:02:28] 成功向sharding_1_1.member插入了2000条数据
# [14:02:28] 成功向sharding_2_1.member插入了2000条数据
# [14:02:28] 从源表sharding_2.member取出了3658条待处理数据...
# [14:02:29] 从源表default.member取出了3657条待处理数据...
# [14:02:29] 成功向sharding_1_1.member插入了1829条数据
# [14:02:29] 成功向sharding_2_1.member插入了1828条数据
# [14:02:29] 拓展库数据迁移完毕
# [14:02:29] 请应用扩展配置, 应用完毕输入yes并回车继续: yes
# [14:02:49] 从源表sharding_2.member取出了1条待处理数据...
# [14:02:49] 拓展库数据迁移完毕
# [14:02:50] 成功从sharding_2_1.member删除了0条拓表冗余数据
# [14:02:50] 成功从sharding_1_1.member删除了0条拓表冗余数据
# [14:02:50] 成功从sharding_2.member删除了101821条拓表冗余数据
# [14:02:51] 成功从default.member删除了101824条拓表冗余数据
# [14:02:51] 源冗余数据清除完毕
# [14:02:51] 分库拓展完毕!
```

脚本启动后，若配置无异常，则会进入数据迁移过程，直到迁移完毕。脚本可以随时终止，再次执行时，会继续上次的位置继续迁移。数据迁移完毕后，需要你手动的更新分库规则配置，将拓库配置追加到分库配置中，可见下面的样例。配置更新完后，输入yes继续执行，清除已迁移到新库的冗余数据。当然，你也可以直接退出脚本，自行手动清除（`DELETE FROM {$tableName} WHERE ({$shardingConfig->shardingIdColumn} >> {$serverBitWidth}) % {$shardingConfig->targetModulus} > {$remainder}`）。

更新分库配置
```php {17-18,29-44}
return [
    'id_generator' => SplFixedArray::fromArray([]),
    'sharding' => new ArrayObject([
        'member' => [
            'type' => 'modulo',
            'db_type' => 'mysql',
            'cross_update' => true,
            'allow_joint' => true,
            'table' => [
                'member' => [
                    'id_column' => 'mid',
                ]
            ],
            'mapping' => [
                'default' => 0,
                'sharding_2' => 1,
                'sharding_2_1' => 3,
                'sharding_1_1' => 2,
            ],
        ],
    ]),
    'mysql' => new ArrayObject([
        'default' => [
            ...
        ],
        'sharding_2' => [
            ...
        ],
        'sharding_1_1' => [
            'label' => 'sharding_1_1',
            'host' => '192.168.1.222',
            'db_user' => 'root',
            'db_password' => 'drunk',
            'db_name' => 'sharding_1_1',
            'db_port' => 3306,
        ],
        'sharding_2_1' => [
            'label' => 'sharding_2_1',
            'host' => '192.168.1.222',
            'db_user' => 'root',
            'db_password' => 'drunk',
            'db_name' => 'sharding_2_1',
            'db_port' => 33065,
        ],
    ]),
//    'sharding_extend' => new ArrayObject(), 拓库更新配置后可以删掉拓库配置了
];
```

::: warning 注意
拓库过程请停掉业务服务，直到全部转移完再开启。如果不停止，可能会出现数据异常回档问题，如迁移的数据，在未正式更新分库配置前，查询仍然会被路由向源分库，导致迁移到新库的数据变旧的问题。所以，如果你使用本脚本拓库，请务必先停止对外业务支持，仅允许拓库。
:::


### 校验迁移结果

拓库完毕后检查迁移结果，可以看到原本两个库的数据被拓展迁移到了四个库中，且数据没有丢失，总量与拓库前能够对应，拓库成功。

```php
Co\run(function () {
    $count1 = db(dbAlias: 'default')->query("select count(1) from member;")[0][0];
    $count2 = db(dbAlias: 'sharding_2')->query("select count(1) from member;")[0][0];
    $count3 = db(dbAlias: 'sharding_1_1')->query("select count(1) from member;")[0][0];
    $count4 = db(dbAlias: 'sharding_2_1')->query("select count(1) from member;")[0][0];
    $count = db('member')->count();
    testPoint($count1, $count2, $count3, $count4, $count);
});
/*
1-1    int(101819)
1-2    int(101823)
1-3    int(101824)
1-4    int(101821)
1-5    int(407287)
*/
```