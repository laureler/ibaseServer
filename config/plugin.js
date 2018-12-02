exports.static = true;

exports.vuessr = {
  enable: true,
  package: 'egg-view-vue-ssr'
};
exports.multipleStatic  =  {
	enable: true,
    package: 'egg-multiple-static',
}

exports.webpack = {
	enable: true,
	package: 'egg-webpack',
}