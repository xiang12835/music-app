<template>
	<view></view>
</template>

<script>
	export default {
		data() {
			return {
				typeList: [ // 码类型 参考地址 https://www.dcloud.io/docs/api/zh_cn/barcode.html
					plus.barcode.QR,
					// plus.barcode.EAN13,
					// plus.barcode.EAN8,
					// plus.barcode.UPCA,
					// plus.barcode.UPCE,
					// plus.barcode.CODABAR,
					// plus.barcode.CODE39,
					// plus.barcode.CODE93,
					// plus.barcode.CODE128,
					// plus.barcode.ITF,
				],
			};
		},
		methods: {
			open() {
				// 创建上层webview
				let pages = getCurrentPages();
				let currentWebview = pages[pages.length - 1].$getAppWebview();
				// 创建一个扫码框
				this.barcode = plus.barcode.create('barcode', this.typeList, {
					position: 'fixed',
					top: '64px',
					left: '0px',
					width: '100%',
					height: '100%',
				});
				
				// 扫码成功回调
				this.barcode.onmarked = this.onmarked;
				
				// 添加到当前 Webview
				currentWebview.append(this.barcode);
				
				// 打开扫码
				this.barcode.start();
			},
			// 关闭扫码
			close () {
				this.barcode.close();
			},
			// 扫码成功
			onmarked (type, result) {
				this.openStartRecognize(result)
				this.$emit('success', result);
				this.close()
			},
			// 打开识别 网址跳转
			openStartRecognize (result) {
				let strRegex = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/|www\.)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
				let reg = new RegExp(strRegex);
				if (reg.test(result)) {
					return false
				}
				
				// 创建一个 webview 页面
			    let barcodeWebview = plus.webview.create(result, 'barcodeWebview', {  
			        titleNView: {  
			            autoBackButton: true,  
			            backgroundColor: '#fff',  
			            titleColor: '#333',  
			            // titleText: '外部页面',   // 不设置标题自动读取网页标题  
			        },  
			        backButtonAutoControl: 'hide',  
			        hardwareAccelerated: true,  
					background:"#fff"  
			    })  
				barcodeWebview.show('slide-in-right', 200, function() {
					let title = barcodeWebview.getTitle()
				});
			}
		}
	}
</script>

<style lang="scss">
	
</style>
