# 实体结构

实体结构用于定义数据表结构，在Dce里面应用比较简单，主要用于定义活动记录属性对应的字段结构，目前仅用到了字段名及是否主键属性，但建议你完整定义，可以更直观的了解表结构，或者兼容日后可能的更丰富的功能扩展。


## \dce\db\entity\DbField

数据表字段注解类，定义字段结构。


### `->__construct()`

- 参数
  - `string|null $type = null` 字段类型，已在`\dce\db\entity\schema\FieldType`类定义为常量
  - `int $length = 0` 字符串或Decimal字段最大字符数或数值字段最大字节
  - `string|int|float|false $default = false` 默认值
  - `string $comment = ''` 字段注释
  - `bool $primary = false` 是否主键
  - `bool $null = false` 是否允许Null值
  - `bool $increment = false` 是否自增
  - `bool $unsigned = true` 是否无符号
  - `int $precision = 0` Decimal字段小数位

- 示例
```php
class MemberBadge extends DbActiveRecord {
    #[ Property, DbField(FieldType::TINYINT), ]
    public int $id;

    #[ Property('徽章名'), DbField(FieldType::VARCHAR, 15),
        Validator(Validator::RULE_STRING, max: 15),
        Validator(Validator::RULE_REQUIRED),
    ]
    public string $name;

    #[ Property('备注'), DbField(FieldType::VARCHAR), Validator(Validator::RULE_STRING, max: 32), ]
    public string $memo;

    #[ Property('添加时间'), DbField(FieldType::DATETIME), Validator(Validator::RULE_DATETIME), ]
    public string $createTime;
}
```


### `->getName()`
取字段名


### `->getType()`
取字段类型实例

- 返回`\dce\db\entity\schema\FieldType`


### `->isPrimaryKey()`
判断字段是否主键


### `->isNotNull()`
判断字段是否不支持存null


### `->isAutoIncrement()`
判断字段是否自增


### `->getDefault()`
取字段默认值


### `->getComment()`
取字段注释



## \dce\db\entity\schema\FieldType

字段类型类，下述为类型常量


### `::INT`

### `::TINYINT`

### `::SMALLINT`

### `::MEDIUMINT`

### `::BIGINT`

### `::DECIMAL`

### `::FLOAT`

### `::DOUBLE`

### `::VARCHAR`

### `::CHAR`

### `::TINYTEXT`

### `::TEXT`

### `::MEDIUMTEXT`

### `::LONGTEXT`

### `::TINYBLOB`

### `::BLOB`

### `::MEDIUMBLOB`

### `::LONGBLOB`

### `::JSON`

### `::DATE`

### `::DATETIME`

### `::TIMESTAMP`

### `::TIME`

### `::YEAR`


### `->__construct()`

- 参数
  - `string|null $typeName`
  - `int|bool $length`
  - `bool|int $isUnsigned`
  - `int $precision`


### `->__toString()`
字符串化类型实例


### `->getName()`
取类名


### `->isNumeric()`
是否数值型字段


### `->isUnsigned()`
是否无符号型数值字段


### `->getLength()`
最大字符长度或数值字节数


### `->getPrecision()`
取小数位数