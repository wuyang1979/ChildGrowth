let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        index: "-1",
        orderList: [],
        start: 0,
        pageSize: 15,
        hasMoreData: true,
        peddingPayCouont: "",
        peddingconfirm: "",
    },

    oneOrder: function (e) {
        let status = e.currentTarget.dataset.status;
        if (status == 3) {
            wx.showToast({
                title: '订单已取消',
                icon: 'none'
            })
            return;
        }
        let id = e.currentTarget.dataset.id;
        let order_no = e.currentTarget.dataset.order_no;
        let name = e.currentTarget.dataset.name;
        let order_type = e.currentTarget.dataset.order_type;
        let order_sale_type = e.currentTarget.dataset.order_sale_type;
        let main_image = e.currentTarget.dataset.main_image;
        let pay_time = e.currentTarget.dataset.pay_time || "";
        let num = e.currentTarget.dataset.num;
        let total = e.currentTarget.dataset.total;
        let price = e.currentTarget.dataset.price;
        let retail_commission = e.currentTarget.dataset.retail_commission || "";
        let retail_commission_income = e.currentTarget.dataset.retail_commission_income || "";
        let platform_service_fee = e.currentTarget.dataset.platform_service_fee || "";
        let standard_id = e.currentTarget.dataset.standard_id;
        let standardName = e.currentTarget.dataset.standard_name || "";
        let phone = e.currentTarget.dataset.phone;
        let product_style = e.currentTarget.dataset.product_style || "";

        let allUrl = util.fillUrlParams("/pages/product/oneOrder", {
            id: id,
            order_no: order_no,
            name: name,
            status: status,
            order_type: order_type,
            order_sale_type: order_sale_type,
            main_image: main_image,
            pay_time: pay_time,
            num: num,
            total: total,
            price: price,
            retail_commission: retail_commission,
            retail_commission_income: retail_commission_income,
            platform_service_fee: platform_service_fee,
            standard_id: standard_id,
            standardName: standardName,
            phone: phone,
            product_style: product_style,
        })
        wx.navigateTo({
            url: allUrl,
        })
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
            op.getSelectedOrderListByUserId();
        }
    },

    loadOrderCountByUserId: function (e) {
        let op = this;
        app.post("/product/loadOrderCountByUserId", {
            userId: app.getUserId(),
        }, function (data) {
            if (app.hasData(data)) {
                op.setData({
                    peddingPayCouont: data.peddingPayCouont,
                    peddingconfirm: data.peddingconfirm,
                })
            }
        })
    },

    getSelectedOrderListByUserId: function (e) {
        let op = this;
        let orderList = op.data.orderList;
        app.post("/product/getSelectedOrderListByUserId", {
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

    writeOff: function (e) {
        let op = this;
        let orderId = e.currentTarget.dataset.order_id;
        let phone = e.currentTarget.dataset.phone;
        wx.showModal({
            title: '温馨提示',
            content: '确认核销 ' + phone + ' 的订单？',
            showCancel: true, //隐藏取消按钮
            confirmText: "确认", //只保留确定更新按钮
            success: function (res) {
                if (res.confirm) {
                    app.post("/userOrder/writeOffUserOrder", {
                        orderId: orderId,
                    }, function (data) {
                        if (typeof data == 'number') {
                            op.setData({
                                orderList: [],
                                start: 0,
                                hasMoreData: true,
                            });
                            op.getSelectedOrderListByUserId();
                            op.loadOrderCountByUserId();
                        }
                    })
                } else {}
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getSelectedOrderListByUserId();
        this.loadOrderCountByUserId();
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
        this.getSelectedOrderListByUserId();
        this.loadOrderCountByUserId();

        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.hasMoreData) {
            this.getSelectedOrderListByUserId();
        } else {
            wx.showToast({
                title: '没有更多数据',
                duration: 500,
            })
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})