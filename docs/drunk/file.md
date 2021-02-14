# 文件管理器

## \drunk\File

### `::write()`
将字符串写入文件（早期对file方法的封装，建议使用`file_put_contents`）

- 参数
  - `string $filename` 文件名
  - `string $content` 写入内容
  - `string $mode='wb'` 文件打开模式

- 返回`bool`

### `::listFile()`
筛选文件(仅文件)列表（早期封装版，建议使用`glob`）

- 参数
  - `array|string $pathsRoot` 需筛选的目录级，传数组可同时筛选多个目录
  - `array|string|null $match = null` 筛选规则，传数组可同时按多个规则筛选
  - `array|string|null $filter = null` 过滤规则，传数组可同时按多个规则过滤
  - `int $depth = 0` 筛选深度，0表示不限深度

- 返回`array`

### `::listDir()`
筛选目录(仅目录)列表（早期封装版，建议使用`glob`）

- 参数
  - `array|string $pathsRoot` 需筛选的目录级，传数组可同时筛选多个目录
  - `array|string|null $match = null` 筛选规则，传数组可同时按多个规则筛选
  - `array|string|null $filter = null` 过滤规则，传数组可同时按多个规则过滤
  - `int $depth = 0` 筛选深度，0表示不限深度

- 返回`array`

### `::list()`
筛选文件目录列表（早期封装版，建议使用`glob`）

- 参数
  - `array|string $pathsRoot` 需筛选的目录级，传数组可同时筛选多个目录
  - `array|string|null $match = null` 筛选规则，传数组可同时按多个规则筛选
  - `array|string|null $filter = null` 过滤规则，传数组可同时按多个规则过滤
  - `int $depth = 0` 筛选深度，0表示不限深度
  - `string $type = 'all'` 筛选类别
    - `file` 仅文件
    - `dir` 仅目录
    - `all` 文件和目录

- 返回`array`