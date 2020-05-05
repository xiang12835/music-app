import request from '@/utils/request/index.js'

export function apiGetNavList(data) {
	return request.request({
		url: '/minemock',
		method: 'GET',
		data: data,
		authType: 'None'
	})
}
