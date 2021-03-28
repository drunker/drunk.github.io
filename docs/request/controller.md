# 控制器

控制器用于定义程序接口，接收处理各种类型的请求。DCE定义了一个控制器基类，该类封装了一些基本控制器方法，用户通过编写继承该基类的类来实现控制器定义。

用户控制器类定义于对应项目下的 controller 目录，文件名与类名保持一致，需定义名字空间为`[PROJECT_NAME]\controller`，如果你的控制器类存放于 controller 下的子目录，则名字空间需带上该目录名`[PROJECT_NAME]/controller/gallery`，以此实现类自动加载。DCE没有对类作命名限制，但建议以Controller结尾，这样更直观，且可以较好的解决不同功能同业务的类命名混淆问题。并且DCE建议所有的目录名及PHP名字空间皆以蛇底式命名，类及类文件名皆以大驼峰式命名。


## \dce\project\Controller;

控制器基类


### `->request`
`\dce\project\request\Request` 当前请求

### `->rawRequest`
`protected \dce\project\request\RawRequest` 当前原始请求

### `->rendered`
`bool` 是否被渲染过


### `->__init()`
初始方法，用以代替构造方法。DCE需要通过构造方法初始化一些类属性，如果用户在控制器实现类中也需要定义构造方法却没调用父构造方法，将导致该控制器异常，为了避免这种情况，DCE将控制器的构造方法定义了final修饰属性，用户将无法在控制器实现类定义构造方法，又为了满足用户可能需要构造方法的需求，所以定义了此方法代替构造方法，该方法将在原始构造方法执行完毕时被调用。

- 返回`void`


