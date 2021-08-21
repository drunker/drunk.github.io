# 树形对象基类

## \drunk\Tree

树形对象抽象类，子对象集成此对象实现树形对象。


示例（可参考`dce\project\node\NodeTree`）：
```php
use dce\base\TraitModel;
use drunk\Tree;

class NodeTree extends Tree {
    use TraitModel {
        TraitModel::arrayify as baseArrayify;
    }

    public string $nodeName;

    public function __construct(string $nodeName) {
        $this->nodeName = $nodeName;
    }

    public function arrayify() {
        $properties = $this->baseArrayify();
        $properties['children'] = $this->childrenArrayify();
        return properties;
    }
}

$tree = new NodeTree('根');
$tree->addClild(new NodeTree('大儿子'));
$tree->addClild(new NodeTree('二女儿'));
$tree->traversal(fn ($tree) => echo $tree->nodeName . "\n");
var_dump($tree->arrayify());

// 根
// 大儿子
// 二女儿
/*
[
    'nodeName' => '根',
    'children' => [
        ['nodeName' => '大儿子'],
        ['nodeName' => '二女儿'],
    ]
]
*/
```


### `::TRAVERSAL_STOP_CHILD`
`->traversal()`方法遍历时若返回本常量，则不继续遍历子级

### `::TRAVERSAL_STOP_SIBLING`
`->traversal()`方法遍历时不继续遍历同级剩余

### `::TRAVERSAL_STOP_ALL`
`->traversal()`方法遍历时终止过程

### `->id`
`string` 树的ID

### `->parent`
`self` 父树

### `->children`
`self[]` 子树集


### `->setChild()`
添加子树

- 参数
  - `self $child`
  - `string|array|null $keys = null` 指定子树下标

- 返回`void`


### `->getChild()`
取子树

- 参数
  - `string|array $$keys` 子树下标

- 返回`Tree|null`


### `->getParents()`
取父族树集

- 参数
  - `static|null $until = null` 直到取到某个父级，null则取到根级为止
  - `bool $elderFirst = true` 是否父辈优先（长者排前）

- 返回`Tree[]`


### `->getParentIds()`
取父族树ID集

- 参数
  - `static|null $until = null`
  - `bool $elderFirst = true`

- 返回`string[]`


### `->has()`
判断是否存在某个下标子树

- 参数
  - `string $key`

- 返回`bool`


### `->isEmpty()`
是否空树

- 返回`bool`


### `->traversal()`
遍历全树执行回调函数

- 参数
  - `callable $callback(static $child)` 该回调返回值可改变遍历行为。`{false: 跳出兄弟级遍历, 0: 不遍历子级}`

- 返回`void`


### `->childrenArrayify()`
子节点数组化

- 返回`self[]`


### `::from()`
将列表形数据树形化

- 参数
  - `array $items` 列表形数据
  - `static|string|int $pid` 根对象或ID
  - `int $deep = 0` 树形化深度，0表示不限深度
  - `string $primaryKey = 'id'`  主键名
  - `string $parentKey = 'pid'` 父键名
  - `bool $pkAsIndex = false` 是否以子树ID作为子元素下标

- 返回`array`

- 示例
```php
$tree = ArrayTree::from([
    ['id' => 1, 'pid' => 0, 'name' => '哈哈'],
    ['id' => 2, 'pid' => 1, 'name' => '嘿嘿'],
    ['id' => 3, 'pid' => 4, 'name' => '嚯嚯'],
    ['id' => 4, 'pid' => 0, 'name' => '嘻嘻'],
    ['id' => 5, 'pid' => 3, 'name' => '呵呵'],
    ['id' => 6, 'pid' => 5, 'name' => '呼呼'],
    ['id' => 7, 'pid' => 4, 'name' => '吼吼'],
], 0);

testPoint(
    $tree->arrayify(false),
);

/*
1-1    array(2) {
         [0] => array(4) {
           ["id"] => int(1)
           ["pid"] => int(0)
           ["name"] => string(6) "哈哈"
           ["children"] => array(1) {
             [0] => array(4) {
               ["id"] => int(2)
               ["pid"] => int(1)
               ["name"] => string(6) "嘿嘿"
               ["children"] => array(0) {
               }
             }
           }
         }
         [1] => array(4) {
           ["id"] => int(4)
           ["pid"] => int(0)
           ["name"] => string(6) "嘻嘻"
           ["children"] => array(2) {
             [0] => array(4) {
               ["id"] => int(3)
               ["pid"] => int(4)
               ["name"] => string(6) "嚯嚯"
               ["children"] => array(1) {
                 [0] => array(4) {
                   ["id"] => int(5)
                   ["pid"] => int(3)
                   ["name"] => string(6) "呵呵"
                   ["children"] => array(1) {
                     [0] => array(4) {
                       ["id"] => int(6)
                       ["pid"] => int(5)
                       ["name"] => string(6) "呼呼"
                       ["children"] => array(0) {
                       }
                     }
                   }
                 }
               }
             }
             [1] => array(4) {
               ["id"] => int(7)
               ["pid"] => int(4)
               ["name"] => string(6) "吼吼"
               ["children"] => array(0) {
               }
             }
           }
         }
       }
*/
```


### `->__construct();`
构造方法

- 参数
  - `array $properties` 属性键值表


### `->arrayify();`
将树形对象转化为树形数组

- 返回`array`



## \drunk\ArrayTree

树形数组类


### `->getItem()`
取当前数组

- 返回`array`


### `->arrayify()`
数组化树形对象

- 参数
  - `bool $withWrap = true` 是否保留根包裹

- 返回`array`