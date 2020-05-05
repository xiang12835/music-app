<template>
	<view class="album-page">
		<view class="nav-bar">
			<view class="h300">
				<view class="bg" :style="scrollBg">
				</view>
				<view class="bg1"></view>
			</view>
			<view class="nav-bar-con">
				<view class="flex-box align">
					<view class="iconfont" @click="goBack">&#xe616;</view>
					<view class="title flex-item tac">歌单</view>
					<view class="iconfont right-icon">
						<!-- &#xe616; -->
					</view>
				</view>
			</view>
		</view>
		<scroll-view scroll-y="true" class="page-content" @scroll="scrollpage">
			<view class="album-top">
				<view class="bg" :style="bgStyle"></view>
				<view class="bg1"></view>
				<view class="album-con">
					<view class="flex-box">
						<view class="img-info">
							<view class="img" :style="bgStyle"></view>
							<view class="count">344.5</view>
						</view>
						<view class="info-con flex-item">
							<view class="title">{{ album.name }}</view>
							<view v-if="album.creator" class="avator-box flex-box">
								<image class="avator" v-if="album.creator.avatarUrl" :src="album.creator.avatarUrl+ $imgSuffix"></image>
								{{ album.creator.nickname }}
								<view class="iconfont">&#xe605;</view>
							</view>
							<view class="desc-box flex-box">
								<view class="desc">{{ album.description}}...</view>
								<view class="iconfont">&#xe605;</view>
							</view>
						</view>
					</view>
					<view class="album-bot flex-box">
						<view class="flex-item">
							<view class="iconfont">&#xe607;</view>
							<view class="txt">{{ album.commentCount }}</view>
						</view>
						<view class="flex-item">
							<view class="iconfont">&#xe639;</view>
							<view class="txt">{{ album.shareCount }}</view>
						</view>
						<view class="flex-item">
							<view class="iconfont">&#xe60e;</view>
							<view class="txt">下载</view>
						</view>
						<view class="flex-item">
							<view class="iconfont">&#xe61e;</view>
							<view class="txt">多选</view>
						</view>
					</view>
				</view>
			</view>
			<view class="album-list">
				<view class="title-bar flex-box">
					<view class="play">
						<text class="iconfont">&#xe710;</text>
						播放全部(共{{songList.length}}首歌曲)
					</view>
					<view class="collect">
						+ 收藏
					</view>
				</view>
				<view class="list">
					<view class="item flex-box" v-for="(item, index) in songList" :key="index" @click="setPlayList(item)">
						<view class="num" :class="{ on: index < 3 }">
							<text class="iconfont" v-if="playList.curSong.id == item.id">&#xe64c;</text>
							<text v-else>{{ index + 1 }}</text>
						</view>
						<view class="flex-item">
							<view class="flex-box con" :class="{ on: playList.curSong.id == item.id }">
								<view>
									<view class="tit ellipsis">{{ item.name }}</view>
									<view class="count">{{ item.score }}</view>
								</view>
								<view class="iconfont">&#xe60f;</view>
							</view>
							<view class="desc">{{ item.singer }}</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	// 防抖
	function debounce(fn, wait = 10) {
		var timeout = null;
		return function() {
			if (timeout !== null) clearTimeout(timeout);
			timeout = setTimeout(fn, wait);
		}
	}
	var that = null
	import { mapState, mapMutations } from 'vuex';
	import { apiAlbumDetail } from '@/apis/index.js';
	import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue';
	export default {
		components: {
			uniNavBar
		},
		data() {
			return {
				album: {},
				songList: [],
				scrollTop: 20,
				scrollY: 0,
			};
		},
		created() {
			that = this
			// #ifdef H5
			this.scrollTop = 0
			// #endif
		},
		onLoad(options) {
			// 参数解码
			const item = JSON.parse(decodeURIComponent(options.item));
			this.album.coverImgUrl = item.picUrl
			this.album.name = item.name
			this.album.description = item.copywriter
			
			this.getData(item.id);
		},
		computed: {
			...mapState(['playList']),
			// 设置滤镜背景
			bgStyle() {
				if (this.album.coverImgUrl) {
					return 'background-image:url(' + (this.album.coverImgUrl) + this.$imgSuffix + ')'
				} else {
					return ''
				}
			},
			scrollBg() {
				if (this.album.coverImgUrl) {
					return 'background-image:url('+ (this.album.coverImgUrl + this.$imgSuffix) +');top: ' + this.scrollTop + 'px'
				} else {
					return ''
				}
			},
		},
		methods: {
			// 设置歌单
			...mapMutations(['storePlayList']),
			// 获取数据
			getData(id) {
				var par = {
					id
				};
				apiAlbumDetail(par).then(res => {
					res.playlist.description = res.playlist.description.slice(0, 27)
					var list = res.playlist;
					let tracks = res.playlist.tracks.map(song => {
						let singer = song.ar.map(art => {
							return art.name
						})[0]
						return {
							name: song.name,
							id: song.id,
							singer,
						}
					})
					this.album = Object.freeze(res.playlist);
					this.songList = Object.freeze(tracks);
				});
			},
			scrollpage(e) {
				this.scrollY = e.detail.scrollTop
				this.scroll()
			},
			// 设置背景条
			scroll: debounce(() => {
				if (that.scrollY < 5) {
					// #ifdef H5
					that.scrollTop = 0
					// #endif
					// #ifndef H5
					that.scrollTop = 20
					// #endif
				} else {
					if (that.scrollY < 300) {
						// #ifdef H5
						that.scrollTop = -parseInt(that.scrollY)
						// #endif
						// #ifndef H5
						that.scrollTop = -parseInt(that.scrollY) + 20
						// #endif

					}
				}
			}),
			goBack() { // 返回上一页
				uni.navigateBack();
			},
			// 设置播放列表
			setPlayList(item) {
				// 传递歌单信息到 store
				this.storePlayList({
					curSong: item,
					list: this.songList,
				})
				uni.navigateTo({
					url: '/pages/subpages/index/play'
				})
			}
		}
	};
