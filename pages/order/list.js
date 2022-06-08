let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        index: "",
        orderList: [],
        start: 0,
        pageSize: 10,
        hasMoreData: true,
    },

    showSelectedList: function (e) {
        let op = this;
        let index = e.currentTarget.dataset.index;

        if (index != op.data.index) {
            op.setData({
                index: index,
                orderList: [],
                start: 0,
                hasMoreData: true,
            })
            op.loadSelectedOrderList();
        }
    },

    loadSelectedOrderList: function (e) {
        let op = this;
        let orderList = op.data.orderList;
        app.post("/userOrder/getSelectedOrderList", {
            userId: app.getUserId(),
            selectType: op.data.index,
            start: op.data.start,
            num: op.data.pageSize,
        }, function (data) {
            if (app.hasData(data)) {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].main_image.indexOf("http") == -1) {
                        data[i].main_image = app.qinzi + data[i].main_image;
                    }
                    if (data[i].order_type == 0) {
                        switch (data[i].status) {
                            case 0:
                                data[i].statusValue = "待支付"
                                break;
                            case 1:
                                data[i].statusValue = "待收货"
                                break;
                            case 2:
                                data[i].statusValue = "已完成"
                                break;
                            case 3:
                                data[i].statusValue = "已取消"
                                break;
                        }
                    } else if (data[i].order_type == 1) {
                        switch (data[i].status) {
                            case 0:
                                data[i].statusValue = "待支付"
                                break;
                            case 1:
                                data[i].statusValue = "待核销"
                                break;
                            case 2:
                                data[i].statusValue = "已完成"
                                break;
                            case 3:
                                data[i].statusValue = "已取消"
                                break;
                        }
                    }
                }

                if (data.length < op.data.pageSize) {
                    op.setData({
                        orderList: orderList.concat(data),
                        hasMoreData: false
                    });
                } else {
                    op.setData({
                        orderList: orderList.concat(data),
                        hasMoreData: true,
                        start: op.data.start + op.data.pageSize
                    })
                }
            }
        })
    },

    goPay: function (e) {
        let orderId = e.currentTarget.dataset.order_id;
        let allUrl = util.fillUrlParams("/pages/product/preOrder", {
            orderId: orderId
        });
        wx.navigateTo({
            url: allUrl,
        })
    },

    confirmReceipt: function (e) {
        let op = this;
        let orderId = e.currentTarget.dataset.order_id;

        wx.showModal({
            title: '确认收货？',
            showCancel: true,
            confirmText: "确认",
            success: function (res) {
                if (res.confirm) {
                    app.post("/userOrder/confirmReceipt", {
                        orderId: orderId
                    }, function (data) {
                        if (typeof data == 'number') {
                            op.setData({
                                orderList: [],
                                start: 0,
                                hasMoreData: true,
                            });
                            op.loadSelectedOrderList();
                        }
                    })
                }
            }
        })
    },

    oneOrder: function (e) {
        let order_type = e.currentTarget.dataset.order_type;
        let phone = e.currentTarget.dataset.phone;
        let customer_service = e.currentTarget.dataset.customer_service;
        let main_image = e.currentTarget.dataset.main_image;
        let name = e.currentTarget.dataset.name;
        let introduce = e.currentTarget.dataset.introduce;
        let num = e.currentTarget.dataset.num;
        let status = e.currentTarget.dataset.status;
        let total = e.currentTarget.dataset.total;
        let create_time = e.currentTarget.dataset.create_time;
        let id = e.currentTarget.dataset.id;
        let order_no = e.currentTarget.dataset.order_no;
        let product_style = e.currentTarget.dataset.product_style || "";
        let allUrl = util.fillUrlParams("/pages/order/oneOrder", {
            id: id,
            order_no: order_no,
            order_type: order_type,
            phone: phone,
            main_image: main_image,
            name: name,
            introduce: introduce,
            num: num,
            total: total,
            create_time: create_time,
            customer_service: customer_service,
            status: status,
            product_style: product_style,
        });
        wx.navigateTo({
            url: allUrl,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let index = options.index || '-1';
        this.setData({
            index: index,
        })

        this.loadSelectedOrderList();
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
        this.setData({
            orderList: [],
            start: 0,
            hasMoreData: true,
        });
        this.loadSelectedOrderList();

        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.hasMoreData) {
            this.loadSelectedOrderList();
        } else {
            wx.showToast({
                title: '没有更多数据',
                duration: 500,
                icon: "none"
            })
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})