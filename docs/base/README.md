# 全局组件


## dce.php

dce.php是框架入口，里面初始化了一些基础常量及加载器，并启动Dce。下述为常量说明：

### `DCE_CLI_MODE`
是否cli模式。

### `DCE_ROOT`
框架根目录（即dce.php所在文件目录）。

### `APP_ROOT`
应用根目录，用户可在入口文件自定义（下同），若未定义，则cli模式时为`dirname($_SERVER['PHP_SELF'])`，否则为`$_SERVER['DOCUMENT_ROOT']/..`

### `APP_COMMON`
公共目录，用于存放公共类库与配置，默认为`APP_ROOT . 'common/'`

### `APP_PROJECT_ROOT`
项目根目录，项目可定义于此目录下，默认为`APP_ROOT . 'project/'`

### `APP_RUNTIME`
运行时根目录，用于存放模板缓存、文件缓存等，默认为`APP_ROOT .'runtime/'`

### `APP_WWW`
Cgi入口/静态文件目录，默认为`APP_ROOT .'www/'`



## \dce\Dce

Dce是入口类，该类绑定了以下基础静态属性与方法。

### `::$config`
`\dce\config\DceConfig` 公共配置。

- 示例
```php
test(
    Dce::$config->appId,
    Dce::$config->mysql->getDefault(),
);
/*
1-1    string(8) "2706cf44"
1-2    array(1) {
         [0] => object(dce\db\connector\DbConfig)#7 (10) {
           ["label"] => string(8) "222:3306"
           ["host"] => string(13) "127.0.0.1"
           ["dbUser"] => string(4) "root"
           ["dbPassword"] => string(5) "drunk"
           ["dbName"] => string(10) "default_db"
           ["dbPort"] => int(3306)
           ["isMaster"] => bool(true)
           ["maxConnection"] => int(16)
           ["databases":"dce\db\connector\DbConfig":private] => array(0) {
           }
           ["dynamics":"dce\config\Config":private] => array(0) {
           }
         }
       }
*/
```

### `::$cache`
`\dce\cache\CacheManager` 缓存类实例。

- 示例
```php
test(
    // 使用默认缓存器
    Dce::$cache->get('framework'),
    Dce::$cache->set('framework', ['name' => 'Dce']),
    Dce::$cache->get('framework'),

    // 使用静态变量缓存器
    Dce::$cache->var->get('framework'),
    Dce::$cache->var->set('framework', ['name' => 'Dce']),
    Dce::$cache->var->get('framework'),
);
/*
1-1    NULL
1-2    bool(true)
1-3    array(1) {
         ["name"] => string(3) "Dce"
       }
1-4    NULL
1-5    bool(true)
1-6    array(1) {
         ["name"] => string(3) "Dce"
       }
*/
```

### `::$lock`
`\dce\base\Lock` 并发锁类实例。


### `::getId()`
取应用Id（你也可以从全局配置中取）。

- 返回`string`


### `::isDevEnv()`
判断是否处于开发环境（有develop项目则视为开发环境）。

- 返回`bool`


### `::initOnly()`
仅初始化Dce（不加载项目与节点，不引导调用控制器方法）(将Dce作为纯库使用)

- 返回`void`

- 示例
```php
require_once "./vendor/autoload.php";
dce\Dce::initOnly();
test(1);
// int(1)
```


### `::scan()`
初始化Dce及项目节点（不引导调用控制器方法）(将Dce作为带项目节点的库使用)

- 返回`void`

- 示例
```php
require_once "./vendor/autoload.php";
dce\Dce::scan();
test(dce\Dce::isDevEnv());
// bool(false)
```


### `::boot()`
引导路由（准备全部类库并引导执行控制器方法）（将Dce作为命令行工具、MVC框架、服务器使用）

- 返回`void`

- 示例

作为命令行工具/服务器使用
```php
// 命令行工具文件: /dce
require_once "./vendor/autoload.php";
dce\Dce::boot();
```

```shell
# 执行空命令
php dce

# 
# 你正在cli模式以空路径请求Dce接口


# 启动HTTP服务器
php dce http start
# Http server started with 0.0.0.0:20460.
```

作为Cgi的MVC框架使用
```php
// 框架入口文件: /www/index.php
require_once "../vendor/autoload.php";
dce\Dce::boot();
```



## \dce\Loader

加载器类，注册类的自动加载。


### `::prepare()`
注册名字空间的自动加载。

- 参数
  - `string $namespaceWildcard` 待注册名字空间通配符，如：`\dce\*`
  - `string|Closure $dirBase` 待注册的目录
    - `string` 需自动加载的名字空间下类文件的根目录，如：`DCE_ROOT . 'engine/'`
    - `\Closure` 自定义加载方法`callback(string $className)`，你可以在此方法中根据回调参数`className`自己实现加载逻辑
  - `bool $isPrepend = false` 是否插入待自动注册队列头部

- 返回`void`

- 示例
```php
// 将 DCE_ROOT . 'drunk/' 路径下所有符合自动加载规则的类文件注册到 '\drunk\*' 名字空间下以供自动加载
Loader::prepare('\drunk\*', DCE_ROOT . 'drunk/');
```

### `::preload()`
预加载PHP类（与prepare方法不同的是，本方法是直接注册按需加载的类名，而不是名字空间）

- 参数
  - `string $className` 需惰性加载的类名
  - `string|Closure $classPath` 类文件路径
    - `string` 类文件路径
    - `\Closure` 自定义加载方法`callback(string $className)`，你可以在此方法中根据回调参数`className`自己实现加载逻辑

- 返回`void`

- 示例
```php
Loader::prepare('drunk\Debug', DCE_ROOT . 'drunk/Debug.php');
```

### `::dirOnce()`
一次性引入目录下所有PHP文件

- 参数
  - `string $dir` 目标根目录

- 返回值<br>
  成功: `true`；
  失败: `false`

### `::once()`
一次性引入某个文件

- 参数
  - `string $path` 目标文件路径

- 返回值<br>
  成功: `true`；
  失败: `false`