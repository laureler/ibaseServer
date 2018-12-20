'use strict';

import * as Type from './mutation-type';
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const host = 'http://127.0.0.1:7001';

const actions = {
    /**
     * 文章列表数据
     * @param commit
     * @param dispatch
     * @param state
     * @returns {*}
     * @constructor
     */
  FETCH_ARTICLE_LIST: ({ commit, dispatch, state }) => {
    if (!state.articleList.length) {
      return axios.get(`${host}/api/article/list`)
        .then(response => {
          const data = response.data.list;
          commit(Type.SET_ARTICLE_LIST, data);
          return data;
        });
    }
    return Promise.resolve();
  },
    /**
     * 文章详细数据
     * @param commit
     * @param dispatch
     * @param state
     * @param id
     * @returns {*}
     * @constructor
     */
  FETCH_ARTICLE_DETAIL: ({ commit, dispatch, state }, { id }) => {
    if (state.article.id !== Number(id)) {
      return axios.get(`${host}/api/article/${id}`)
        .then(response => {
          const data = response.data;
          commit(Type.SET_ARTICLE_DETAIL, data);
        });
    }
    return Promise.resolve();
  }
};

export default actions;
