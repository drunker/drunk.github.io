# 配置类库

## \dce\config\ConfigManager

配置管理器类，静态类，负责加载、解析及缓存配置对象等


### `::getCommonConfig()`
取公共配置对象

- 返回`\dce\config\DceConfig`

- 示例
```php
$config = \dce\config\ConfigManager::getCommonConfig();
test($config->appId);
// c4b23554
```


### `::newCommonConfig()`
实例化一个公共配置

- 返回`\dce\config\DceConfig`


### `::getProjectConfig()`
取项目配置

- 参数
  - `\dce\project\Project $project` 项目实例

- 返回`\dce\config\DceConfig`


### `::getPureProjectConfig()`
取未与公共配置合并的项目配置

- 参数
  - `\dce\project\Project $project` 项目实例

- 返回`\dce\config\DceConfig`


### `::parseFile()`
从文件载入配置

- 参数
  - `string $path` 配置文件路径

- 返回`array`



## \dce\config\Config

配置基类


### `__construct`

- 参数
  - `array|ArrayAccess $config` 原始数组式配置项


### `->get()`
函数形式取配置（若配置类有定义类的实体属性配置项，则会取该属性值，否则会从dynamic键值属性取对应值）

- 参数
  - `string $key` 配置项名

- 返回`mixed`


### `->set()`
函数形式设置配置（若配置类有定义类的实体属性配置项，则会直接设置该属性值，否则会存为dynamic键值属性数组元素）

- 参数
  - `string $key` 配置项名
  - `mixed $value` 配置值，一般情况下
    - `array` 当配置类属性为`array|self`，配置值为`array`时，将合并进配置对象属性
    - `SplFixedArray|ArrayObject` 当配置类属性为`array|self`，配置值为`SplFixedArray|ArrayObject`对象时，将从配置值提取`array`值覆盖掉配置对象属性
    - 其他情况直接以配置值覆盖掉配置对象属性

- 返回`$this`

- 示例
```php
$config = new \dce\config\Config();
$config->set('property1', 'DCE');
test($config->get('property1'));
// DCE
```


### `->extend()`
混入配置项

- 参数
  - `array|ArrayAccess $config` 原始数组式配置项

- 返回`$this`

- 示例
```php
$config = new \dce\config\Config(['property1' => 'DCE']);
$config->extend(['property2' => 'drunkce.com']);
testGet()->getEnd()->mark($config->arrayify())->dumpJson();
// {"property1":"DCE","property2":"drunkce.com"}
```


### `->del()`
删除配置项

- 参数
  - `string $key`

- 返回`$this`


### `->empty()`
清空配置

- 返回`$this`


### `->arrayify()`
取配置的数组形式

- 返回`array`


### `__get()`
`->get()`的getter魔术方法版（若为实体属性的配置项，则不会经过getter魔术方法，而是直接取实体属性值）


### `__set()`
`->set()`的setter魔术方法版

- 示例
```php
$config = new \dce\config\Config();
$config->property1 = 'DCE';
test($config->property1);
// DCE
```