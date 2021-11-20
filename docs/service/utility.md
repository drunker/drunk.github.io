# 综合工具

综合工具封装在内置项目中的`project/dce`项目中，该项目用于集成一些命令行小工具。

该项目根节点配置了可省略路径，所以调用时可以不带根路径，如
```shell
// 带根路径
dce dce sharding extend

// 不带根路径
dce sharding extend
// 也支持路径模式
dce sharding/extend
```


## 缓存工具
`dce cache`
- 功能
  - `clear` 清除服务器缓存
    - `-t, --type` 待清除缓存类型 ['file', 'redis', 'memcache', 'memcached', 'shm', 'var']

- 示例
```shell
# 清除文件缓存
dce cache clear

# 清除Redis缓存
dce cache clear -t=redis
# 或
dce cache clear -t redis
# 或
dce cache clear --type redis
```


## 拓库工具
[分库拓库工具](/sharding/extend.md)


## 任务计划工具
`dce crontab` 

- 若[配置了任务计划](../config/#cron)，其将会在启动Dce服务时自动启动，你也可以通过本命令行工具单独启动任务计划服务。
  - 示例
  ```php
  'cron' => [
    'per5min' => ['minute' => '*/5', 'command' => 'php dce'],
    'daily1345am' => ['minute' => 0, 'hour' => '1,3-5', 'command' => 'echo hello', 'enabled' => false, 'run_on_start' => true,],
  ],
  ```

- 功能
  - `start` 启动任务计划服务
  - `run [CRON_KEY]` 立即执行一次某个配置的任务
  - `status` 查看服务状态
  - `history` 查看任务被执行记录

::: tip
你可以使用`\dce\service\cron\TaskIterator`工具以更方便的编写需批量执行的任务的脚本
:::


## RPC工具
`dce rpc` 若[配置了Rpc服务](../config/#rpcservice)，其将会在启动Dce服务时自动启动，你也可以通过本命令行工具单独启动Rpc服务。
- 功能
  - `start` 启动Rpc服务器