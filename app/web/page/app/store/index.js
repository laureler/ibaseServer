'use strict';
import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';

Vue.use(Vuex);
/**
 * 创建全局存储
 * @param initState
 * @returns {Store<{articleList: Array, article: {}}>}
 */
export default function createStore(initState = {}) {

  const state = {
    //文章列表
    // todo demo用 待删除
    articleList: [],
    // todo demo用 待删除
    article: {},
    ...initState,
    wrapType : -1, // 架构模式。1：支持三级菜单，单页面展示。2：支持两级菜单，标签页展示。
    currentMenu: {

    },
  };

  return new Vuex.Store({
    state,
    actions,
    getters,
    mutations
  });
}