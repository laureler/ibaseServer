const Model = require('../mocks/article/list');
const Controller = require('egg').Controller;
class AppController extends Controller {
  //单页面静态组件渲染
  async index() {
    await this.ctx.render('appClient.js', { url: this.ctx.url });
  }

  /**
   * 客户端渲染
   * @returns {Promise<void>}
   */
  async client() {
    await this.ctx.renderClient('appClient.js', { url: this.ctx.url });
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

module.exports = AppController;