</script>

<style lang="scss" scoped>
	$bgheight: 688rpx;
	$bgtop: -44px;

	.bg {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		filter: blur(35px);
		background-position: 0 0px;
		background-repeat: no-repeat;
		background-size: cover;
	}

	.bg1 {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background: rgba(0, 0, 0, 0.2);
		z-index: 2;
	}

	.nav-bar {
		position: fixed;
		width: 100%;
		height: 64px;
		/* #ifdef H5 */
		height: 44px;
		/* #endif */
		z-index: 100;
		background-position: center 0;
		background-repeat: no-repeat;
		color: #fff;
		background: #fff;
		overflow: hidden;

		.nav-bar-con {
			position: absolute;
			top: 20px;
			/* #ifdef H5 */
			top: 0px;
			/* #endif */
			width: 100%;
			height: 100%;
			padding: 0 30rpx;
			z-index: 20;
			color: #fff;

			.align {
				align-items: center;
				height: 44px;
				font-size: 32rpx;
			}

			.right-icon {
				width: 16px;
			}
		}

		.h300 {
			position: relative;
			height: $bgheight;

			.bg {
				top: 20px;
				/* #ifdef H5 */
				top: 0px;
				/* #endif */
			}
		}
	}

	.page-content {
		position: fixed;
		top: 64px;
		left: 0;
		right: 0;
		bottom: 0;
		/* #ifdef H5 */
		top: 44px; // h5 无状态栏
		/* #endif */
	}

	.album-top {
		position: relative;
		top: $bgtop;
		height: $bgheight;
		padding-top: 44px;
		overflow: hidden;
		background: #fff;

		.bg {
			background-size: 100%;
		}

		.album-con {
			position: absolute;
			width: 100%;
			padding: 46rpx 24rpx 0 30rpx;
			z-index: 10;
		}
	}

	.album-bot {
		padding-top: 42rpx;
		color: #fff;
		text-align: center;

		.iconfont {
			font-size: 44rpx;
		}
	}

	.img-info {
		position: relative;
		width: 280rpx;
		height: 280rpx;
		margin-right: 40rpx;
		border-radius: 10rpx;
		overflow: hidden;

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

		.img {
			width: 280rpx;
			height: 280rpx;
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
			background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAqFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8j1z1tAAAAN3RSTlMA9wcC+/3w4A/RoQv0m4s6IBkU7eeRK73kxaZtW+rc1cmxe3UmwbiWQNmqgWZUzUY1ME4dhmGuJ2Z0kQAABVtJREFUeNrtnYtWGkEQRFsEeSmgII8EVBASUFHx1f//ZwmJRwaZYhndjdU5c//gQp8DVTvTK5FIJBKJRCKRSCQSiUQikcj/yWI6vRfzNEYz/U23NhbLlF70jZ7hr+W+pQ6FoxOxyXhP12neiEVyZd3gdiH2uFYfP0tijP2mehk8iy3miui1xRLfFHNaFTv0dAutvpihq1uZmPmp1yRqRuZLVxyol+5cLOB+9nMwZ52G8OOKSLWWVx97TzlhZ01EZDxRL8UHIcf92ZAl/ZZ6+UE+XxsiUjoF8zWinq9NEZH2BZivO+HFJyLyPFAvL4/Cil9ESkcF9XFIO19ARGRRVi9ndaHEDVPvksp38FP/7VgIQSJLTirq5fByX+jAIkvq5+rlnG++tovI/uWheqmwlUZAZMXxlXo5+M41X0DEZXqmXspUpaSuOBJAbrTq8GhLSSzi8jjUv/CWkusimLui/oa4lNxVRHLXYL5ISkmPCKLRYS4lPSIYFOovCEpJXVGRJGCoz59++XwBEci4R1pKIhFMv0VZegeL4FCfDyklGUSWoZ6vlAQiSTw32UpJN/lJMm6o5yolkUgy92WqUjJcxA31RKXkJ0RwqN+7TpwvLpFlqGcpJYNEQkL9MOtSEotcSRIo1DOU3kEigaH+bCoQShEY6vUKlpKcIjDU41IyS5EXSSY81M/q4oNXBIR6VHoTi4BQD0pJahEQ6kHpnZ3IUAIIDPWF96U3u8hGqEelJL/IWqjHpaQFERjqC0er0siECAj12c6Xm4ckRW6a20tJMyKvoR6WknZEcKgf9EXEkggO9b22LREY6pelpC0RHOq7fWMiONRPxlmJdCQLcKjPP1VtieBQX5wbE8GhvtOwJbIM9bCUtCWCQ33xzpgIDvWVXLoiE8macQck4YYxERjqy/vWRFCofzInItKeqIdxiiI9yRwc6msWRXyhfmBSxBfqFzZFNkP9g1UROVkP9TfpiVzIv6VRVodLqyLv/7D0jYps/IW8Nyni+VNfNSjii1kVSU/kVjIHB9+6ORF/FTEUYyKgHBqUjIlMZ+rjcCppipQlY47BOoNyQ0yJoEq7JmJJpH4Om1NLIieVAjzAbUgEPSjJn1YlA5FzyYj7Mn6eaEhkmTvQtRNLIjdNeBHIksjiFp+CyExkJmlT+lmA5wYsiTwP8PVFQyLti20XSs2IVE/zGZ+mwyJnkh79VsKlaxsi40niiUALIug44IF7BtiAyLyb7anZZJGipECjs9s5ZnKR3NPejifLuUUeimDBzeZUMYs0fgQ8SOcVAU/R0X2YLEW66ZXSyTfgSEUeh19+JxGIhJbSX39L1G00PlxKM9zbBSIhpTTHTWogElBKk9xt/5xIfUazAtXtZ8JLaaL9D64IX334L0Tq51w7LNySJqyUJttaA0QSp4pujxAWCS+lb9vydbiZeudSmnHXVrDITZNz+1mgyOKWdR8dEIGlNO2GwBCR5wHxzka36kgopXvUWzRdEapSOiORfot906ybTINL6RnHVHlEUCltYFtussi8++WrQtIQaXQIlreEinhLaYZ1OoEi+Z1L6R+EW9ehCC6lzyjfs4BElqU0zRKwQJHCeinNUB9+VgSX0rxvh/GJ5EagPnwifl+POryV0jT14WdEjq+I6sMPilCV0p8R2Zf6jKs+/KAIKqUH5FO1IXKght+NqCt4F3fvwtu3QL+qP4GybqFwZGKq/jBUTJnldQO78F1VbbxgJIHSHpgqivowhIp/qoiKnh05aZqfqlceiOvDMC51jRlb0bM79RZrfRhKqXb46lExOlVv5O5G19ejB/bQEYlEIpFIJBLJkF8r2nFUwcJuMQAAAABJRU5ErkJggg==) no-repeat;
			background-size: 25rpx 25rpx;
			transform: scale(0.8);
		}
	}

	.info-con {
		.title {
			margin-bottom: 14rpx;
			color: #fff;
			line-height: 46rpx;
			font-weight: 600;
		}
	}

	.avator-box {
		margin-bottom: 26rpx;
		align-items: center;
		color: #ccc0ba;
		font-size: 25rpx;

		.avator {
			width: 60rpx;
			height: 60rpx;
			margin-right: 12rpx;
			border-radius: 60rpx;
		}
	}

	.desc-box {
		align-items: center;
		line-height: 40rpx;
		color: #ccc0ba;
		font-size: 23rpx;
	}

	.album-list {
		position: relative;
		top: - 84px;
		background: #fff;
		border-radius: 36rpx 36rpx 0 0;
		z-index: 100;

		.title-bar {
			padding: 10rpx;
			justify-content: space-between;

			.iconfont {
				margin-left: 16rpx;
				margin-right: 16rpx;
				font-size: 40rpx;
			}

			.play {
				line-height: 80rpx;
				color: #252621;
				font-weight: 600;
				font-size: 32rpx;
			}

			.collect {
				width: 228rpx;
				height: 80rpx;
				text-align: center;
				line-height: 80rpx;
				border-radius: 80rpx;
				color: #fff;
				background: #fb2b21;
			}
		}

		.item {
			align-items: center;
			height: 120rpx;
		}

		.con {
			padding-right: 40rpx;
			align-items: center;
			justify-content: space-between;
			&.on{
				.tit {
					color: #fb2b21;
				}
			}
		}

		.num {
			width: 84rpx;
			text-align: center;
			line-height: 120rpx;
			color: #999;
			font-size: 24rpx;

			&.on {
				color: #ff3a3a;
			}
			.iconfont{
				color: #fb2b21;
			}
		}

		.tit {
			max-width:560rpx;
			margin-right: 20rpx;
			color: #333;
			line-height: 48rpx;
			font-size: 32rpx;
		}

		.count {
			margin-right: 20rpx;
			color: #ccc;
			line-height: 48rpx;
			font-size: 24rpx;
			transform: scale(0.84);
		}

		.icon {
			width: 56rpx;
			height: 20rpx;
		}

		.desc {
			color: #999;
			font-size: 24rpx;
			line-height: 40rpx;
		}
	}
</style>
