<template>
	<view class="play-page" :style="bgStyle">
		<view class="bg"></view>
		<!-- #ifndef H5 -->
		<view class="title-bar flex-box">
			<view class="iconfont" @click="goBack">&#xe616;</view>
			<view class="flex-item">
				<view class="name">{{computedTitle}}</view>
				<view class="author">{{audioList[curPlayIndex].singer}}</view>
			</view>
			<view class="iconfont">&#xe639;</view>
		</view>
		<!-- #endif -->
		<!-- 拨条 -->
		<view class="strip-box" :class="playState ? 'active' : ''">
			<image class="img" src="https://s3.music.126.net/mobile-new/img/needle-ip6.png?be4ebbeb6befadfcae75ce174e7db862="></image>
		</view>
		<view class="content">
			<view class="play-poster">
				<div class="poster-box" :class="playState?'play':'pause'">
					<image class="img" v-if="curSongItem.picUrl" :src="curSongItem.picUrl + $imgSuffix"></image>
				</div>
			</view>
			<view class="bot">
				<view class="tool-groups flex-box">
					<view class="flex-item" @click="collectFunc">
						<text class="iconfont">&#xe615;</text>
					</view>
					<view class="flex-item iconfont">&#xe60e;</view>
					<view class="flex-item iconfont">&#xe6ac;</view>
					<view class="flex-item iconfont">&#xe628;</view>
					<view class="flex-item iconfont">&#xe60f;</view>
				</view>
				<view class="slider-bar flex-box">
					<view class="time star">{{curPlayTimeNum}}</view>
					<slider class="line flex-item" :value="curPlayTime" min="0" :max="playTime" @change="sliderChange" block-size="15"
					 backgroundColor="rgba(255,255,255,.5)" activeColor="rgba(255,255,255,.5)" />
					<view class="time end">{{playTimeNum}}</view>
				</view>
				<view class="btn-groups flex-box">
					<view class="flex-item" @click="setPlayModel">
						<view v-if="playModel==0" class="iconfont">&#xe66c;</view>
						<view v-if="playModel==1" class="iconfont">&#xe66b;</view>
						<view v-if="playModel==2" class="iconfont">&#xe66d;</view>
					</view>
					<view class="flex-item" @click="prevPlay">
						<view class="iconfont">&#xe78a;</view>
					</view>
					<view class="play-btn" @click="play">
						<view v-if="!playState" class="iconfont">&#xe638;</view>
						<view v-if="playState" class="iconfont">&#xe76a;</view>
					</view>
					<view class="flex-item" @click="nextPlay">
						<view class="iconfont">&#xe7a5;</view>
					</view>
					<view class="flex-item iconfont" @click="openList(1)">&#xe634;</view>
				</view>
			</view>
		</view>
		<!-- 播放列表 -->
		<view>
			<view class="mark" :class="{active: isShowList}" @click="openList(0)"></view>
			<view class="album-list" :class="{active: isShowList}">
				<view class="tit-bar flex-box">
					<view class="play" @click="setPlayModel">
						<text v-if="playModel == 0" class="iconfont">&#xe66c;</text>
						<text v-if="playModel == 1" class="iconfont">&#xe66b;</text>
						<text v-if="playModel == 2" class="iconfont">&#xe66d;</text>
						{{['列表循环', '随机播放', '单曲循环'][playModel]}}
						{{playModel < 2 ? '('+audioList.length+')' : ''}}
					</view>
					<view class="delete" @click="confirmClear">
						<text class="iconfont">&#xe61a;</text>
					</view>
				</view>
				<view class="list">
					<view class="item flex-box" v-for="(item, index) in audioList" :key="index">
						<view class="flex-box con" :class="{ on: playList.curSong.id == item.id }" @click="selectSong(item)">
							<text class="iconfont" v-if="playList.curSong.id == item.id">&#xe64c;</text>
							<view class="tit ellipsis flex-item">
								{{ item.name }} - <text class="cfb"> {{ item.singer }}</text>
							</view>
						</view>
						<view class="flex-item iconfont" @click="removeItem(item)">&#xe785;</view>
					</view>
				</view>
				<view class="close" @click="openList(0)">关闭</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import {
		apiSongUrl,
		apiSongDetail
	} from '@/apis/index.js'
	let backgroundAudioManager = ''
	export default {
		data() {
			return {
				curPlayTime: 0, // 当前时间
				playState: 0, // 播放状态
				playTime: 0, // 全部时间
				audioList: [],
				curPlayIndex: 0, //当前播放的歌曲index
				curAudio: {},
				playModel: 0, //播放方式 0顺序播放 1随机播放 2单曲循环
				collect: 0, //是否收藏
				curSongItem: {
					title: '',
					time: ''
				},
				isShowList: false, // 是否显示列表
				curSong: {}
			}
		},
		computed: {
			...mapState(['playList']),
			// 当前播放时长
			curPlayTimeNum() {
				return this.$pubFuc.formatTime(this.curPlayTime)
			},
			// 单曲播放时长
			playTimeNum() {
				return this.$pubFuc.formatTime(this.playTime)
			},
			// 设置滤镜背景
			bgStyle() {
				if (this.curSongItem.picUrl || this.curSong.picUrl) {
					return 'background-image:url(' + (this.curSongItem.picUrl || this.curSong.picUrl) + this.$imgSuffix + ')'
				} else {
					return ''
				}
			},
			// 设置标题
			computedTitle () {
				if (this.audioList.length) {
					const title = this.audioList[this.curPlayIndex].name
					return title > 20 ? title : title.slice(0,20)
				} else {
					return ''
				}
			}
		},
		onLoad() {
			// 播放列表
			this.audioList = this.playList.list
			this.curSong = this.playList.curSong
			if (backgroundAudioManager) {  // 如果实例化了音频
				
			} else {
				// #ifdef H5
				backgroundAudioManager = uni.createInnerAudioContext();
				// #endif
				
				// 设置后台播放
				// #ifndef H5
				backgroundAudioManager = uni.getBackgroundAudioManager()
				// #endif
			}
			console.log(this.curSong.src)
			// 重新进入页面的时候判定后台音频是否为当前音频
			if (this.curSong.src && backgroundAudioManager.src && (this.curSong.src == backgroundAudioManager.src)) {
				// 维持当前歌曲
			} else { 
				let isH5 = false
				// #ifdef H5
				isH5 = true
				// #endif
				
				if (isH5 && this.curSong.src) { // H5 利用 locastorage 优势，页面刷新后播放当前储存下的歌曲
					this.playTime = this.curSong.time
					backgroundAudioManager.src = this.curSong.src
					// h5 设置autoplay自动播放
					if (this.playList.playState) {
						backgroundAudioManager.autoplay = true
					}
				} else {
					// 播放新歌  新歌分两种情况： 1，下一首原有列表的歌  2，上个页面传递的歌曲
					console.log("播放新歌曲了")
					this.playInit(1)
					return false
				}
				
			}
			this.playTime = this.curSong.time   // 歌曲总时长
			this.curPlayTime = backgroundAudioManager.currentTime   // 歌曲当前播放时间
			this.playState = !backgroundAudioManager.paused  // 播放状态
			this.playModel = this.curSong.playModel || 0    // 播放模式
			this.curSongItem.picUrl = this.curSong.picUrl  // 设置封面
			
			// #ifdef H5
			this.playState = this.playList.playState
			uni.setNavigationBarTitle({
				title: this.curSong.name + ' - ' + this.curSong.singer + ' - 单曲 - 网易云音乐'
			})
			// #endif

			// 设置音频对象的方法
			this.setPlay()
		},
		methods: {
			// 设置歌单
			...mapMutations(['storePlayList']),
			// 设置音频对象的方法
			setPlay() {
				// 设置对应的歌曲索引
				let tempIndex = 0
				this.audioList.forEach((item, index) => {
					if (this.curSong.id == item.id) {
						return tempIndex = index
					}
				})
				this.curPlayIndex = tempIndex
				
				backgroundAudioManager.onPlay(() => { // 设置播放状态
					this.playState = 1
					// 传递歌单信息到 store
					this.storePlayList({
						playState: 1
					})
				})
				backgroundAudioManager.onPause(() => {
					this.playState = 0
					
					// 传递歌单信息到 store
					this.storePlayList({
						playState: 0
					})
				})
				backgroundAudioManager.onTimeUpdate((e) => {
					this.curPlayTime = Math.floor(backgroundAudioManager.currentTime)
				})
				backgroundAudioManager.onEnded(() => {
					this.nextPlay()
				})
			},
			// 获取数据 初始化播放数据
			async playInit(isInit) {
				if (isInit) {  // 初始化的话
					console.log("初始化了")
					// 设置音频对象的方法
					this.setPlay()
				}
				this.curAudio = this.audioList[this.curPlayIndex]
				this.curId = this.curAudio.id
				this.curPlayTime = 0
				let [res0, res1] = await Promise.all([
					// 获取歌曲URL
					apiSongDetail({
						ids: this.curId
					}).then(res => {
						var songs = res.songs[0]
						let singer = songs.ar.map(art => {
							return art.name
						})[0]
						return {
							name: songs.al.name,
							picUrl: songs.al.picUrl,
							singer,
							time: Math.floor(songs.dt / 1000) // 播放时长
						}
					}),
					// 获取歌曲详情
					apiSongUrl({
						id: this.curId
					}).then(res => {
						let src = res.data[0].url
						if (!src) {
							uni.showToast({
								icon: 'none',
								title: '播放出现问题啦，播放下一首~'
							})
							this.curPlayIndex++
							this.playInit()
							return false
						}
						return {
							src: res.data[0].url
						}
					})
				])

				this.curSongItem = { ...res0, ...res1 }
				
				// 传递歌单信息到 store
				this.storePlayList({
					curSong: {...this.curAudio, ...this.curSongItem, ...{ playModel: this.playModel }}
				})
				
				// 新的音频歌
				console.log("新的音频歌", this.curSongItem)
				backgroundAudioManager.title = this.curSongItem.name
				backgroundAudioManager.singer = this.curSongItem.singer
				backgroundAudioManager.coverImgUrl = this.curSongItem.picUrl
				this.playTime = this.curSongItem.time
				// 设置了 src 之后会自动播放
				backgroundAudioManager.src = this.curSongItem.src
				// h5 设置autoplay自动播放
				backgroundAudioManager.autoplay = true
				
				// #ifdef H5
				uni.setNavigationBarTitle({
					title: this.curSongItem.name + ' - ' + this.curSongItem.singer + ' - 单曲 - 网易云音乐'
				})
				// #endif
				
			},
			// 拖拽进度
			sliderChange(e) {
				this.curPlayTime = e.detail.value
				backgroundAudioManager.seek(this.curPlayTime)
			},
			// 播放暂停
			play() {
				if (this.playState) {
					//暂停
					backgroundAudioManager.pause()
				} else {
					//播放
					backgroundAudioManager.play()
				}
			},
			// 下一首
			nextPlay(type) {
				// 顺序播放
				if (this.playModel == 0) {
					if (!type) { // 默认下一首
						this.curPlayIndex = this.curPlayIndex >= (this.audioList.length - 1) ? 0 : this.curPlayIndex + 1
					} else {
						this.curPlayIndex = (this.curPlayIndex < 1) ? this.audioList.length - 1 : this.curPlayIndex - 1
					}

				}
				// 随机播放
				if (this.playModel == 1) {
					this.curPlayIndex = Math.floor(Math.random() * 10) % this.audioList.length;
				}
				// 单曲循环保持当前索引不变

				// 再次初始化播放
				this.playInit()
			},
			// 上一首
			prevPlay() {
				this.nextPlay(1)
			},
			// 设置播放模式
			setPlayModel() {
				this.playModel = this.playModel > 1 ? 0 : this.playModel + 1
				uni.showToast({
					icon: 'none',
					title: ['列表循环', '随机播放', '单曲循环'][this.playModel]
				})
			},
			// 打开列表
			openList(bool) {
				this.isShowList = bool
			},
			// 返回
			goBack() {
				uni.navigateBack()
			},
			// 清除列表
			confirmClear() {
				uni.showModal({
					title: '',
					content: '确定要清空播放列表吗？',
					cancelColor: '#007aff',
					success: res => {
						if (res.confirm) {
							if (backgroundAudioManager) { // 清空实例
								backgroundAudioManager.pause()
								// #ifdef H5
								backgroundAudioManager.destroy()
								// #endif
								backgroundAudioManager = ''
							}
							this.audioList = []
							// 传递歌单信息到 store
							this.storePlayList({
								curSong: {},
								list: []
							})
							// 进入到首页
							uni.switchTab({
								url: '/pages/index/index'
							});
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			// 删除单曲
			removeItem(data) {
				// 过滤当前歌曲	
				this.audioList = this.audioList.filter(item => {
					return data.id != item.id
				})

				// 新列表更新到store
				this.storePlayList({
					list: this.audioList
				})
				// 如果删的是当前歌曲
				console.log(data)
				console.log(this.playList.curSong)
				if (data.id == this.playList.curSong.id && this.audioList.length > 0) {
					// 定位到下一首，索引保持不变
					this.playInit()
				}
			},
			// 选曲
			selectSong(data) {
				// 当前歌曲返回
				if (data.id == this.playList.curSong.id) {
					return false;
				}	
				let tempIndex = 0
				this.audioList.forEach((item, index) => {
					if (data.id == item.id) {
						return tempIndex = index
					}
				})
				this.curPlayIndex = tempIndex
				this.playInit()
			}
		},
		destroyed() {
			backgroundAudioManager.onPlay()
			backgroundAudioManager.onPause()
			backgroundAudioManager.onTimeUpdate()
			backgroundAudioManager.onEnded()
		},

	}
</script>

<style lang="scss" scoped>
	.mark{
		position: fixed;
		right: 0;
		left: 0;
		top:0;
		bottom:0;
		background-color: rgba(0, 0, 0, .4);
		z-index: 100;
		display: none;
		&.active{
			display: block;
		}
	}
	.bg {
		position: fixed;
		z-index: 0;
		right: 0;
		left: 0;
		height: 100%;
		width: 100%;
		filter: blur(40rpx);
		background: inherit;
		z-index: -1;
		transform: scale(1.5);
		background-color: rgba(0, 0, 0, .6);
	}

	.play-page {
		position: fixed;
		right: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-position: center center;
		background-repeat: no-repeat;
		background-size: cover;
	}

	.slider-bar {
		color: rgba(255, 255, 255, .6);
		padding: 20rpx 0;
		justify-content: space-between;

		.line {
			margin: 0;
			border-radius: 2rpx;
		}

		.time {
			height: 36rpx;
			width: 80rpx;
			margin-right: 10rpx;
			font-size: 36rpx;
			line-height: 76rpx;
			transform: scale(0.5) translateY(-50%);
		}
	}

	.strip-box {
		position: absolute;
		width: 100%;
		top: 142rpx;
		/* #ifdef H5 */
		top: 0rpx;
		/* #endif */
		height: 329rpx;
		z-index: 100;
		transform: rotate(-30deg);
		transform-origin: center 0;
		transition: transform 0.3s;

		&:before {
			position: absolute;
			content: "";
			top: -20rpx;
			left: 350rpx;
			width: 48rpx;
			height: 48rpx;
			border-radius: 48rpx;
			background: #fff;
			z-index: 100;
		}

		&.active {
			transform: rotate(0deg);
		}

		.img {
			width: 220rpx;
			height: 330rpx;
			margin-left: 340rpx;
		}
	}

	.play-poster {
		margin: 310rpx auto 0;
		/* #ifdef H5 */
		margin-top: 130rpx;

		/* #endif */
		.poster-box {
			display: flex;
			width: 616rpx;
			height: 616rpx;
			margin: 0 auto;
			background: url(https://s3.music.126.net/mobile-new/img/disc-ip6.png?69796123ad7cfe95781ea38aac8f2d48=) center center no-repeat;
			background-size: 100%;
			align-items: center;
			justify-content: center;
			animation: circling 20s linear infinite;

			&.pause {
				animation-play-state: paused;
			}
		}

		.img {
			display: block;
			margin: 0 auto;
			width: 382rpx;
			height: 382rpx;
			border: solid 16rpx rgba(0, 0, 0, .15);
			border-radius: 50%;
		}
	}

	@-webkit-keyframes circling {
		0% {
			transform: rotate(0);
		}

		100% {
			transform: rotate(1turn);
		}
	}

	.btn-groups {
		align-items: center;
		text-align: center;

		.iconfont {
			font-size: 40rpx;
		}

		.play-btn {
			position: relative;
			width: 120rpx;
			height: 120rpx;
			line-height: 120rpx;

			&:before {
				position: absolute;
				content: "";
				width: 240rpx;
				height: 240rpx;
				border: 1px solid #fff;
				border-radius: 240rpx;
				transform: scale(0.5) translate(-100%, -50%);
				z-index: -1;
			}
		}
	}

	.tool-groups {
		margin-bottom: 20rpx;
		text-align: center;

		.iconfont {
			font-size: 40rpx;
		}
	}

	.title-bar {
		position: fixed;
		top: 0;
		width: 100%;
		height: 44px;
		margin-top: 20px;
		text-align: center;
		line-height: 44px;
		color: #fff;
		z-index: 100;

		.name {
			line-height: 50rpx;
			font-size: 28rpx;
		}

		.author {
			line-height: 1;
			font-size: 24rpx;
			color: rgba(255, 255, 255, .8);
		}

		.iconfont {
			width: 110rpx;
			font-size: 44rpx;
		}
	}

	.content {
		position: fixed;
		z-index: 1;
		right: 0;
		left: 0;
		height: 100%;
		width: 100%;
		color: #FFFDEF;

		.bot {
			position: fixed;
			bottom: 40rpx;
			left: 0;
			width: 100%;
			padding: 0 26rpx;
		}
	}

	.album-list {
		position: absolute;
		width: 100%;
		bottom: 0;
		background: #fff;
		border-radius: 36rpx 36rpx 0 0;
		z-index: 101;
		transition: transform 0.3s;
		transform: translateY(100%);

		&.active {
			transform: translateY(0);
		}

		.list {
			padding-left: 30rpx;
			height: 696rpx;
			overflow-y: scroll;

		}

		.cfb {
			color: #69696a;
			font-size: 24rpx;
			margin-left: 6rpx;
		}

		.tit-bar {
			position: relative;
			padding: 10rpx;
			justify-content: space-between;

			&:before {
				position: absolute;
				content: "";
				width: 100%;
				bottom: 0;
				border-bottom: 1px solid #e6e6e6;
				transform: scaleY(.5);
			}

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

			.delete {
				line-height: 80rpx;
				color: #999;
				font-size: 34rpx;
			}
		}

		.item {
			position: relative;
			align-items: center;
			height: 88rpx;
			line-height: 88rpx;

			&:before {
				position: absolute;
				content: "";
				width: 720rpx;
				bottom: 0;
				border-bottom: 1px solid #e6e6e6;
				transform: scaleY(.5);
			}

			.iconfont {
				width: 96rpx;
				height: 88rpx;
				text-align: center;
				line-height: 88rpx;
				font-size: 32rpx;
				color: #999;
			}
		}

		.con {
			width: 624rpx;

			&.on {
				.iconfont {
					width: 40rpx;
					margin-right: 10rpx;
					color: #fb2b21;
				}

				.tit {
					color: #fb2b21;
				}

				.cfb {
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
		}

		.tit {
			margin-right: 20rpx;
			color: #333;
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

		.close {
			position: relative;
			height: 50px;
			line-height: 50px;
			text-align: center;

			&:before {
				position: absolute;
				content: "";
				top: 0;
				left: 0;
				width: 100%;
				border-top: 1px solid #ddd;
				transform: scaleY(0.5);
			}
		}
	}
</style>
