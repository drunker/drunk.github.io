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


### `->id`
`string` 树的ID

### `->parent`
`self` 父树

### `->children`
`self[]` 子树集


### `->addChild()`
添加子树

- 参数
  - `self $child`
  - `? string $key = null` 指定子树下标

- 返回`void`


### `->getChild()`
取子树

- 参数
  - `string $key` 子树下标

- 返回`self|null`


### `->getFamilyIds()`
取父族关系树ID集

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
  - `callable $callback(Tree $child, Tree $parent)` 

- 返回`void`


### `->childrenArrayify()`
子节点数组化

- 返回`self[]`