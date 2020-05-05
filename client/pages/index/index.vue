<template>
	<view>
		<view :class="{dpn: isShowSearch}">
			<uni-nav-bar fixed :status-bar="true" @clickRight="goPlay">
				<block slot="left">
					<block>
						<!-- #ifdef MP-WEIXIN -->
						<image class="top-img" src="/static/image/mine/r.png" @click="goPlay"></image>
						<!-- #endif -->
						<!-- #ifndef MP-WEIXIN -->
						<image class="top-img pl10" src="/static/image/search/6.png" @click="goCloud"></image>
						<!-- #endif -->
					</block>
				</block>
				<view class="top-search flex-box" @click="openSearch">
					<image class="search-icon" src="/static/image/search/2.png"></image>
					{{ searchTxt }}
				</view>
				<!-- #ifdef APP-PLUS || H5 -->
				<block slot="right" v-if="isShowPlay">
					<image class="top-img pr10" src="/static/image/mine/r.png"></image>
				</block>
				<!-- #endif -->
			</uni-nav-bar>
			<view class="page-content">
				<mescroll-uni ref="mescroll" :fixed="false" :down="downOption" :up="upOption" @down="downCallback" @up="upCallback">
					<view class="banner">
						<swiper
							class="swiper"
							:autoplay="true"
							:indicator-dots="true"
							indicator-active-color="#ff372b"
							indicator-color="rgba(255,255,255, .5)"
							duration="400"
							:circular="true"
						>
							<swiper-item v-for="(item, index) in swiper" :key="index">
								<view class="item">
									<image :src="item.imageUrl + $imgSuffix" class="img"></image>
									<view class="tag">{{ item.typeTitle }}</view>
								</view>
							</swiper-item>
						</swiper>
					</view>
					<!-- 主入口 -->
					<view class="main-bar flex-box">
						<view class="flex-item" v-for="(item, index) in contentBar" :key="index" @click="goUrl(item)">
							<image :src="'/static/image/index/t_' + (index + 1) + '.png'" class="img"></image>
							<view>{{ item.name }}</view>
							<view v-if="index == 0" class="date">{{ curDate }}</view>
						</view>
					</view>
					<!-- 歌单分类块 -->
					<songList title="推荐歌单" :list="recommendSongs" />
					<!-- 歌单分类块 -->
					<view class="song-list">
						<view class="tit-bar">
							推荐歌单
							<view class="more fr">歌单广场</view>
						</view>
						<scroll-view class="scroll-view" scroll-x>
							<navigator class="item" v-for="(item, index) in recommendSongs" :key="index" hover-class="none" :url="'/pages/subpages/index/album?item='+ encodeURIComponent(JSON.stringify(item))">
								<image class="img" :src="item.picUrl + $imgSuffix"></image>
								<view class="desc ellipsis">{{ item.name }}</view>
								<view class="count">{{ item.playCount }}</view>
							</navigator>
						</scroll-view>
					</view>
					<!-- 歌单分类块 -->
					<view class="song-list">
						<view class="switch-line flex-box">
							<view class="flex-box">
								<view class="switch-item" :class="{ on: newType == 1 }" @click="switchTab(1)">新碟</view>
								|
								<view class="switch-item" :class="{ on: newType == 2 }" @click="switchTab(2)">新歌</view>
							</view>
							<template v-if="newType == 1">
								<view class="more">更多新碟</view>
							</template>
							<template v-if="newType == 2">
								<view class="more">新歌推荐</view>
							</template>
						</view>
						<scroll-view class="scroll-view" scroll-x>
							<view class="item" v-for="(item, index) in latestAlbum" :key="index">
								<image class="img" :src="item.picUrl + $imgSuffix"></image>
								<view class="desc ellipsis">{{ item.name }}</view>
								<view class="desc ellipsis c9">{{ item.artist.name }}</view>
							</view>
						</scroll-view>
					</view>
					<!-- 歌单分类块 -->
					<view class="video-list song-list">
						<view class="tit-bar">
							精选视频
							<view class="more fr">更多></view>
						</view>
						<view class="video-item" v-for="(item, index) in relatedVideo" :key="index">
							<image class="img" :src="item.coverUrl + $imgSuffix"></image>
							<view class="desc ellipsis">{{ item.title }}</view>
						</view>
					</view>
				</mescroll-uni>
			</view>
		</view>
		<search ref="search" @close="closeSearch"></search>
	</view>