### `->render()`
渲染响应，先通过节点配置的[render](../config/node.md#render)属性值渲染数据，然后将数据传递给[response()](#response)方法响应输出。

HTTP请求会自动调用此方法渲染，无需手动调用。你也可以在控制器中手动调用渲染，手动调用后将不再自动调用，因为HTTP请求只能渲染响应一次。非HTTP请求不会自动渲染也没有调用次数限制。

- 参数
  - `mixed $data = false` 需渲染的内容，若未指定将渲染通过[assign](#assign)系方法预设的数据
  - `string|false|null $path = null` 响应路径，若未指定则响应为请求路径（用于长连接请求向客户端响应推送数据）

- 返回`void`


### `->response()`
直接响应输出数据（不经过渲染）

请求 | 动作
:--: | :--
HTTP | 响应数据，若非字符串则自动json编码，可多次调用，将不再自动渲染
长连接 | 向客户端推送数据
命令行 | 向控制台打印输出数据，若非字符串则自动json编码

- 参数
  - `mixed $data = false` 需响应的内容，若未指定将响应通过[assign](#assign)系方法预设的数据
  - `string|false|null $path = null` 响应路径，若未指定则响应为请求路径（用于长连接请求向客户端响应推送数据）

- 返回`void`


### `->print()`
打印变量值到控制台

- 参数
  - `mixed $value` 需打印的数据
  - `string $suffix = "\n"` 后缀，默认为换行符

- 返回`void`


### `->printf()`
格式化并打印变量值到控制台

- 参数
  - `string $format` 格式化规则
  - `mixed ... $arguments` 需打印的数据

- 返回`void`

- 示例
```php
$this->printf("[%s] %s\n", date('Y-m-d H:i:s'), '任务执行完毕！');
```


### `->input()`
从控制台取输入内容

- 参数
  - `string $label = ''` 标注说明
  - `int $size = 1024` 截取长度

- 返回`string`

- 示例
```php
$input = $this->input('请输入邮箱地址：');
```


### `->success()`
快捷渲染响应为操作成功状态（`{"status": true}`）

- 参数
  - `string|null $message = null` 需要响应的消息
  - `int|null $code = null` 需要响应的状态码

- 返回`void`


### `->fail()`
快捷渲染响应为操作失败状态（`{"status": false}`）

- 参数
  - `string|null $message = null` 需要响应的消息
  - `int|null $code = null` 需要响应的状态码

- 返回`void`


### `->exception()`
快捷渲染响应异常结果（`{"status": false, "message": $异常消息提示, "code": $异常状态码}`）

- 参数
  - `Throwable $throwable`

- 返回`void`


### `->httpException()`
快捷渲染响应HTTP异常

- 参数
  - `int $code` HTTP状态码，如`401：未授权`
  - `string $reason = ''` HTTP状态原因

- 返回`void`


### `->assign()`
预设响应数据

- 参数
  - `string $key` 预设数据键/模板变量名
  - `mixed $value` 预设值

- 返回`static`

- 示例
```php
$this->assign('mid', 10000);
```


### `->assignMapping()`
批量预设响应数据

- 参数
  - `array $mapping` 键值映射表

- 返回`static`


### `->getAssigned()`
根据预设数据键取值

- 参数
  - `string $key` 预设数据键

- 返回`mixed`


### `->getAllAssigned()`
取预设响应数据键值映射表

- 返回`array`

- 示例
```php
$data = $this->getAllAssigned();
// {"mid": 10000}
```


### `->clearAssigned()`
清空预设数据键值表

- 返回`void`


### `->assignStatus()`
预设响应状态数据

- 参数
  - `string $key` 状态名（`{status: 操作结果状态,code: 操作结果状态码,message: 操作结果状态消息, data:操作结果数据}`，或其他你的自定义状态）
  - `mixed $value` 状态值

- 返回`static`

- 示例
```php
$this->assignStatus('status', 1);
$this->assignStatus('code', 200);
```


### `->getAllAssignedStatus()`
取全部状态数据

- 返回`array`

- 示例
```php
$data = $this->getAllAssignedStatus();
// {"status": 1, "code": 200, "data": {"mid": 10000}}
```



## \dce\project\render\Renderer;

渲染器，用于渲染数据，调用控制器的[render()](#render)方法时被调用，无需你手动调用。接口的渲染方式通过节点配置的[render](../config/node.md#render)属性定义。


### `::TYPE_JSON`
`string` JSON渲染器

### `::TYPE_JSONP`
`string` JSONP渲染器

### `::TYPE_XML`
`string` XML渲染器


### `::extend()`
扩展自定义渲染器，也允许你覆盖系统渲染器来按自己的方式渲染响应对应类型数据。

- 参数
  - `string $typeName` 渲染器别名
  - `string $renderClass` 渲染器类名，该类需继承渲染器基类`\dce\project\render\Renderer`

- 返回`void`


### 模板渲染

DCE没有设计专门的模板语言/语法，而是直接使用PHP脚本作为（HTML、XML或其他）模板。因为PHP本身已是足够简洁的标记语言，且可以直接解析，无法转译，能提高程序性能，所以DCE决定直接用PHP作为模板。

模板文件定义于`[PROJECT_NAME]/template/`目录下，文件路径定义于节点配置的[render](../config/node.md#render)属性，完整路径为`"[PROJECT_NAME]/template/" . $node->render`。

DCE也支持模板布局，布局文件路径定义于节点配置的[templateLayout](../config/node.md#templatelayout)属性，你可以在布局文件中引入页面框架的固定组件（如页头页脚等），使用`<?php // layout_content ?>`表示要用渲染页面内容替换的区域。节点的布局文件属性会被子节点继承，如果某个子节点不需要布局，可以单独定义为空字符串覆盖父布局表示不使用布局，当然也可以定义为其他布局文件。

- 单模板示例

```php
// 节点配置
[
  'render' => 'gallery/index.php',
]
```

```php
<?php // 模板文件 [PROJECT_NAME]/template/gallery/index.php ?>
<!doctype html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>标题</title>
</head>
<body>
    <?=$hello?>
</body>
</html>
```

- 模板布局示例

```php
// 节点配置
[
  'render' => 'gallery/index.php',
  'template_layout' => 'layout/default.php',
]
```

```php
<?php // 布局文件 [PROJECT_NAME]/template/layout/default.php?>
<?php require 'header.php'; // 注意不要使用 require_once, 会导致无法二次渲染 ?>
<?php // layout_content ?>
</body>
</html>
```

```php
<?php // 头部文件 [PROJECT_NAME]/template/layout/header.php?>
<!doctype html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>标题</title>
</head>
<body>
```

```php
<?php // 主体模板文件 [PROJECT_NAME]/template/gallery/index.php?>
<div>
    <?=$hello?>
</div>
```


### 渲染缓存
HTTP请求支持渲染缓存，通过节点参数[renderCache](../config/node.md#rendercache)配置。

#### 缓存逻辑
---
![缓存逻辑](./api-cache-logic.svg)



## 服务类

业务型类库建议写在服务类库目录下`[PROJECT_NAME]/controller/service/`，在控制器中调用这些类库方法，这样可以有更好的复用性，让业务代码结构更清晰，更好维护。服务类库需定义名字空间为`[PROJECT_NAME]\service`，若在子目录下则需加上目录名如`[PROJECT_NAME]/controller/gallery`，DCE能自动注册加载符合规则的服务类。



## 示例


### 命令行请求控制器

```php
// [PROJECT_NAME]/controller/ServerController.php

namespace [PROJECT_NAME]\controller;

use dce\project\Controller;
use dce\project\node\Node;

class ServerController extends Controller {
    #[Node(methods: 'cli')] // 注解型节点配置
    public function hi() {
        $input = $this->input();
        $this->printf("您输入的是: %s\n", $input);
    }
}
```

### 子目录GET请求控制器响应JSON数据

```php
// [PROJECT_NAME]/controller/gallery/GalleryController.php

namespace [PROJECT_NAME]\controller\gallery;

use dce\project\Controller;
use dce\project\node\Node;

class GalleryController extends Controller {
    #[Node(render: 'json')]
    public function save() {
        $this->assign('photo_id', 1);
        $this->success('保存成功');
    }
}
```

### 在控制器中调用服务类

定义服务类

```php
// [PROJECT_NAME]/service/gallery/GalleryService.php

namespace [PROJECT_NAME]\service\gallery;

class GalleryService {
    public function hello() {
        return "Hello World !";
    }
}
```

然后在控制器中调用

```php
// [PROJECT_NAME]/controller/gallery/GalleryController.php

namespace [PROJECT_NAME]\controller\gallery;

use dce\project\Controller;
use dce\project\node\Node;
use [PROJECT_NAME]\service\gallery\GalleryService;

class GalleryController extends Controller {
    #[Node]
    public function save() {
        $service = new GalleryService;
        $this->assign('hello', $service->hello());
    }
}
```