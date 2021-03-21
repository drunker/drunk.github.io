# 节点

DCE定义了节点的概念，所谓节点，简单来说就是一个请求路径与控制器方法的映射关系，收到用户请求后，DCE会找到请求地址对应的路由方法，执行并返回结果。

节点配置会被缓存，Dce启动时会扫描项目下的节点文件，如果文件有改动则从配置文件取节点，否则直接用缓存。你也可以开启[节点缓存配置](/config/#node)来强制使用节点缓存，但这种形式下节点配置改动时缓存不会自动更新，需要你手动清除缓存来自动重建缓存。

节点配置于对应项目下的`config/nodes.php`，以数组的形式定义配置项，配置项数组下标皆以蛇底形式书写，DCE载入配置后，会自动转为小驼峰式的节点对象属性。下述为一个示例节点配置文件：

```php
<?php
// [SomeProject]/config/nodes.php
return [
    [ // 项目根节点，若未定义则DCE会自动生成
        'methods' => 'cli', // 允许的请求方式，会被子节点继承
        'path' => 'db', // 请求路径
    ],
    [
        'path' => 'extend', // 请求路径（此为省略写法，完整定义为"db/extend"，DCE解析时会自动补充完整）
        'controller' => 'MysqlShardingController->extend', // 控制器方法，以 -> 分割控制器类与方法名
        'enable_coroutine' => true, // 是否开启协程容器
    ],
];
```


## 注解式节点

注解式节点是指可以在控制器方法中配置节点，这种方式可以让你编写接口更加便捷直观，可以省略控制器相关配置项。但注解式节点需要通过扫描全部控制器文件（[默认最深4层](/config/#node)）来解析，如果你是Cgi式应用，每次请求都会扫描解析全部控制器方法，比较浪费IO，你可以在生产环境开启[节点缓存配置](/config/#node)来提升性能。如果你是常驻内存服务的应用，则无需担心IO浪费，因为Dce仅在载入时（服务启动前）会扫描节点。

Dce未在项目下找到`config/nodes.php`文件时，则视其为注解式节点项目，会扫描控制器方法的注解来解析节点配置。下面时一个注解节点配置示例：

```php
<?php
namespace app\controller;
// 从名字空间可以看出当前控制器所属一个叫 app 的项目

use dce\project\node\Node; // 引入注解式节点配置类
use dce\project\request\Request;
use dce\project\view\ViewCli;

class TestController extends ViewCli {
    #[Node('app', omissiblePath: true)] // 配置可可省略项目级"app"路径 (凡是以 __ 开头的方法, Dce不会当其为控制器方法, 即在该方法的注解配置的节点未指定控制器方法)
    public function __construct(Request $request) {
        parent::__construct($request);
    }

    #[Node] 
    // 配置路径, 并未配置控制器, 因为Dce能自动解析对应控制器方法. 
    // 另外你也会发现未配置"methods", 因为当前控制器继承了 ViewCli, Dce能以此推断出你的请求方式为 cli, 但HTTP接口则需你手动指定, Dce无法得知你接口是 post/get 或其他
    public function index() {
        $this->print('哈哈');
    }

    #[Node(extra: ['a' => '哈哈'])] // 配置了扩展属性, 你可以以此做一些特殊的工作, 如鉴权
    public function test() {
        $this->print($this->request->node->extra);
    }
}
```


### 注解式节点参数
*参数名与配置相对应，可以点击跳转到对应配置项的说明*

[`string|null $path = null`](#path)节点路径（若未指定，则将以方法名的蛇底形式作为当前节点路径，否则直接使用指定的路径。若控制器处于子级目录中，则以其所有父目录作为父路径。）  
[`string|array|null $methods = null`](#methods)  
[`string|null $id = null`](#id)  
[`string|null $name = null`](#name)  
[`bool|null $enableCoroutine = null`](#enablecoroutine)  
[`bool|null $hookCoroutine = null`](#hookcoroutine)  
[`string|null $phpTemplate = null`](#phptemplate)  
[`string|null $templateLayout = null`](#templateLayout)  
[`array|null $corsOrigins = null`](#corsorigins)  
[`array|null $projectHosts = null`](#projecthosts)  
[`int|null $apiCache = null`](#apicache)  
[`bool|null $omissiblePath = null`](#omissiblepath)  
[`array|null $urlArguments = null`](#urlarguments)  
[`bool|null $urlPlaceholder = null`](#urlplaceholder)  
[`array|null $urlSuffix = null`](#urlsuffix)  
[`bool|null $lazyMatch = null`](#lazymatch)  
[`string|null $http301 = null`](#http301)  
[`string|null $http302 = null`](#http302)  
[`string|null $jsonpCallback = null`](#jsonpcallback)  
[`array|null $extra = null`](#extra)
`bool $controllerPath = false` 是否为控制器级路径（若设为真，则作为控制器级节点，该节点将作为该控制器下所有节点的父节点）



## \dce\project\node\Node

节点类，类属性通过节点配置定义，DCE会自动将其转为节点对象属性。下述所有属性示例皆为节点配置示例。


### `->id`
`string` 节点ID，全应用唯一，若未定义则会自动生成

### `->name`
`string` 节点名

### `->pathName`
`string` 节点路径名，DCE自动提取

### `->methods`
`string[]` 允许的请求类型（会被继承，子节点可以自定义覆盖继承的值），支持值如下：

值 | 类型
:--: | :--
get | GET请求（默认）
post | POST请求
put | PUT请求
delete | DELETE请求
cli | 命令行式访问
tcp | TCP请求
udp | UDP请求
websocket | Websocket请求

```php
'methods' => 'get',
// 配置中支持字符串的形式，转为对象时会自动转为数组属性
'methods' => ['get', 'cli'],
// 也支持直接定义为数组形式
```

### `->path`
`string` 节点路径，多级之间以 / 隔开

```php
'path' => 'home',
'path' => 'home/gallery',
```

### `->pathFormat`
`string` 格式化的路径，用户可能省略了项目路径部分，DCE解析时会自动补全并格式化然后填充到该属性。

### `->projectName`
`string` 节点所属项目名

### `->controller`
`string` 节点映射的控制器方法，类与方法名之间以 -> 分隔。

```php
'controller' => 'GalleryController->list',
// 普通的控制器方法，最终会解析为 (new \[PROJECT_NAME]\controller\GalleryController)->list()
'controller' => 'gallery\\GalleryController->list',
// 若控制器在子目录下，则可以在前面加上子目录名，会解析为 (new \[PROJECT_NAME]\controller\gallery\GalleryController)->list()
```

### `->enableCoroutine`
`bool` 是否开启协程容器，默认为`false`。若在Swoole Server环境，则是通过Server配置控制（会被继承，子类可自定义以覆盖父节点的定义）

### `->hookCoroutine`
`bool` 是否协程化IO操作，当$enableCoroutine=true时此参数将默认为true（会被继承，子类可自定义以覆盖父节点的定义）

### `->phpTemplate`
`string` PHP模板文件路径（相对于 `[PROJECT_NAME]/view/`目录）

```php
'php_template' => 'list.php',
// 视图根目录的模板，路径将会解析为 [PROJECT_NAME]/view/list.php
'php_template' => 'gallery/list.php',
// 子目录的模板，将会解析为 [PROJECT_NAME]/view/gallery/list.php
```

### `->templateLayout`
`string` 模板布局文件路径（相对于 `[PROJECT_NAME]/view/`目录），留空则不使用布局（会被继承，子类可自定义以覆盖父节点的定义）

### `->apiCache`
`int` 接口缓存（支持位或组合配置，仅对继承`\dce\project\view\ViewHttp`的控制器有效）
位元 | 类型 | 说明
:--: | :--: | :--
0 | 不缓存 | 不对接口/页面缓存
1 | 缓存Api数据 | 缓存控制器方法中assign的数据，下次进入直接取缓存而不再执行控制器方法，直到缓存失效
2 | 缓存Html模板 | 不论模板是否被修改，直接取缓存渲染直到缓存失效
4 | 缓存Html页面 | 缓存最终的渲染内容，下次进入若Api数据无变化，则直接输出缓存，除非无缓存或已失效

### `->omissiblePath`
`bool` 当前节点路径是否可省略。

```php
'omissible_path' => false,
// 不可省略时可能得这么访问 /home/gallery/
'omissible_path' => true,
// 可省略时允许这么访问 /gallery/，使用Url类生成的url也会自动省略对应节点的路径部分
```

### `->urlArguments`
`NodeArgument[]` Url参数配置集（Url参数指伪装在Url路径部分的参数、伪静态地址中的参数，如 `/news/1.html`中，其实含有参数`id = 1`），以纯数组配置，DCE会将其转为对象数组。

```php
// 下述配置可以通过 \dce\project\request\Url::make() 生成伪静态地址，用户请求该伪静态地址时，也能正确的匹配到对应的节点并解析出伪装的参数
'url_arguments' => [
    ['name' => 'id', 'match' => '/^\d+$/',]
],
```

### `->urlPlaceholder`
`bool` 参数位未传时是否保留分隔符，默认为true（此配置设为false时需要用户保证多个参数的匹配不会混淆，不会把a匹配为b参数，否则会导致错误提参）

```php
'url_placeholder' => false,
// 假设有四个参数三个未传，则设false时可能是这样 /news/1.html
'url_placeholder' => true,
// 设true时是这样 /news/1---.html
```

### `->urlSuffix`
`array` 允许的后缀

```php
'url_suffix' => '.html',
// 配置时可以使用字符串，DCE会自动转为数组，该配置能解析类似这样的地址 /news/1.html
'url_suffix' => ['', '/'],
// 同时支持多种后缀，如 /news 及 /news/
```

### `->http301`
`string` 301永久转移目标地址，路由匹配到该节点时会自动301重定向

### `->http302`
`string` 302临时跳转目标地址，路由匹配到该节点时会自动302重定向

### `->jsonpCallback`
`string` Jsonp请求时的回调方法url参数名

### `->lazyMatch`
`bool` 是否惰性匹配（匹配到此及命中，不再继续匹配剩余路径）

### `->corsOrigins`
`array` 允许跨域的主机，若配置了，则自动允许所配的主机访问（会被继承，子类可自定义以覆盖父节点的定义）

### `->isDir`
`bool` 是否目录节点，DCE自动判断生成

### `->projectHosts`
`array` 项目绑定域名（只在项目根节点配置有效，当访问绑定的域名时，会自动路由到相应项目下）

### `->extra`
`array` 用户自定义参数，如`'extra' => ['attr1' => 1],`


### `->genPathInfo()`
解析path取组成部件

- 返回`array`


### `->arrayify()`
数组化当前节点

- 返回`array`


## \dce\project\node\NodeArgument

节点Url参数类，配置伪静态式Url参数的提取方式


### `->name`
`string` 参数名，提取的参数会以该值作为下标存入$_GET数组（如`'name' => 'id'`，则路径`/news/1.html`可能提取为`$_GET['id'] = 1`）。

### `->prefix`
`string` 参数标识前缀，帮助更准确的匹配提取参数。

### `->match`
`string|array|callable|null` 参数匹配器，支持下述类型的值：

类型 | 用法
:--: | :--
regexp | 正则表达式，如`'/^\d+$/'`
array | 数组，会用来做in_array匹配检查，如`[1,2,3]`，`/news/3.html`能匹配提取，`/news/4.html`不能匹配
callable | 回调函数，返回非`false`则为匹配，否则不匹配
null | 无匹配器，参数默认匹配按顺序提取
其他 | 抛出无效匹配器的异常

### `->required`
`bool` 参数是否必须

### `->separator`
`string` 参数分隔符，默认为`-`

### `->autoGet`
`bool` 生成url时是否自动从当前url中提取应入