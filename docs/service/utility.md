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
  - clear 清除服务器缓存
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