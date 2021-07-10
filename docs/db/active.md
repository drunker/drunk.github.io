# 活动记录

活动记录定义了一个抽象类，该抽象类继承于[模型类](/model)，类中定义了一些与数据库表交互的接口方法。你可以定义一个与数据表对应的类继承活动记录类，从而通过读写类实例来操作数据表记录。


## \dce\db\active\ActiveRecord;

活动记录抽象类

定义数据表实体类（后续示例若无特殊说明，则表示已此类为基础模型类）
```php
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

```php
namespace tests\model;

use dce\db\active\DbActiveRecord;
use dce\db\entity\DbField;
use dce\db\entity\schema\FieldType;
use dce\model\Property;
use dce\model\Validator;

class MemberBadge extends DbActiveRecord {
    #[ Property, DbField(FieldType::TINYINT, primary: true, increment: true), ]
    public int $id;

    #[ Property('徽章名'), DbField(FieldType::VARCHAR, 15),
        Validator(Validator::RULE_STRING, max: 15),
        Validator(Validator::RULE_REQUIRED),
    ]
    public string $name;

    #[ Property('备注'), DbField(FieldType::VARCHAR), Validator(Validator::RULE_STRING, max: 31), ]
    public string $memo;

    #[ Property('添加时间'), DbField(FieldType::DATETIME), Validator(Validator::RULE_DATETIME), ]
    public string $createTime;
}
```

::: danger 警告
请不要对字段型类属性设置默认值，这将可能导致利用活动记录更新数据库时，真实业务数据被更新为此默认值。如果需要插入时自动补充默认值，请使用[默认值赋值器](../model/validator.md#dce-model-validator-assignment-defaultvalidator)实现。
:::


### `->getPkValues()`
取主键值集

- 返回`int[]|string[]`

- 示例
```php
$member = Member::find(410011121441111);
test($member->getPkValues());
/*
1-1    array(1) {
         ["mid"] => int(410011121441111)
       }
*/
```


### `->setQueriedProperties()`
初始化查询结果活动记录实例（对新实例属性赋值）

- 参数
  - `array $properties` 模型属性键值表

- 返回`void`


### `->isCreateByQuery()`
判断当前实例是否查询结果实例

- 返回`bool`

- 示例
```php
$member = Member::find(410011121441111);
$member2 = new Member();
test(
    $member->isCreateByQuery(),
    $member2->isCreateByQuery(),
);
/*
1-1    bool(true)
1-2    bool(false)
 */
```


### `->save()`
保存数据（插入或更新数据库）

- 返回`int|string`
  - `插入` 新插入记录的ID
  - `更新` 改变的记录数

- 示例
```php
$memberBadge = new MemberBadge();
$memberBadge->name = 'VIP3';
$memberBadge->memo = 'VIP3等级的贵宾';
$memberBadge->createTime = date('Y-m-d H:i:s');
test($memberBadge->save());
// 1-1    string(1) "4"
```


### `->delete()`
删除数据库记录

- 返回`int` 影响的记录数

- 示例
```php
$memberBadge = MemberBadge::find(4);
test($memberBadge->delete());
// 1-1    int(1)
```


### `->hasOne()`
构建一对一关联数据查询器

- 参数
  - `string $className` 关联表模型类名
  - `array $relationMap` 与关联表的关系字段映射表
  - `string|null $viaRelationName = null` 中间关联关系名

- 返回`\dce\db\active\ActiveRelation`

- 示例
```php {7}
// 主体类
class Member extends DbActiveRecord {
    // ...

    // 定义获取关联数据的方法
    public function getLogin() {
        return $this->hasOne(MemberLogin::class, ['mid' => 'mid']);
    }
}

// 惰性获取关联数据
$member = Member::find(410011121441111);
test(
    $member->login->extractProperties(),
);
/*
1-1    array(8) {
         ["id"] => int(1000)
         ["mid"] => int(410011121441111)
         ["type"] => int(1)
         ["terminal"] => int(1)
         ["login_date"] => string(10) "2021-01-27"
         ["last_login_date"] => string(10) "1970-01-01"
         ["is_silent"] => int(0)
         ["create_time"] => string(19) "2021-01-27 19:08:00"
       }
*/
```


### `->hasMany()`
构建一对多关联数据查询器

- 参数
  - `string $className` 关联表模型类名
  - `array $relationMap` 与关联表的关系字段映射表
  - `string|null $viaRelationName = null` 中间关联关系名

- 返回`\dce\db\active\ActiveRelation`

- 示例
```php {7,11}
// 主体类
class Member extends DbActiveRecord {
    // ...

    // 定义获取关联数据的方法
    public function getBadgeMap() {
        return $this->hasMany(MemberBadgeMap::class, ['mid' => 'mid']);
    }

