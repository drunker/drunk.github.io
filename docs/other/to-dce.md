# 注意事项


## 传统PHPer转战Dce

传统PHP编程中，一般是以Cgi式Web编程，所有PHP变量的生命周期为请求至响应之间，各个请求变量独立互不影响，所以很多服务都是以独立于请求的全局变量或方法提供。而常驻内存式Web编程时，无法再使用这些全局变量提供的服务，因为不同的请求需要在相同的内存环境处理，而传统全局变量无法针对请求提供服务。Dce为了兼容Cgi与常驻内存编程，在这些服务上进行了层通用封装，可以使你以同样的代码兼容两种模式，所以你编程时不要直接使用传统变量或方法，而应该使用Dce的封装方法。


### $_GET/$_POST/$_REQUEST/$_FILES

所有这些请求相关的变量，都不建议在Dce中直接使用，虽然它们可以正常的应用于Cgi模式，但这样你的代码将不再兼容。你应该通过`\dce\project\request\Request`对象来取这些参数，该对象还封装了其他请求相关参数，通过从该对象取请求参数，你的代码能兼容各种模式的编程，让你更简单愉悦的编码。

::: danger 不兼容编码 ×
``` php
$post = $_POST;
$put = json_decode(file_get_contents('php://input'), true);
$request = $_REQUEST;
```
:::

::: tip 兼容编码 √
``` php
$post = $request->post;
$put = $request->put;
$request = $request->request;
```
:::


### $_SESSION/$_COOKIE

会话相关变量同样不建议直接使用，而应该通过`\dce\project\request\Request::$cookie`与`\dce\project\request\Request::$session`来使用，这两个属性是对象而不是数组，并且会话数据不会自动加载，而是在你用到的时候惰性加载，使用该属性不仅让你的代码兼容性好，还能提升性能。

::: danger 不兼容编码 ×
``` php
$_SESSION['signer'] = [];
$signer = $_SESSION['signer'];
$sid = $_COOKIE['dcesid'];
```
:::

::: tip 兼容编码 √
``` php
$request->session->set('signer', []);
$signer = $request->session->get('signer');
$sid = $request->cookie->get('dcesid');
```
:::


### echo/print

不要在控制器中直接echo/print/printf，而应该使用视图方法如`->response()`等。


### 未完待续...