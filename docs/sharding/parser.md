# 解析器

解析器主用于解析Sql语句，以供 ~~分库中间件~~做分库决策及对结果合并计算


## 简介

为了降低开发难度，Dce以`\dce\db\query\builder\StatementAbstract`对象作为分库决策判断条件。作者本想通过这个取巧，舍弃对原生语句分库查询的支持，以绕开Sql语句解析器的开发需求。但后面发现做合并计算时需要提取聚合函数，这个需求无法绕开，或者为了绕开需要大大增加`Query`对象的使用成本。所以没办法，作者最终还是编写了Sql解析器。但为了偷懒，只编写了对影响聚合计算的部分的解析器，所以分库查询还是只支持对象式的查询，后续可能会完善解析器以支持全语句解析，但那都是后话了。

本模块文件较多，并且你基本不会直接用到，所以不展开细讲，有兴趣者可自行查看源代码了解。


## \dce\sharding\parser\mysql\list\MysqlColumnParser

### `::build()`
解析SELECT语句的COLUMN部分

- 参数
  - `string $statement` 待解析语句
  - `int & $offset = 0` 起始解析偏移位置

- 返回`self`

- 示例
```php
$sql = "distinct case f1 when 1 then 2 else 0 end, sum (case f2 when 2 then 3 when 4 then 5 else 1 end) a1,
        `db1`.t1.`field1` as f1, t2 . field2 `f2`, field3 , 32.5,1,
        2 field2, 'aaa' as field, 'aa,ass55,5,5,\'fdfsd' g5,
        sum(`t1`.`field1`) as f1, max(if_null(field2, 0)) as f2, count(distinct field3)";
$parser = MysqlColumnParser::build($sql);
test($parser->toArray());
/*
1-1    array(4) {
         ["type"] => string(4) "list"
         ["class"] => string(6) "column"
         ["modifiers"] => array(1) {
           [0] => string(8) "distinct"
         }
         ["columns"] => array(13) {
           [0] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(5) {
               ["type"] => string(9) "statement"
               ["statement"] => string(4) "case"
               ["case"] => array(4) {
                 ["type"] => string(5) "field"
                 ["field"] => string(2) "f1"
                 ["table"] => NULL
                 ["db"] => NULL
               }
               ["when"] => array(1) {
                 [0] => array(4) {
                   ["type"] => string(9) "statement"
                   ["statement"] => string(4) "when"
                   ["when"] => array(2) {
                     ["type"] => string(5) "value"
                     ["value"] => float(1)
                   }
                   ["then"] => array(2) {
                     ["type"] => string(5) "value"
                     ["value"] => float(2)
                   }
                 }
               }
               ["else"] => array(2) {
                 ["type"] => string(5) "value"
                 ["value"] => float(0)
               }
             }
             ["alias"] => NULL
           }
           [1] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(4) {
               ["type"] => string(8) "function"
               ["name"] => string(3) "SUM"
               ["modifiers"] => NULL
               ["arguments"] => array(1) {
                 [0] => array(5) {
                   ["type"] => string(9) "statement"
                   ["statement"] => string(4) "case"
                   ["case"] => array(4) {
                     ["type"] => string(5) "field"
                     ["field"] => string(2) "f2"
                     ["table"] => NULL
                     ["db"] => NULL
                   }
                   ["when"] => array(2) {
                     [0] => array(4) {
                       ["type"] => string(9) "statement"
                       ["statement"] => string(4) "when"
                       ["when"] => array(2) {
                         ["type"] => string(5) "value"
                         ["value"] => float(2)
                       }
                       ["then"] => array(2) {
                         ["type"] => string(5) "value"
                         ["value"] => float(3)
                       }
                     }
                     [1] => array(4) {
                       ["type"] => string(9) "statement"
                       ["statement"] => string(4) "when"
                       ["when"] => array(2) {
                         ["type"] => string(5) "value"
                         ["value"] => float(4)
                       }
                       ["then"] => array(2) {
                         ["type"] => string(5) "value"
                         ["value"] => float(5)
                       }
                     }
                   }
                   ["else"] => array(2) {
                     ["type"] => string(5) "value"
                     ["value"] => float(1)
                   }
                 }
               }
             }
             ["alias"] => string(2) "a1"
           }
           [2] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(4) {
               ["type"] => string(5) "field"
               ["field"] => string(6) "field1"
               ["table"] => string(2) "t1"
               ["db"] => string(3) "db1"
             }
             ["alias"] => string(2) "f1"
           }
           [3] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(4) {
               ["type"] => string(5) "field"
               ["field"] => string(6) "field2"
               ["table"] => string(2) "t2"
               ["db"] => NULL
             }
             ["alias"] => string(2) "f2"
           }
           [4] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(4) {
               ["type"] => string(5) "field"
               ["field"] => string(6) "field3"
               ["table"] => NULL
               ["db"] => NULL
             }
             ["alias"] => NULL
           }
           [5] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(2) {
               ["type"] => string(5) "value"
               ["value"] => float(32.5)
             }
             ["alias"] => NULL
           }
           [6] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(2) {
               ["type"] => string(5) "value"
               ["value"] => float(1)
             }
             ["alias"] => NULL
           }
           [7] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(2) {
               ["type"] => string(5) "value"
               ["value"] => float(2)
             }
             ["alias"] => string(6) "field2"
           }
           [8] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(2) {
               ["type"] => string(5) "value"
               ["value"] => string(3) "aaa"
             }
             ["alias"] => string(5) "field"
           }
           [9] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(2) {
               ["type"] => string(5) "value"
               ["value"] => string(20) "aa,ass55,5,5,\'fdfsd"
             }
             ["alias"] => string(2) "g5"
           }
           [10] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(4) {
               ["type"] => string(8) "function"
               ["name"] => string(3) "SUM"
               ["modifiers"] => NULL
               ["arguments"] => array(1) {
                 [0] => array(4) {
                   ["type"] => string(5) "field"
                   ["field"] => string(6) "field1"
                   ["table"] => string(2) "t1"
                   ["db"] => NULL
                 }
               }
             }
             ["alias"] => string(2) "f1"
           }
           [11] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(4) {
               ["type"] => string(8) "function"
               ["name"] => string(3) "MAX"
               ["modifiers"] => NULL
               ["arguments"] => array(1) {
                 [0] => array(4) {
                   ["type"] => string(8) "function"
                   ["name"] => string(7) "IF_NULL"
                   ["modifiers"] => NULL
                   ["arguments"] => array(2) {
                     [0] => array(4) {
                       ["type"] => string(5) "field"
                       ["field"] => string(6) "field2"
                       ["table"] => NULL
                       ["db"] => NULL
                     }
                     [1] => array(2) {
                       ["type"] => string(5) "value"
                       ["value"] => float(0)
                     }
                   }
                 }
               }
             }
             ["alias"] => string(2) "f2"
           }
           [12] => array(4) {
             ["type"] => string(9) "statement"
             ["statement"] => string(6) "column"
             ["field"] => array(4) {
               ["type"] => string(8) "function"
               ["name"] => string(5) "COUNT"
               ["modifiers"] => array(1) {
                 [0] => string(8) "distinct"
               }
               ["arguments"] => array(1) {
                 [0] => array(4) {
                   ["type"] => string(5) "field"
                   ["field"] => string(6) "field3"
                   ["table"] => NULL
                   ["db"] => NULL
                 }
               }
             }
             ["alias"] => NULL
           }
         }
       }
*/
```


### 注意
::: warning
解析器支持的语法已基本在上述示例中包括，尚不支持对计算运算符、逻辑运算符、判断运算符等的解析。如果你的Sql的SELECT COLUMN部分包含有不支持的语法，将会抛出异常或者导致结果错误。对于这些不支持的语法，你可以在取出结果后自行编程实现。作者会评估这些语法的重要性及研发难易度，陆续的支持完善。
:::