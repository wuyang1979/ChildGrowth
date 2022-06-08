let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: "",
        name: "",
        gender: "",
        birthday: "",
        identity_card: "",
        isAgree: false,
        columns: ["男", "女"],
    },


    toYinSi: function (e) {
        wx.navigateTo({
            url: '/pages/index/yinsi',
        })
    },

    toUserZhengCe: function (e) {
        wx.navigateTo({
            url: '/pages/index/userZhengCe',
        })
    },

    agree: function (e) {
        let op = this;
        op.setData({
            isAgree: !op.data.isAgree,
        })
    },

    inputName: function (e) {
        this.setData({
            name: e.detail.value,
        })
    },

    inputIdentityCard: function (e) {
        this.setData({
            identity_card: e.detail.value,
        })
    },

    changeGender: function (e) {
        this.setData({
            gender: e.detail.value,
        })
    },

    changeBirthday: function (e) {
        this.setData({
            birthday: e.detail.value,
        })
    },

    auth: function (e) {
        let op = this;
        if (!op.data.isAgree) {
            wx.showToast({
                title: '请同意协议',
            });
            return;
        }
        if (!op.check()) {
            return;
        }
        op.updateBabyInfo();
    },

    check: function (e) {
        if (this.data.name == "") {
            wx.showToast({
                title: '请填写宝贝姓名',
            })
            return false;
        }
        if (this.data.gender == "") {
            wx.showToast({
                title: '请选择宝贝性别',
            })
            return false;
        }
        if (this.data.birthday == "") {
            wx.showToast({
                title: '请选择出生日期',
            })
            return false;
        }
        if (this.data.identity_card != "" && !util.IsIdentityCard(this.data.identity_card)) {
            wx.showToast({
                title: '身份证号格式错误',
            })
            return false;
        }
        return true;
    },

    updateBabyInfo: function (e) {
        let op = this;
        app.post("/userInfo/updateBabyInfo", {
            babyId: op.data.id,
            name: op.data.name,
            gender: op.data.gender,
            birthday: op.data.birthday,
            identity_card: op.data.identity_card,
        }, function (data) {
            if (typeof data == 'number') {
                wx.navigateTo({
                    url: '/pages/my/babyList',
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let id = options.id;
        let name = options.name;
        let gender = options.gender;
        let birthday = options.birthday;
        let identity_card = options.identity_card;
        this.setData({
            id: id,
            name: name,
            gender: gender,
            birthday: birthday,
            identity_card: identity_card,
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