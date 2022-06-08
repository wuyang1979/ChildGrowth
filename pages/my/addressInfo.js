let cityUtil = require("../../utils/city");
let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cityArray: [],
        region: [],
        citysIndex: [],

        id: "",
        userId: "",
        name: "",
        phone: "",
        province: "",
        city: "",
        area: "",
        address: "",
    },

    func_changeCitysChange(e) {
        let array = cityUtil.getCityIndex(this.data.cityArray, e.detail.value);
        this.setData({
            region: [array[0].name, array[1].name, array[2].name],
            region_code: [array[0].id, array[1].id, array[2].id],
            citysIndex: e.detail.value
        })
    },

    changeCitysChangeColumn(e) {
        let column = e.detail.column;
        let index = e.detail.value;
        if (column == 0) {
            this.setData({
                province_index: index,
                cityArray: cityUtil.changeCloumt(this.data.cityArray, index, column)
            })
        }
        if (column == 1) {
            this.setData({
                cityArray: cityUtil.changeCloumt(this.data.cityArray, index, column, this.data.province_index)
            })
        }
    },

    inputName: function (e) {
        let op = this;
        op.setData({
            name: e.detail.value,
        })
    },

    inputPhone: function (e) {
        let op = this;
        op.setData({
            phone: e.detail.value,
        })
    },

    inputAddress: function (e) {
        let op = this;
        op.setData({
            address: e.detail.value,
        })
    },

    submit: function (e) {
        if (this.check()) {
            this.saveOrUpdate();
        }
    },

    check: function (e) {
        let op = this;
        if (op.data.userId == '') {
            wx.showToast({
                title: '您还未注册',
                icon: "none"
            })
            return false;
        }
        if (op.data.name == '') {
            wx.showToast({
                title: '请填写姓名',
                icon: "none"
            })
            return false;
        }
        if (op.data.phone == '') {
            wx.showToast({
                title: '请填写手机号',
                icon: "none"
            })
            return false;
        }
        if (!util.checkInvoiceMobile(op.data.phone)) {
            wx.showToast({
                title: '手机号格式错误',
                icon: "none"
            })
            return false;
        }
        if (op.data.region.length == 0) {
            wx.showToast({
                title: '请选择所在地区',
                icon: "none"
            })
            return false;
        }
        if (op.data.address == '') {
            wx.showToast({
                title: '请填写详细地址',
                icon: "none"
            })
            return false;
        }
        return true;
    },

    saveOrUpdate: function (e) {
        let op = this;
        let region = op.data.region;
        app.post("/userInfo/saveOrUpdateAddressInfoByUserId", {
            userId: op.data.userId,
            name: op.data.name,
            phone: op.data.phone,
            province: region[0],
            city: region[1],
            area: region[2],
            address: op.data.address,
        }, function (data) {
            if (data == 1) {
                wx.showToast({
                    title: '保存成功',
                });
                setTimeout(function () {
                    let allUrl = util.fillUrlParams("/pages/my/addressList", {
                        userId: op.data.userId,
                    })
                    wx.navigateTo({
                        url: allUrl,
                    })
                }, 1500);
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let userId = options.userId;

        let id = options.id || '';
        let receive_name = options.receive_name || '';
        let receive_phone = options.receive_phone || '';
        let province = options.province || '';
        let city = options.city || '';
        let area = options.area || '';
        let address = options.address || '';
        let region = [];
        if (province != '') {
            region.push(province);
        }
        if (city != '') {
            region.push(city);
        }
        if (area != '') {
            region.push(area);
        }

        this.setData({
            id: id,
            userId: userId,
            name: receive_name,
            phone: receive_phone,
            province: province,
            city: city,
            area: area,
            address: address,
            region: region,
            cityArray: cityUtil.init()
        })
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