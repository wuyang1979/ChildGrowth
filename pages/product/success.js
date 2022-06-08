var util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        productId: "",
        companyId: "",
        qrUrl: "",
        qrTip: "",
    },

    toOrderList: function (event) {
        let allUrl = util.fillUrlParams("/pages/order/list", {
            index: 1
        })
        wx.navigateTo({
            url: allUrl,
        });
    },

    goBackIndex: function (e) {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },

    previewImage: function (e) {
        let imgArr = [];
        let current = e.currentTarget.dataset.src;
        imgArr.push(current);
        wx.previewImage({
            current: current,
            urls: imgArr,
        })
    },

    getCompanyIdInnerShopByProductId: function (e) {
        let op = this;
        app.post("/shop/getCompanyIdInnerShopByProductId", {
            productId: op.data.productId
        }, function (data) {
            if (app.hasData(data)) {
                let companyId = data.companyId;
                op.setData({
                    companyId: companyId,
                })
                //中企云服科技companyId为286
                if (companyId != 286) {
                    wx.showLoading({
                        title: '加载中',
                        mask: true
                    })
                    //其他商户的商品，加载群二维码
                    app.post("/shop/getQrCodeByProductId", {
                        productId: op.data.productId
                    }, function (data1) {
                        if (data1.qrUrl == "" || data1.qrUrl == null) {

                        } else {
                            op.setData({
                                qrUrl: app.qinzi + data1.qrUrl,
                                qrTip: "扫描下方二维码加入福利群",
                            })
                        }
                        setTimeout(() => {
                            wx.hideLoading()
                        }, 500)
                    })
                } else {
                    //自己公司的商品
                    op.setData({
                        qrUrl: "/pages/img/communityQrCode.png",
                        qrTip: "点击下方按钮加入福利活动群",
                    })
                }
            }
        })
    },

    saveQr: function (e) {
        let op = this;
        let qrUrl = op.data.qrUrl;
        if (qrUrl == "") {
            wx.showToast({
                title: '二维码有误',
                icon: "none"
            });
            return;
        }
        wx.showLoading({
            title: '二维码下载中',
            mask: true
        })
        wx.getImageInfo({
            src: qrUrl,
            success: res => {
                wx.saveImageToPhotosAlbum({
                    filePath: res.path,
                    success(res) {
                        wx.showToast({
                            title: '保存图片成功！',
                        })
                        setTimeout(() => {
                            wx.hideLoading()
                        }, 500)
                    },
                    fail(res) {
                        //未授权操作
                        if (res.errMsg) {
                            //重新授权弹框确认
                            wx.showModal({
                                title: '温馨提示',
                                content: '您好,请先获取相册授权',
                                showCancel: false,
                                success(res) {
                                    if (res.confirm) {
                                        //重新授权弹框用户点击了确定
                                        wx.openSetting({
                                            //进入小程序授权设置页面
                                            success(settingdata) {
                                                if (settingdata.authSetting['scope.writePhotosAlbum']) {
                                                    //用户打开了保存图片授权开关
                                                } else {
                                                    //用户未打开保存图片到相册的授权开关
                                                    wx.showModal({
                                                        title: '温馨提示',
                                                        content: '授权失败，请稍后重新获取',
                                                        showCancel: false,
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let productId = options.productId || '';
        this.setData({
            productId: productId,
        })
        this.getCompanyIdInnerShopByProductId();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})