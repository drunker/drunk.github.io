# Session管理器

## \dce\project\request\SessionManager;

Session管理器基类，维护管理Session状态及与用户的映射表 **（此类可能尚不完善，不建议直接商用）**


### `->logFdBySid()`
以SessionForm记录sid与fd映射, 若通过sid找到了mid, 则同时记录mid

- 参数
  - `string $sid` Session ID
  - `int $fd` 连接文件描述符
  - `string $apiHost` 连接主机
  - `int $apiPort` 连接端口
  - `string $extra = ''` 附加信息

- 返回`void`


### `->unLogByFd()`
根据fd删除SessionForm

- 参数
  - `int $fd` 连接文件描述符
  - `string $apiHost` 连接主机
  - `int $apiPort` 连接端口
  - `string $extra = ''` 附加信息

- 返回`void`


### `->tryUnLog()`
尝试删除删除SessionForm记录（在连接关闭事件中调用，找到则删除）

- 参数
  - `int $id` SessionForm ID

- 返回`void`


### `->logFd()`
更新记录长连接Session映射 （若通过表示匹配到已经记录的映射，则更新属性）

- 参数
  - `string $sid` Session ID
  - `int $mid` 会员ID
  - `int $fd` 连接文件描述符
  - `string $apiHost` 连接主机
  - `int $apiPort` 连接端口
  - `string $extra = ''` 附加信息

- 返回`void`


### `->logMid()`
记录用户Session映射

- 参数
  - `string $sid` Session ID
  - `int $mid` 会员ID

- 返回`void`


### `->logFdMid();`
记录长连接Session映射

- 参数
  - `string $sid` Session ID
  - `int $mid` 会员ID
  - `int $fd` 连接文件描述符
  - `string $apiHost` 连接主机
  - `int $apiPort` 连接端口
  - `string $extra = ''` 附加信息

- 返回`void`


### `->updateLog();`
更新SessionForm映射记录

- 参数
  - `int $id` SessionForm ID
  - `array $data` 需更新的记录键值表

- 返回`void`


### `->unLog();`
删除SessionForm记录

- 参数
  - `int $id` SessionForm ID

- 返回`void`


### `->filterByMid();`
按mid筛选SessionForm

- 参数
  - `int $mid` 会员ID

- 返回`\dce\project\request\SessionForm[]`


### `->filterBySid();`
按sid筛选SessionForm

- 参数
  - `string $sid` Session ID

- 返回`\dce\project\request\SessionForm[]`


### `->filterByFd();`
按fd筛选SessionForm

- 参数
  - `int $fd` 连接文件描述符
  - `string $apiHost` 连接主机
  - `int $apiPort` 连接端口
  - `string $extra = ''` 附加信息

- 返回`\dce\project\request\SessionForm[]`


### `->updateSession();`
批量更新某mid的Session

- 参数
  - `int $mid` 会员ID
  - `string $key` Session键
  - `mixed $value` Session值

- 返回`void`


### `->destroySession();`
批量销毁某mid的Session

- 参数
  - `int $mid` 会员ID

- 返回`void`


### `->expiredCollection();`
过期映射回收器

- 返回`void`


## \dce\project\request\SessionForm

Session关系映射表类


### `->id`
`int` 映射表ID

### `->sid`
`string` Session ID

### `->mid`
`string` 会员ID

### `->fd`
`int` 连接文件描述符

### `->apiHost`
`string` 连接主机

### `->apiPort`
`int` 连接端口

### `->extra`
`string` 附加信息

### `->createTime`
`string` 创建时间

