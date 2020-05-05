import request from '@/utils/request/index.js'

// 示例代码，接口名字以 api 开头命名，协同开人员看到引用后就知道这是接口方法
export function apiLogin(data) {
	return request.request({
		url: '/login/cellphone',
		method: 'GET',
		data,
		hideLoading: true
	})
}

export function apiLogout(data) {
	return request.request({
		url: '/logout',
		method: 'GET',
		data,
		hideLoading: true
	})
}

// 获取用户详情
export function apiUserDetail(data) {
	return request.request({
		url: '/user/detail',
		method: 'GET',
		data,
		hideLoading: true
	})
}
