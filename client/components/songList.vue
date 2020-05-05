<template>
	<view class="song-list-comp">
		<view class="tit-bar">
			{{title}}
			<view class="more fr">歌单广场</view>
		</view>
		<view class="clearfix">
			<navigator class="item" v-for="(item, index) in list" :key="index" hover-class="none" :url="'/pages/subpages/index/album?item='+ encodeURIComponent(JSON.stringify(item))">
				<image class="img" :src="item.picUrl + $imgSuffix"></image>
				<view class="desc">{{item.name}}</view>
				<view class="count">{{item.playCount}}</view>
			</navigator>
		</view>
	</view>
</template>

<script>
	export default {
		// 从父组件传值的 共有的有主标题，链接更多，歌单数据
		props:{
			title: {
				type: String,
				default: ''
			},
			link:{
				type:String,
				default:''
			},
			list:{
				type: Array,
				default () {
					return []
				}
			}
		},
		data() {
			return {}
		},
		methods:{
			// 跳转链接
			// goUrl (item) {
			// 	uni.navigateTo({
			// 		url: '/pages/subpages/index/album?id=' + item.id,
			// 	});
			// }
		},
		
	}
</script>
<style lang="scss">
	.song-list-comp {
		padding-left: 32rpx;
		margin-top:10rpx;
		.tit-bar {
			font-size: 34rpx;
			font-weight: 600;
			line-height: 110rpx;
		}

		.more {
			width:150rpx;
			height:50rpx;
			line-height:50rpx;
			text-align: center;
			margin-top: 30rpx;
			margin-right: 32rpx;
			font-weight: 400;
			font-size: 24rpx;
			border: 2rpx solid #e6e6e6;
			border-radius: 50rpx;
		}

		.item {
			float:left;
			position: relative;
			width: 216rpx;
			padding-bottom:16rpx;
			margin-right: 16rpx;
			line-height: 34rpx;
			&.video{
				width: 450rpx;
			}
			.img {
				display: block;
				width: 100%;
				height: 216rpx;
				margin-bottom: 16rpx;
				background: #eee;
				border-radius: 10rpx;
			}
			.desc{
				height:62rpx;
				margin-top:12rpx;
				line-height: 30rpx;
				font-weight: 400;
				overflow: hidden;
			}
			.count{
				position:absolute;
				top:0;
				right:0;
				padding-left:25rpx;
				line-height: 34rpx;
				color:#fff;
				font-size: 24rpx;
				z-index: 10;
				background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAqFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8j1z1tAAAAN3RSTlMA9wcC+/3w4A/RoQv0m4s6IBkU7eeRK73kxaZtW+rc1cmxe3UmwbiWQNmqgWZUzUY1ME4dhmGuJ2Z0kQAABVtJREFUeNrtnYtWGkEQRFsEeSmgII8EVBASUFHx1f//ZwmJRwaZYhndjdU5c//gQp8DVTvTK5FIJBKJRCKRSCQSiUQikcj/yWI6vRfzNEYz/U23NhbLlF70jZ7hr+W+pQ6FoxOxyXhP12neiEVyZd3gdiH2uFYfP0tijP2mehk8iy3miui1xRLfFHNaFTv0dAutvpihq1uZmPmp1yRqRuZLVxyol+5cLOB+9nMwZ52G8OOKSLWWVx97TzlhZ01EZDxRL8UHIcf92ZAl/ZZ6+UE+XxsiUjoF8zWinq9NEZH2BZivO+HFJyLyPFAvL4/Cil9ESkcF9XFIO19ARGRRVi9ndaHEDVPvksp38FP/7VgIQSJLTirq5fByX+jAIkvq5+rlnG++tovI/uWheqmwlUZAZMXxlXo5+M41X0DEZXqmXspUpaSuOBJAbrTq8GhLSSzi8jjUv/CWkusimLui/oa4lNxVRHLXYL5ISkmPCKLRYS4lPSIYFOovCEpJXVGRJGCoz59++XwBEci4R1pKIhFMv0VZegeL4FCfDyklGUSWoZ6vlAQiSTw32UpJN/lJMm6o5yolkUgy92WqUjJcxA31RKXkJ0RwqN+7TpwvLpFlqGcpJYNEQkL9MOtSEotcSRIo1DOU3kEigaH+bCoQShEY6vUKlpKcIjDU41IyS5EXSSY81M/q4oNXBIR6VHoTi4BQD0pJahEQ6kHpnZ3IUAIIDPWF96U3u8hGqEelJL/IWqjHpaQFERjqC0er0siECAj12c6Xm4ckRW6a20tJMyKvoR6WknZEcKgf9EXEkggO9b22LREY6pelpC0RHOq7fWMiONRPxlmJdCQLcKjPP1VtieBQX5wbE8GhvtOwJbIM9bCUtCWCQ33xzpgIDvWVXLoiE8macQck4YYxERjqy/vWRFCofzInItKeqIdxiiI9yRwc6msWRXyhfmBSxBfqFzZFNkP9g1UROVkP9TfpiVzIv6VRVodLqyLv/7D0jYps/IW8Nyni+VNfNSjii1kVSU/kVjIHB9+6ORF/FTEUYyKgHBqUjIlMZ+rjcCppipQlY47BOoNyQ0yJoEq7JmJJpH4Om1NLIieVAjzAbUgEPSjJn1YlA5FzyYj7Mn6eaEhkmTvQtRNLIjdNeBHIksjiFp+CyExkJmlT+lmA5wYsiTwP8PVFQyLti20XSs2IVE/zGZ+mwyJnkh79VsKlaxsi40niiUALIug44IF7BtiAyLyb7anZZJGipECjs9s5ZnKR3NPejifLuUUeimDBzeZUMYs0fgQ8SOcVAU/R0X2YLEW66ZXSyTfgSEUeh19+JxGIhJbSX39L1G00PlxKM9zbBSIhpTTHTWogElBKk9xt/5xIfUazAtXtZ8JLaaL9D64IX334L0Tq51w7LNySJqyUJttaA0QSp4pujxAWCS+lb9vydbiZeudSmnHXVrDITZNz+1mgyOKWdR8dEIGlNO2GwBCR5wHxzka36kgopXvUWzRdEapSOiORfot906ybTINL6RnHVHlEUCltYFtussi8++WrQtIQaXQIlreEinhLaYZ1OoEi+Z1L6R+EW9ehCC6lzyjfs4BElqU0zRKwQJHCeinNUB9+VgSX0rxvh/GJ5EagPnwifl+POryV0jT14WdEjq+I6sMPilCV0p8R2Zf6jKs+/KAIKqUH5FO1IXKght+NqCt4F3fvwtu3QL+qP4GybqFwZGKq/jBUTJnldQO78F1VbbxgJIHSHpgqivowhIp/qoiKnh05aZqfqlceiOvDMC51jRlb0bM79RZrfRhKqXb46lExOlVv5O5G19ejB/bQEYlEIpFIJBLJkF8r2nFUwcJuMQAAAABJRU5ErkJggg==) no-repeat;
				background-size: 25rpx 25rpx;
				transform: scale(0.8);
			}
		}
	}
</style>