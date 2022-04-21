# 概述

数据库操作是网络编程中非常重要的部分，DCE在与数据库交互的开发比重也是最重的，占了整个框架近一半的代码量。DCE提供了丰富的数据库操作支持，其中最亮点的特性则是编写了 ~~分库中间件~~，提供了对分布式数据库的读写及简易维护支持。DCE封装了非常灵活且简洁的数据库查询支持，你可以通过查询器拼装各种复杂的查询语句，具体见下述示例及后续章节。


## 普通示例

（目前仅支持MySql，但在设计DCE时考虑了对其他数据库的支持，所以后续若需支持其他数据库，也可以很方便的扩展开发。）


### 数据库配置

单库版配置
```php
'mysql' => [
    'host' => '127.0.0.1', // 主机地址
    'db_user' => 'root', // 数据库用户名
    'db_password' => 'password', // 数据库密码
    'db_name' => 'default_db', // 数据库名
    'db_port' => 3306, // 数据库端口
    'max_connection' => 8, // 最大连接数
],
```

多库版配置
```php
'mysql' => [
    'default' => [ // 数据库别名 (上述的单库版在实例化为对象时会自动格式化为default别名的配置，该别名的库为默认查询库，不指定库查询时会查询改配置的库)
        'host' => '127.0.0.1', // 主机地址
        'db_user' => 'root', // 数据库用户名
        'db_password' => 'password', // 数据库密码
        'db_name' => 'default_db', // 数据库名
        'db_port' => 3306, // 数据库端口
        'max_connection' => 8, // 最大连接数
    ],
    'db2' => [ // 数据库别名
        'host' => '127.0.0.1',
        'db_user' => 'root',
        'db_password' => 'password',
        'db_name' => 'other_db',
        'db_port' => 33065,
        'max_connection' => 8,
    ],
],
```


### 查询器查询

```php
// 增
$id = (new \dce\db\Query())->table('article')->insert(['title'=>'DCE是啥?', 'content'=>'DCE是一款网络编程开发框架']);
// 删
$affecteds = (new \dce\db\Query())->table('article')->where('id', 1)->delete();
// 查
$list = (new \dce\db\Query())->table('article')->where([['mid', 10000], ['create_time', 'between', ['2021-01-01', '2021-01-31 23:59:59']]])->select();
// 改
$affecteds = (new \dce\db\Query())->table('article')->where('id', 1)->update(['title'=>'DCE是啥']);
// 指定非默认库查询
$article = (new \dce\db\Query('db2'))->table('article')->where(['id', '=', 1])->find();
```


### 快捷方法查询


使用查询器类查询时需要较长的编码，为了简化编码设计了快捷方法实例化查询器对象

#### `db()`
快捷实例化查询器类的方法

- 参数
  - `string|null $tableName` 待查表名
  - `string|null $alias` 表别名
  - `string|null $dbAlias` 目标库别名

- 返回`\dce\db\Query`


#### `raw()`
快捷实例化原始语句类的方法

::: tip
为了防止SQL注入，DCE对字段名数据值等做了严格语法校验，但有时我们的查询语句较复杂，并且确定是安全的，却无法通过校验，于是DCE设计了原始语句类，凡是该对象包装的语句，不会被语法校验，方便你编写复杂的查询语句。

当然，首先你需确保使用此方法包装的语句是绝对安全的，否则将可能得不偿失
:::

- 参数
  - `string $sql` 需包装的原始语句
  - `bool $autoParenthesis = true` 是否用小括号包装
  - `array $params = []` 占位符对应值的映射表

- 返回`\dce\db\query\builder\RawBuilder`


#### 示例

```php
// 增
$id = db('article')->insert(['title'=>'DCE是啥?', 'content'=>'DCE是一款网络编程开发框架']);
// 删
$affecteds = db('article')->where('id', 1)->delete();
// 查
$list = db('article')->where([['mid', 10000], ['create_time', 'between', ['2021-01-01', '2021-01-31 23:59:59']]])->select();
// 改
$affecteds = db('article')->where('id', 1)->update(['title'=>'DCE是啥']);
// 指定非默认库查询
$article = db('article', dbAlias: 'db2')->where(['id', '=', 1])->find();
// 自增查询 (使用raw方法包装表达式式右值)
$affecteds = db('article')->where('id', 1)->update(['hits'=>raw('hits + 1')]);
// 复杂查询
$list = db('article', 'a')->join('member', 'm', ['a.mid', raw('m.mid')])->where([
    ['a.is_deleted', 0], // 省略'='比较符
    [
        ['a.hits', '>', 10000],
        'or',
        ['m.vip', '>', 0],
    ],
    'and', // 'and'逻辑符可省略
    ['exists', raw('SELECT 1 FROM activity WHERE mid = m.mid LIMIT 1')] // 无左值比较表达式
])->order('a.hits', 'desc')->limit(10, 0)->select('a.*, m.name member_name', 'id', isAutoRaw: true);
```


### 活动记录式查询

#### 定义表实体

