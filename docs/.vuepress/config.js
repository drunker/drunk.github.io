module.exports = {
  host: '0.0.0.0',
  port: 8810,
  evergreen: true,
  dest: 'dist',
  title: 'Dce',
  description: 'Dce是一款基于PHP8开发的网络编程框架，支持传统Cgi式Web编程及命令行工具编程，也支持Swoole下常驻内存式Web编程与长连接服务器编程，并且设计了一套通用的RCR架构处理所有类型网络编程，让你的应用项目保持清晰整洁，助你轻松编写出易复用、好维护的代码',
  locales: {
    '/': {
      lang: 'zh-CN',
    }
  },
  markdown: {
    lineNumbers: true
  },
  plugins: [
    '@vuepress/back-to-top',
    [
      '@vuepress/last-updated',
      {
        dateOptions: {
          hour12: false
        }
      }
    ]
  ],
  themeConfig: {
    repo: 'idrunk/dce',
    docsRepo: 'idrunk/dce-wiki',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: '在Github上编辑此页',
    lastUpdated: '更新于',
    logo: '/assets/img/logo.png',
    sidebarDepth: 2,
    nav: [
      { text: 'Dce', link: '/' },
      { text: '指南', link: '/guide/' },
    ],
    sidebar: [
      {
        title: '指南',
        children: [
          '/guide/',
          '/guide/design',
          '/guide/get',
          '/guide/first-app',
        ]
      },
      {
        title: '组件',
        children: [
          {
            title: '基础',
            children: [
              '/base/',
              '/base/lib',
              {
                title: '扩展类库',
                children: [
                  '/drunk/debug',
                  '/drunk/file',
                  '/drunk/network',
                  '/drunk/char',
                  '/drunk/structure',
                  '/drunk/tree',
                  '/drunk/utility',
                ]
              }
            ]
          },
          {
            title: '配置',
            children: [
              '/config/',
              '/config/lib',
              '/config/node',
              '/config/node-tree',
            ]
          },
          '/request/project',
          {
            title: '请求',
            children: [
              '/request/',
              '/request/raw',
              '/request/router',
              '/request/controller',
              '/request/view',
              '/request/session',
              '/request/cookie',
              '/request/url',
              '/request/session-manager',
            ]
          },
          {
            title: '模型',
            children: [
              '/model/',
              '/model/validator',
            ]
          },
          '/pool/',
          '/rpc/',
          {
            title: '储存',
            children: [
              '/storage/',
              '/storage/redis',
            ]
          },
          '/event/',
        ]
      },
      {
        title: '数据库',
        children: [
          '/db/',
          {
            title: '数据库',
            children: [
              '/db/connector',
              '/db/proxy',
              '/db/query_builder',
              '/db/query',
              '/db/entity',
              '/db/active',
            ]
          },
          {
            title: '中间件',
            children: [
              '/sharding/id_generator',
              '/sharding/parser',
              '/sharding/',
              '/sharding/extend',
            ]
          },
        ]
      },
      {
        title: '内置服务',
        children: [
          '/service/',
          '/service/http',
          '/service/websocket',
          '/service/tcp',
        ]
      },
      {
        title: '其他',
        children: [
          '/other/to-dce',
          '/other/faq',
          '/other/links',
        ]
      }
    ],
  }
};
