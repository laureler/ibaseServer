# 基于Node.js egg.js的 中途岛服务器



## QuickStart
配置信息：（必须配置）
1. `${app_root}/config/config.default.js` 找到 ibaseDir变量，修改为你本地ibase项目的.git的根路径
2. `${app_root}/config/config.local.js` 找到 httpProxy变量，三个变量分别为三个拦截器的配置，会根据你配置的url路径来映射代理。
* 注意：
	1. 拦截请求会有先后顺序，也就是说如果在 第一个拦截(pxoxy_0)里面拦截了所有请求，后续的拦截是不会拦截到的。
	所以，请按照拦截器的准则，先易后难，先少后多的原则（如果你一开始就拦截了全部，那么会导致你后续拦截失效）
	



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