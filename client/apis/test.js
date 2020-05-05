import request from '@/utils/request/index.js'

export function test200(data) {
	return request.request({
		url: '/get200',
		method: 'POST',
		data: data,
		authType: 'None'
	})
}
