<template>
	<view class="search-page" :class="{show: isShow}" v-if="isShow">
		<uni-nav-bar fixed :isShowLeft="false" :status-bar="true" @clickLeft="goCloud" @clickRight="goCloud">
			<view class="search-box  flex-box">
				<view class="top-search flex-box flex-item">
					<image class="search-icon" src="/static/image/search/2.png"></image>
					<input class="flex-item" :focus="isFocus" type="text" v-model="searchTxt" @confirm="addSearch" confirm-type="search" @input="inputSearch">
				</view>
				<view class="cancle" @click="close">取消</view>
			</view>
			<!-- #ifdef APP-PLUS || H5 -->
			<block slot="right"><image class="top-img" src="/static/image/search/1.png"></image></block>
			<!-- #endif -->
		</uni-nav-bar>
		<scroll-view scroll-y="true" class="page-content" @click="blurSearch">
			<template v-if="!searchTxt.trim().length">
				<image class="top-ad" src="/static/image/search/s_03.png"></image>
				<view class="history-list" v-if="historyList.length">
					<view class="title-bar flex-box">
						<view class="title">搜索历史</view>
						<image class="icon" src="/static/image/search/3.png" @click="clearSearch"></image>
					</view>
					<scroll-view class="list scroll-view" scroll-x :show-scrollbar="false">
						<view class="item" v-for="(item, index) in historyList" :key="index" @click="goUrl(item)">
							<view class="desc">{{ item }}</view>
						</view>
					</scroll-view>
				</view>
				<view class="hot-list">
					<view class="title-bar flex-box">
						<view class="title">热搜榜</view>
					</view>
					<view class="list">
						<view class="item flex-box" v-for="(item, index) in hotList" :key="index" @click="goUrl(item.searchWord)">
							<view class="num" :class="{on: index < 3}">{{index + 1}}</view>
							<view class="flex-item">
								<view class="flex-box con">
									<view class="tit">{{item.searchWord}}</view>
									<view class="count">{{item.score}}</view>
									<image class="icon" :src="item.iconUrl" mode="aspectFit"></image>
								</view>
								<view class="desc">
									{{item.content}}
								</view>
							</view>
						</view>
					</view>
				</view>
			</template>
			<view v-if="searchTxt.trim().length" class="suggest-list">
				<view class="suggest">搜索 {{'"'+searchTxt.trim()+'"'}}</view>
				<view class="item flex-box" v-for="(item, index) in suggestList" :key="index" @click="goUrl(item.keyword)">
					<view class="icon iconfont">&#xe613;</view>
					<view class="word flex-item">{{item.keyword}}</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	// 防抖
	function debounce(fn, wait = 300) {    
	    var timeout = null;    
	    return function() {        
	        if(timeout !== null) clearTimeout(timeout);        
	        timeout = setTimeout(fn, wait);    
	    }
	}
	var that = null
	import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue';
	import { apiGetSearcHot, apiSearchSuggest } from '@/apis/search.js';
	
	export default {
		components: {
			uniNavBar,
		},
		data() {
			return {
				isShow: false,
				isFocus: false,
				searchTxt: '',
				historyList: [],
				hotList: [],
				suggestList: []
			};
		},
		created() {
			that = this
		},
		methods: {
			close () {
				this.$emit('close')
				this.isShow = false
				this.searchTxt = ''
				this.suggestList = []
			},
			open () {
				this.isShow = true
				this.isFocus = true
				this.getSearchList ()
				this.getHotList()
			},
			blurSearch () {
				this.isFocus = false
			},
			// 获取热门搜索
			getHotList () {
				if (this.hotList.length > 0) {
					return false
				}
				apiGetSearcHot().then(res => {
					this.hotList = res.data
				})
			},
			// 获取搜索历史
			getSearchList () {
				try {
				    const value = uni.getStorageSync('searchlist');
				    if (value) {
						this.historyList = JSON.parse(value)
				    }
				} catch (e) {
				    // error
				}
			},
			// 清除历史
			clearSearch () {
				uni.showModal({
				    title: '',
				    content: '确认清除全部历史记录？',
				    success: res => {
				        if (res.confirm) {
							uni.setStorageSync('searchlist', '')
							this.historyList = []
				        } else if (res.cancel) {
				            // console.log('用户点击取消');
				        }
				    }
				});
				
			},
			// 添加搜索
			addSearch () {
				const txt = this.searchTxt.trim()
				
				if (txt.length == 0) {  // 空字符不添加
					return false
				}
				
				const tempIndex = this.historyList.indexOf(txt)
				if (tempIndex !== -1) {  // 如果存在相同的删除旧的
					this.historyList.splice(tempIndex, 1)
				}
				
				// 插入数组前
				this.historyList.unshift(txt)
				if (this.historyList.length > 7) {  // 数组长度7
					this.historyList = this.historyList.slice(0, 7)
				}
				uni.setStorageSync('searchlist', JSON.stringify(this.historyList))
			},
			// 输入搜索
			inputSearch: debounce(() => {
				// 未搜索或者写入空格的情况下不显示搜索建议
				if (!that.searchTxt.trim().length) {
					that.suggestList = []
					return false
				}
				const par = {
					type: 'mobile',
					keywords: that.searchTxt.trim(),
				}
				// 请求后台数据
				apiSearchSuggest(par).then(res => {
					that.suggestList = res.result.allMatch
				})
			}),
			goCloud() {
				uni.showToast({
					icon: 'none',
					title: '功能未开发'
				});
			},
			goUrl (keyword) {
				uni.navigateTo({
					url: '/pages/subpages/index/searchList?keyword=' + keyword
				})
			}
		}
	}
