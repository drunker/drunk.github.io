# Url

## \dce\project\request\Url

Url工具类


### `::make()`
组装Url（DCE设计初期较注重SEO，将对伪静态的支持设计的比较灵活，高版本也延续了该传统，能够组装与解析各种规则的伪静态URL，具体参见示例部分）

- 参数
  - `string $path` 节点路径
  - `array $arguments = []` 需携带的GET参数表
  - `? string $suffix = null` 后缀（用于匹配节点）

- 返回`string|null`

- 示例
  - 一般URL
  ```php
  // nodes.php
  [
    'path' => 'home/news',
  ]

  // ::make()
  $url = \dce\project\request\Url::make('home/news', ['id'=>1]);
  test($url);
  // /?/home/news&id=1
  ```

  - 可省略路径
  ```php
  // nodes.php
  [
    'path' => 'home',
    'omissible_path' => true,
  ],
  [
    'path' => 'home/news/detail',
  ]

  // ::make()
  $url = \dce\project\request\Url::make('home/news/detail', ['id'=>1]);
  test($url);
  // /?/news/detail&id=1
  ```

  - 匹配参数
  ```php
  // nodes.php
  [
    'path' => 'home',
    'omissible_path' => true,
  ],
  [
    'path' => 'news/detail',
    'omissible_path' => true,
    'url_arguments' => [
      [
        'name' => 'id',
        'match' => fn($arg) => is_numeric($arg) ? $arg : false,
      ]
    ]
  ]

  // ::make()
  $url = \dce\project\request\Url::make('home/news/detail', ['id'=>1, 'ext'=>'other']);
  test($url);
  // /?/news/1&ext=other
  ```

  - 伪静态
  ```php
  // config.php
  [
    'rewrite_mode' => true,
  ]

  // nodes.php
  [
    'path' => 'home',
    'omissible_path' => true,
  ],
  [
    'path' => 'news/detail',
    'omissible_path' => true,
    'url_arguments' => [
      [
        'name' => 'id',
        'match' => '/^\d+$/',
      ],
      [
        'name' => 'ext',
        'match' => ['one', 'two', 'other'],
        'separator' => '_',
      ]
    ]
    'url_suffix' => '.html'
  ]

  // ::make()
  $url = \dce\project\request\Url::make('home/news/detail', ['id'=>1, 'ext'=>'other']);
  test($url);
  // /news/1_other.html
  ```


### `::argumentDecode()`
参数安全解码（参数值中若有参数分隔符则可能影响路由，所以make时需编码，提取后需解码）

- 参数
  - `string $argument` 参数值

- 返回`string`

- 示例
```php
$arg = "no%2D1%2E1";
$argDecoded = \dce\project\request\Url::argumentDecode($arg);
test($argDecoded);
// no-1.1
```


### `::validate()`
判断是否有效Url地址

- 参数
  - `string $url`
  - `bool $isFull = true` 是否全路径

- 返回`bool`


### `::fill()`
将URL转为全路径

- 参数
  - `string $url` 需补全的URL
  - `string $urlReference` 所依据的全路径URL

- 返回`string`

- 示例
```php
$path = '/wiki/';
$fullPath = \dce\project\request\Url::fill($path, "https://drunkce.com/favicon.ico");
test($fullPath);
// https://drunkce.com/wiki/
```


### `->getRootDomain()`
根据URL取根域名

- 参数
  - `? string $url = null` 需要提取的URL，若未传则取当前URL

- 返回`string`

- 示例
```php
$root1 = \dce\project\request\Url::getRootDomain("https://www.drunkce.cn/favicon.ico");
test($root1);
// drunkce.cn
$root2 = \dce\project\request\Url::getRootDomain("https://www.drunkce.com.cn/favicon.ico");
test($root2);
// drunkce.com.cn
```


### `->getDomain()`
取URL域名

- 参数
  - `? string $url = null` 需要提取的URL，若未传则取当前URL

- 返回`string`


### `->getCurrent()`
返回当前URL

- 返回`string`