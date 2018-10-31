# 基于Node.js egg.js的 中途岛服务器



## QuickStart




1. 如果你希望代理服务端的数据和页面、又希望使用本地的静态资源
	1. 你需要关闭静态资源的代理 -->  httpProxy.js中isProxyStatic()方法，默认就是不代理的。
	2. 此时由于没有代理静态资源，会出现404，所以你需要配置本地的静态资源。config.default.js中配置变量ibaseDir为你的本地ibase项目
	3. ibase项目常用的web模块已经配置出来相对路径，你可以参考继续配置自己的地址。
2.如果你是不希望使用代理功能，app.js注释代码即可	



### 开发者选项

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### 部署项目

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org