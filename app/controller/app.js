const Model = require('../mocks/article/list');
const Controller = require('egg').Controller;

class AppController extends Controller {
	//单页面静态组件渲染 基础设置
	async mainIndexClient() {
		await this.ctx.renderClient('mainIndexClient.js', {type:'base'});
	}

	//单页面静态组件渲染
	async demoAppClient() {
		await this.ctx.renderClient('demoAppClient.js', {
			type:"vueIndex",
			title:'我说什么来的'
		});
	}

	/**
	 * 客户端渲染
	 * @returns {Promise<void>}
	 */
	async client() {
		await this.ctx.renderClient('demoAppClient.js', {url: this.ctx.url});
	}

	async list() {
		const pageIndex = this.ctx.query.pageIndex;
		const pageSize = this.ctx.query.pageSize;
		this.ctx.body = Model.getPage(pageIndex, pageSize);
	}

	async detail() {
		const id = Number(this.ctx.params.id);
		this.ctx.body = Model.getDetail(id);
	}
}
exports.index = async ctx =>{
	const type = ctx.query.type;
	const q = ctx.query.q || 'node.js'
	if(type === 'bin'){
		ctx.redirect("http://www.baidu.com?key='123'")
	}else {
		ctx.redirect("http://www.baidu.com?key='nobin'")
	}
}
module.exports = AppController;
