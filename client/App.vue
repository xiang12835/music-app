<script>
	import { mapMutations } from 'vuex';
	export default {
		onLaunch() {
			console.log('App Launch')
			uni.getStorage({
				key: 'userInfo',
				success: res => {
					console.log(res.data)
					// 此处仅做演示
					// 跟后台校验token的有效性，判定是否在登录状态。如果token失效，需重新登录。app端不强制用户登录，可以游客身份登录，可以进一步优化流程
					// uni.request({
					//  url: '',    // 验证token有效性的api
					//  header: {  
					//     "Token":res.data.token  
					//  },  
					// 	method: "POST",
					// 	success: response => {
					// 		if (response.data.code === 200) {
					// 			this.storeLogin(e.data);
					// 		} else {  // 验证无效清除用户原有缓存数据
					// 			this.storeLogout()
					// 		}
					// 	}
					// })
					
					this.storeLogin(JSON.parse(res.data))
					
					const mockMessage = {  // 模拟应用信息
						newMsg: [0, 1, 1, 0, 0],   // 红点信息
						account: 2   // 账号信息
					}
					
					this.storeMessage(mockMessage)
				}
			});
		},
		onShow() {
			console.log('App Show')
			let adShowTime = (10 * 60 * 1000)  // 10分钟（单位毫秒）
			// let adShowTime = (3 * 1000)  // 3秒测试（单位毫秒）
			let nowTime = (new Date()).getTime()
			let leaveTime = this.$store.state.leaveTime
			
			if ((nowTime - leaveTime) > adShowTime && leaveTime > 10) {
				console.log('出现广告吧')
				uni.navigateTo({
					url: '/pages/account/ad'
				});
			}
		},
		onHide() {
			console.log('App Hide')
			// 记录离开时间
			this.$store.commit('storeLeaveTime')
		},
		methods: {  
			...mapMutations(['storeLogin', 'storeLogout', 'storeMessage'])  
		} 
	}
</script>

<style lang="scss">
@import './common/css/common.scss';
@import './common/css/iconfont.css';
</style>
