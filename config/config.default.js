'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1537409827938_2257';
  config.security = {
		csrf: {
			// 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
			// @todo 对于RESTful api应该如何解决跨域问题
			ignoreJSON: true,
            enable: false
		},
	},
  // add your config here
  config.middleware = [];

  return config;
};
