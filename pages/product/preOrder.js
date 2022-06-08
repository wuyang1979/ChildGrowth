let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: "",
        productId: "",
        phone: "",
        main_image: "",
        name: "",
        introduce: "",
        num: "",
        total: "",
        order_type: "",
        address: "",
        standardName: "",
        hasAddress: true,
        product_style: '',
    },

    loadOrderInfo: function (e) {
        let op = this;
        let orderId = op.data.id;
        let userId = app.getUserId();
        if (orderId != "" && userId != "") {
            app.post("/userOrder/getShowInfo", {
                orderId: orderId,
                userId: userId,
            }, function (data) {
                if (app.hasData(data)) {
                    let hasAddress = true;
                    if (data.main_image.indexOf("http") == -1) {
                        data.main_image = app.qinzi + data.main_image;
                    }
                    if (data.address == "") {
                        hasAddress = false;
                        data.address = "您暂未填写收货地址，点击前往~";
                    }
                    if (data.order_type == 0) {
                        op.setData({
                            product_style: data.product_style,
                        })
                    }
                    op.setData({
                        phone: data.phone,
                        main_image: data.main_image,
                        name: data.name,
                        introduce: data.introduce,
                        num: data.num,
                        total: data.total,
                        order_type: data.order_type,
                        address: data.address,
                        hasAddress: hasAddress,
                        standardName: data.standardName,
                    })
                }
            })
        }
    },

    toAddressPage: function (e) {
        let userId = app.getUserId();
        if (this.data.hasAddress) {
            let allUrl = util.fillUrlParams("/pages/my/addressList", {
                userId: userId
            })
            wx.navigateTo({
                url: allUrl,
            })
        } else {
            let allUrl = util.fillUrlParams("/pages/my/info", {
                id: userId
            })
            wx.navigateTo({
                url: allUrl,
            })
        }
    },

    goPay: function (e) {
        let op = this;
        if (op.data.order_type == 0 && op.data.product_style == 1 && !op.data.hasAddress) {
            wx.showToast({
                title: '请填写收货地址',
                icon: "none"
            })
            return;
        }
        app.post('/userOrder/prePay', {
            userId: app.getUserId(),
            id: op.data.id,
            body: op.data.name,
            total: op.data.total,
            appName: 'chengzhanggo',
        }, function (data) {
            if (!!data && !!data.status) {
                wx.showToast({
                    title: '后台处理失败',
                    icon: "none"
                })
                return;
            }

            if (app.hasData(data)) {
                // 发起微信支付
                wx.requestPayment({
                    'timeStamp': data.timeStamp,
                    'nonceStr': data.nonceStr,
                    'package': data.package,
                    'signType': data.signType,
                    'paySign': data.paySign,
                    'success': function (res) {
                        let allUrl = util.fillUrlParams('/pages/product/success', {
                            productId: op.data.productId
                        });
                        wx.navigateTo({
                            url: allUrl
                        });
                    },
                    'fail': function (res) {}
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let orderId = options.orderId || "";
        let productId = options.productId || "";
        this.setData({
            id: orderId,
            productId: productId,
        })

        this.loadOrderInfo();
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
        this.loadOrderInfo();
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