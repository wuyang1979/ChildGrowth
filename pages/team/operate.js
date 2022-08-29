let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //二维码中的scene为团队领导人userId
        let inviterUserId = decodeURIComponent(options.scene);
        //判断扫码接收邀请的人是否在成长GO注册过
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
                                                            app.onGotUserInfo(options, function () {
                                                                let allUrl = util.fillUrlParams("/pages/index/register")
                                                                wx.navigateTo({
                                                                    url: allUrl,
                                                                })
                                                            });
                                                        }
                                                    }
                                                })
                                            } else {
                                                //已注册，弹出确认框
                                                wx.showModal({
                                                    title: '确认成为分销合伙人？',
                                                    content: '',
                                                    showCancel: true, //隐藏取消按钮
                                                    confirmText: "确认", //只保留确定更新按钮
                                                    success: function (res) {
                                                        if (res.confirm) {
                                                            //先根据受邀人是否已成为分销合伙人
                                                            app.post("/index/getDistributionPartnerListByUserId", {
                                                                userId: id,
                                                            }, function (res1) {
                                                                if (app.hasData(res1)) {
                                                                    if (res1.length == 0) {
                                                                        app.post("/team/becomeTeamMemberByInvited", {
                                                                            inviterUserId: inviterUserId,
                                                                            inviteeUserId: id,
                                                                        }, function (res2) {
                                                                            if (typeof res2 == 'number') {
                                                                                let allUrl = util.fillUrlParams("/pages/team/success", {})
                                                                                wx.navigateTo({
                                                                                    url: allUrl,
                                                                                })
                                                                            }
                                                                        })
                                                                    } else {
                                                                        let allUrl = util.fillUrlParams("/pages/team/fail", {
                                                                            errorMsg: "您已是分销合伙人"
                                                                        })
                                                                        wx.navigateTo({
                                                                            url: allUrl,
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        } else {
                                                            wx.switchTab({
                                                                url: '/pages/index/index',
                                                            })
                                                        }
                                                    },
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
                            wx.showModal({
                                title: '温馨提示~',
                                content: '您还未注册哦~',
                                showCancel: true, //隐藏取消按钮
                                confirmText: "前往注册", //只保留确定更新按钮
                                success: function (res) {
                                    if (res.confirm) {
                                        app.onGotUserInfo(options, function () {
                                            let allUrl = util.fillUrlParams("/pages/index/register")
                                            wx.navigateTo({
                                                url: allUrl,
                                            })
                                        });
                                    }
                                }
                            })
                        } else {
                            //已注册，弹出确认框
                            wx.showModal({
                                title: '确认成为分销合伙人？',
                                content: '',
                                showCancel: true, //隐藏取消按钮
                                confirmText: "确认", //只保留确定更新按钮
                                success: function (res) {
                                    if (res.confirm) {
                                        //先根据受邀人是否已成为分销合伙人
                                        app.post("/index/getDistributionPartnerListByUserId", {
                                            userId: id,
                                        }, function (res1) {
                                            if (app.hasData(res1)) {
                                                if (res1.length == 0) {
                                                    app.post("/team/becomeTeamMemberByInvited", {
                                                        inviterUserId: inviterUserId,
                                                        inviteeUserId: id,
                                                    }, function (res2) {
                                                        if (typeof res2 == 'number') {
                                                            let allUrl = util.fillUrlParams("/pages/team/success", {})
                                                            wx.navigateTo({
                                                                url: allUrl,
                                                            })
                                                        }
                                                    })
                                                } else {
                                                    let allUrl = util.fillUrlParams("/pages/team/fail", {
                                                        errorMsg: "您已是分销合伙人"
                                                    })
                                                    wx.navigateTo({
                                                        url: allUrl,
                                                    })
                                                }
                                            }
                                        })
                                    } else {
                                        wx.switchTab({
                                            url: '/pages/index/index',
                                        })
                                    }
                                },
                            })
                        }
                    }
                });
            }
        } else {
            //已注册，弹出确认框
            wx.showModal({
                title: '确认成为分销合伙人？',
                content: '',
                showCancel: true, //隐藏取消按钮
                confirmText: "确认", //只保留确定更新按钮
                success: function (res) {
                    if (res.confirm) {
                        //先根据受邀人是否已成为分销合伙人
                        app.post("/index/getDistributionPartnerListByUserId", {
                            userId: id,
                        }, function (res1) {
                            if (app.hasData(res1)) {
                                if (res1.length == 0) {
                                    app.post("/team/becomeTeamMemberByInvited", {
                                        inviterUserId: inviterUserId,
                                        inviteeUserId: id,
                                    }, function (res2) {
                                        if (typeof res2 == 'number') {
                                            let allUrl = util.fillUrlParams("/pages/team/success", {})
                                            wx.navigateTo({
                                                url: allUrl,
                                            })
                                        }
                                    })
                                } else {
                                    let allUrl = util.fillUrlParams("/pages/team/fail", {
                                        errorMsg: "您已是分销合伙人"
                                    })
                                    wx.navigateTo({
                                        url: allUrl,
                                    })
                                }
                            }
                        })
                    } else {
                        wx.switchTab({
                            url: '/pages/index/index',
                        })
                    }
                },
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