```php
<?php
namespace tests\model;

use dce\db\active\DbActiveRecord;
use dce\db\entity\DbField;
use dce\db\entity\schema\FieldType;
use dce\model\Property;
use dce\model\Validator;

/**
 * Class Member
 * @package tests\model
 * @property MemberGroup $group
 * @property MemberTag[] $memberTags
 * @property Tag[] $tags
 */
class Member extends DbActiveRecord {
    public const SCENARIO_REGISTER = 'register';

    #[ Property('用户ID'), DbField(FieldType::BIGINT, primary: true, increment: true), ]
    public int $mid;

    #[ Property('分组ID'), DbField(FieldType::TINYINT), Validator(Validator::RULE_INTEGER), ]
    public int $groupId;

    #[ Property('用户名'), DbField(FieldType::VARCHAR, 16),
        Validator(Validator::RULE_STRING, [self::SCENARIO_DEFAULT, self::SCENARIO_REGISTER], max: 16, min: 3),
        Validator(Validator::RULE_REQUIRED, self::SCENARIO_REGISTER), 
    ]
    public string $username;

    #[ Property('密码'), DbField(FieldType::VARCHAR, 128), ]
    public string $password;

    #[ Property('注册时间'), DbField(FieldType::DATETIME), Validator(Validator::RULE_DATETIME), ]
    public string $registerTime;

    public function getGroup() {
        return $this->hasOne(MemberGroup::class, ['id' => 'group_id']);
    }

    public function getMemberTags() {
        return $this->hasMany(MemberTag::class, ['mid' => 'mid']);
    }

    public function getTags() {
        return $this->hasMany(Tag::class, ['id' => 'tag_id'], 'memberTags');
    }
}
```

#### 查询示例

```php
// 增
$member = new Member(Member::SCENARIO_REGISTER);
$member->username = 'Drunk';
$member->password = sha1('123456');
$member->registerTime = date('Y-m-d H:i:s');
$member->insert();
// 删
$affecteds = Member::find(1)->delete();
// 查
$list = Member::query()->where('group_id', 1)->select();
// 改
$member = Member::find(1);
$member->password = sha1('654321');
$member->update();
// 取关系数据
$member = Member::find(1);
$tags = $member->tags;

// 指定非默认库查询
// 在Member类中定义方法
class Member extends DbActiveRecord {
    public function getProxy(): string|DbProxy|null {
        return 'db2';
    }
}
// 然后Member对象的操作目标库则为'db2'
$member = Member::find(1);
```


## 分库示例


### 分库配置

```php
<?php
return [    
    'id_generator' => [ // ID生成器配置
        'client_rpc_hosts' => [],
    ],
    'mysql' => [ // 数据库配置
        'default' => [
            'host' => '127.0.0.1',
            'db_user' => 'root',
            'db_password' => 'password',
            'db_name' => 'default_db',
            'db_port' => 3306,
            'max_connection' => 8,
        ],
        '22:3306' => [
            [
                'label' => '22:3306',
                'host' => '127.0.0.1',
                'db_user' => 'root',
                'db_password' => 'password',
                'db_name' => 'sharding_db',
                'db_port' => 3306,
                'is_master' => 1, // 是否主库
            ],
        ],
        '22:33065' => [
            [
                'label' => '22:33065',
                'host' => '127.0.0.1',
                'db_user' => 'root',
                'db_password' => 'password',
                'db_name' => 'sharding_db',
                'db_port' => 33065,
            ],
        ],
    ],
    'sharding' => [ // 分库规则配置
        'member' => [ // 分库别名
            'db_type' => 'mysql',
            'type' => 'modulo', // 按模查询
            'cross_update' => true, // 是否允许跨库更新
            'allow_joint' => true, // 是否允许联表查询
            'table' => [
                'member' => [
                    'id_column' => 'mid', // 未配置sharding_column时将以id_column作为分库字段
                    'id_tag' => 'mid',
                ],
                'member_login' => [
                    'id_column' => 'id', // 若配置了id_column字段, 则将使用生成器生成ID, 若同时配置了sharding_column, 则该字段将作为ID的基因字段
                    'id_tag' => 'mlid',
                    'sharding_column' => 'mid', // 若未配置id_column字段, 则将不主动生成ID, 分库将仅以sharding_column字段划分
                    'sharding_tag' => 'mid'
                ],
            ],
            'mapping' => [ // 分库规则映射表
                '22:3306' => 0,
                '22:33065' => 1,
            ],
        ],
    ],
];
```

### 分库查询

分库查询和非分库查询的方式完全一样，支持查询器方式、快捷方式及活动记录式查询，只要待查的目标表命中分库配置的表，且查询语句符合分库查询的条件，则会自动进行分库查询并合并结果。分库查询时无法指定目标库查询，只要你的目标表配置为了分库表，则会强制分库查询，如果查询语句不符合分库查询条件则会抛出异常。

要熟练使用分库查询你需要弄清分库查询原理，需要懂得ID生成器及其配置，及分库配置。分库查询有一些限制，如对事务的支持不完整，如连表查询的限制等。对于事务，你可以通过友好的分库规则设计避免，或者自己通过程序逻辑实现；对于连表查询，你也可以通过友好的设计避免，或者可以使用活动记录的关系数据特性弥补，或者自己编写程序代码补充数据。但这些需要你对分库原理有较好的认识，你可以从后续的章节深入的学习理解DCE ~~分库中间件~~。