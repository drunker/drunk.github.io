# 校验器

校验器类为注解类。在模型类中，标记了校验器的注解的模型属性，可以调用`\dce\model\validator\Model::valid`校验数据的合法性。


## \dce\model\Validator

模型校验规则工具类


### `::RULE_DEFAULT`
`string` 默认值赋值校验，对应[`\dce\model\validator\assignment\DefaultValidator`](validator.md#dce-model-validator-assignment-defaultvalidator)

### `::RULE_FILTER`
`string` 过滤校验，对应[`\dce\model\validator\filter\FilterValidator`](validator.md#dce-model-validator-filter-filtervalidator)

### `::RULE_DATE`
`string` 日期校验，对应[`\dce\model\validator\checker\DateValidator`](validator.md#dce-model-validator-checker-datevalidator)

### `::RULE_DATETIME`
`string` 日期时间校验，对应[`\dce\model\validator\checker\DateValidator`](validator.md#dce-model-validator-checker-datevalidator)

### `::RULE_EMAIL`
`string` 邮箱校验，对应[`\dce\model\validator\checker\EmailValidator`](validator.md#dce-model-validator-checker-emailvalidator)

### `::RULE_IP`
`string` IP校验，对应[`\dce\model\validator\checker\IpValidator`](validator.md#dce-model-validator-checker-ipvalidator)

### `::RULE_IP6`
`string` IP6校验，对应[`\dce\model\validator\checker\IpValidator`](validator.md#dce-model-validator-checker-ipvalidator)

### `::RULE_NUMBER`
`string` 数组校验，对应[`\dce\model\validator\checker\NumberValidator`](validator.md#dce-model-validator-checker-numbervalidator)

### `::RULE_INTEGER`
`string` 整数校验，对应[`\dce\model\validator\checker\NumberValidator`](validator.md#dce-model-validator-checker-numbervalidator)

### `::RULE_REGULAR`
`string` 正则校验，对应[`\dce\model\validator\checker\RegularValidator`](validator.md#dce-model-validator-checker-regularvalidator)

### `::RULE_SET`
`string` 集合校验，对应[`\dce\model\validator\checker\SetValidator`](validator.md#dce-model-validator-checker-setvalidator)

### `::RULE_STRING`
`string` 字符串校验，对应[`\dce\model\validator\checker\StringValidator`](validator.md#dce-model-validator-checker-stringvalidator)

### `::RULE_URL`
`string` Url校验，对应[`\dce\model\validator\checker\UrlValidator`](validator.md#dce-model-validator-checker-urlvalidator)

### `::RULE_REQUIRED`
`string` 必填校验，对应[`\dce\model\validator\ending\RequiredValidator`](validator.md#dce-model-validator-ending-requiredvalidator)

### `::RULE_REQUIRED_EMPTY`
`string` 必传校验，对应[`\dce\model\validator\ending\RequiredValidator`](validator.md#dce-model-validator-ending-requiredvalidator)

### `::RULE_UNIQUE`
`string` 唯一校验，对应[`\dce\model\validator\ending\UniqueValidator`](validator.md#dce-model-validator-ending-uniquevalidator)


### `->__construct()`
注解校验器构造方法

- 参数
  - `string|array $rule` 规则名, 见头部定义的常量
  - `string|array $scenario = [Model::SCENARIO_DEFAULT]` 适用场景名
  - `int|float|string|array|null $max = null` 最大字符串长度或最大有效数值或日期
  - `int|float|string|array|null $min = null` 最小字符串长度或最小有效数值或日期
  - `array|null $set = null` Set校验器合法值集
  - `string|array|null $regexp = null` 匹配用正则表达式
  - `string|array|null $keyword = null` 搜索用字符串
  - `string|null $error = null` 规则通用校验失败异常提示模板
  - `array|null $combined = null` 唯一记录校验器联合唯一索引其他字段集
  - `string|array|null $type = null` 日期校验器类型
  - `array|null $formatSet = null` 日期校验器合法格式集
  - `bool|array|null $decimal = null` 数值校验器是否允许小数
  - `bool|array|null $negative = null` 数值校验器是否允许负数
  - `string|int|float|null|false $default = false` 默认校验器默认值

- 示例
```php
class MemberModel extends Model {
    #[ Property,
        Validator(Validator::RULE_INTEGER),
        Validator(Validator::RULE_NUMBER, min: [10000, '{{label}}不能小于{{min}}']),
    ]
    public int $id;

    #[ Property,
        Validator(Validator::RULE_FILTER),
        Validator(Validator::RULE_DEFAULT, default: ''),
        Validator(Validator::RULE_EMAIL, error: '邮箱地址大大滴不对'),
    ]
    public string $email;

    #[ Property,
        Validator(Validator::RULE_REQUIRED),
        Validator(Validator::RULE_FILTER),
        Validator(Validator::RULE_STRING, max: 16),
    ]
    public string $nickname;
}

$model = new MemberModel;
$model->id = 10000;
$model->nickname = ' Dru nk ';
$model->valid();
test($model->extractProperties());
/*
1-1    array(3) {
         ["id"] => int(10000)
         ["email"] => string(0) ""
         ["nickname"] => string(5) "Drunk"
       }
 */
// 校验通过，并对 nickname 去除了空格，对email属性初始化了个 "" 默认值
```


### `::extendMap()`
扩展校验器映射表（如果你自定义了校验器类，可以调用此方法将其加入映射表，这样你可以在模型中使用你的自定义校验器来校验数据）

- 参数
  - `array $map`

- 返回`void`

- 示例
```php
// 扩展
Validator::extendMap([
    'cn_name' => [
        'class' => 'YOUR VALIDATOR CLASS',
        'arg1' => '',
        'other_arguments' => '',
    ]
]);

// 使用
class SomeModel extends Model {
    #[ Property, Validator('cn_name'), ]
    public string $name;
}
```


### 支持或逻辑
```php
class ChildModel extends Model {
    // 若将规则的第一个参数配置为规则集, 那么将以或逻辑校验属性值 (各子规则共用场景参数, 其他参数以数组键值方式自定义)
    #[ Property, Validator([[Validator::RULE_DATETIME], [Validator::RULE_DATE, 'max' => '2022-12-12']], scenario: ['default']), ]
    public string $date;
}

$model = new ChildModel;
$model->date = '2021-01-31';
$model->valid();
test($model->extractProperties());
/* 由于配置了或逻辑允许值为日期时间或者纯日期, 所以不会抛出异常
1-1    array(1) {
         ["date"] => string(10) "2021-01-31"
       }
 */
```



## \dce\model\validator\ValidatorAbstract;

校验器基类，定义了对各种类型的校验器抽象的接口方法

校验器主要与模型配合使用，校验模型属性是否合法等。DCE抽象了四种类别的校验器：
类型 | 抽象类 | 说明
:--: | :-- | :--
赋值器 | `\dce\model\validator\TypeAssignment` | 用于初始化赋值或其他赋值
过滤器 | `\dce\model\validator\TypeFilter` | 过滤空格或其他字符
校验器 | `\dce\model\validator\TypeChecker` | 校验数据的合规性，不合规则抛异常
后置校验器 | `\dce\model\validator\TypeEnding` | 做必填值、唯一值等需要最后做的校验工作


### `->getValue()`
取待校验值

- 返回`string|int|float|null|false`


### `->valid()`
校验

- 返回`bool`


### `->checkGetValue()`
校验并返回校验处理过的值

- 参数
  - `string|int|float|false|null` 待校验值
  - `string|null $propertyName` 校验属性名
  - `string|null $propertyAlias` 校验属性别名
  - `Model|null $model` 待校验模型

- 返回`string|int|float|false|null`


### `->getProperty()`
`protected` 取校验条件属性

- 参数
  - `string $name` 条件属性名
  - `string|null $requiredError` 必设校验属性未设时的异常提示模板

- 返回`\dce\model\validator\ValidatorProperty|null`

- 示例
```php
$this->getProperty('type', '{{label}}校验器未配置formatSet或type属性');
```


### `->getGeneralError()`
`protected` 取错误模板（模板分为三种，类型及优先级依次为校验条件配置属性值 > 校验条件通用错误属性 > 系统内置默认错误模板）

- 参数
  - `string|null $definedError` 自定义的错误信息模板，支持变量替换（`{property: 属性名, label: 属性别名, value: 属性值}`）
  - `string|null $defaultError` 系统内置默认错误模板

- 返回`string|null`

- 示例
```php
class ChildModel extends Model {
    // 未自定义异常提示模板, 将使用系统内置异常文案
    #[ Property, Validator(Validator::RULE_INTEGER, max: 10), ]
    public int $id;

    // 定义了规则通用异常提示模板, 不论值违背了哪个属性, 将以规则通用文案提示
    #[ Property('编号2'), Validator(Validator::RULE_INTEGER, max: 10, min: 1, error: '{{label}} 的值 {{value}} 非法'), ]
    public int $id2;

    // 针对特定属性定义了异常提示模板, 当校验无法通过该属性时将以相应文案提示
    #[ Property, Validator(Validator::RULE_INTEGER, max: [10, '{{label}} 的值 {{value}} 不能大于10'], min: 1, error: '{{label}} 的值 {{value}} 非法'), ]
    public int $id3;

    public function save() {
        $this->valid();
    }
}
try {
    $model = new ChildModel;
    $model->id = 11;
    $model->save();
} catch (Throwable $throwable) {
    testPoint($throwable->getMessage());
//    1-1    string(16) "id不能大于10"
}
try {
    $model2 = new ChildModel;
    $model2->id2 = 11;
    $model2->save();
} catch (Throwable $throwable) {
    testPoint($throwable->getMessage());
//    2-1    string(24) "编号2 的值 11 非法"
}
try {
    $model3 = new ChildModel;
    $model3->id3 = 11;
    $model3->save();
} catch (Throwable $throwable) {
    test($throwable->getMessage());
//    1-1    string(28) "id3 的值 11 不能大于10"
}
```


### `->addError()`
`protected` 添加标记一个错误

- 参数
  - `string $message`
  - `int $error_code = 0`

- 返回`$this`


### `->getError()`
`protected` 取一个错误（当前校验对象第一个）

- 返回`ValidatorException|null`


### `::inst()`
实例化一个校验器

- 参数
  - `array $properties` 校验器属性键值表

- 返回`static`



## \dce\model\validator\TypeAssignment;

赋值器


### `\dce\model\validator\assignment\DefaultValidator`
默认值赋值器，主要配合模型使用


## \dce\model\validator\TypeFilter;

过滤器


### `\dce\model\validator\filter\FilterValidator`
常规过滤器，主要配合模型使用


## \dce\model\validator\TypeChecker;

校验器


### `->valid()`
校验设置的值，校验失败将抛出`\dce\model\validator\ValidatorException`异常

- 返回`true`

- 示例
```php
test(
    \dce\model\validator\checker\StringValidator::inst([
        'min' => [5, '名字不能小于{{min}}个字符'],
        'max' => 10
    ])->checkGetValue('许愿')
);
/*
1-1    string(38) "dce\model\validator\ValidatorException"
1-2    string(35) "Code:0 名字不能小于5个字符"
 */
```

### `->check();`
`protected` 校验方法的抽象实现方法，在实现类中实现

- 参数
  - `string|int|float|null|false $value`

- 返回`\dce\model\validator\ValidatorException|null`


### `\dce\model\validator\checker\DateValidator`
日期时间校验器


#### `::TYPE_MONTH`
月份校验类型常量

#### `::TYPE_DATE`
日期校验类型常量

#### `::TYPE_TIME`
时间校验类型常量

#### `::TYPE_DATETIME`
日期时间校验类型常量

#### `->type`
`string` 校验器属性，校验类型

#### `->formatSet`
`array` 允许的格式集

#### `->max`
`int` 最大日期

#### `->min`
`int` 最小日期

- 示例
```php
DateValidator::inst([
    'type' => [DateValidator::TYPE_DATE, '日期格式异常'],
])->checkGetValue('2015-01');
// '日期格式异常'异常
DateValidator::inst([
    'type' => [DateValidator::TYPE_DATE, '日期格式异常'],
])->checkGetValue('2015-01-01');
// 无异常

DateValidator::inst([
    'format_set' => [['H:i'], '时间格式异常'],
])->checkGetValue('12:12:11');
// '时间格式异常'异常

DateValidator::inst([
    'min' => ['2016-01-01', '日期不能早于{{min}}'],
])->checkGetValue('2015-01-01');
// '日期不能早于2016-01-01'异常
```


### `\dce\model\validator\checker\EmailValidator`
邮箱校验器

- 示例
```php
test(EmailValidator::inst()->checkGetValue('drunkce.com'));
/*
1-1    string(38) "dce\model\validator\ValidatorException"
1-2    string(27) "Code:0 非有效Email地址"
*/
```


### `\dce\model\validator\checker\IpValidator`
IP校验器

#### `->isIp4`
`bool` 是否校验IP4，否则为IP6，默认为`true`

- 示例
```php
test(IpValidator::inst(['error' => '非有效IP地址'])->checkGetValue('drunkce.com'));
/*
1-1    string(38) "dce\model\validator\ValidatorException"
1-2    string(24) "Code:0 非有效IP地址"
 */
```


### `\dce\model\validator\checker\NumberValidator`
数字校验器

#### `->decimal`
`bool` 是否允许小数，默认为`true`

#### `->negative`
`bool` 是否允许负数，默认为`true`

#### `->max`
`float` 允许最大值

#### `->min`
`float` 允许最小值

- 示例
```php
NumberValidator::inst()->checkGetValue('drunkce.com'));
// '非有效数字'异常

NumberValidator::inst([
    'decimal' => false,
])->checkGetValue(1.1);
// '不能为小数'异常

NumberValidator::inst([
    'max' => 10,
])->checkGetValue(11);
// '不能大于10'异常
```


### `\dce\model\validator\checker\RegularValidator`
正则校验器

#### `->regexp`
`string` 正则表达式

- 示例
```php
RegularValidator::inst()->checkGetValue('许愿');
// '未配置表达式'异常

RegularValidator::inst([
    'regexp' => '^\D+$',
])->checkGetValue(10);
// '^\D+$ 不是有效正则表达式'异常

RegularValidator::inst([
    'regexp' => '/^\D+$/',
])->checkGetValue(10);
// '输入不正确'异常
```


### `\dce\model\validator\checker\SetValidator`
集合校验器

#### `->set`
`array` 允许的值集

- 示例
```php
SetValidator::inst([
    'set' => [1, 2, 3],
])->checkGetValue(10);
// '值10必须为[1,2,3]中的一个'异常
```


### `\dce\model\validator\checker\StringValidator`

#### `->min`
`int` 最大长度

#### `->max`
`int` 最小长度

- 示例
```php
StringValidator::inst([
    'min' => 10,
])->checkGetValue(10);
// '不能小于10个字符'异常
```


### `\dce\model\validator\checker\UrlValidator`
Url校验器


## \dce\model\validator\TypeEnding;

后置校验器


### `\dce\model\validator\ending\RequiredValidator`
必填校验器

#### `->allowEmpty`
`bool` 是否允许空值（允许空值表示允许`""`或`0`之类非`null`的值，否则不允许所有`empty()`的值），默认为`false`

```php
RequiredValidator::inst()->checkGetValue('');
// '不能为空'异常

RequiredValidator::inst([
    'allowEmpty' => true,
])->checkGetValue(false);
// '缺少必传参数'异常

RequiredValidator::inst([
    'allowEmpty' => true,
])->checkGetValue('');
// 无异常
```


### `\dce\model\validator\ending\UniqueValidator`
唯一值校验器（ActiveRecord专用唯一记录校验器）

#### `->combined`
`array` 其他组合字段（联合唯一字段）

- 示例
```php
UniqueValidator::inst([
    'combined' => ['node_path'],
])->checkGetValue(10, 'mid', null, $permissionModel);
// 'mid不能重复'异常 或 无异常
```
