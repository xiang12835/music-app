import store from '@/store/index.js'

const PubFuc = {
	// 格式化时间戳
	formatTime (value) {
	    var value = String(value);
	    function t (v) {
	        return v = v < 10 ? ("0" + v) : v;
	    }
	    String.prototype.ToString = function (value) {
	        var date = new Date(parseInt(this.substring(6, this.length - 2)));
	        value = value.replace("yyyy", date.getFullYear());
	        value = value.replace("yy", t(date.getFullYear().toString().substr(2)));
	        value = value.replace("MM", t(date.getMonth() + 1));
	        value = value.replace("dd", t(date.getDate()));
	        value = value.replace("hh", t(date.getHours()));
	        value = value.replace("mm", t(date.getMinutes()));
	        value = value.replace("ss", t(date.getSeconds()));
	        value = value.replace("ms", date.getMilliseconds())
	        return value;
	    };
	    return value.ToString("yyyy-MM-dd  hh:mm:ss");
	},
	// 秒格式化 00:00 格式
	formatTime (second){
		var sec = second % 60;
		var min = Math.floor(second / 60);
		if(min.toString().length < 2){
			min = '0' + min;
		}
		if(sec.toString().length < 2){
			sec = '0' + sec;
		}
		return min + ':' + sec
	},
	// 设置角标
	setTabBarBadge (page) {
		// 设置 store 红点信息
		const accountMsg = store.state.message.account 
		const newMsg = store.state.message.newMsg || []
		
		newMsg[page] = 0
		
		const TempMsg = {
			account: page == 4 ? 0 : accountMsg,
			newMsg
		}
		store.commit('storeMessage', TempMsg)
		
		// 获取 store 红点信息
		const accountMsgNew = store.state.message.account
		const newMsgNew = store.state.message.newMsg || []
		
		if (accountMsgNew > 0) { // 如果有账号信息
			setTimeout(() => {
				// uni.setTabBarBadge 这个 API 在非tabbar页面上调用会失效。
				uni.setTabBarBadge({   // 设置角标
					index: 4,
					text: String(accountMsgNew)
				})
			})
		} else {
			setTimeout(() => {
				// 删除角标
				uni.removeTabBarBadge({
				   index: 0,
				})
			})
		}
		
		newMsgNew.forEach((item, index) => {  // 设置红点
			if (item > 0) {
				uni.showTabBarRedDot({
					index
				})
			} else {
				uni.hideTabBarRedDot({
					index
				})
			}
		})
	}
}

export default PubFuc