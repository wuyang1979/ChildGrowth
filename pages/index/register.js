let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isAgree: false,
        phone: "",

        //新用户是否成为下线  0：否；1：是
        beOffline: 0,
        posterSharerPhone: "",
        onlineShopId: -1,
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

    getPhoneNumber: function (e) {
        let op = this;
        if (!op.data.isAgree) {
            wx.showToast({
                title: '请同意协议',
                icon: "none"
            });
            return;
        }

        if (e.detail.errMsg == 'getPhoneNumber:ok') {
            wx.login({
                success: res => {
                    let code = res.code;
                    if (code) {
                        app.post("/business/info/getSessionKeyAndOpenIdByCode", {
                            code: code,
                        }, function (data) {
                            if (app.hasData(data)) {
                                app.globalData.openId = data.openId;
                                app.post("/index/getPhoneNumber", {
                                    encryptedData: e.detail.encryptedData,
                                    sessionId: data.sessionKey,
                                    iv: e.detail.iv
                                }, function (data1) {
                                    if (app.hasData(data1)) {
                                        op.setData({
                                            phone: data1.phoneNumber
                                        })
                                        op.registerNewUser();
                                    }
                                })
                            }
                        })
                    }
                }
            });
        } else if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {}
    },

    registerNewUser: function (e) {
        let op = this;
        let userInfo = app.globalData.userInfo;
        app.post("/index/registerNewUser", {
            openId: app.globalData.openId,
            phone: op.data.phone,
            nickName: userInfo.nickName,
            headImgUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            beOffline: op.data.beOffline,
            posterSharerPhone: op.data.posterSharerPhone,
            onlineShopId: op.data.onlineShopId,
            belong: 0,
        }, function (data2) {
            if (app.hasData(data2)) {
                wx.setStorageSync('id', data2.id);
                wx.navigateBack({
                    delta: 1,
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let op = this;
        if (app.hasData(options.beOffline)) {
            //新用户是否成为下线  0：否；1：是
            let beOfflineFlag = JSON.parse(options.beOffline);
            if (beOfflineFlag) {
                op.setData({
                    beOffline: 1,
                    posterSharerPhone: options.posterSharerPhone || "",
                    onlineShopId: options.onlineShopId || -1,
                })
            }
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