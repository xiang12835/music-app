import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

let storePlayList = {
	curSong: {},       // 当前播发歌曲信息
	list: [],          // 播放列表
	playState: false   // 播放状态
}
try {  // 给H5端缓存住音乐数据
    const value = uni.getStorageSync('playList');
    if (value) {
		storePlayList = JSON.parse(value)
    }
} catch (e) {
    // error
}

const store = new Vuex.Store({
	state: {
		userInfo: {},
		hasLogin: false,
		leaveTime: 0,
		message: {},  // 角标信息
		playList: storePlayList,
	},
	mutations: {
		storeLeaveTime(state, payload) { // 记录离开时间
			let date = new Date()
			state.leaveTime = date.getTime()
		},
		storeLogin(state, payload) { // 改变登录状态
			const temp = {
				hasLogin: true,
				token: payload.token,
				profile: payload.profile
			}
			
			state.userInfo = Object.assign({}, state.userInfo, temp)
			
			// 将用户信息保存在本地
			uni.setStorageSync('userInfo', JSON.stringify(state.userInfo))
		
		},
		storeLogout(state) { //退出登录
			const temp = {
				hasLogin: false,
				token: '',
				profile: {}
			}
			state.userInfo = Object.assign({}, state.userInfo, temp)
			
			uni.removeStorageSync('userInfo')
		},
		storeMessage(state, payload) {   // 角标信息
			state.message = {...state.message, ...payload}
		},
		// 设置播放列表
		storePlayList(state, payload) {
			state.playList = Object.assign({}, state.playList, payload)
			
			// #ifdef H5
			// 给H5端缓存住音乐数据
			uni.setStorage({
			    key: 'playList',
			    data: JSON.stringify(state.playList),
			    success: function () {
			        console.log('存储列表success');
			    }
			});
			// #endif
		}
	}
})

export default store
