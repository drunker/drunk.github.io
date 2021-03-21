# 节点树


## \dce\project\node\NodeTree

节点树，描述节点族系关系的类


### `->projectName`
`string` 所属项目名

### `->pathName`
`string` 路径名

### `->pathFormat`
`string` 所属路径

### `->pathParent`
`string` 父路径

### `->nodes`
`\dce\project\node\Node[]` 一个路径可能匹配不同的节点, 所以将节点按路径分组, (如将/edit同时用于添加编辑)

### `->hiddenChildren`
`\dce\project\node\NodeTree[]` 可省略路径子树集


### `->addNode()`
添加节点

- 参数
  - `Node $node`
  - `? string $key = null`

- 返回`void`


### `->getNode()`
根据ID取节点

- 参数
  - `string $id`

- 返回`\dce\project\node\Node`


### `->getFirstNode()`
取第一个节点

- 返回`\dce\project\node\Node`


### `->arrayify()`
将树对象数组化

- 返回`array`


## \dce\project\node\NodeManager

节点管理器


### `::getRootTree()`
取根节点树

- 返回`\dce\project\node\NodeTree`


### `::getTreeByPath()`
根据路径取节点树

- 参数
  - `string $path`

- 返回`\dce\project\node\NodeTree|null`


### `::getTreeById()`
根据节点ID取节点树

- 参数
  - `string $id`

- 返回`\dce\project\node\NodeTree|null`


### `::getNode()`
根据节点ID取节点对象

- 参数
  - `string $id`

- 返回`\dce\project\node\Node|null`


### `::isSubOf()`
判断某个节点路径是否在当前节点族中（常用于导航菜单的active）。

- 参数
  - `string $needlePath` 待查节点路径
  - `string $elderPath` 父类节点路径

- 返回`bool`