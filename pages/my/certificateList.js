let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        certificateList: [],
        start: 0,
        pageSize: 15,
        hasMoreData: true,
    },

    auth: function (e) {
        let op = this;
        let id = app.getUserId();
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
                                                op.loadAllCertificateList();
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
                            op.loadAllCertificateList();
                        }
                    }
                });
            }
        } else {
            //已注册
            op.loadAllCertificateList();
        }
    },

    loadAllCertificateList: function (e) {
        let op = this;
        let certificateList = op.data.certificateList;
        let id = app.getUserId();
        app.post('/certificate/getCertificateList', {
            start: op.data.start,
            num: op.data.pageSize,
            userId: id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].main_image.indexOf("http") == -1) {
                            data[i].main_image = app.qinzi + data[i].main_image;
                        }
                    }
                }
                if (data.length < op.data.pageSize) {
                    op.setData({
                        certificateList: certificateList.concat(data),
                        hasMoreData: false
                    });
                } else {
                    op.setData({
                        certificateList: certificateList.concat(data),
                        hasMoreData: true,
                        start: op.data.start + op.data.pageSize
                    })
                }
            }
        });
    },

    viewCertificate: function (e) {
        let op = this;
        let userId = app.getUserId();
        let certificateId = e.currentTarget.dataset.id;
        app.post("/certificate/getChildrenNumById", {
            userId: userId
        }, function (data) {
            if (typeof data == 'number') {
                if (data == 0) {
                    let allUrl = util.fillUrlParams("/pages/my/inputBabyInfo", {
                        certificateId: certificateId
                    })
                    wx.navigateTo({
                        url: allUrl,
                    })
                } else {
                    let allUrl = util.fillUrlParams("/pages/my/selectBabyList", {
                        certificateId: certificateId
                    })
                    wx.navigateTo({
                        url: allUrl,
                    })
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadAllCertificateList();
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
            certificateList: [],
            start: 0,
            hasMoreData: true,
        });
        this.loadAllCertificateList();

        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.hasMoreData) {
            this.loadAllCertificateList();
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