    public function getBadge() {
        return $this->hasMany(MemberBadge::class, ['id' => 'mb_id'], 'badgeMap');
    }
}

// 惰性获取关联数据
$member = Member::find(410011121441111);
foreach ($member->badge as $badge) {
    testPoint($badge->extractProperties());
}
/*
1-1    array(4) {
         ["id"] => int(1)
         ["name"] => string(4) "VIP1"
         ["memo"] => string(19) "VIP1等级的贵宾"
         ["create_time"] => string(19) "2021-01-27 19:09:39"
       }

2-1    array(4) {
         ["id"] => int(2)
         ["name"] => string(4) "VIP2"
         ["memo"] => string(19) "VIP2等级的贵宾"
         ["create_time"] => string(19) "2021-01-27 19:09:45"
       }

3-1    array(4) {
         ["id"] => int(3)
         ["name"] => string(4) "VIP3"
         ["memo"] => string(19) "VIP3等级的贵宾"
         ["create_time"] => string(19) "2021-01-27 19:09:51"
       }
 */
```


### `->begin()`
开启事务

- 返回`\dce\db\proxy\Transaction`

- 示例
```php
$memberBadge = new MemberBadge();
$memberBadge->name = 'VIP3';
$memberBadge->memo = 'VIP3等级的贵宾';
$memberBadge->createTime = date('Y-m-d H:i:s');
$transaction = $memberBadge::begin();
if ($insertId = $memberBadge->save()) {
    $transaction->commit();
} else {
    $transaction->rollback();
}
test($insertId);
// 1-1    string(1) "5"
```


### `::getTableName()`
取表名（子类可覆盖指定表名）

- 返回`string`

- 示例
```php
test(Member::getTableName());
// 1-1    string(6) "member"
```


### `::query();`
取新的活动记录查询器实例

- 返回`\dce\db\active\ActiveQuery`

- 示例
```php
$query = Member::query();
```


### `->insert();`
向数据库插入数据

- 返回`int|string`

- 示例
```php
$member->insert();
```


### `->update();`
将当前对象更新到数据库

- 返回`int`

- 示例
```php
$member->update();
```



## \dce\db\active\DbActiveRecord;

数据表活动记录抽象类


### `->fieldClass`
`string` 字段类名，用于实现注解字段

### `->find()`
筛选一条数据库数据，转为活动记录对象并返回

- 参数
  - `int|string|array|RawBuilder|WhereSchema $whereCondition` 查询条件，同`\dce\db\Query::where(columnName)`

- 返回`static|false`

- 示例
```php
$memberBadge = MemberBadge::find(1);
test($memberBadge->id, $memberBadge->extractProperties());
/*
1-1    int(1)
1-2    array(4) {
         ["id"] => int(1)
         ["name"] => string(4) "VIP1"
         ["memo"] => string(19) "VIP1等级的贵宾"
         ["create_time"] => string(19) "2021-01-27 19:09:39"
       }
*/
```


### `->insert()`
向数据库插入数据


### `->update()`
将当前对象更新到数据库


### `->updateCounter()`
计数器更新

- 参数
  - `string|array $fieldName`
  - `int|float $increment = 1`

- 返回`int`

- 示例
```php
$memberBadge = MemberBadge::find(5);
test($memberBadge->updateCounter('id'), MemberBadge::find(6)->id);
/*
1-1    int(1)
1-2    int(6)
 */
```


### `::getProxy()`
指定目标库或设定查询代理器（活动记录类默认使用默认代理查询默认库，你可以在实体类中定义覆盖此方法用指定代理器查询指定库）

- 返回`string|DbProxy|null`

- 示例
```php {4-7}
class Member extends DbActiveRecord {
    // ...

    public static function getProxy() {
        // 指定查询别名为db2的库
        return 'db2',
    }
}

// 此时将向别名为db2的库发起查询而不是default库
$member = Member::find(1);
```


### `::query()`
取新的活动记录查询器实例

- 返回`\dce\db\active\DbActiveQuery`

- 示例
```php
$query = MemberBadge::query();
$list = $query->arrayify()->select();
test($list);
/*
1-1    array(4) {
         [0] => array(4) {
           ["id"] => int(1)
           ["name"] => string(4) "VIP1"
           ["memo"] => string(19) "VIP1等级的贵宾"
           ["create_time"] => string(19) "2021-01-27 19:09:39"
         }
         [1] => array(4) {
           ["id"] => int(2)
           ["name"] => string(4) "VIP2"
           ["memo"] => string(19) "VIP2等级的贵宾"
           ["create_time"] => string(19) "2021-01-27 19:09:45"
         }
         [2] => array(4) {
           ["id"] => int(3)
           ["name"] => string(4) "VIP3"
           ["memo"] => string(19) "VIP3等级的贵宾"
           ["create_time"] => string(19) "2021-01-27 19:09:51"
         }
 */
