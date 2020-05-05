<template>
	<view>
		<!-- #ifdef APP-PLUS || MP-WEIXIN -->
		<uni-nav-bar fixed :status-bar="true" left-icon="back" title="排行榜" @clickLeft="goBack" @clickRight="goCloud">
			<!-- #ifdef APP-PLUS -->
			<block slot="right"><image class="top-img" src="/static/image/mine/r.png"></image></block>
			<!-- #endif -->
		</uni-nav-bar>
		<!-- #endif -->
		<view class="toplist">
			<view class="title">官方榜单</view>
			<view class="flex-box item" v-for="(item, index) in playList" :key="index">
				<image class="img" :src="item.coverImgUrl"></image>
				<view class="con-list">
					<view v-for="(song, i) in item.tracks" :key="i">
						{{i + 1}}.{{song.name}} - {{song.singer}}
					</view>
				</view>
			</view>
		</view>
		<view class="toplist recommend-list">
			<view class="title">推荐榜</view>
			<div class="flex-box flex-wrap">
				<view class="item" v-for="(item, index) in recommendList" :key="index">
					<image class="img" :src="item.coverImgUrl"></image>
					<view>{{item.name}}</view>
				</view>
			</div>
		</view>
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
import { apiToplist, apiTopSinglelist } from '@/apis/index.js';
import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue';
export default {
	components: {
		uniNavBar
	},
	data() {
		return {
			album: {},
			playList: [],
			recommendList: []
		};
	},
	created() {
		that = this
	},
	onLoad(options) {
		this.getData();
	},
	methods: {
		async getData() {
			// 推荐榜
			apiToplist().then(res => {
				this.recommendList = Object.freeze(res.list.slice(4, 10))
			});
			// 获取promise列表
			function promiseList(arr) {
				return arr.map(item => {
				  	return apiTopSinglelist({idx: item}).then(res => {
						let tracks = res.playlist.tracks.slice(0,3).map(song => {
							let singer = song.ar.map(art => {
								return art.name
							})[0]
							return {
								name: song.name,
								singer
							}
						})
				  		return {
							coverImgUrl: res.playlist.coverImgUrl,
							name: res.playlist.name,
							tracks, 
						}
				  	})
				})
			}
			// 获取官方榜
			let [res0, res1, res2, res3, res4] = await Promise.all([...promiseList([3,0,1,2,4])])
			this.playList = Object.freeze([res0, res1, res2, res3, res4])
		},
		scrollpage (e) {
			this.scrollY = e.detail.scrollTop
			this.scroll()
		},
		// 设置背景条
		scroll: debounce(() => {
			if (that.scrollY < 5) {
				that.scrollTop = 20
			} else {
				if (that.scrollY < 300) {
					that.scrollTop = - parseInt(that.scrollY) + 20
				}
			}
		}),
		goBack () {  // 返回上一页
			uni.navigateBack();
		},
		goCloud () {
			uni.showToast({
				icon: 'none',
				title: '功能未开发',
			});
		},
	}
};
</script>

<style lang="scss" scoped>
	.flex-box.flex-wrap{
		flex-wrap: wrap;
	}
	.toplist{
		padding-left:32rpx;
		.title{
			font-size: 32rpx;
			color:#222;
			font-weight:600;
			line-height: 90rpx;
		}
		.item{
			margin-bottom:20rpx;
			.img{
				display: block;
				width:216rpx;
				height:216rpx;
				margin-right:30rpx;
				border-radius:6rpx;
			}
		}
		.con-list{
			// padding-top:25rpx;
			line-height: 56rpx;
			color:#4d4d4d;
		}
	}
	.recommend-list{
		.item{
			width:216rpx;
			margin-right:20rpx;
			&:nth-child(3){
				margin-right:0;
			}
			.img{
				margin:0;
			}
		}
	}
</style>
