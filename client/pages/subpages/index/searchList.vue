<template>
	<view>
		<view :class="{dpn: isShowSearch}">
			<uni-nav-bar fixed :status-bar="true" @clickLeft="goBack" @clickRight="goCloud">
				<block slot="left"><image class="top-img" src="/static/image/search/back.png"></image></block>
				<view class="top-search flex-box" @click="openSearch">
					<image class="search-icon" src="/static/image/search/2.png"></image>
					{{ searchTxt }}
				</view>
				<!-- #ifdef APP-PLUS || H5 -->
				<block slot="right"><image class="top-img" src="/static/image/mine/r.png"></image></block>
				<!-- #endif -->
			</uni-nav-bar>
			<scroll-view scroll-y="true" class="page-content">
				<view class="song-list">
					<view class="item tit">单曲</view>
					<view class="item" v-for="(item, index) in resList.songs" :key="index">
						<view class="con">
							<view class="name">{{item.name}}</view>
							<view class="desc">{{item.desc}}</view>
						</view>
						<view class="iconfont">&#xe60f;</view>
					</view>
				</view>	
			</scroll-view>
		</view>
		<search ref="search" @close="closeSearch"></search>
	</view>
</template>

<script>
// 防抖
function debounce(fn, wait = 10) {    
	var timeout = null;    
	return function() {        
		if(timeout !== null) clearTimeout(timeout);        
		timeout = setTimeout(fn, wait);    
	}
}
var that = null
import { apiSearch } from '@/apis/index.js';
import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue';
import search from '@/components/search.vue';
export default {
	components: {
		uniNavBar,
		search
	},
	data() {
		return {
			searchTxt: '周杰伦',
			isShowSearch: false,
			resList: [],
		};
	},
	created() {
		that = this
	},
	onLoad(options) {
		this.getData(options.keyword);
	},
	methods: {
		getData(keyword) {
			var par = {
				keywords: keyword
			};
			apiSearch(par).then(res => {
				res.result.songs.forEach(item => {
					item.desc =  item.artists.map(t => {
						return t.name
					}).join('/')
				})
				this.resList  = res.result
			});
		},
		// 打开搜索
		openSearch() {
			this.isShowSearch = true;
			this.$refs.search.open()
		},
		// 关闭搜索
		closeSearch() {
			this.isShowSearch = false;
		},
		goBack() {
			uni.navigateBack()
		},
		goCloud() {
			uni.showToast({
				icon: 'none',
				title: '功能未开发'
			});
		}
	}
};
</script>

<style lang="scss" scoped>
	.dpn{
		display: none;
	}
	.top-img {
		width: 50rpx;
		height: 50rpx;
		margin-top: 10rpx;
	}
	.top-search {
		width: 560rpx;
		/* #ifdef MP-WEIXIN */
		width: 460rpx;
		margin-left:-60rpx;
		/* #endif */
		height: 72rpx;
		margin-right: 24rpx;
		border-radius: 72rpx;
		color: #c6c6c6;
		background: #f7f7f7;
		align-items: center;
		justify-content: center;
		.search-icon {
			width: 28rpx;
			height: 29rpx;
			margin-right: 12rpx;
		}
	}
	.song-list{
		.item{
			@include flex-row-center;
			position:relative;
			height:120rpx;
			padding:0 30rpx;
			&:before{
				position:absolute;
				content: "";
				bottom:0;
				width: 686rpx;
				border-bottom: 1px solid #e4e4e4;
				transform: scaleY(0.5);
			}
		}
		.con{
			max-width: 80%;
		}
		.tit{
			height:80rpx;
			padding-top:0;
			color:#222;
			font-size: 32rpx;
			font-weight: 600;
			line-height: 80rpx;
		}
		.name{
			margin-top:12rpx ;
			margin-right:20rpx;
			color:#222;
			line-height: 58rpx;
			font-size: 32rpx;
			@include ellipsis;
		}
		.desc{
			color:#666;
			font-size: 24rpx;
			line-height: 40rpx;
			@include ellipsis;
		}
		.iconfont{
			padding:0 10rpx;
			line-height: 120rpx;
		}
	}

</style>