```


### `::getPkFields()`
取数据表主键集

- 返回`string[]`

- 示例
```php
$pks = MemberBadge::getPkFields();
test($pks);
/*
1-1    array(1) {
         [0] => string(2) "id"
       }
 */
```



## \dce\db\active\ActiveQuery;

活动记录查询器


### `->with()`
设置即时加载关联数据

查询列表时可能也需要取其关联数据，若通过遍历惰性的取关联数据，则会多次发起查询请求，造成资源浪费，通过with方法设置需取的关系后，会在select时一次性将所有关系数据查询出来，减少查询请求从而提高性能

- 参数
  - `string ... $relationNames` 需即时加载的关系集

- 返回`static`

- 示例
```php
$members = Member::query()->with('login')->select();
$logins = array_column($members, 'login');
test($logins);
/* 可以看到一次性将关联的login数据全部查了出来
1-1    array(3) {
         [0] => object(tests\model\MemberLogin)#95 (13) {
           ["id"] => int(1000)
           ["mid"] => int(410011121441111)
           ["type"] => int(1)
           ["terminal"] => int(1)
           ["loginDate"] => string(10) "2021-01-27"
           ["lastLoginDate"] => string(10) "1970-01-01"
           ["isSilent"] => int(0)
           ["createTime"] => string(19) "2021-01-27 19:08:00"
           ["createByQuery":"dce\db\active\ActiveRecord":private] => bool(true)
           ["originalProperties":"dce\db\active\ActiveRecord":private] => array(8) {
             ["id"] => int(1000)
             ["mid"] => int(410011121441111)
             ["type"] => int(1)
             ["terminal"] => int(1)
             ["login_date"] => string(10) "2021-01-27"
             ["last_login_date"] => string(10) "1970-01-01"
             ["is_silent"] => int(0)
             ["create_time"] => string(19) "2021-01-27 19:08:00"
           }
           ["activeQuery":protected] => NULL
           ["getterValues":"dce\model\Model":private] => array(0) {
           }
           ["scenario":"dce\model\Model":private] => string(7) "default"
         }
         [1] => NULL
         [2] => NULL
       }
 */
```

:::warning
注意，通过此方式查询数据时，会一次性将所有关联数据全部查出，所以如果关联数据量比较大，则不适合此即时查询，这种情况下通过遍历惰性限量查询性能更佳。
```php {8}
// 主体类
class Member extends DbActiveRecord {
    // ...

    // 定义获取关联数据的方法
    public function getLogin() {
        $relation = $this->hasOne(MemberLogin::class, ['mid' => 'mid']);
        $relation->getActiveQuery()->limit(1); // 限量查询
        return $relation;
    }
}

$members = Member::query()->select();
foreach ($members as $member) {
    if ($member->login) {
        testPoint($member->login->extractProperties());
    }
}
/*
1-1    array(8) {
         ["id"] => int(1000)
         ["mid"] => int(410011121441111)
         ["type"] => int(1)
         ["terminal"] => int(1)
         ["login_date"] => string(10) "2021-01-27"
         ["last_login_date"] => string(10) "1970-01-01"
         ["is_silent"] => int(0)
         ["create_time"] => string(19) "2021-01-27 19:08:00"
       }
 */
```
:::


### `->arrayify()`
设置按数组返回查询结果而非活动记录对象

- 返回`static`

- 示例
```php
$memberBadges = MemberBadge::query()->limit(1)->arrayify()->select();
test($memberBadges);
/*
1-1    array(1) {
         [0] => array(4) {
           ["id"] => int(1)
           ["name"] => string(4) "VIP1"
           ["memo"] => string(19) "VIP1等级的贵宾"
           ["create_time"] => string(19) "2021-01-27 19:09:39"
         }
       }
 */
