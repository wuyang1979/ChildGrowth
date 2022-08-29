var util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        shopId: "",
        shopName: "",
        logopic: "",
        start: 0,
        pageSize: 10,
        hasMoreData: true,
        productList: [],
        visitCount: 0,

        index: 0,

        id: '-1',
        nick_name: '',
        head_img_url: '',
        phone: "",
        certificateUrl: '',
        growthValue: '0',
        certificateNum: '0',

        //由转发的小店进入 0：否；1：是
        enterFromForardShop: 0,

        isDistributionPartnerShow: false,
        hasDistributionRecord: false,
        hasShop: false,
    },

    myTeam: function (e) {
        let id = app.getUserId();
        app.post("/index/getShopListByUserId2", {
            userId: id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length > 0) {
                    let allUrl = util.fillUrlParams("/pages/team/list", {
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
    },

    closeDistributionPartnerShow: function (e) {
        this.setData({
            isDistributionPartnerShow: false,
        })
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

    getDistributionPartnerListByUserId: function (e) {
        let op = this;
        app.post("/index/getDistributionPartnerListByUserId", {
            userId: op.data.id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length == 0) {
                    //没开通小店
                    op.setData({
                        hasDistributionRecord: false,
                    })
                } else {
                    //已开通小店
                    op.setData({
                        hasDistributionRecord: true,
                    })
                }
            }
        })
    },

    toIndexPageForShop: function (e) {
        this.setData({
            index: 0,
        })
    },

    toMyPageForShop: function (e) {
        let op = this;
        if (op.data.id == '-1') {
            //未注册
            app.onGotUserInfo(e, function () {
                let allUrl = util.fillUrlParams("/pages/index/register", {
                    beOffline: JSON.stringify(true),
                    onlineShopId: op.data.shopId
                })
                wx.navigateTo({
                    url: allUrl,
                })
            });
        } else {
            //已注册
            op.setData({
                index: 1,
            })
        }
    },

    // consult: function (e) {
    //     let op = this;
    //     if (op.data.phone != null && op.data.phone != "") {
    //         wx.makePhoneCall({
    //             phoneNumber: op.data.phone,
    //         })
    //     } else {
    //         wx.showToast({
    //             title: '暂无咨询电话',
    //             icon: "none"
    //         })
    //     }
    // },

    loadShopInfoById: function (e) {
        let op = this;
        let id = op.data.shopId;
        app.post("/shop/getShopShowInfoById", {
            shopId: id
        }, function (data) {
            if (app.hasData(data)) {
                let logopic = data.logopic;
                if (logopic.indexOf("http") == -1) {
                    logopic = app.qinzi + logopic;
                }
                op.setData({
                    shopName: data.shopName,
                    logopic: logopic,
                    visitCount: data.visitCount,
                })
            }
        })
    },

    loadShopInfoByUserId: function (e) {
        let op = this;
        app.post("/index/getShopListByUserId", {
            userId: op.data.id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length == 0) {
                    //未在亲子云商开通分销小店
                    op.setData({
                        hasShop: false,
                    })
                } else {
                    //已在亲子云商开通分销小店
                    op.setData({
                        hasShop: true,
                    })
                }
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
                                                        op.getDistributionPartnerListByUserId()
                                                        //获取小店信息
                                                        op.loadShopInfoByUserId();
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
                                    op.getDistributionPartnerListByUserId()
                                    //获取小店信息
                                    op.loadShopInfoByUserId();
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
                    op.getDistributionPartnerListByUserId()
                    //获取小店信息
                    op.loadShopInfoByUserId();
                }
            })
        }
    },

    distributionOrder: function (e) {
        let allUrl = util.fillUrlParams("/pages/distributionCenter/orderList", {});
        wx.navigateTo({
            url: allUrl,
        })
    },

    myEarnings: function (e) {
        let allUrl = util.fillUrlParams("/pages/profit/info", {});
        wx.navigateTo({
            url: allUrl,
        })
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

    loadAllProductByShopId: function (e) {
        let op = this;
        let id = op.data.shopId;
        let productList = op.data.productList;
        app.post("/shop/loadAllProductByShopId", {
            shopId: id,
            start: op.data.start,
            num: op.data.pageSize,
        }, function (data) {
            if (app.hasData(data)) {
                for (let i = 0; i < data.length; i++) {
                    data[i].main_image = app.qinzi + data[i].main_image;
                }
                if (data.length < op.data.pageSize) {
                    op.setData({
                        productList: productList.concat(data),
                        hasMoreData: false
                    });
                } else {
                    op.setData({
                        productList: productList.concat(data),
                        hasMoreData: true,
                        start: op.data.start + op.data.pageSize
                    })
                }
            }
        })
    },

    oneProduct: function (e) {
        let buy_count = e.currentTarget.dataset.buy_count;
        let address = e.currentTarget.dataset.address || '';
        let address_name = e.currentTarget.dataset.address_name || '';
        let longitude = e.currentTarget.dataset.longitude || '';
        let latitude = e.currentTarget.dataset.latitude || '';
        let card_id = e.currentTarget.dataset.card_id;
        let create_time = e.currentTarget.dataset.create_time;
        let deadline_time = e.currentTarget.dataset.deadline_time;
        let id = e.currentTarget.dataset.id;
        let instruction = e.currentTarget.dataset.instruction;
        let introduce = e.currentTarget.dataset.introduce;
        let is_hot = e.currentTarget.dataset.is_hot;
        let main_image = e.currentTarget.dataset.main_image;
        let name = e.currentTarget.dataset.name;
        let once_max_purchase_count = e.currentTarget.dataset.once_max_purchase_count;
        let phone = e.currentTarget.dataset.phone;
        let present_price = e.currentTarget.dataset.present_price;
        let repeat_purchase = e.currentTarget.dataset.repeat_purchase;
        let video_path = e.currentTarget.dataset.vedio_path;
        let type = e.currentTarget.dataset.type;
        let product_type = e.currentTarget.dataset.product_type;
        let product_style = e.currentTarget.dataset.product_style;
        let shop_id = e.currentTarget.dataset.shop_id;
        let disShopId = e.currentTarget.dataset.dis_shop_id;
        let wuyuType = e.currentTarget.dataset.wuyu_type;

        let allUrl = util.fillUrlParams('/pages/product/oneProduct', {
            buy_count: buy_count,
            address: address,
            address_name: address_name,
            longitude: longitude,
            latitude: latitude,
            card_id: card_id,
            create_time: create_time,
            deadline_time: deadline_time,
            id: id,
            instruction: instruction,
            introduce: introduce,
            is_hot: is_hot,
            main_image: main_image,
            name: name,
            once_max_purchase_count: once_max_purchase_count,
            phone: phone,
            present_price: present_price,
            repeat_purchase: repeat_purchase,
            video_path: video_path,
            type: type,
            product_type: product_type,
            product_style: product_style,
            shop_id: shop_id,
            disShopId: disShopId,
            enterFromShop: JSON.stringify(true),
            wuyuType: wuyuType,
        })

        wx.navigateTo({
            url: allUrl,
        })
    },

    addVisitCountByShopId: function (e) {
        let op = this;
        app.post("/shop/addVisitCountByShopId", {
            shopId: op.data.shopId,
        }, function (data) {
            if (typeof data == 'number') {
                console.log("小店访问次数自增成功")
            } else {
                console.log("小店访问次数自增失败")
            }
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
                    shopId: op.data.shopId,
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let shopId, enterFromForardShop;
        if (!options.scene || options.scene == '') {
            shopId = options.shopId;
            enterFromForardShop = options.enterFromForardShop ? options.enterFromForardShop : 0;
        } else {
            let scene = decodeURIComponent(options.scene);
            if (scene == '') {
                wx.showToast({
                    title: '二维码有误',
                });
                return;
            }
            shopId = util.getUrlParam("shopId", scene);
            enterFromForardShop = 0;
        }
        this.setData({
            shopId: shopId,
            enterFromForardShop: enterFromForardShop,
        })
        this.loadShopInfoById();
        this.loadAllProductByShopId();
        this.addVisitCountByShopId();
        this.loadUserInfo();

        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function (options) {
        wx.hideHomeButton();
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
        this.setData({
            productList: [],
            start: 0,
            hasMoreData: true,
        });
        this.loadAllProductByShopId();

        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.hasMoreData) {
            this.loadAllProductByShopId();
        } else {
            wx.showToast({
                title: '没有更多数据',
                duration: 500,
                icon: "none"
            })
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var op = this;
        var allUrl = util.fillUrlParams('/pages/shop/myShop', {
            shopId: op.data.shopId,
            enterFromForardShop: 1,
        });

        return {
            title: '分享了一个小店！',
            path: allUrl,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    }
})