# 缓存

DCE可以通过配置里的[`缓存配置项`](/config/#cache)配置自动实例化缓存，缓存对象会赋到`\dce\cache\CacheManager`及`\dce\Dce`对象的属性上，你可以通过`\dce\Dce::$cache`调用缓存器方法。



## \dce\cache\CacheManager

缓存管理器（实例化各种缓存器，单例模式类，会自动实例化并绑定到`\dce\Dce::$cache`属性上，编程中若需调用缓存方法皆可通过该属性调用）


### `->file`
`\dce\cache\engine\FileCache` 文件缓存器实例

- 示例
```php
test(
    Dce::$cache->file->get('framework'),
    Dce::$cache->file->set('framework', ['name' => 'Dce']),
    Dce::$cache->file->get('framework'),
);
/*
1-1    bool(false)
1-2    bool(true)
1-3    array(1) {
         ["name"] => string(3) "Dce"
       }
*/
```

### `->redis`
`\dce\cache\engine\RedisCache` Redis缓存器实例

### `->memcache`
`\dce\cache\engine\MemcacheCache` Memcache缓存器实例

### `->memcached`
`\dce\cache\engine\MemcachedCache` Memcached缓存器实例

### `->var`
`\dce\cache\engine\VarCache` 静态变量缓存器实例

### `->shm`
`\dce\cache\engine\ShmCache` 共享内存缓存器实例

### `->default`
`\dce\cache\Cache` 默认缓存器实例（配置的默认缓存器名，为file/memcache/memcached中的一个）

- 示例
```php
test(
    Dce::$cache->get('framework'),
    Dce::$cache->set('framework', ['name' => 'Dce']),
    Dce::$cache->get('framework'),
);
/*
1-1    array(1) {
         ["name"] => string(3) "Dce"
       }
1-2    bool(true)
1-3    array(1) {
         ["name"] => string(3) "Dce"
       }
*/
```


### `init()`
实例化一个单例对象（Dce自调用）


### `->get()`
通过默认缓存器取缓存值（参数及返回值与`\dce\cache\Cache`对象对应的同名方法一致，下同）


### `->set()`
通过默认缓存器设置缓存


### `->touch()`
重置默认缓存有效时长


### `->set()`
通过默认缓存器设置缓存


### `->inc()`
通过默认缓存器递增缓存值


### `->dec()`
通过默认缓存器递减缓存值


### `->del()`
通过默认缓存器删除缓存


### `::fileIsModified()`
判断文件集是否被改动过（提取文件特征，取缓存的特征，若不一致，则表示文件有改动，否则没改动）

- 参数
  - `array $files` 文件集

- 返回`bool`



## \dce\cache\Cache;

缓存基类，定义了基本缓存操作方法。所有缓存类皆继承于此抽象类，即所有缓存器的调用方法一致。


### `->get();`
取缓存值

- 参数
  - `string|array $key` 缓存键
    - `string` 字符串式缓存键（字符串式键会被自动加上`Dce::getId()`为前缀，如果你不想被自动加前缀请使用数组式键，如`->get('key')`=>`->get(['key'])`）
    - `string[]` 字符串数组式缓存键，会自动以连接各个字符串，方便实现类前缀后缀之类的用法（注意，数组元素必须为字符串，Dce不会自动对其字符串编码，所以若非字符串，拼接时可能会抛出异常）

- 返回`mixed`，失败返回`false`

- 示例
```php
test(
    Dce::$cache->get('缓存键'),
    Dce::$cache->set('缓存键',  new StdClass),
    Dce::$cache->get('缓存键'),

    Dce::$cache->get(['前缀', '缓存键']),
    Dce::$cache->set(['前缀', '缓存键'],  new StdClass),
    Dce::$cache->get(['前缀', '缓存键']),
);
/*
1-1    bool(false)
1-2    bool(true)
1-3    object(stdClass)#8 (0) {
       }
1-4    bool(false)
1-5    bool(true)
1-6    object(stdClass)#10 (0) {
       }
*/
```


### `->set();`
设置缓存

- 参数
  - `string|array $key` 缓存键
  - `mixed $value` 缓存值
  - `int $expiry` 有效时长

- 返回`bool`


### `->touch();`
重置缓存有效时长

- 参数
  - `string|array $key` 缓存键
  - `int $expiry` 有效时长

- 返回`bool`


### `->inc();`
递增某缓存值

- 参数
  - `string|array $key` 缓存键
  - `int $value = 1` 增量

- 返回`int|false`


### `->dec();`
递减某缓存值

- 参数
  - `string|array $key` 缓存键
  - `int $value = 1` 增量

- 返回`int|false`


### `->del();`
删除某缓存

- 参数
  - `string|array $key` 缓存键

- 返回`bool`


## \dce\cache\engine\FileCache

文件缓存类（可永久缓存）


## \dce\cache\engine\RedisCache

Redis缓存类（依赖Redis扩展，可永久缓存）


## \dce\cache\engine\MemcacheCache

Memcache缓存类（依赖memcache扩展，默认当Memcache服务退出时缓存失效）


## \dce\cache\engine\MemcachedCache

Memcached缓存类（依赖memcached扩展，默认当Memcached服务退出时缓存失效）


## \dce\cache\engine\VarCache

静态变量缓存类（当前进程退出时缓存失效，缓存仅在进程内有效，无法跨进程操作）


## \dce\cache\engine\ShmCache

共享内存缓存类（依赖Swoole，Master进程退出时缓存失效，缓存在当前程序所有进程皆有效，可跨进程操作）
