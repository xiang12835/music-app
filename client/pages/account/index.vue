<template>
	<view>
		<uni-nav-bar v-if="!isShowScan" fixed :status-bar="true" @clickLeft="openScan" @clickRight="goCloud">
			<!-- #ifdef APP-PLUS -->
			<block slot="left"><image class="top-img left" src="/static/image/account/a16.png"></image></block>
			<!-- #endif -->
			<!-- #ifndef MP-WEIXIN -->
			<block slot="right"><image class="top-img" src="/static/image/mine/r.png"></image></block>
			<!-- #endif -->
			<view class="tac">{{title}}</view>
		</uni-nav-bar>
		<scroll-view scroll-y="true" class="page-content" @scroll="scroll" :scroll-top="scrollTop">
			<view v-if="!userInfo.hasLogin" class="empty-user">
				<view>登录网易云音乐</view>
				<view>手机电脑多端同步，尽享海量高品质音乐</view>
				<navigator class="btn" url="/pages/subpages/account/login">
					立即登录
				</navigator>
			</view>
			<template v-if="userInfo.hasLogin">
				<view class="userinfo-box flex-box">
					<view class="avator">
						<image v-if="userInfo.profile" class="img" :src="userInfo.profile.avatarUrl"></image>
						<view v-else class="no-img">
							上传头像
						</view>
					</view>
					<view class="flex-item">
						<view class="fl">
							<view class="name">{{userInfo.profile.nickname}}</view>
							<view class="level">lv{{detail.level || 1}}</view>
						</view>
						<image class="sign fr" src="/static/image/account/a_03.png"></image>
					</view>
				</view>
				<view class="nav-bar flex-box">
					<view class="flex-item">
						{{detail.eventCount || 0}}
						<view class="txt">动态</view>
					</view>
					<view class="flex-item">
						{{detail.follows || 0}}
						<view class="txt">关注</view>
					</view>
					<view class="flex-item">
						{{detail.followeds || 0}}
						<view class="txt">粉丝</view>
					</view>
					<view class="flex-item">
						<view class="iconfont">&#xe63a;</view>
						<view class="txt">编辑资料</view>
					</view>
				</view>
			</template>
			<view class="ad-bar" :class="{bgf: !userInfo.hasLogin}">
				<image class="img" src="/static/image/account/a_07.png"></image>
			</view>
			<view class="mall-bar flex-box">
				<view class="flex-item">
					<image class="icon" src="/static/image/account/a_m1.png"></image>
					消息
				</view>
				<view class="flex-item">
					<image class="icon" src="/static/image/account/a_m2.png"></image>
					商城
					<view class="txt">现实29包邮</view>
				</view>
				<view class="flex-item">
					<image class="icon" src="/static/image/account/a_m3.png"></image>
					演出
					<view class="txt">天鹅湖</view>
				</view>
				<view class="flex-item">
					<image class="icon" src="/static/image/account/a_m4.png"></image>
					个性换肤
				</view>
			</view>
			<view class="bgf8">
				<uni-list>
					<uni-list-item title="口袋彩铃" thumb="/static/image/account/a_16.png" size='mini'/>
					<uni-list-item title="我的订单" thumb="/static/image/account/a_19.png" size='mini' border0/>
					<uni-list-item title="创作者中心" thumb="/static/image/account/a_09.png" size='mini' class="mt16" border0/>
					<uni-list-item title="设置" thumb="/static/image/account/a_21.png" size='mini' class="mt16"/>
					<uni-list-item title="夜间模式" thumb="/static/image/account/a_23.png" size='mini' :show-switch="true"  @switchChange="switchChange"/>
					<uni-list-item title="定时开关" thumb="/static/image/account/13.png" size='mini'/>
					<uni-list-item title="音乐闹钟" thumb="/static/image/account/13.png" size='mini' border0/>
					<uni-list-item title="在线听歌免流量" thumb="/static/image/account/14.png" size='mini' class="mt16"/>
					<uni-list-item title="优惠券" thumb="/static/image/account/15.png" size='mini' border0/>
					<uni-list-item title="分享网易云音乐" thumb="/static/image/account/16.png" size='mini' class="mt16"/>
					<uni-list-item title="关于" thumb="/static/image/account/17.png" size='mini' border0/>
				</uni-list>
				<view v-if="userInfo.hasLogin" class="logout" @click="confirmOut">
					退出登录
				</view>
			</view>
		</scroll-view> 
		<!-- 扫码组件 -->
		<!-- #ifdef APP-PLUS -->
			<view class="scan-box" :class="{active: isShowScan}">
				<!-- 扫码标题栏 -->
				<uni-nav-bar if="isShowScan" fixed :status-bar="true" title="扫一扫" left-icon="back" @clickLeft="closeScan">
				</uni-nav-bar>
				<scan ref="scan" @success="getScanCode"/>
			</view>
		<!-- #endif -->
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	import { apiLogout, apiUserDetail } from '@/apis/account.js';
	import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue';
	import uniList from '@/components/uni-list/uni-list.vue'
	import uniListItem from '@/components/uni-list-item/uni-list-item.vue'
	import scan from '@/components/scan/scan.vue'
	export default {
		components: {
			uniNavBar,
			uniList,
			uniListItem,
			scan
		},
		data() {
			return {
				title: '',
				scrollTop: 0,
				isShowScan: false,
				detail: {},
			};
		},
		onLoad () {
			this.getDetail()
			
			// 公共设置图标
			this.$pubFuc.setTabBarBadge(4)
		},
		computed:{
		   ...mapState(['userInfo'])
		},
		methods: {
			// 退出登录
			...mapMutations(['storeLogout']),
			switchChange(e) {
				uni.showToast({
					title: 'change:' + e.value,
					icon: 'none'
				})
			},
			// 退出登录 清空缓存
			confirmOut() {
				uni.showModal({
					title: '网易云音乐',
					content: '确定退出当前账号吗？',
					cancelColor: '#007aff',
					success: res => {
						if (res.confirm) {
							this.confirmLogout()
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			// 确定退出
			confirmLogout() {
				apiLogout().then(res => {
					this.storeLogout()
					// 到登录页
					uni.navigateTo({
						url: '/pages/subpages/account/login'
					})
				})
			},
			// 滚动到顶部标题变换
			scroll (e) {
				let scrollTop = e.detail.scrollTop
				if (scrollTop < 5) {
					this.title = ''
					this.scrollTop = 0
				} else {
					this.title = '账号'
				}
			},
			// #ifdef APP-PLUS
			// 打开扫描
			openScan () {
				this.$refs.scan.open()
				this.isShowScan = true
				// 隐藏底部 tabbar
				uni.hideTabBar({})
			},
			// 隐藏扫描
			closeScan () {
				this.$refs.scan.close()
				this.isShowScan = false
				uni.showTabBar({})
			},
			// 扫码成功
			getScanCode (val) {
				this.closeScan()
				uni.showToast({
					icon: 'none',
					title: '扫码成功',
				});
			},
			// #endif
			// 获取用户详情
			getDetail () {
				const profile = this.userInfo.profile
				if (!profile || !profile.userId) {
					return false
				}
				const par = {
					uid: profile.userId
				}
				apiUserDetail(par).then(res => {
					this.detail = {...res, ...res.profile}
				})
			}
			
		}
	}
</script>

<style lang="scss">
	.bgf8{
		background: #f8f8f8;
	}
	.scan-box{
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0,0,0,.8);
		transform: translateX(100%);
		transition: transform 0.05s;
		&.active{
			transform: translateX(0)
		}
	}
	.tac{
		flex:1;
		text-align: center;
	}
	.top-img {
		width: 50rpx;
		height: 40rpx;
		&.left {
			margin-left: 10rpx;
		}
	}
	.page-content {
		position: fixed;
		top: 64px;
		left: 0;
		right: 0;
		bottom: 0;
		/* #ifdef H5 */
		top:44px;  // h5 无状态栏
		bottom: 100rpx;
		/* #endif */
	}
	.mt16 {
		margin-top: 16rpx;
	}

	.bgf {
		background: #fff;
	}

	.empty-user {
		background: #fff;
		padding-top: 40rpx;
		text-align: center;
		line-height: 50rpx;

		.btn {
			width: 710rpx;
			height: 80rpx;
			margin: 22rpx auto 0;
			text-align: center;
			line-height: 80rpx;
			border: 2rpx solid #cdcdcd;
			border-radius: 80rpx;
			font-size: 32rpx;
		}
	}

	.userinfo-box {
		padding-top: 46rpx;

		.avator {
			width: 120rpx;
			height: 120rpx;
			margin: 0 32rpx;
			border-radius: 120rpx;
			color: #fff;
			background: #d6d8da;
			overflow: hidden;
		}

		.img {
			width: 100%;
			height: 100%;
		}

		.name {
			color: #302f30;
			line-height: 68rpx;
			font-weight: 600;
		}

		.sign {
			width: 128rpx;
			height: 52rpx;
			margin-top: 16rpx;
			margin-right: 32rpx;
			border-radius: 52rpx;
		}

		.level {
			width: 100rpx;
			height: 50rpx;
			text-align: center;
			line-height: 50rpx;
			border-radius: 50rpx;
			color: #838080;
			background: #d7d3d4;
			transform: scale(0.8);
		}
	}

	.nav-bar {
		margin-top: 38rpx;
		text-align: center;
		font-weight: 600;

		.flex-item {
			height: 80rpx;
			border-right: 1rpx solid #e5e1df;

			&:last-child {
				border: 0;
			}
		}

		.txt {
			color: #939293;
			font-weight: 400;
		}
	}

	.ad-bar {
		padding-top: 32rpx;

		.img {
			display: block;
			width: 686rpx;
			height: 120rpx;
			margin: 0 auto;
		}
	}

	.mall-bar {
		padding-top: 38rpx;
		padding-bottom: 20rpx;
		text-align: center;
		font-weight: 600;
		font-size: 26rpx;
		background: #fff;
		line-height: 35rpx;

		.icon {
			display: block;
			width: 48rpx;
			height: 48rpx;
			margin: 0 auto 24rpx;
		}

		.txt {
			color: #999;
			font-weight: 400;
			font-size: 24rpx;
			transform: scale(0.84);
		}
	}

	.line-item {

		.icon {
			float: left;
			width: 35rpx;
			height: 32rpx;
			margin-top: 30rpx;
			margin-right: 36rpx;
		}
	}

	.logout {
		height: 100rpx;
		margin-top: 16rpx;
		text-align: center;
		line-height: 100rpx;
		color: $color;
		background: #fff;
	}
</style>
