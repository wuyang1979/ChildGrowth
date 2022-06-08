let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: "",
        order_no: "",
        order_type: "",
        phone: "",
        customer_service: "",
        main_image: "",
        name: "",
        introduce: "",
        num: "",
        total: "",
        create_time: "",
        status: "",
        product_style: "",

        address: "",
        url: "",
    },

    loadReceiveAddress: function (e) {
        let op = this;
        let userId = app.getUserId();
        if (userId == "-1") {
            wx.showToast({
                title: '您还未注册',
                icon: "none"
            });
            return;
        }

        app.post("/userOrder/getReceiveAddress", {
            userId: userId,
        }, function (data) {
            if (app.hasData(data)) {
                let addressInfo = data[0];
                let address = addressInfo.province + addressInfo.city + addressInfo.area + addressInfo.address
                op.setData({
                    address: address,
                })
            }
        })
    },

    consult: function (e) {
        let op = this;
        if (op.data.customer_service != null && op.data.customer_service != "") {
            wx.makePhoneCall({
                phoneNumber: op.data.customer_service,
            })
        }
    },

    loadWriteOffQrCode: function (e) {
        let op = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        app.getUrlArraybuffer("/userOrder/download-qrCode/" + op.data.id, function (data) {
            if (app.hasData(data)) {
                let url = 'data:image/png;base64,' + wx.arrayBufferToBase64(data);
                op.setData({
                    url: url,
                })
                setTimeout(() => {
                    wx.hideLoading()
                }, 500)
            }
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let order_type = options.order_type;
        let phone = options.phone;
        let customer_service = options.customer_service;
        let main_image = options.main_image;
        let name = options.name;
        let introduce = options.introduce;
        let num = options.num;
        let status = options.status;
        let total = options.total;
        let create_time = options.create_time;
        let id = options.id;
        let order_no = options.order_no;
        let product_style = options.product_style || "";
        this.setData({
            id: id,
            order_no: order_no,
            order_type: order_type,
            phone: phone,
            customer_service: customer_service,
            main_image: main_image,
            name: name,
            introduce: introduce,
            num: num,
            total: total,
            create_time: create_time,
            status: status,
            product_style: product_style,
        })

        this.loadReceiveAddress();
        if (this.data.order_type == 1 || (this.data.order_type == 0 && this.data.product_style == 0)) {
            this.loadWriteOffQrCode();
        }
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