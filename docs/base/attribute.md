# 注解式编程

注解式编程表示通过在类、类属性、类方法等上，通过注解的形式，调用关联的方法、建立关联属性或装饰目标类等，可以将相关的属性方法一块定义绑定，自动完成麻烦的初始工作等，使编程工作更加的便捷而优雅。

[加载器](../base/#dce-loader-loader)在加载类时会触发加载完成事件，类的装饰、注解的解析都是在这个事件中处理，你可以注册该事件实现自定义类装饰。



## \dce\loader\Decorator

类装饰器接口，亦可用作类注解。实现本接口或者标记注解的类，在被自动加载时，将被扫描属性方法并尝试解析装饰。需装饰的类必须是独立的符合自动加载的文件，否则需手动调用装饰方法。



## \dce\loader\DecoratorManager

类装饰管理器，绑定类加载事件，并在事件回调中尝试解析装饰Dce类，Dce内置了下述注解支持。


### `::decorate()`
手动装饰一个类（目标类需实现Decorator接口或者标注类注解才能被装饰，符合自动加载的类会自动装饰，无需手动调用此方法）

- 参数
  - `string $className` 待装饰类名

- 返回`void`



## \dce\loader\attr\Constructor

实例器接口，亦可用作注解。实现了该接口的类，在实现了装饰器接口的类中，作为静态属性类型约束或者标记为注解时，将被自动实例化，并赋值到类的静态属性。直接看示例代码可能更易理解：

### 示例

1. 创建实现接口的类
```php
// TypeClass.php
<?php
class TypeClass implements \dce\loader\attr\Constructor { // 实现实例器接口
    public function __construct(
        public int $id,
    ) {}
}
```

2. 创建需自动初始化静态属性的类（即实现装饰器接口或标记注解）
```php
// ServiceClass.php
<?php
use dce\loader\Decorator;
use dce\loader\attr\Constructor;

#[Decorator] // 使用注解标记当前类需装饰
class ServiceClass {
// class ServiceClass implements \dce\loader\Decorator { // 实现装饰器接口自动装饰 (效果和使用标注一致, 你可以注释掉上两行并取消此行注释测试)

    public static TypeClass|int $p1 = 789; // 因为TypeClass实现了Constructor, 所以无需注解也能自动实例化
    // 属性若有默认值, 则将作为实例化类时的第一个参数, 所以使用了联合类型约束以适配默认值的类型

    #[Constructor(ArrayObject::STD_PROP_LIST)] // 对于未实现Constructor接口的类, 可以使用注解的形式自动实例化
    public static ArrayObject|array $p2 = [1, 2, 3]; // 如果类需不止一个构造参数, 则剩余参数可以在注解中传入

    #[Constructor([4, 5, 6], ArrayObject::STD_PROP_LIST)] // 也可以将全部参数都通过注解传入
    public static ArrayObject $p3; // 使用注解传参初始实例化时, 无需联合约束
}
```

3. 创建测试脚本
```php
// attribute.php
<?php
require_once __DIR__ . "/vendor/autoload.php";
\dce\Dce::initOnly(); // 仅注册Dce类库不引导

\dce\loader\Loader::preload('TypeClass', __DIR__ . '/TypeClass.php'); // 注册类自动加载
\dce\loader\Loader::preload('ServiceClass', __DIR__ . '/ServiceClass.php');

testPoint( // 打印自动实例化的类静态属性
    ServiceClass::$p1,
    ServiceClass::$p2,
    ServiceClass::$p3,
);
```

4. 执行结果
```php
/*
1-1    object(TypeClass)#19 (1) {
         ["id"] => int(789)
       }
1-2    object(ArrayObject)#17 (1) {
         ["storage":"ArrayObject":private] => array(3) {
           [0] => int(1)
           [1] => int(2)
           [2] => int(3)
         }
       }
1-3    object(ArrayObject)#20 (1) {
         ["storage":"ArrayObject":private] => array(3) {
           [0] => int(4)
           [1] => int(5)
           [2] => int(6)
         }
       }
*/
```

从结果可以看出，所有静态属性都被自动实例化了，较优雅的解决了PHP不支持对类属性自动实例化初始化的麻烦。



## \dce\loader\attr\Singleton

单例实例器，自动实例化单例实例。与实例器接口类似，能自动实例化单例实例，仅能以注解的形式使用。



## \dce\loader\attr\Sington

按参单例实例器。与上述单例实例器的区别是，上述是传统的单例，而按参单例表示，以相同的参数取类实例时，将取到相同的实例，否则取新实例。（两种形式即使都不传参数也将取到不同实例）



## \dce\i18n\Language

[语种文本映射类](../config/i18n.md#dce-i18n-language)。本类实现了`\dce\loader\attr\Constructor`接口，所以可以在类静态属性时自动实例化，另外本类自身也被定义为了注解类，可以在类常量上标注解，见示例：


### 示例

1. 创建文本字典类
```php
<?php
use dce\i18n\Language;
use dce\loader\Decorator;
use dce\loader\attr\Constructor;

class TextMapping implements Decorator { // 实现或者标注Decorator类装饰器的类会被自动解析装饰
    #[Language(['语种映射表配置错误', 'Language mapping error'])] // 常量式Language注解, 注解参数设置语种文本映射实例, 常量值为该实例ID
    public const LANGUAGE_MAPPING_ERROR = 100; // 此种形式比较适合需要ID标识实例的场景, 多语种异常则非常适合这种形式

    public const LANGUAGE_MAPPING_CALLABLE_ERROR = 101; // 静态属性式Language实例, 并定义了常量作为该实例ID, 此种组合式定义效果同上述常量式
    #[Constructor(self::LANGUAGE_MAPPING_CALLABLE_ERROR)]
    public static Language|array $LANGUAGE_MAPPING_CALLABLE_ERROR = ['语种映射工厂配置错误或工厂方法未返回语种文本映射表', 'Language factory callable error'];

    public static Language|array $hello = ['你好 %s !', 'Hello %s !']; // 纯静态属性式Language实例, 此种形式比较适合纯多语种文案场景, 如各种提示文案等
}
```

2. 创建测试脚本
```php
<?php
require_once __DIR__ . "/vendor/autoload.php";
\dce\Dce::initOnly();

\dce\loader\Loader::preload('TextMapping', __DIR__ . '/TextMapping.php');

testPoint(
    (string) lang(TextMapping::LANGUAGE_MAPPING_ERROR), // 通过常量ID取语种文本实例
    (string) lang(TextMapping::LANGUAGE_MAPPING_CALLABLE_ERROR),
    (string) TextMapping::$LANGUAGE_MAPPING_CALLABLE_ERROR, // 直接取静态属性语种文本实例
    (string) TextMapping::$hello->format(lang(['世界', 'World']))->lang(\dce\i18n\Language::EN), // 直接取静态属性语种文本实例并调用对象方法
);
```

3. 执行结果
```php
/*
1-1    string(27) "语种映射表配置错误"
1-2    string(75) "语种映射工厂配置错误或工厂方法未返回语种文本映射表"
1-3    string(75) "语种映射工厂配置错误或工厂方法未返回语种文本映射表"
1-4    string(13) "Hello World !"
*/
```



## \dce\model\Model;

模型基类实现了`dce\loader\Decorator`装饰器接口，所有装饰器都可以应用于该类及其子类。另外针对模型定义了[模型属性](../model/#dce-model-property)、[模型校验器](../model/validator.md)、[表实体字段](../db/entity.md#dce-db-entity-dbfield)注解，你可以点击查看对应详细介绍。



## \dce\base\Exception;

异常基类实现了`dce\loader\Decorator`装饰器接口，所有装饰器都可以应用于该类及其子类，你可以基于此方便的定义异常消息代码。

```php
<?php
require_once __DIR__ . "/vendor/autoload.php";
\dce\Dce::initOnly();

class TestException extends \dce\base\Exception {
    #[\dce\i18n\Language(['%s 错误', '%s error'])]
    public const INVALID_CODE = 10001;

    public static \dce\i18n\Language|array $invalidCode = ['验证码错误', 'Code error'];
}

// TestException不会经过自动加载, 所以需手动调用装饰该类
\dce\loader\DecoratorManager::decorate(TestException::class);

$exception1 = (new TestException(TestException::INVALID_CODE))->format(lang(['验证码', 'Verify code']))->lang('en');
$exception2 = new TestException(TestException::$invalidCode);

testPoint(
    $exception1->getMessage(),
    $exception1->getCode(),
    $exception2->getMessage(),
    $exception2->getCode(),
);

/*
1-1    string(17) "Verify code error"
1-2    int(10001)
1-3    string(15) "验证码错误"
1-4    int(0)
*/
```



## \dce\project\node\Node

节点类是个注解式类，可在控制器方法上标注，以定义Dce接口节点。与上述不同的是，节点控制器无需实现或者标注`Decorator`，因为节点注解不是依赖类加载事件实现。实现普通节点时已做了很多优化策略，为了方便复用他们，单独对节点注解做了解析，后续考虑更仔细后可能还会调整为实现`Decorator`接口的方式，但使用方法将向上兼容。更多详情点击[这里](../config/node.md#注解式节点)了解。