```


### `->__construct();`

- 参数
  - `DbActiveRecord $activeRecord`


### `->getActiveRecord();`
取活动记录实例

- 返回`\dce\db\active\ActiveRecord`



## \dce\db\active\DbActiveQuery

数据库活动记录查询器


### `->getActiveRecord()`
取活动记录实例


### `->where()`
设置Where条件

- 参数
  - `string|array|RawBuilder|WhereSchema $columnName` 条件字段名，同[查询器->where方法](/db/query.md#where)
  - `string|int|float|false|RawBuilder|SelectStatement $operator = false` 条件比较运算符，同[查询器->where方法](/db/query.md#where)
  - `string|int|float|array|false|RawBuilder|SelectStatement $value = false` 条件比较值，同[查询器->where方法](/db/query.md#where)

- 返回`self`

- 示例
```php
Member::query()->where('mid', 1);
```


### `->order()`
设置排序规则

- 参数
  - `string|array|RawBuilder $columnName` 排序列，同[查询器->where方法](/db/query.md#order)
  - `string|null $order = null` 排序方式，同[查询器->where方法](/db/query.md#order)

- 返回`self`

- 示例
```php
Member::query()->order('mid');
```


### `->limit()`
设置记录截取量

- 参数
  - `int $limit` 截取条数
  - `int $offset = 0` 起始截取偏移量

- 返回`self`

- 示例
```php
Member::query()->limit(10);
```


### `->select()`
多记录查询实例化结果集并返回

- 参数
  - `string|RawBuilder|null $indexColumn = null` 以此字段作为查询结果数组下标

- 返回`ActiveRecord[]`

- 示例
```php
$memberBadges = MemberBadge::query()->arrayify()->select('id');
test($memberBadges);
/*
1-1    array(5) {
         [1] => array(4) {
           ["id"] => int(1)
           ["name"] => string(4) "VIP1"
           ["memo"] => string(19) "VIP1等级的贵宾"
           ["create_time"] => string(19) "2021-01-27 19:09:39"
         }
         [2] => array(4) {
           ["id"] => int(2)
           ["name"] => string(4) "VIP2"
           ["memo"] => string(19) "VIP2等级的贵宾"
           ["create_time"] => string(19) "2021-01-27 19:09:45"
         }
         [3] => array(4) {
           ["id"] => int(3)
           ["name"] => string(4) "VIP3"
           ["memo"] => string(19) "VIP3等级的贵宾"
           ["create_time"] => string(19) "2021-01-27 19:09:51"
         }
         [6] => array(4) {
           ["id"] => int(6)
           ["name"] => string(4) "VIP3"
           ["memo"] => string(19) "VIP3等级的贵宾"
           ["create_time"] => string(19) "2021-01-31 18:24:44"
         }
       }
 */
```


### `->each()`
多记录查询，返回迭代器，遍历时实例化为活动记录对象

- 返回`\Iterator`

- 示例
```php
$iterator = MemberBadge::query()->arrayify()->limit(2)->each();
foreach ($iterator as $memberBadge) {
    testPoint($memberBadge);
}
/*
1-1    array(4) {
         ["id"] => int(1)
         ["name"] => string(4) "VIP1"
         ["memo"] => string(19) "VIP1等级的贵宾"
         ["create_time"] => string(19) "2021-01-27 19:09:39"
       }

2-1    array(4) {
         ["id"] => int(2)
         ["name"] => string(4) "VIP2"
         ["memo"] => string(19) "VIP2等级的贵宾"
         ["create_time"] => string(19) "2021-01-27 19:09:45"
       }
 */
```


### `->find()`
筛选一条数据库数据，转为活动记录对象并返回

- 返回`ActiveRecord|array|false`

- 示例
```php
$memberBadge = MemberBadge::query()->arrayify()->limit(2)->find();
test($memberBadge);
/*
1-1    array(4) {
         ["id"] => int(1)
         ["name"] => string(4) "VIP1"
         ["memo"] => string(19) "VIP1等级的贵宾"
         ["create_time"] => string(19) "2021-01-27 19:09:39"
       }
 */
```


### `->insert()`
向数据库插入数据（建议通过[活动记录](/db/active.md#insert-2)执行，而不是查询器）


### `->update()`
更新筛选的数据（建议通过[活动记录](/db/active.md#update-2)执行，而不是查询器）


### `->delete()`
删除筛选中的数据（建议通过[活动记录](/db/active.md#delete)执行，而不是查询器）


### `->begin()`
开启事务（建议通过[活动记录](/db/active.md#begin)执行，而不是查询器）



## \dce\db\active\ActiveRelation

活动记录关联数据查询器


### `->getActiveQuery()`
取活动记录查询器

- 返回`\dce\db\active\ActiveQuery`

- 示例
```php {5}
class Member extends DbActiveRecord {
    public function getLogin() {
        $relation = $this->hasOne(MemberLogin::class, ['mid' => 'mid']);
        // 取活动记录查询器
        $activeQuery = $relation->getActiveQuery();
        $activeQuery->limit(1);
        return $relation;
    }
}
```


*下述方法在活动记录相关类中自动调用，无需手动调用*

### `->hasOne()`
设为一对一关联关系


### `->isHasOne()`
是否一对一查询


### `->screen()`
查询数据库


### `->setMapping()`
设置关联关系映射表


### `->getMapping()`
取关联关系映射表


### `->getVia()`
取中间关系名