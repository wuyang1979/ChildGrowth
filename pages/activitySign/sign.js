let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        hasRegistered: false,
        scene: "",
        phone: "",
    },

    init: function (e) {
        let op = this;
        let id = app.getUserId();

        //判断是否注册
        if (id == "-1") {
            if (app.globalData.openId == "") {
                wx.login({
                    success: res => {
                        let code = res.code;
                        if (code) {
                            app.post("/business/info/getSessionKeyAndOpenIdByCode", {
                                code: code,
                            }, function (data) {
                                if (app.hasData(data)) {
                                    app.globalData.openId = data.openId;
                                    app.globalData.sessionKey = data.sessionKey;
                                    app.post('/business/info/c_end_code', {
                                        openId: data.openId
                                    }, function (data1) {
                                        if (app.hasData(data1)) {
                                            if (data1.id == null || data1.id == "-1") {
                                                wx.setStorageSync('id', '-1');
                                                id = '-1';
                                            } else {
                                                wx.setStorageSync('id', data1.id);
                                                id = data1.id;
                                            }

                                            if (id == '-1') {
                                                //未注册

                                                wx.showModal({
                                                    title: '温馨提示~',
                                                    content: '您还未注册哦~',
                                                    showCancel: true, //隐藏取消按钮
                                                    confirmText: "前往注册", //只保留确定更新按钮
                                                    success: function (res) {
                                                        if (res.confirm) {
                                                            app.onGotUserInfo(e, function () {
                                                                let allUrl = util.fillUrlParams("/pages/index/register")
                                                                wx.navigateTo({
                                                                    url: allUrl,
                                                                })
                                                            });
                                                        }
                                                    }
                                                })
                                            } else {
                                                //已注册
                                                op.setData({
                                                    hasRegistered: true,
                                                })
                                            }
                                        }
                                    });
                                }
                            })
                        }
                    }
                });
            } else {
                app.post('/business/info/c_end_code', {
                    openId: app.globalData.openId
                }, function (data1) {
                    if (app.hasData(data1)) {
                        if (data1.id == null || data1.id == "-1") {
                            wx.setStorageSync('id', '-1');
                            id = '-1';
                        } else {
                            wx.setStorageSync('id', data1.id);
                            id = data1.id;
                        }

                        if (id == '-1') {
                            //未注册
                            app.onGotUserInfo(e, function () {
                                let allUrl = util.fillUrlParams("/pages/index/register")
                                wx.navigateTo({
                                    url: allUrl,
                                })
                            });
                        } else {
                            //已注册
                            op.setData({
                                hasRegistered: true,
                            })
                        }
                    }
                });
            }
        } else {
            //已注册
            op.setData({
                hasRegistered: true,
            })
        }
    },

    inputPhone: function (e) {
        let op = this;
        op.setData({
            phone: e.detail.value,
        })
    },

    confirm: function (e) {
        let op = this;
        if (op.data.phone == "") {
            wx.showToast({
                title: '请填写手机号码',
                icon: "none"
            })
            return;
        }
        if (util.checkInvoiceMobile(op.data.phone)) {
            op.updateOrder();
        } else {
            wx.showToast({
                title: '手机号格式有误',
                icon: "none"
            })
        }
    },

    updateOrder: function (e) {
        let op = this;
        let id = app.getUserId();
        if (id == "-1") {
            app.onGotUserInfo(e, function () {
                let allUrl = util.fillUrlParams("/pages/index/register")
                wx.navigateTo({
                    url: allUrl,
                })
            });
        } else {
            app.post("/userOrder/updateOrderByProductIdAndPhone", {
                productId: op.data.scene,
                userId: id,
                phone: op.data.phone,
            }, function (data) {
                if (app.hasData(data)) {
                    if (data.checkResult) {
                        //校验成功
                        let allUrl = util.fillUrlParams("/pages/order/list", {
                            index: -1,
                        })
                        wx.navigateTo({
                            url: allUrl,
                        })
                    } else {
                        //校验失败
                        wx.navigateTo({
                            url: '/pages/activitySign/error',
                        })
                    }
                }
            })
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let scene = decodeURIComponent(options.scene);
        if (scene != "") {
            this.setData({
                scene: scene,
            })
        } else {
            wx.showToast({
                title: '二维码有误',
                icon: "none"
            })
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
        this.init();
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