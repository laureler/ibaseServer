'use strict';

import {
  SET_ARTICLE_LIST,
  SET_ARTICLE_DETAIL
} from './mutation-type';
// 引入types.js
import * as types from './type.js';

const mutations = {
  [SET_ARTICLE_LIST](state, items) {
    state.articleList = items;
  },
  [SET_ARTICLE_DETAIL](state, data) {
    state.article = data;
  },
  [types.WRAP_TYPE] (state,res) {
    state.wrapType =res
    // let tempJson = JSON.stringify(res);
    // window.sessionStorage.setItem('step', tempJson);
  },
  [types.CURRENT_MENU] (state,res) {
    state.currentMenu =res
  },
};
export default mutations;
