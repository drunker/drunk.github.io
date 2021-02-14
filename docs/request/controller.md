# 控制器

DCE有控制器的概念，但没有单独的控制器抽象类。节点配置中的能正常访问的，继承于[视图类](/request/view.md)的类即为控制器类，其定义的动态方法为控制器方法。

控制器类定义于对应项目下的 controller 目录，文件名与类型保持一致，需定义名字空间为`[PROJECT_NAME]\controller`，如果你的控制器类存放于 controller 下的子目录，则名字空间需带上该目录名`[PROJECT_NAME]/controller/gallery`。DCE没有对类作命名限制，但建议以Controller结尾，这样更直观，且可以较好的解决不同功能同业务的类命名混淆问题。并且DCE建议所有的目录名及PHP名字空间皆以蛇底式命名，类及类文件名皆以大驼峰式命名。

业务型类库建议写在服务类库目录下`[PROJECT_NAME]/controller/service/`，在控制器中调用这些类库方法，这样可以有更好的复用性，让业务代码结构更清晰，更好维护。服务类库需定义名字空间为`[PROJECT_NAME]\service`，若在子目录下则需加上目录名如`[PROJECT_NAME]/controller/gallery`，DCE能自动注册加载符合规则的服务类。


## 示例


### 命令行控制器

```php
// [PROJECT_NAME]/controller/ServerController.php

namespace [PROJECT_NAME]\controller;

use dce\project\view\ViewCli;

class ServerController extends ViewCli {
    public function hi() {
        $input = $this->input();
        $this->printf("您输入的是: %s", $input);
    }
}
```

### 子目录Json控制器

```php
// [PROJECT_NAME]/controller/gallery/GalleryController.php

namespace [PROJECT_NAME]\controller\gallery;

use dce\project\view\engine\ViewHttpJson;

class GalleryController extends ViewHttpJson {
    public function save() {
        $this->assign('photo_id', 1);
        $this->success('保存成功');
    }
}
```

### 在控制器中调用服务类

```php
// [PROJECT_NAME]/service/gallery/GalleryService.php

namespace [PROJECT_NAME]\service\gallery;

class GalleryService {
    public function hello() {
        return "Hello World !\n";
    }
}
```

然后在控制器中调用

```php
// [PROJECT_NAME]/controller/gallery/GalleryController.php

namespace [PROJECT_NAME]\controller\gallery;

use dce\project\view\engine\ViewHttpHtml;
use [PROJECT_NAME]\service\gallery\GalleryService;

class GalleryController extends ViewHttpHtml {
    public function save() {
        $service = new GalleryService;
        $this->assign('hello', $service->hello());
W    }
}
```