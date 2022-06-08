let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '-1',
        nick_name: '',
        head_img_url: '',
        phone: "",
        certificateUrl: '',
        growthValue: '0',
        certificateNum: '0',

        isDistributionPartnerShow: false,
        hasShop: false,
    },

    closeDistributionPartnerShow: function (e) {
        this.setData({
            isDistributionPartnerShow: false,
        })
    },

    joinDistributionPartnerPrePay: function (e) {
        let op = this;
        let userId = op.data.id;
        app.post("/index/addDistributionPartnerOrder", {
            userId: userId,
        }, function (data) {
            if (typeof data == 'number') {
                let orderId = data;
                app.post('/index/joinDistributionPartnerPrePay', {
                    userId: userId,
                    id: orderId,
                    body: "分销合伙人订单",
                    total: '9.9',
                }, function (data) {
                    if (!!data && !!data.status) {
                        wx.showToast({
                            title: '后台处理失败',
                            icon: "none"
                        })
                        return;
                    }
                    if (app.hasData(data)) {
                        // 发起微信支付
                        wx.requestPayment({
                            'timeStamp': data.timeStamp,
                            'nonceStr': data.nonceStr,
                            'package': data.package,
                            'signType': data.signType,
                            'paySign': data.paySign,
                            'success': function (res) {
                                let allUrl = util.fillUrlParams('/pages/my/success', {

                                });
                                wx.navigateTo({
                                    url: allUrl
                                });
                            },
                            'fail': function (res) {}
                        })
                    }
                })
            }
        })
    },

    toTechPage: function (e) {
        wx.navigateTo({
            url: '/pages/tech/index',
        })
    },

    onGotUserInfo: function (e) {
        let op = this;
        if (op.data.id == '-1') {
            //未注册
            app.onGotUserInfo(e, function () {
                let allUrl = util.fillUrlParams("/pages/index/register")
                wx.navigateTo({
                    url: allUrl,
                })
            });
        } else {
            //已注册
            let allUrl = util.fillUrlParams("/pages/my/info", {
                id: op.data.id
            });
            wx.navigateTo({
                url: allUrl,
            })
        }
    },

    joinDistributionPartner: function (e) {
        let op = this;
        if (op.data.id == '-1') {
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
                isDistributionPartnerShow: true,
            })
        }
    },

    loadUserInfo: function (e) {
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

                                            //加载用户信息
                                            if (id == '-1') {
                                                op.setData({
                                                    id: id,
                                                    nick_name: '点击登录',
                                                    head_img_url: '/pages/img/default_bg.png',
                                                })
                                            } else {
                                                app.post("/index/getUserInfoById", {
                                                    id: id
                                                }, function (data2) {
                                                    if (app.hasData(data2)) {
                                                        let userInfo = data2[0];
                                                        op.setData({
                                                            id: id,
                                                            nick_name: userInfo.nick_name,
                                                            head_img_url: userInfo.head_img_url,
                                                            phone: userInfo.phone,
                                                        })
                                                        app.post("/index/getCertificateNum", {
                                                            id: id
                                                        }, function (data3) {
                                                            op.setData({
                                                                certificateNum: data3.certificateNum
                                                            })
                                                        })
                                                        //获取小店列表
                                                        op.getShopListByUserId()
                                                    }
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

                        //加载用户信息
                        if (id == '-1') {
                            op.setData({
                                id: id,
                                nick_name: '点击登录',
                                head_img_url: '/pages/img/default_bg.png',
                            })
                        } else {
                            app.post("/index/getUserInfoById", {
                                id: id
                            }, function (data2) {
                                if (app.hasData(data2)) {
                                    let userInfo = data2[0];
                                    op.setData({
                                        id: id,
                                        nick_name: userInfo.nick_name,
                                        head_img_url: userInfo.head_img_url,
                                        phone: userInfo.phone,
                                    })
                                    app.post("/index/getCertificateNum", {
                                        id: id
                                    }, function (data3) {
                                        op.setData({
                                            certificateNum: data3.certificateNum
                                        })
                                    })
                                    //获取小店列表
                                    op.getShopListByUserId()
                                }
                            })
                        }
                    }
                });
            }
        } else {
            app.post("/index/getUserInfoById", {
                id: id
            }, function (data2) {
                if (app.hasData(data2)) {
                    let userInfo = data2[0];
                    op.setData({
                        id: id,
                        nick_name: userInfo.nick_name,
                        head_img_url: userInfo.head_img_url,
                        phone: userInfo.phone,
                    })
                    app.post("/index/getCertificateNum", {
                        id: id
                    }, function (data3) {
                        op.setData({
                            certificateNum: data3.certificateNum
                        })
                    })
                    //获取小店列表
                    op.getShopListByUserId()
                }
            })
        }
    },

    toOrderList: function (e) {
        let id = app.getUserId();
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
            let index = e.currentTarget.dataset.index;
            let allUrl = util.fillUrlParams("/pages/order/list", {
                index: index,
            })
            wx.navigateTo({
                url: allUrl,
            })
        }
    },

    toMyShop: function (e) {
        let id = app.getUserId();
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
            app.post("/index/getShopListByUserId2", {
                userId: id,
            }, function (data) {
                if (app.hasData(data)) {
                    if (data.length > 0) {
                        let allUrl = util.fillUrlParams("/pages/shop/myShop", {
                            shopId: data[0].id
                        });
                        wx.navigateTo({
                            url: allUrl,
                        })
                    } else {
                        wx.showToast({
                            title: '您未开通小店',
                        })
                        return;
                    }
                }
            })
        }
    },

    toCoopreatePage: function (e) {
        let allUrl = util.fillUrlParams("/pages/my/cooperate", {});
        wx.navigateTo({
            url: allUrl,
        })
    },

    toAboutPage: function (e) {
        let allUrl = util.fillUrlParams("/pages/my/about", {});
        wx.navigateTo({
            url: allUrl,
        })
    },

    dev: function (e) {
        wx.showToast({
            title: '敬请期待',
            icon: 'none'
        });
        return;
    },

    toCertificateList: function (e) {
        let id = app.getUserId();
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
            wx.navigateTo({
                url: '/pages/my/certificateList',
            })
        }
    },

    toGrowthValue: function (e) {
        let id = app.getUserId();
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
            wx.navigateTo({
                url: '/pages/growthValue/list',
            })
        }
    },

    toGrowthProcess: function (e) {
        let id = app.getUserId();
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
            wx.navigateTo({
                url: '/pages/growthValue/growthProcess',
            })
        }
    },
    getShopListByUserId: function (e) {
        let op = this;
        app.post("/index/getShopListByUserId", {
            userId: op.data.id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length == 0) {
                    //没开通小店
                    op.setData({
                        hasShop: false,
                    })
                } else {
                    //已开通小店
                    op.setData({
                        hasShop: true,
                    })
                }
            }
        })
    },

    distributionOrder: function (e) {
        let allUrl = util.fillUrlParams("/pages/distributionCenter/orderList", {});
        wx.navigateTo({
            url: allUrl,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadUserInfo();
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
        this.setData({
            isDistributionPartnerShow: false,
        })
        this.loadUserInfo();
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