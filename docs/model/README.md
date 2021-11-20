# 模型

## \dce\model\Model;

模型类是数据实体的基类，区别于`\dce\model\TraitModel`，Model类是抽象类，集成了校验器及更多其他接口方法，可以基于这些特性封装灵活强大的数据实体类（如活动记录）


### `::SCENARIO_DEFAULT`
默认场景名常量


### `->fieldClass`
`string` 注解字段类名（在实体类中定义，用于实现注解字段）



### `->__construct()`

- 参数
  - `private string $scenario = self::SCENARIO_DEFAULT` 设置当前场景名


### `->apply()`
应用模型属性值

- 参数
  - `array|ArrayAccess $properties` 待赋值属性键值表
  - `string $coverType = self::COVER_TYPE_REPLACE` 是否清空待赋值属性键之外的属性值
    - `COVER_TYPE_UNSET` unset掉默认值
    - `COVER_TYPE_REPLACE` 若属性已存在则替换
    - `COVER_TYPE_IGNORE` 若属性已存在则忽略

- 返回`$this`


### `->extract()`
提取模型属性键值表

- 参数
  - `bool $toDbKey = true` 是否已蛇底命名键返回
  - `mixed $null = null` 视为无效值的比对值（若属性为该值，将不返回）

- 返回`array`


### `::toModelKey()`
将数据库数据转为Model对象时默认以小驼峰方式命名属性名

- 参数
  - `string $key` 属性名

- 返回`string`

- 示例
```php
test(Model::toModelKey('key_name'));
// 1-1    string(7) "keyName"
```


### `::toDbKey()`
将Model对象转为数据库数据时默认以蛇底方式命名字段名

- 参数
  - `string $key` 属性名

- 返回`string`

- 示例
```php
test(Model::toDbKey('keyName'));
// 1-1    string(8) "key_name"
```


### `->setScenario()`
设置当前场景名

- 参数
  - `string $scenario`

- 返回`$this`


### `->valid()`
校验当前模型属性值

- 返回`$this`

- 示例
```php
class ChildModel extends Model {
    #[ Property, Validator(Validator::RULE_INTEGER, max: 100), Validator(Validator::RULE_SET, ['default', 'login'], set: [[1, 2, 3], '非法字段']), ]
    public int $field1;

    #[ Property, Validator(Validator::RULE_SET, ['default', 'login'], set: [[1, 2, 3], '非法字段']), ]
    public int $field2;
}
$model = new ChildModel('default');
$model->field1 = 2;
$model->field2 = 1;
$model->valid();
testPoint($model->extractProperties());
/*
1-1    array(2) {
         ["field1"] => int(2)
         ["field2"] => int(1)
       }
 */

$model->field2 = 100;
$model->valid();
/*
1-1    string(38) "dce\model\validator\ValidatorException"
1-2    string(19) "Code:0 非法字段"
 */
```


### `->correct()`
根据模型属性校验器配置修正并校验数据

- 参数
  - `array|scalar|Model $value` 待校验数据或模型
  - `string $prop` 对应模型属性名
  - `mixed|Validator::RULE_*` $rule 适用规则，默认全规则
  - `mixed|static::SCENARIO_* $scenario` 适用场景，默认全场景

- 返回`void`


### `->getProperties()`
取实例类的模型属性实例表

- 返回`Property[]`


### `->getProperty()`
根据属性名取属性实例

- 参数
  - `string $name` 属性名

- 返回`Property|null`


### `->__get()`
魔术方法，处理getter

- 参数
  - `string $name`

- 返回`mixed`

- 示例
```php
class ChildModel extends \dce\model\Model {
    public function getPartner() {
        return 'The partner';
    }
}
$model = new ChildModel;
test($model->partner);
// 1-1    string(11) "The partner"
```


### `->callGetter()`
调用getter方法

- 参数
  - `string $name` 属性名
  - `bool $throwable = false` 是否抛出未定义的异常

- 返回`bool|mixed`

- 示例
```php
class ChildModel extends \dce\model\Model {
    public function getPartner() {
        return 'The partner';
    }
}
$model = new ChildModel;
test($model->callGetterMethod('partner'));
// 1-1    string(11) "The partner"
```


### `->handleGetter()`
处理getter方法返回值（主用于实现活动记录取关联数据）

- 参数
  - `string $name` 属性名
  - `mixed $value` getter方法返回值

- 返回`mixed`

- 示例
```php
class ChildModel extends \dce\model\Model {
    protected function handleGetter(string $name, mixed $value): mixed {
        return strtoupper($value);
    }

    public function getPartner() {
        return 'The partner';
    }
}
$model = new ChildModel;
test($model->partner);
// 1-1    string(11) "THE PARTNER"
```


### `->setGetterValue()`
缓存getter值

- 参数
  - `string $name` 属性名
  - `mixed $value` getter方法返回值

- 返回`$this`


### `->getGetterValue()`
取getter缓存值

- 参数
  - `string $name`

- 返回`mixed|null`


### `->hasGetterValue()`
判断相应getter是否已有缓存值

- 参数
  - `string $name`

- 返回`bool`


### `::from()`
以属性键值对实例化一个模型对象

- 参数
  - `array $properties` 属性键值对
  - `string $coverType = self::COVER_TYPE_UNSET` 同[apply](#apply)
  - `mixed ... $ctorArgs` 需传递到构造函数的参数集

- 返回`static`



## \dce\model\Property

模型属性注解类（在模型实体类中，标注了`Property`注解的公共属性视为模型属性，支持校验等模型特性）


### `->refProperty`
`\ReflectionProperty` 属性的反射对象

### `->name`
`string` 属性名

### `->alias`
`string` 属性别名

### `->validators`
`\dce\model\Validator[]` 属性校验器集

### `->field`
`\dce\db\entity\Field` 属性对应的字段对象


### `->__construct()`
构造方法，一般在模型中自行实例化

- 参数
  - `public string|null $alias = null` 属性别名


### `->applyProperties()`
绑定相关属性（模型中自调用）

- 参数
  - `string $modelClass`
  - `ReflectionProperty $refProperty`
  - `array $validators`
  - `Field|null $field`

- 返回`self`


### `->isInitialized()`
属性是否已初始化

- 参数
  - `Model $model` 所属模型实例

- 返回`bool`


### `->getValue()`
取模型属性值

- 参数
  - `Model $model` 所属模型实例
  - `mixed $default = null` 默认值，属性未初始化时返回该值

- 返回`string|int|float|null|false`

- 示例
```php
class ChildModel extends Model {
    #[ Property('属性1'), ]
    public int $field1;
}
$model = new ChildModel;
$model->field1 = 11;
$property = $model->getProperty('field1');
test($property->name, $property->alias, $property->getValue($model));
/*
1-1    string(6) "field1"
1-2    string(7) "属性1"
1-3    int(11)
*/
```