</template>
<script>
import { mapState } from 'vuex';
import { apiGetBanner, apiGetRecommendSongs, apiGetIndexData, apiGetTopAlbum, apiGetRelatedVideo, apiGetHotList } from '@/apis/index.js';
import songList from '@/components/songList.vue';
import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue';
import MescrollUni from '@/components/mescroll-uni/mescroll-uni.vue';
import search from '@/components/search.vue';
export default {
	components: {
		uniNavBar,
		MescrollUni,
		songList,
		search
	},
	data() {
		return {
			searchTxt: '周杰伦',
			isShowSearch: false,
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
			swiper: [],
			curDate: '',
			contentBar: [{ name: '每日推荐' }, { name: '歌单' }, { name: '排行榜' , url: '/pages/subpages/index/rank'}, { name: '电台' }, { name: '直播' }],
			recommendSongs: [],
			newType: 1, // 新歌新碟
			latestTempAlbum: [],
			latestAlbum: [],
			relatedVideo: [],
			hotList: [],
			isShowPlay: false
		};
	},
	onLoad() {
		this.getBanner();
		this.getRecommendSongs();
		this.getLatestAlbum();
		this.getRelatedVideo();
		this.getHotList();

		this.curDate = new Date().getDate();
		
		// 公共设置图标
		this.$pubFuc.setTabBarBadge(0)
	},
	onShow() {
		this.isShowPlay = this.playList.list.length > 0
	},
	computed: {
		...mapState(['playList'])
	},
	methods: {
		// 获取轮播图
		getBanner() {
			apiGetBanner().then(res => {
				this.swiper = res.banners;
			});
		},
		// 获取推荐歌单
		getRecommendSongs() {
			const params = {
				limit: 6
			};
			apiGetRecommendSongs(params).then(res => {
				// 格式化播放量数据
				const formatCount = data => {
					let tempNum = data;
					if (data > 100000) {
						tempNum = parseInt(data / 10000) + '万';
					}

					return tempNum;
				};

				this.recommendSongs = res.result;

				this.recommendSongs.forEach(item => {
					item.playCount = formatCount(item.playCount);
				});
			});
		},
		// 切换新碟新歌
		switchTab(type) {
			this.newType = type;
			let temp = {
				s: type == 1 ? 0 : 3,
				e: type == 1 ? 3 : 6
			};
			this.latestAlbum = this.latestTempAlbum.slice(temp.s, temp.e);
		},
		// 获取新碟
		getLatestAlbum() {
			apiGetTopAlbum().then(res => {
				this.latestTempAlbum = res.albums;
				this.latestAlbum = res.albums.slice(0, 3);
			});
		},
		// 获取相关视频
		getRelatedVideo() {
			const params = {
				id: 6524
			};
			apiGetRelatedVideo(params).then(res => {
				this.relatedVideo = res.data;
			});
		},
		// 获取相关视频
		getList(pageNum, pageSize, successCallback, errorCallback) {
			const params = {
				id: 4571 + pageNum,
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
		// hot 列表
		getHotList() {
			const params = {
				limit: 10,
				order: 'hot'
			};
			apiGetHotList(params).then(res => {
				this.hotList = res.playlists;
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
		/*下拉刷新的回调 */
		downCallback(mescroll) {
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
		goCloud () {
			uni.showToast({
				icon: 'none',
				title: '功能未开发',
			});
		},
		// 链接跳转
		goUrl(item) {
			if (!item.url) {
				this.goCloud()
				return false;
			}
			uni.navigateTo({
				url: item.url
			})
		},
		// 去播放
		goPlay () {
			if (!this.playList.list.length) {
				uni.showToast({
					icon: 'none',
					title: '播放列表还未有歌曲',
				});
				return
			}
			uni.navigateTo({
				url: '/pages/subpages/index/play?go=1'
			})
		}
	}
};
</script>

<style lang="scss">
page {
	color: #1a1a1a;
	font-size: 24rpx;
}
.pl10{
	padding-left: 20rpx;
}
.pr10{
	padding-right:20rpx;
}
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
	flex:none;
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
.page-content {
	position: fixed;
	top: 64px;
	left: 0;
	right: 0;
	bottom: 0px;
	/* #ifdef H5 || MP-WEIXIN */
	top: 44px;
	/* #endif */
}
.banner {
	width: 100%;
	height: 268rpx;
	margin: 30rpx auto 44rpx;
	.swiper {
		height: 268rpx;
	}
	.item {
		position: relative;
		display: block;
		width: 686rpx;
		height: 268rpx;
		margin: 0 auto;
		border-radius: 14rpx;
		overflow: hidden;
	}
	.img {
		display: block;
		width: 100%;
		height: 100%;
	}
	.tag {
		position: absolute;
		bottom: 0;
		right: 0;
		height: 34rpx;
		padding: 0 14rpx;
		line-height: 34rpx;
		color: #fff;
		background: #43a5f0;
		z-index: 10;
		border-top-left-radius: 14rpx;
	}
}

.main-bar {
	padding-bottom: 22rpx;
	text-align: center;
	line-height: 70rpx;
	color: #666;
	border-bottom: 1rpx solid #e6e6e6;
	.img {
		display: block;
		width: 92rpx;
		height: 92rpx;
		margin: 0 auto;
	}
	.flex-item {
		position: relative;
		.date {
			position: absolute;
			left: 50%;
			top: 40rpx;
			line-height: 1;
			font-size: 24rpx;
			color: #ff392d;
			transform: translateX(-50%) scale(0.8);
		}
	}
}

.song-list {
	padding-left: 32rpx;
	.tit-bar {
		font-size: 34rpx;
		font-weight: 600;
		line-height: 110rpx;
	}

	.more {
		width: 150rpx;
		height: 50rpx;
		line-height: 50rpx;
		text-align: center;
		margin-top: 30rpx;
		margin-right: 32rpx;
		color: #333;
		font-weight: 400;
		font-size: 24rpx;
		border: 2rpx solid #e6e6e6;
		border-radius: 50rpx;
	}
	.switch-line {
		justify-content: space-between;
		color: #999;
		.flex-box {
			line-height: 110rpx;
			width: 300rpx;
		}
		.switch-item {
			font-weight: 600;
			&:first-child {
				width: 80rpx;
			}
			&:last-child {
				padding-left: 22rpx;
			}
			&.on {
				color: #333;
				font-size: 34rpx;
			}
		}
	}
	.scroll-view {
		width: 100%;
		white-space: nowrap;
	}

	.item {
		position: relative;
		display: inline-block;
		width: 218rpx;
		padding-bottom: 16rpx;
		margin-right: 16rpx;
		line-height: 34rpx;
		&:before {
			content: ' ';
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 40rpx;
			z-index: 2;
			background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.2), transparent);
		}
		&.video {
			width: 450rpx;
		}
		.img {
			display: block;
			width: 100%;
			height: 218rpx;
			margin-bottom: 16rpx;
			background: #eee;
			border-radius: 10rpx;
		}
	}
	.count {
		position: absolute;
		top: 0;
		right: 0;
		padding-left: 25rpx;
		line-height: 34rpx;
		color: #fff;
		font-size: 24rpx;
		z-index: 10;
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAqFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8j1z1tAAAAN3RSTlMA9wcC+/3w4A/RoQv0m4s6IBkU7eeRK73kxaZtW+rc1cmxe3UmwbiWQNmqgWZUzUY1ME4dhmGuJ2Z0kQAABVtJREFUeNrtnYtWGkEQRFsEeSmgII8EVBASUFHx1f//ZwmJRwaZYhndjdU5c//gQp8DVTvTK5FIJBKJRCKRSCQSiUQikcj/yWI6vRfzNEYz/U23NhbLlF70jZ7hr+W+pQ6FoxOxyXhP12neiEVyZd3gdiH2uFYfP0tijP2mehk8iy3miui1xRLfFHNaFTv0dAutvpihq1uZmPmp1yRqRuZLVxyol+5cLOB+9nMwZ52G8OOKSLWWVx97TzlhZ01EZDxRL8UHIcf92ZAl/ZZ6+UE+XxsiUjoF8zWinq9NEZH2BZivO+HFJyLyPFAvL4/Cil9ESkcF9XFIO19ARGRRVi9ndaHEDVPvksp38FP/7VgIQSJLTirq5fByX+jAIkvq5+rlnG++tovI/uWheqmwlUZAZMXxlXo5+M41X0DEZXqmXspUpaSuOBJAbrTq8GhLSSzi8jjUv/CWkusimLui/oa4lNxVRHLXYL5ISkmPCKLRYS4lPSIYFOovCEpJXVGRJGCoz59++XwBEci4R1pKIhFMv0VZegeL4FCfDyklGUSWoZ6vlAQiSTw32UpJN/lJMm6o5yolkUgy92WqUjJcxA31RKXkJ0RwqN+7TpwvLpFlqGcpJYNEQkL9MOtSEotcSRIo1DOU3kEigaH+bCoQShEY6vUKlpKcIjDU41IyS5EXSSY81M/q4oNXBIR6VHoTi4BQD0pJahEQ6kHpnZ3IUAIIDPWF96U3u8hGqEelJL/IWqjHpaQFERjqC0er0siECAj12c6Xm4ckRW6a20tJMyKvoR6WknZEcKgf9EXEkggO9b22LREY6pelpC0RHOq7fWMiONRPxlmJdCQLcKjPP1VtieBQX5wbE8GhvtOwJbIM9bCUtCWCQ33xzpgIDvWVXLoiE8macQck4YYxERjqy/vWRFCofzInItKeqIdxiiI9yRwc6msWRXyhfmBSxBfqFzZFNkP9g1UROVkP9TfpiVzIv6VRVodLqyLv/7D0jYps/IW8Nyni+VNfNSjii1kVSU/kVjIHB9+6ORF/FTEUYyKgHBqUjIlMZ+rjcCppipQlY47BOoNyQ0yJoEq7JmJJpH4Om1NLIieVAjzAbUgEPSjJn1YlA5FzyYj7Mn6eaEhkmTvQtRNLIjdNeBHIksjiFp+CyExkJmlT+lmA5wYsiTwP8PVFQyLti20XSs2IVE/zGZ+mwyJnkh79VsKlaxsi40niiUALIug44IF7BtiAyLyb7anZZJGipECjs9s5ZnKR3NPejifLuUUeimDBzeZUMYs0fgQ8SOcVAU/R0X2YLEW66ZXSyTfgSEUeh19+JxGIhJbSX39L1G00PlxKM9zbBSIhpTTHTWogElBKk9xt/5xIfUazAtXtZ8JLaaL9D64IX334L0Tq51w7LNySJqyUJttaA0QSp4pujxAWCS+lb9vydbiZeudSmnHXVrDITZNz+1mgyOKWdR8dEIGlNO2GwBCR5wHxzka36kgopXvUWzRdEapSOiORfot906ybTINL6RnHVHlEUCltYFtussi8++WrQtIQaXQIlreEinhLaYZ1OoEi+Z1L6R+EW9ehCC6lzyjfs4BElqU0zRKwQJHCeinNUB9+VgSX0rxvh/GJ5EagPnwifl+POryV0jT14WdEjq+I6sMPilCV0p8R2Zf6jKs+/KAIKqUH5FO1IXKght+NqCt4F3fvwtu3QL+qP4GybqFwZGKq/jBUTJnldQO78F1VbbxgJIHSHpgqivowhIp/qoiKnh05aZqfqlceiOvDMC51jRlb0bM79RZrfRhKqXb46lExOlVv5O5G19ejB/bQEYlEIpFIJBLJkF8r2nFUwcJuMQAAAABJRU5ErkJggg==)
			no-repeat;
		background-size: 25rpx 25rpx;
		transform: scale(0.8);
	}
}
.video-list {
	padding-left: 0;
	.tit-bar {
		padding-left: 32rpx;
	}
	.video-item {
		width: 686rpx;
		height: 490rpx;
		margin: 0 auto;
		background: #f8f8f8;
		border-radius: 10rpx;
		overflow: hidden;
		margin-bottom: 24rpx;
	}
	.img {
		display: block;
		width: 686rpx;
		height: 390rpx;
		background: #eee;
	}
	.desc {
		padding-left: 40rpx;
		font-size: 30rpx;
		font-weight: 600;
		line-height: 100rpx;
	}
}

/*
	 *平台差异化处理的代码可以放在底部，这样有利于集中管理
	*/
/* #ifdef MP-WEIXIN */
.banner {
	margin-top: 60rpx;
}
/* #endif */
</style>
