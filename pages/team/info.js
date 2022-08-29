var util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: "",
        headImgUrl: "",
        phone: "",
        nickName: "",
        babyName: "",
        receiveName: "",
        receiveArea: "",
        receiveAddress: "",
        orderList: [],
        start: 0,
        pageSize: 10,
        hasMoreData: true,
    },

    getBabyInfoById: function (e) {
        let op = this;
        app.post("/customer/getBabyInfoById", {
            userId: op.data.userId,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length == 1) {
                    op.setData({
                        babyName: data[0].name,
                    })
                } else if (data.length > 1) {
                    let babyName = "";
                    for (let i = 0; i < data.length; i++) {
                        if (i == 0) {
                            babyName += data[i].name;
                        } else {
                            babyName += "，" + data[i].name;
                        }
                        op.setData({
                            babyName: babyName,
                        })
                    }
                }
            }
        })
    },

    getReceiveAddressById: function (e) {
        let op = this;
        app.post("/customer/getReceiveAddressById", {
            userId: op.data.userId,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length == 0) {
                    op.setData({
                        receiveName: "",
                        receiveArea: "",
                        receiveAddress: "",
                    })
                } else {
                    op.setData({
                        receiveName: data[0].receive_name,
                        receiveArea: data[0].province + data[0].city + data[0].area,
                        receiveAddress: data[0].address,
                    })
                }
            }
        })
    },

    getDistributionOrderListById: function (e) {
        let op = this;
        let orderList = op.data.orderList;
        app.post("/team/getDistributionOrderListById", {
            userId: op.data.userId,
            start: op.data.start,
            num: op.data.pageSize,
        }, function (data) {
            if (app.hasData(data)) {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].main_image.indexOf("http") == -1) {
                        data[i].main_image = app.qinzi + data[i].main_image;
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

    goBack:function(e){
        wx.switchTab({
          url: '/pages/my/index',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let id = options.id;
        let headImgUrl = options.headImgUrl;
        let phone = options.phone;
        let nickName = options.nickName;
        this.setData({
            userId: id,
            headImgUrl: headImgUrl,
            phone: phone,
            nickName: nickName,
        })
        // this.getBabyInfoById();
        // this.getReceiveAddressById();
        this.getDistributionOrderListById();
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