let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        babylist: [],
    },

    loadBabyList: function (e) {
        let op = this;
        let userId = app.getUserId();
        app.post("/userInfo/getBabyListById", {
            userId: userId,
        }, function (data) {
            if (app.hasData(data)) {
                op.setData({
                    babylist: data,
                })
            }
        })
    },

    editBabyInfo: function (e) {
        let id = e.currentTarget.dataset.id;
        let name = e.currentTarget.dataset.name;
        let gender = e.currentTarget.dataset.gender;
        let birthday = e.currentTarget.dataset.birthday;
        let identity_card = e.currentTarget.dataset.identity_card || "";
        let allUrl = util.fillUrlParams("/pages/my/babyInfo", {
            id: id,
            name: name,
            gender: gender,
            birthday: birthday,
            identity_card: identity_card,
        });
        wx.navigateTo({
            url: allUrl,
        })
    },

    addBaby: function (e) {
        wx.navigateTo({
            url: '/pages/my/addBaby',
        })
    },

    goBack: function (e) {
        wx.switchTab({
            url: '/pages/my/index',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadBabyList();
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
        this.loadBabyList();
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