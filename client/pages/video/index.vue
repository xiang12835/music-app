<template>
	<view>
		<view :class="{dpn: isShowSearch}">
			<uni-nav-bar fixed :status-bar="true" @clickLeft="goCloud" @clickRight="goCloud">
				<block slot="left"><image class="top-img" src="/static/image/search/7.png"></image></block>
				<view class="top-search flex-box" @click="openSearch">
					<image class="search-icon" src="/static/image/search/2.png"></image>
					{{ searchTxt }}
				</view>
				<!-- #ifdef APP-PLUS || H5 -->
				<block slot="right"><image class="top-img" src="/static/image/mine/r.png"></image></block>
				<!-- #endif -->
			</uni-nav-bar>
			<view class="topbar">
				<view class="h86"></view>
				<scroll-view class="scroll-view" scroll-x :show-scrollbar="false">
					<view class="rel">
						<view class="item" v-for="(item, index) in navList" :class="{active: curNav == item.id}" :key="index" @click="switchNav(item.id, index)">
							<view class="desc">{{item.name}}</view>
						</view>
						<view class="slide" :style="'width: '+ sliderWidth +'rpx;transform: translateX('+ sliderOffset +'rpx)'"></view>
					</view>
				</scroll-view>
			</view>
			<mescroll-uni ref="mescroll" :top="mescrollTop" :down="downOption" :up="upOption" @down="downCallback" @up="upCallback">
				<view class="video-list">
					<view class="video-item" v-for="(item, index) in relatedVideo" :key="index">
						<view class="video-wrap">
							<image class="img" :src="item.coverUrl + $imgSuffix"></image>
							<view class="desc ellipsis">{{item.title}}</view>
							<view class="creater-bar flex-box">
								<view class="avactor-box flex-box">
									<image class="avactor" src=""></image>
									<view class="name">{{item.creator[0].userName}}</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</mescroll-uni>
		</view>
		<search ref="search" @close="closeSearch"></search>
	</view>
</template>

