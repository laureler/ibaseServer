import axios from 'axios'
// import {LOG_OUT} from '../constants/index.js'
/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */

/**
 * 请求之前可以做什么
 */
//设置请求头
/*axios.interceptors.request.use((config) => {
  config.headers.common['Authorization'] = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJJZCI6MTQ3MzksIlVzZXJOYW1lIjoiMTg1MjAxMjI5NzgtMSIsIk5hbWUiOiIiLCJMWERIIjoiMTg1MjAxMjI5NzgiLCJTeXN0ZW1JZCI6NSwiQ29tcGFueUlkIjoiMyIsIkNvbXBhbnlOYW1lIjoi5YWs5LyXIiwiQ29tcGFueVR5cGUiOjEwMCwiSXNBdXRoZW50aWNhdGVkIjp0cnVlLCJ1c2VyVHlwZSI6MiwiU3RvcmVOYW1lIjoiIiwiVmFsaWRTdGF0ZSI6IiIsIkxvZ2luRGF0ZSI6IlwvRGF0ZSgxNTI4ODg1NjI4MDAwKVwvIn0.cm3IkD1kn1KzXScP-4c84ek9n0269ZjjY3FkXRaiIYQ'
  return config;
}, (error) => {

  return Promise.reject(error);
});*/

let activeId = sessionStorage.getItem('activeId');
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
	// 在发送请求之前做些什么
	return config;
}, function (error) {
	// 对请求错误做些什么
	return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
	// 对响应数据做点什么
	if(response.status == 302){
		debugger
		if(window.parent){
			window.parent.location.href = "/cas/login"
		}
		window.location.href = "/cas/login"
	}
	return response;
}, function (error) {
	// 对响应错误做点什么
	return Promise.reject(error);
});
export default {
	fetch: (url,params={})=>{
		return new Promise((resolve,reject) => {
			axios.get(url,{
					params:params
				})
				.then(response => {
					resolve(response.data);
				})
				.catch(err => {
					reject(err)
				})
		})
	},
	post: (url,data = {})=>{
		return new Promise((resolve,reject) => {
			axios.post(url,data)
				.then(response => {
					resolve(response.data);
				},err => {
					reject(err)
				})
		})
	},
	patch: (url,data = {})=>{
		return new Promise((resolve,reject) => {
			axios.patch(url,data)
				.then(response => {
					resolve(response.data);
				},err => {
					reject(err)
				})
		})
	},
	put: (url,data = {})=>{
		return new Promise((resolve,reject) => {
			axios.put(url,data)
				.then(response => {
					resolve(response.data);
				},err => {
					reject(err)
				})
		})
	}
}


/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */



/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */


/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */


