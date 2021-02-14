# 请求

DCE定义的请求不止传统意义上的类HTTP请求，而是将发起的所有交互皆视为请求（如通过命令行执行脚本），并统一按`请求 - 处理 - 响应`的流程处理。

请求类是DCE中的一个大类，该类绑定了非常丰富的信息，在你的业务代码中会经常访问该类对象。


## \dce\project\request\Request

请求类


### `->rawRequest`
`\dce\project\request\RawRequest` [原始请求](/request/raw.md)对象（用于全部类型请求）

### `->node`
`\dce\project\node\Node` 当前请求的[节点](/config/node.md)对象（用于全部类型请求）

### `->url`
`\dce\project\request\Url` 当前节点[Url](/request/url.md)对象（用于Http类型请求）

### `->project`
`\dce\project\Project` 当前[项目](/project/)对象（用于全部类型请求）

### `->config`
`\dce\config\DceConfig` 当前项目[配置](/config/)对象（用于全部类型请求）

### `->cookie`
`\dce\project\request\Cookie` 当前项目[Cookie](/request/cookie.md)对象（用于Http类型请求）

### `->session`
`\dce\project\request\Session` 当前项目[Session](/request/session.md)对象（用于全部类型请求）

### `->sessionManager`
`\dce\project\request\SessionManager` [Session管理器](/request/session-manager.md)（用于全部类型请求）

### `->rawData`
`mixed` 原始请求数据（用于全部类型请求），请求类型与属性值的对应表如下：

请求类型 | 属性值
:--: | :--
http | `string` `php://input`
cli | `array` `$argv`除开脚本参数外的参数集
tcp | `mixed` 解包后除开路径外的数据
ucp | 同tcp
websocket | 同tcp

### `->request`
`array` 请求参数，请求类型与属性值的对应表如下：

请求类型 | 属性值
:--: | :--
get | `->get`
post | `->get + ->post`
put | `->get + ->put`
delete | `->get + ->delete`
cli | `->cli`
tcp | 除开路径的数据若为json，则此处为json转的数组，否则为null（可以取rawData）
udp | 同tcp
websocket | 同tcp

### `->pureCli`
`array` 不带前缀的cli参数，如['h'=>'', 'p'=>'']

### `->cli`
`array` 完整cli参数，如['-h'=>'', '--p'=>'']

### `->get`
`array` Http请求的get参数

### `->post`
`array` Http请求的post参数

### `->put`
`array` Http请求的put参数

### `->delete`
`array` Http请求的delete参数

### `->files`
`array` Http请求的上传文件集

### `->fd`
`int` websocket与tcp连接的资源描述符

### `->ext`
`array` 供用户用的扩展属性
