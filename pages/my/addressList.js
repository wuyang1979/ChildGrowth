let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: "",
        addressList: [],

        id: "",
    },

    loadAllAddressList: function (e) {
        let op = this;
        app.post("/userInfo/getReceiveAddressListById", {
            userId: op.data.userId,
        }, function (data) {
            if (app.hasData(data)) {
                op.setData({
                    addressList: data,
                })
            }
        })
    },

    editAddress: function (e) {
        let op = this;
        let id = e.currentTarget.dataset.id;
        let receive_name = e.currentTarget.dataset.receive_name;
        let receive_phone = e.currentTarget.dataset.receive_phone;
        let province = e.currentTarget.dataset.province;
        let city = e.currentTarget.dataset.city;
        let area = e.currentTarget.dataset.area;
        let address = e.currentTarget.dataset.address;

        let allUrl = util.fillUrlParams("/pages/my/addressInfo", {
            id: id,
            userId: op.data.userId,
            receive_name: receive_name,
            receive_phone: receive_phone,
            province: province,
            city: city,
            area: area,
            address: address
        });

        wx.navigateTo({
            url: allUrl,
        })
    },

    goHome: function (event) {
        wx.switchTab({
            url: '/pages/index/index',
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let userId = options.userId;
        this.setData({
            userId: userId,
        })

        this.loadAllAddressList();
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