</script>

<style lang="scss">
	.search-page{
		position:absolute;
		top:0;
		left:0;
		width:100%;
		background: #fff;
		min-height:100%;
		transition: transform 0.1s;
		transform: translateX(100%);
		z-index: 100;
		&.show{
			transform: translateX(0)
		}
	}
.search-box{
	width:630rpx;
	/* #ifdef MP-WEIXIN */
	width: 540rpx;
	/* #endif */
	align-items: center;
	.cancle{
		width:70rpx;
		font-size: 34rpx;
		color:#000;
	}
}
.top-img {
	width: 50rpx;
	height: 50rpx;
	margin-top: 10rpx;
}
.top-search {
	width: 500rpx;
	height: 72rpx;
	padding: 0 30rpx;
	margin-left: 30rpx;
	margin-right: 24rpx;
	border-radius: 72rpx;
	color: #333;
	background: #f7f7f7;
	align-items: center;
	.search-icon {
		width: 28rpx;
		height: 29rpx;
		margin-right: 12rpx;
	}
	
}
.page-content {
	position: fixed;
	top: 64px;
	left: 0;
	right: 0;
	bottom: 0px;
	/* #ifdef H5 */
	top: 44px;
	/* #endif */
}
.top-ad{
	display:block;
	width:686rpx;
	height:110rpx;
	margin: 24rpx auto 0;
}
.history-list {
	padding-top:14rpx;
	.list {
		height: 106rpx;
		padding-top:20rpx;
		margin-bottom: 30rpx;
		white-space: nowrap;
		.item {
			position: relative;
			display: inline-block;
			height: 64rpx;
			padding:0 30rpx;
			margin-right:20rpx;
			text-align: center;
			line-height: 64rpx;
			border-radius: 64rpx;
			color:#323232;
			background: #f8f8f8;
			&:first-child{
				margin-left:40rpx;
			}
		}
	}
}
.title-bar{
	height:68rpx;
	padding: 0 36rpx;
	justify-content: space-between;
	align-items:center;
	font-size: 26rpx;
	font-weight: 600;
	color:#333;
	.icon{
		width:36rpx;
		height:36rpx;
		margin-right:10rpx;
	}
}
.hot-list{
	.item{
		align-items: center;
		height:120rpx;
	}
	.con{
		align-items: center;
	}
	.num{
		width:84rpx;
		text-align: center;
		line-height: 120rpx;
		color:#999;
		font-size: 24rpx;
		font-weight: 600;
		&.on{
			color:#ff3a3a;
		}
	}
	.tit{
		margin-right:20rpx;
		color:#333;
		line-height: 48rpx;
		font-size: 32rpx;
		font-weight: 600;
	}
	.count{
		margin-right:20rpx;
		color:#ccc;
		line-height: 48rpx;
		font-size: 24rpx;
		transform: scale(0.84);
	}
	.icon{
		width:56rpx;
		height:20rpx;
	}
	.desc{
		color:#999;
		font-size: 24rpx;
		line-height: 40rpx;
		@include ellipsis;
	}
}
.suggest-list{
	.suggest{
		position:relative;
		height:96rpx;
		margin-left:32rpx;
		line-height:96rpx;
		color:#6578a0;
		&:before{
			position:absolute;
			content: '';
			right:0;
			bottom:0;
			width:100%;
			border-top: 1px solid #e6e6e6;
			transform: scaleY(0.5);
		}
	}
	.item{
		height:90rpx;
		line-height: 90rpx;
		color:#222;
	}
	.icon{
		width:72rpx;
		color:#aaa;
		text-align:center;
	}
	.word{
		position:relative;
		&:before{
			position:absolute;
			content: '';
			right:0;
			bottom:0;
			width:100%;
			border-top: 1px solid #e6e6e6;
			transform: scaleY(0.5);
		}
	}
}
</style>
