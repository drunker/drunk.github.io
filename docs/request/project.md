# 项目

DCE项目是为了切分不同类型的业务代码而抽象的概念，每个项目可以定义自己的配置、节点、类库等，方便实现差异化的流程权限等控制，如拆分管理后台、用户中心、前台页面等项目。

默认项目根目录为[`APP_PROJECT_ROOT`](/base/#app-project-root)，你可以在入口文件中自定义这个常量指定特殊路径。并且DCE还支持定义扩展项目，详情请参见[`->projectPaths`](/config/dce-config.md#projectpaths)。项目结构请参见[目录结构](/design/#目录结构)。

DCE内置了一些项目，这些项目封装着内置服务，并通过控制器暴露了服务接口，详细文档参见[内置服务](/server/)。


## \dce\project\ProjectManager
项目管理器


### `::get()`
取指定项目对象

- 参数
  - `string $projectName` 项目名

- 返回`\dce\project\Project`


### `::getAll()`
取全部项目

- 参数
  - `bool $justSystematic = null` 仅找系统项目
    - `true` 仅系统项目
    - `false` 仅非系统项目
    - `null` 全部项目

- 返回`\dce\project\Project[]`


## \dce\project\Project
项目类


### `->name`
`string` 项目名

### `->path`
`string` 项目路径

### `->isSystematic`
`bool` 是否系统项目（内置项目）

### `->nodeTree`
`\dce\project\node\NodeTree` 项目节点树

### `->config`
`\dce\config\DceConfig` 项目配置（包括公共配置）

### `->pureConfig`
`\dce\config\DceConfig` 纯项目配置

### `->extra`
`array` 项目扩展属性


### `->getConfig()`
取项目配置（若已绑定到属性，则直接取属性，否则通过ProjectManager取并存到属性）

- 返回`\dce\config\DceConfig`


### `->getPureConfig()`
取纯项目配置

- 返回`\dce\config\DceConfig`


### `->getRootNode()`
取根节点

- 返回`\dce\project\node\Node`


### `->extendProperty()`
扩展属性（方便绑定项目全局变量）

- 参数
  - `string $key` 扩展属性的键
  - `mixed $value` 扩展属性值

- 返回`void`

- 示例
```php
$project = \dce\project\ProjectManager::get('http');
$project->extendProperty('extend1', 'value1');
test($project->extra['extend1']);
// value1
```