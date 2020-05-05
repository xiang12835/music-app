import request from '@/utils/request/index.js'

// 示例代码，接口名字以 api 开头命名，协同开人员看到引用后就知道这是接口方法
export function apiAd(data) {
	return request.request({
		url: '/adMock',
		method: 'get',
		data,
		hideLoading: true
	})
}