<script>
	import { apiGetNavList } from '@/apis/video.js';
	import { apiGetRelatedVideo } from '@/apis/index.js';
	import MescrollUni from "@/components/mescroll-uni/mescroll-uni.vue";
	import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue';
	import search from '@/components/search.vue';
	export default {
		components:{
			MescrollUni,
			uniNavBar,
			search
		},
		data() {
			return {
				searchTxt: '周杰伦',
				isShowSearch: false,
				mescrollTop: 210,  // 满足app高度
				// 下拉刷新的常用配置
				downOption: {
					auto: false //是否在初始化后,自动执行下拉回调callback; 默认true
				},
				// 上拉加载的常用配置
				upOption: {
					auto: false, // 是否在初始化完毕之后自动执行上拉加载的回调; 默认true
					page: {
						num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
						size: 10 // 每页数据的数量,默认10
					},
				},
				navList: [
					{ name: '推荐', id: 34571},
					{ name: 'LOCK直播', id: 23472},
					{ name: '翻唱', id: 33485},
					{ name: '广场', id: 4652},
					{ name: '舞蹈', id: 658785},
					{ name: '游戏', id: 62689},
					{ name: '现场', id: 7456345},
				],
				curNav: '',
				sliderOffset: 0,
				sliderWidth: 60,
				relatedVideo: [],
				refreshing: false,
			};
		},
		onLoad() {
			this.getNavList()
			// #ifdef H5
			this.mescrollTop = 186
			// #endif
			
			// 公共设置图标
			this.$pubFuc.setTabBarBadge(1)
		},
		methods: {
			// 获取导航
			getNavList() {
				const params = {
					id: 124,
				}
				// apiGetNavList(params).then(res => {
				// 	this.navList = res.mock.navList

				// 	this.curNav = this.navList[0].id
					
				// 	this.switchNav(this.curNav, 0)
				// })
				this.switchNav(34654, 0)
			},
			// 导航切换
			switchNav(id, index) {
				this.curNav = id
				this.sliderWidth = index == 1 ? 140 : 60;
			
				this.sliderOffset = 126 * index + (index > 1 ? 80 : 16) + (index == 0 && 16);
				
				this.getList(1, 1, res => {
					this.relatedVideo = res
				})
			},
			// 获取相关视频
			getList(pageNum, pageSize, successCallback, errorCallback) {
				const params = {
					id: this.curNav,
					pageNum,
					pageSize,
				}
				apiGetRelatedVideo(params).then(res => {
					//联网成功的回调
					successCallback && successCallback(res.data);
				}, res => {
					//联网失败的回调
					errorCallback && errorCallback();
				})
			},
			/*下拉刷新的回调 */
			downCallback(mescroll) {
				//联网加载数据
				// this.getList(1, 10, res => {
				// 	//联网成功的回调,隐藏下拉刷新的状态
				// 	mescroll.endSuccess();
					
					
				// 	//设置列表数据
				// 	this.relatedVideo = res
				// }, () => {
				// 	//联网失败的回调,隐藏下拉刷新的状态
				// 	mescroll.endErr();
				// })
				// 第2种方法
				mescroll.resetUpScroll(); // 重置列表为第一页 (自动执行 page.num=1, 再触发upCallback方法 )
			},
			/*上拉加载的回调: mescroll携带page的参数, 其中num:当前页 从1开始, size:每页数据条数,默认10 */
			upCallback(mescroll) {
				//联网加载数据
				this.getList(mescroll.num, mescroll.size, (res) => {
					//设置列表数据
					if(mescroll.num == 1) this.relatedVideo = []; //如果是第一页需手动置空列表
					this.relatedVideo = this.relatedVideo.concat(res)
					
					// 后台接口有返回列表的总数据量 totalSize
					// mescroll.endBySize(10, 50); //必传参数(当前页的数据个数, 总数据量)
					mescroll.endSuccess();
				}, () => {
					//联网失败的回调,隐藏下拉刷新的状态
					mescroll.endErr();
				})
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
			goCloud () {
				uni.showToast({
					icon: 'none',
					title: '功能未开发',
				});
			}
		}
	}
</script>

<style lang="scss">
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
	.topbar {
		.h86 {
			height: 86rpx;
		}
	}

	.scroll-view {
		position: fixed;
		top: 64px;
		width: 100%;
		height: 86rpx;
		white-space: nowrap;
		text-align: center;
		line-height: 86rpx;
		color: #333;
		font-weight: 600;
		border-bottom: 1rpx solid #e6e6e6;
		z-index: 10;
		background: #fff;
		/* #ifdef H5 */
		top: 44px;
		/* #endif */
		.item {
			position: relative;
			display: inline-block;
			min-width: 126rpx;
			height: 86rpx;
			line-height: 86rpx;
			padding: 0 20rpx;
			&.active{
				color:#f32628;
			}
		}
	}

	.slide {
		position: absolute;
		width: 60rpx;
		height: 4rpx;
		left: 0;
		bottom: 0rpx;
		background: #f32628;
		transition: transform 0.3s;
		z-index: 2;
		/* #ifdef MP-WEIXIN */
		bottom: 2rpx;
		/* #endif */
	}

	.video-list {
		color: #333;
		background: #f8f8f8;
		.tit-bar {
			padding-left: 32rpx;
		}
		.video-item {
			padding-top: 32rpx;
			background: #fff;
			border-bottom: 24rpx solid #f8f8f8;
		}

		.video-wrap {
			width: 686rpx;
			margin: 0 auto;
		}

		.img {
			display: block;
			width: 686rpx;
			height: 390rpx;
			border-radius: 10rpx;
			background: #eee;
		}

		.desc {
			font-size: 30rpx;
			font-weight: 600;
			line-height: 84rpx;
			border-bottom: 1rpx solid #e6e6e6;
		}
	}

	.creater-bar {
		height: 100rpx;
		justify-content: space-between;
		align-items: center;
		.avactor-box {
			align-items: center;
		}
		.avactor {
			width: 66rpx;
			height: 66rpx;
			margin-right: 10rpx;
			border-radius: 66rpx;
			background: #eee;
		}

		.name {
			line-height: 100rpx;
		}
	}
</style>
