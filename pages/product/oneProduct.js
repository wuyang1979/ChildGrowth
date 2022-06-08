let util = require('../../utils/util.js');
const app = getApp()
const fsm = wx.getFileSystemManager();
const FILE_BASE_NAME = 'tmp_base64src';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderTemplateId: 'prBHTyQaDjkxSc7uLKoWjRY4OvleCNtB_Lvo-lebEXI',
        id: '',
        posterSharerPhone: "",
        disShopId: "-1",
        is_hot: '',
        card_id: '',
        shop_id: '',
        name: '',
        type: '',
        product_type: '',
        product_style: '',
        main_image: '',
        address: '',
        address_name: "",
        longitude: '',
        latitude: '',
        present_price: '',
        repeat_purchase: '',
        phone: '',
        introduce: '',
        video_path: '',
        instruction: '',
        buy_count: '',
        deadline_time: '',

        pictureList: [],

        isOrderAreaShow: false,
        isMaxTipShow: false,
        isMinTipShow: false,
        oneBuyCount: 1,

        orderBtnName: "",

        standardList: [],
        standardId: "",
        selectStandardName: "",
        onceMaxPurchaseCount: "",
        onceMinPurchaseCount: "",
        isShareShow: false,
        isPosterShow: false,
        posterSrc: "",

        isPlatDistribute: false,
        enterFromShop: false,
        enterFromQr: false,

        nickName: "",
        posterQrCodeSrc: "",
        QRcodebase64: "",
        bg1_res: "",
        avatarUrl_res: "",
        recommendProductList: [],

        showDeFlag: false,
        showZhiFlag: false,
        showTiFlag: false,
        showMeiFlag: false,
        showLaoFlag: false,

        enterFromForwardDetailPage: 0,
        forwardUserId: "",
    },

    toTechPage: function (e) {
        wx.navigateTo({
            url: '/pages/tech/index',
        })
    },

    showShareArea: function (e) {
        this.setData({
            isShareShow: true,
        })
    },

    closeShareArea: function (e) {
        this.setData({
            isShareShow: false,
        })
    },

    previewImage: function (e) {
        let imgArr = [];
        let current = e.currentTarget.dataset.src;
        imgArr.push(current);
        wx.previewImage({
            current: current,
            urls: imgArr,
        })
    },

    getOtherImageList: function (e) {
        let op = this;
        app.post("/product/getOtherImagesById", {
            productId: op.data.id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length > 0) {
                    let pictureList = [];
                    for (let i = 0; i < data.length; i++) {
                        pictureList.push('https://qinzi123.com' + data[i].url)
                    }
                    op.setData({
                        pictureList: pictureList,
                    })
                }
            }
        })
    },

    consult: function (e) {
        let op = this;
        if (op.data.phone != null && op.data.phone != "") {
            wx.makePhoneCall({
                phoneNumber: op.data.phone,
            })
        } else {
            wx.showToast({
                title: '暂无咨询电话',
                icon: "none"
            })
        }
    },

    minus: function (e) {
        let op = this;
        if (op.data.onceMinPurchaseCount == "-1") {
            if (op.data.oneBuyCount > 1) {
                op.setData({
                    oneBuyCount: op.data.oneBuyCount - 1
                })
            }
        } else {
            if (op.data.oneBuyCount > op.data.onceMinPurchaseCount) {
                op.setData({
                    oneBuyCount: op.data.oneBuyCount - 1
                })
            } else {
                op.setData({
                    isMinTipShow: true,
                })

                setTimeout(() => {
                    op.setData({
                        isMinTipShow: false,
                    })
                }, 1500);
            }
        }
    },

    plus: function (e) {
        let op = this;
        if (op.data.onceMaxPurchaseCount != -1) {
            if (op.data.oneBuyCount < op.data.onceMaxPurchaseCount) {
                op.setData({
                    oneBuyCount: op.data.oneBuyCount + 1
                })
            } else {
                op.setData({
                    isMaxTipShow: true,
                })

                setTimeout(() => {
                    op.setData({
                        isMaxTipShow: false,
                    })
                }, 1500);
            }
        } else {
            op.setData({
                oneBuyCount: op.data.oneBuyCount + 1
            })
        }
    },

    closeOrderArea: function (e) {
        this.setData({
            isOrderAreaShow: false,
        })
    },

    onGotUserInfo: function (e) {
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
                                                op.setData({
                                                    isOrderAreaShow: true,
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
                                isOrderAreaShow: true,
                            })
                        }
                    }
                });
            }
        } else {
            //已注册
            op.setData({
                isOrderAreaShow: true,
            })
        }
    },

    onGotUserInfo2: function (e) {
        let op = this;
        let standard_index = e.currentTarget.dataset.standard_index;
        let onceMaxPurchaseCount = e.currentTarget.dataset.once_max_purchase_count;
        let onceMinPurchaseCount = e.currentTarget.dataset.once_min_purchase_count;
        let oneBuyCount = 1;
        if (onceMinPurchaseCount != "-1") {
            oneBuyCount = parseInt(onceMinPurchaseCount);
        }
        let selectStandardName = op.data.product_type == 0 ? op.data.standardList[standard_index].name : op.data.standardList[standard_index].standardName;
        op.setData({
            selectStandardName: selectStandardName,
            onceMaxPurchaseCount: onceMaxPurchaseCount,
            onceMinPurchaseCount: onceMinPurchaseCount,
            oneBuyCount: oneBuyCount,
        })
        let id = app.getUserId();
        if (id == '-1') {
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
                                                                let allUrl = "";
                                                                if (op.data.posterSharerPhone == "") {
                                                                    allUrl = util.fillUrlParams("/pages/index/register", {
                                                                        beOffline: JSON.stringify(false),
                                                                    })
                                                                } else {
                                                                    allUrl = util.fillUrlParams("/pages/index/register", {
                                                                        beOffline: JSON.stringify(true),
                                                                        posterSharerPhone: op.data.posterSharerPhone
                                                                    })
                                                                }
                                                                wx.navigateTo({
                                                                    url: allUrl,
                                                                })
                                                            });
                                                        }
                                                    }
                                                })
                                            } else {
                                                //已注册
                                                let present_price = e.currentTarget.dataset.present_price;
                                                let standardId = e.currentTarget.dataset.standard_id;
                                                op.setData({
                                                    isOrderAreaShow: true,
                                                    present_price: present_price,
                                                    standardId: standardId,
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
                                        app.onGotUserInfo(e, function () {
                                            let allUrl = "";
                                            if (op.data.posterSharerPhone == "") {
                                                allUrl = util.fillUrlParams("/pages/index/register", {
                                                    beOffline: JSON.stringify(false),
                                                })
                                            } else {
                                                allUrl = util.fillUrlParams("/pages/index/register", {
                                                    beOffline: JSON.stringify(true),
                                                    posterSharerPhone: op.data.posterSharerPhone
                                                })
                                            }
                                            wx.navigateTo({
                                                url: allUrl,
                                            })
                                        });
                                    }
                                }
                            })
                        } else {
                            //已注册
                            let present_price = e.currentTarget.dataset.present_price;
                            let standardId = e.currentTarget.dataset.standard_id;
                            op.setData({
                                isOrderAreaShow: true,
                                present_price: present_price,
                                standardId: standardId,
                            })
                        }
                    }
                });
            }
        } else {
            //已注册
            let present_price = e.currentTarget.dataset.present_price;
            let standardId = e.currentTarget.dataset.standard_id;
            op.setData({
                isOrderAreaShow: true,
                present_price: present_price,
                standardId: standardId,
            })
        }
    },

    auth: function (e) {
        let op = this;
        let orderTemplateId = op.data.orderTemplateId;
        //订阅授权
        wx.requestSubscribeMessage({
            tmplIds: [orderTemplateId],
            success: (res) => {},
            fail: (res) => {},
            complete: (res) => {
                op.prePay();
            }
        });
    },

    prePay: function (e) {
        let op = this;
        let userId = app.getUserId();

        //是否允许重复购买
        if (op.data.repeat_purchase == 1) {
            //校验购买记录
            app.post("/userOrder/getOrderListByUserIdAndProductId", {
                userId: userId,
                productId: op.data.id,
            }, function (res) {
                if (app.hasData(res)) {
                    if (res.length > 0) {
                        wx.showToast({
                            title: '不允许重复购买',
                            icon: "none"
                        });
                        return;
                    } else {
                        //检查库存是否足够
                        app.post("/product/getInventoryByStandardId", {
                            standardId: op.data.standardId,
                            productType: op.data.product_type
                        }, function (data) {
                            if (app.hasData(data)) {
                                if (data > 0 && op.data.oneBuyCount <= data) {
                                    if (op.data.present_price == "0") {
                                        if (op.data.product_type == 0) {
                                            //免费产品
                                            if (op.data.product_style == 1) {
                                                //实体产品
                                                app.post("/userOrder/getReceiveAddress", {
                                                    userId: userId,
                                                }, function (data1) {
                                                    if (app.hasData(data1)) {
                                                        if (data1.length == 0) {
                                                            //没有收货地址
                                                            wx.showModal({
                                                                title: '温馨提示~',
                                                                content: '您暂未填写收货地址~',
                                                                showCancel: true, //隐藏取消按钮
                                                                confirmText: "前往填写", //只保留确定更新按钮
                                                                success: function (res) {
                                                                    if (res.confirm) {
                                                                        let allUrl = util.fillUrlParams("/pages/my/info", {
                                                                            id: userId
                                                                        })
                                                                        wx.navigateTo({
                                                                            url: allUrl,
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        } else {
                                                            let receiveAddress = data1[0].province + data1[0].city + data1[0].area + data1[0].address;
                                                            app.post("/userOrder/freeData", {
                                                                userId: app.getUserId(),
                                                                standardId: op.data.standardId,
                                                                productId: op.data.id,
                                                                price: op.data.present_price,
                                                                num: op.data.oneBuyCount,
                                                                total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                                                orderType: op.data.product_type,
                                                                receiveAddress: receiveAddress,
                                                                posterSharerPhone: op.data.posterSharerPhone,
                                                                disShopId: op.data.disShopId,
                                                                isPlatDistribute: op.data.isPlatDistribute,
                                                                enterFromShop: op.data.enterFromShop,
                                                                enterFromQr: op.data.enterFromQr,
                                                                enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                                                forwardUserId: op.data.forwardUserId,
                                                            }, function (data2) {
                                                                if (typeof data2 == 'number') {
                                                                    let allUrl = util.fillUrlParams('/pages/product/success', {
                                                                        productId: op.data.id
                                                                    });
                                                                    wx.navigateTo({
                                                                        url: allUrl
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    }
                                                })
                                            } else {
                                                //虚拟产品
                                                app.post("/userOrder/freeData", {
                                                    userId: app.getUserId(),
                                                    standardId: op.data.standardId,
                                                    productId: op.data.id,
                                                    price: op.data.present_price,
                                                    num: op.data.oneBuyCount,
                                                    total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                                    orderType: op.data.product_type,
                                                    posterSharerPhone: op.data.posterSharerPhone,
                                                    disShopId: op.data.disShopId,
                                                    isPlatDistribute: op.data.isPlatDistribute,
                                                    enterFromShop: op.data.enterFromShop,
                                                    enterFromQr: op.data.enterFromQr,
                                                    enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                                    forwardUserId: op.data.forwardUserId,
                                                }, function (data1) {
                                                    if (typeof data1 == 'number') {
                                                        let allUrl = util.fillUrlParams('/pages/product/success', {
                                                            productId: op.data.id
                                                        });
                                                        wx.navigateTo({
                                                            url: allUrl
                                                        });
                                                    }
                                                });
                                            }
                                        } else {
                                            //免费活动
                                            app.post("/userOrder/freeDataForActivity", {
                                                userId: app.getUserId(),
                                                standardId: op.data.standardId,
                                                productId: op.data.id,
                                                price: op.data.present_price,
                                                num: op.data.oneBuyCount,
                                                total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                                orderType: op.data.product_type,
                                                posterSharerPhone: op.data.posterSharerPhone,
                                                disShopId: op.data.disShopId,
                                                isPlatDistribute: op.data.isPlatDistribute,
                                                enterFromShop: op.data.enterFromShop,
                                                enterFromQr: op.data.enterFromQr,
                                                enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                                forwardUserId: op.data.forwardUserId,
                                            }, function (data1) {
                                                if (typeof data1 == 'number') {
                                                    let allUrl = util.fillUrlParams('/pages/product/success', {
                                                        productId: op.data.id
                                                    });
                                                    wx.navigateTo({
                                                        url: allUrl
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        if (op.data.product_type == 0) {
                                            //付费产品
                                            if (op.data.product_style == 1) {
                                                //实体产品
                                                app.post("/userOrder/getReceiveAddress", {
                                                    userId: userId,
                                                }, function (data1) {
                                                    if (app.hasData(data1)) {
                                                        if (data1.length == 0) {
                                                            //没有收货地址
                                                            wx.showModal({
                                                                title: '温馨提示~',
                                                                content: '您暂未填写收货地址~',
                                                                showCancel: true, //隐藏取消按钮
                                                                confirmText: "前往填写", //只保留确定更新按钮
                                                                success: function (res) {
                                                                    if (res.confirm) {
                                                                        let allUrl = util.fillUrlParams("/pages/my/info", {
                                                                            id: userId
                                                                        })
                                                                        wx.navigateTo({
                                                                            url: allUrl,
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        } else {
                                                            let receiveAddress = data1[0].province + data1[0].city + data1[0].area + data1[0].address;
                                                            app.post("/userOrder/data", {
                                                                userId: app.getUserId(),
                                                                standardId: op.data.standardId,
                                                                productId: op.data.id,
                                                                price: op.data.present_price,
                                                                num: op.data.oneBuyCount,
                                                                total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                                                orderType: op.data.product_type,
                                                                receiveAddress: receiveAddress,
                                                                posterSharerPhone: op.data.posterSharerPhone,
                                                                disShopId: op.data.disShopId,
                                                                isPlatDistribute: op.data.isPlatDistribute,
                                                                enterFromShop: op.data.enterFromShop,
                                                                enterFromQr: op.data.enterFromQr,
                                                                enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                                                forwardUserId: op.data.forwardUserId,
                                                            }, function (data2) {
                                                                if (typeof data2 == 'number') {
                                                                    let allUrl = util.fillUrlParams("/pages/product/preOrder", {
                                                                        orderId: data2,
                                                                        productId: op.data.id,
                                                                    });
                                                                    wx.navigateTo({
                                                                        url: allUrl,
                                                                    })
                                                                }
                                                            });
                                                        }
                                                    }
                                                })
                                            } else {
                                                //虚拟产品
                                                app.post("/userOrder/data", {
                                                    userId: app.getUserId(),
                                                    standardId: op.data.standardId,
                                                    productId: op.data.id,
                                                    price: op.data.present_price,
                                                    num: op.data.oneBuyCount,
                                                    total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                                    orderType: op.data.product_type,
                                                    posterSharerPhone: op.data.posterSharerPhone,
                                                    disShopId: op.data.disShopId,
                                                    isPlatDistribute: op.data.isPlatDistribute,
                                                    enterFromShop: op.data.enterFromShop,
                                                    enterFromQr: op.data.enterFromQr,
                                                    enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                                    forwardUserId: op.data.forwardUserId,
                                                }, function (data1) {
                                                    if (typeof data1 == 'number') {
                                                        let allUrl = util.fillUrlParams("/pages/product/preOrder", {
                                                            orderId: data1,
                                                            productId: op.data.id,
                                                        });
                                                        wx.navigateTo({
                                                            url: allUrl,
                                                        })
                                                    }
                                                });
                                            }
                                        } else {
                                            //付费活动
                                            app.post("/userOrder/dataForActivity", {
                                                userId: app.getUserId(),
                                                productId: op.data.id,
                                                standardId: op.data.standardId,
                                                price: op.data.present_price,
                                                num: op.data.oneBuyCount,
                                                total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                                orderType: op.data.product_type,
                                                posterSharerPhone: op.data.posterSharerPhone,
                                                disShopId: op.data.disShopId,
                                                isPlatDistribute: op.data.isPlatDistribute,
                                                enterFromShop: op.data.enterFromShop,
                                                enterFromQr: op.data.enterFromQr,
                                                enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                                forwardUserId: op.data.forwardUserId,
                                            }, function (data1) {
                                                if (typeof data1 == 'number') {
                                                    let allUrl = util.fillUrlParams("/pages/product/preOrder", {
                                                        orderId: data1,
                                                        productId: op.data.id,
                                                    });
                                                    wx.navigateTo({
                                                        url: allUrl,
                                                    })
                                                }
                                            });
                                        }
                                    }
                                } else {
                                    wx.showToast({
                                        title: '库存不足',
                                        icon: "none"
                                    })
                                }
                            }
                        })
                    }
                }
            });
        } else {
            //检查库存是否足够
            app.post("/product/getInventoryByStandardId", {
                standardId: op.data.standardId,
                productType: op.data.product_type
            }, function (data) {
                if (app.hasData(data)) {
                    if (data > 0 && op.data.oneBuyCount <= data) {
                        if (op.data.present_price == "0") {
                            if (op.data.product_type == 0) {
                                //免费产品
                                if (op.data.product_style == 1) {
                                    //实体产品
                                    app.post("/userOrder/getReceiveAddress", {
                                        userId: userId,
                                    }, function (data) {
                                        if (app.hasData(data)) {
                                            if (data.length == 0) {
                                                //没有收货地址
                                                wx.showModal({
                                                    title: '温馨提示~',
                                                    content: '您暂未填写收货地址~',
                                                    showCancel: true, //隐藏取消按钮
                                                    confirmText: "前往填写", //只保留确定更新按钮
                                                    success: function (res) {
                                                        if (res.confirm) {
                                                            let allUrl = util.fillUrlParams("/pages/my/info", {
                                                                id: userId
                                                            })
                                                            wx.navigateTo({
                                                                url: allUrl,
                                                            })
                                                        }
                                                    }
                                                })
                                            } else {
                                                let receiveAddress = data[0].province + data[0].city + data[0].area + data[0].address;
                                                app.post("/userOrder/freeData", {
                                                    userId: app.getUserId(),
                                                    standardId: op.data.standardId,
                                                    productId: op.data.id,
                                                    price: op.data.present_price,
                                                    num: op.data.oneBuyCount,
                                                    total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                                    orderType: op.data.product_type,
                                                    receiveAddress: receiveAddress,
                                                    posterSharerPhone: op.data.posterSharerPhone,
                                                    disShopId: op.data.disShopId,
                                                    isPlatDistribute: op.data.isPlatDistribute,
                                                    enterFromShop: op.data.enterFromShop,
                                                    enterFromQr: op.data.enterFromQr,
                                                    enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                                    forwardUserId: op.data.forwardUserId,
                                                }, function (data) {
                                                    if (typeof data == 'number') {
                                                        let allUrl = util.fillUrlParams('/pages/product/success', {
                                                            productId: op.data.id
                                                        });
                                                        wx.navigateTo({
                                                            url: allUrl
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    })
                                } else {
                                    //虚拟产品
                                    app.post("/userOrder/freeData", {
                                        userId: app.getUserId(),
                                        standardId: op.data.standardId,
                                        productId: op.data.id,
                                        price: op.data.present_price,
                                        num: op.data.oneBuyCount,
                                        total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                        orderType: op.data.product_type,
                                        posterSharerPhone: op.data.posterSharerPhone,
                                        disShopId: op.data.disShopId,
                                        isPlatDistribute: op.data.isPlatDistribute,
                                        enterFromShop: op.data.enterFromShop,
                                        enterFromQr: op.data.enterFromQr,
                                        enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                        forwardUserId: op.data.forwardUserId,
                                    }, function (data) {
                                        if (typeof data == 'number') {
                                            let allUrl = util.fillUrlParams('/pages/product/success', {
                                                productId: op.data.id
                                            });
                                            wx.navigateTo({
                                                url: allUrl
                                            });
                                        }
                                    });
                                }
                            } else {
                                //免费活动
                                app.post("/userOrder/freeDataForActivity", {
                                    userId: app.getUserId(),
                                    standardId: op.data.standardId,
                                    productId: op.data.id,
                                    price: op.data.present_price,
                                    num: op.data.oneBuyCount,
                                    total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                    orderType: op.data.product_type,
                                    posterSharerPhone: op.data.posterSharerPhone,
                                    disShopId: op.data.disShopId,
                                    isPlatDistribute: op.data.isPlatDistribute,
                                    enterFromShop: op.data.enterFromShop,
                                    enterFromQr: op.data.enterFromQr,
                                    enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                    forwardUserId: op.data.forwardUserId,
                                }, function (data) {
                                    if (typeof data == 'number') {
                                        let allUrl = util.fillUrlParams('/pages/product/success', {
                                            productId: op.data.id
                                        });
                                        wx.navigateTo({
                                            url: allUrl
                                        });
                                    }
                                });
                            }
                        } else {
                            if (op.data.product_type == 0) {
                                //付费产品
                                if (op.data.product_style == 1) {
                                    //实体产品
                                    app.post("/userOrder/getReceiveAddress", {
                                        userId: userId,
                                    }, function (data) {
                                        if (app.hasData(data)) {
                                            if (data.length == 0) {
                                                //没有收货地址
                                                wx.showModal({
                                                    title: '温馨提示~',
                                                    content: '您暂未填写收货地址~',
                                                    showCancel: true, //隐藏取消按钮
                                                    confirmText: "前往填写", //只保留确定更新按钮
                                                    success: function (res) {
                                                        if (res.confirm) {
                                                            let allUrl = util.fillUrlParams("/pages/my/info", {
                                                                id: userId
                                                            })
                                                            wx.navigateTo({
                                                                url: allUrl,
                                                            })
                                                        }
                                                    }
                                                })
                                            } else {
                                                let receiveAddress = data[0].province + data[0].city + data[0].area + data[0].address;
                                                app.post("/userOrder/data", {
                                                    userId: app.getUserId(),
                                                    standardId: op.data.standardId,
                                                    productId: op.data.id,
                                                    price: op.data.present_price,
                                                    num: op.data.oneBuyCount,
                                                    total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                                    orderType: op.data.product_type,
                                                    receiveAddress: receiveAddress,
                                                    posterSharerPhone: op.data.posterSharerPhone,
                                                    disShopId: op.data.disShopId,
                                                    isPlatDistribute: op.data.isPlatDistribute,
                                                    enterFromShop: op.data.enterFromShop,
                                                    enterFromQr: op.data.enterFromQr,
                                                    enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                                    forwardUserId: op.data.forwardUserId,
                                                }, function (data) {
                                                    if (typeof data == 'number') {
                                                        let allUrl = util.fillUrlParams("/pages/product/preOrder", {
                                                            orderId: data,
                                                            productId: op.data.id,
                                                        });
                                                        wx.navigateTo({
                                                            url: allUrl,
                                                        })
                                                    }
                                                });
                                            }
                                        }
                                    })
                                } else {
                                    //虚拟产品
                                    app.post("/userOrder/data", {
                                        userId: app.getUserId(),
                                        productId: op.data.id,
                                        standardId: op.data.standardId,
                                        price: op.data.present_price,
                                        num: op.data.oneBuyCount,
                                        total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                        orderType: op.data.product_type,
                                        posterSharerPhone: op.data.posterSharerPhone,
                                        disShopId: op.data.disShopId,
                                        isPlatDistribute: op.data.isPlatDistribute,
                                        enterFromShop: op.data.enterFromShop,
                                        enterFromQr: op.data.enterFromQr,
                                        enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                        forwardUserId: op.data.forwardUserId,
                                    }, function (data) {
                                        if (typeof data == 'number') {
                                            let allUrl = util.fillUrlParams("/pages/product/preOrder", {
                                                orderId: data,
                                                productId: op.data.id,
                                            });
                                            wx.navigateTo({
                                                url: allUrl,
                                            })
                                        }
                                    });
                                }
                            } else {
                                //付费活动
                                app.post("/userOrder/dataForActivity", {
                                    userId: app.getUserId(),
                                    productId: op.data.id,
                                    standardId: op.data.standardId,
                                    price: op.data.present_price,
                                    num: op.data.oneBuyCount,
                                    total: (op.data.present_price * op.data.oneBuyCount).toFixed(2),
                                    orderType: op.data.product_type,
                                    posterSharerPhone: op.data.posterSharerPhone,
                                    disShopId: op.data.disShopId,
                                    isPlatDistribute: op.data.isPlatDistribute,
                                    enterFromShop: op.data.enterFromShop,
                                    enterFromQr: op.data.enterFromQr,
                                    enterFromForwardDetailPage: op.data.enterFromForwardDetailPage,
                                    forwardUserId: op.data.forwardUserId,
                                }, function (data) {
                                    if (typeof data == 'number') {
                                        let allUrl = util.fillUrlParams("/pages/product/preOrder", {
                                            orderId: data,
                                            productId: op.data.id,
                                        });
                                        wx.navigateTo({
                                            url: allUrl,
                                        })
                                    }
                                });
                            }
                        }
                    } else {
                        wx.showToast({
                            title: '库存不足',
                            icon: "none"
                        })
                    }
                }
            })
        }
    },

    getStandardList: function (e) {
        let op = this;
        app.post("/product/getStandardListByProductId", {
            productId: op.data.id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        data[i].adultsNum = parseInt(data[i].adultsNum);
                        data[i].childrenNum = parseInt(data[i].childrenNum);
                        if (data[i].adultsNum == 0) {
                            data[i].standardName = '儿童票'
                        } else if (data[i].childrenNum == 0) {
                            data[i].standardName = '成人票'
                        } else {
                            data[i].standardName = '【' + data[i].adultsNum + '大' + data[i].childrenNum + '小' + '】';
                        }
                    }
                    op.setData({
                        standardList: data
                    })
                }
            }
        })
    },

    getProductStandardList: function (e) {
        let op = this;
        app.post("/product/getProductStandardListByProductId", {
            productId: op.data.id,
        }, function (data) {
            if (app.hasData(data)) {
                op.setData({
                    standardList: data
                })
            }
        })
    },

    loadProductInfoById: function (e) {
        let op = this;
        app.post("/product/loadProductInfoById", {
            productId: op.data.id,
        }, function (data) {
            if (app.hasData(data)) {
                let buy_count = data.buy_count;
                let address = data.address;
                let address_name = data.address_name;
                let longitude = data.longitude;
                let latitude = data.latitude;
                let card_id = data.card_id;
                let deadline_time = data.deadline_time.indexOf("9999") != -1 ? '不限' : data.deadline_time;
                let id = data.id;
                let instruction = data.instruction || '';
                let introduce = data.introduce || '';
                let is_hot = data.is_hot;
                let main_image = data.main_image.indexOf("http") == -1 ? app.qinzi + data.main_image : data.main_image;
                let name = data.name;
                let phone = data.phone;
                let present_price = data.present_price;
                let repeat_purchase = data.repeat_purchase;
                let video_path = data.vedio_path ? (data.vedio_path.indexOf("https") == -1 ? 'https://qinzi123.com' + data.vedio_path : data.vedio_path) : '';
                let type = data.type;
                let product_type = data.product_type;
                let shop_id = data.shop_id;
                let product_style = data.product_style;
                let wuyuType = data.wuyu_type;
                let showDeFlag = false;
                let showZhiFlag = false;
                let showTiFlag = false;
                let showMeiFlag = false;
                let showLaoFlag = false;
                if (wuyuType != "") {
                    //先判断五育类型有几种
                    if (wuyuType.indexOf("/") == -1) {
                        //一种五育类型
                        switch (wuyuType) {
                            case '1':
                                showDeFlag = true;
                                break;
                            case '2':
                                showZhiFlag = true;
                                break;
                            case '3':
                                showTiFlag = true;
                                break;
                            case '4':
                                showMeiFlag = true;
                                break;
                            case '5':
                                showLaoFlag = true;
                                break;
                        }
                    } else {
                        //多种五育类型
                        let wuyuArr = wuyuType.split("/");
                        for (let i = 0; i < wuyuArr.length; i++) {
                            switch (wuyuArr[i]) {
                                case '1':
                                    showDeFlag = true;
                                    break;
                                case '2':
                                    showZhiFlag = true;
                                    break;
                                case '3':
                                    showTiFlag = true;
                                    break;
                                case '4':
                                    showMeiFlag = true;
                                    break;
                                case '5':
                                    showLaoFlag = true;
                                    break;
                            }
                        }
                    }
                }
                let orderBtnName;
                if (present_price == "0") {
                    orderBtnName = "免费领取";
                } else {
                    orderBtnName = "立即抢购";
                }

                op.setData({
                    buy_count: buy_count,
                    address: address,
                    address_name: address_name,
                    longitude: longitude,
                    latitude: latitude,
                    card_id: card_id,
                    deadline_time: deadline_time,
                    id: id,
                    instruction: instruction,
                    introduce: introduce,
                    is_hot: is_hot,
                    main_image: main_image,
                    name: name,
                    phone: phone,
                    present_price: present_price,
                    repeat_purchase: repeat_purchase,
                    video_path: video_path,
                    type: type,
                    product_type: product_type,
                    product_style: product_style,
                    shop_id: shop_id,
                    orderBtnName: orderBtnName,
                    showDeFlag: showDeFlag,
                    showZhiFlag: showZhiFlag,
                    showTiFlag: showTiFlag,
                    showMeiFlag: showMeiFlag,
                    showLaoFlag: showLaoFlag,
                })
                op.getOtherImageList();
                if (product_type == 1) {
                    op.getStandardList();
                } else if (product_type == 0) {
                    op.getProductStandardList();
                }
            } else {
                wx.showModal({
                    title: '温馨提示~',
                    content: '该产品还未上架哦~',
                    showCancel: true, //隐藏取消按钮
                    confirmText: "返回首页", //只保留确定更新按钮
                    success: function (res) {
                        wx.switchTab({
                            url: '/pages/index/index',
                        })
                    }
                })
            }
        })
    },

    openMapByTencent: function (e) {
        let op = this;
        if (op.data.latitude == '') {
            wx.showToast({
                title: '正在努力开发中',
                icon: "none"
            })
        }
        if (op.data.longitude == '') {
            wx.showToast({
                title: '正在努力开发中',
                icon: "none"
            })
        }
        let latitude = parseFloat(op.data.latitude);
        let longitude = parseFloat(op.data.longitude);

        wx.openLocation({
            latitude: latitude,
            longitude: longitude,
            scale: 15,
            name: op.data.name,
            address: op.data.address,
        })
    },

    base64src: function (base64data) {
        return new Promise((resolve, reject) => {
            let time = new Date().getTime()
            let [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
            if (!format) {
                reject(new Error('ERROR_BASE64SRC_PARSE'));
            }
            //加时间戳是为了图片的缓存问题
            let filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME+time}.${format}`;
            let buffer = wx.base64ToArrayBuffer(bodyData);
            fsm.writeFile({
                filePath,
                data: buffer,
                encoding: 'binary',
                success() {
                    resolve(filePath);
                },
                fail() {
                    reject(new Error('ERROR_BASE64SRC_WRITE'));
                },
            });
        });
    },

    getImageInfo: function (url) {
        return new Promise((resolve, reject) => {
            wx.getImageInfo({
                src: url,
                success(res) {
                    //如果是本地图片的话此api返回的路径有问题，所以需要判断是否是网络图片
                    if (!/^https/.test(url)) {
                        res.path = url
                    };
                    resolve(res)
                },
                fail(err) {
                    reject(err.errMsg + `${url}`)
                },
            })
        })
    },

    // 计算文本长度
    calcTextLength: function (text) {
        let len = 0
        for (let i = 0; i < text.length; i++) {
            if (text.charCodeAt(i) > 255) {
                len += 2
            } else {
                len += 1
            }
        }
        return len * 15
    },

    /**
     *
     * @param {*} contex
     * @param {绘制的头像} img
     * @param {x坐标} x
     * @param {y坐标} y
     * @param {直径} d
     */
    circleImg: function (contex, img, x, y, d) {
        let avatarurl_width = d; //绘制的头像宽度
        let avatarurl_heigth = d; //绘制的头像高度
        contex.save();
        contex.beginPath(); //开始绘制
        //先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
        contex.arc(avatarurl_width / 2 + x, avatarurl_heigth / 2 + y, d / 2, 0, Math.PI * 2, false);
        contex.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
        contex.drawImage(img, x, y, avatarurl_width, avatarurl_heigth); // 推进去图片，必须是https图片
        contex.stroke();
        contex.closePath();
        contex.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制
    },

    /**
     *
     *保存canvas绘制的图像到临时目录
     */
    canvasToTempFilePath: function (option, context) {
        return new Promise((resolve, reject) => {
            wx.canvasToTempFilePath({
                ...option,
                success: resolve,
                fail() {
                    reject(err)
                },
            }, context)
        })
    },

    getcodeImg: function (e) {
        let op = this;
        let userId = app.getUserId();
        let enterFromShop = op.data.enterFromShop ? '0' : '1';
        return new Promise((reslove, reject) => {
            app.getUrlArraybuffer("/product/generateActivityQrCode/" + op.data.id + '-' + userId + '-' + enterFromShop, function (data) {
                if (app.hasData(data)) {
                    let src = 'data:image/png;base64,' + wx.arrayBufferToBase64(data);
                    op.setData({
                        posterQrCodeSrc: src,
                    })
                    let QRcodereq = src;
                    Promise.resolve().then(() => {
                        Promise.all([QRcodereq]).then(([QRcodebase64]) => {
                            op.setData({
                                QRcodebase64: QRcodebase64,
                            })
                        })
                    })
                }
            })
        })
    },

    //canvas单行文本自动省略
    fittingString: function (_ctx, str, maxWidth) {
        let strWidth = _ctx.measureText(str).width;
        const ellipsis = "…";
        const ellipsisWidth = _ctx.measureText(ellipsis).width;
        if (strWidth <= maxWidth || maxWidth <= ellipsisWidth) {
            return str;
        } else {
            var len = str.length;
            while (strWidth >= maxWidth - ellipsisWidth && len-- > 0) {
                str = str.slice(0, len);
                strWidth = _ctx.measureText(str).width;
            }
            return str + ellipsis;
        }
    },

    generatePoster: function (e) {
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
                                                op.setData({
                                                    isShareShow: false,
                                                    isPosterShow: true,
                                                })
                                                setTimeout(op.drawCanvas(), 20)
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
                                isShareShow: false,
                                isPosterShow: true,
                            })
                            setTimeout(op.drawCanvas(), 20)
                        }
                    }
                });
            }
        } else {
            //已注册
            op.setData({
                isShareShow: false,
                isPosterShow: true,
            })
            setTimeout(op.drawCanvas(), 20)
        }
    },

    drawCanvas: function (e) {
        let op = this;
        //图片地址可以是本地相对路径，也可以是网络图片
        let nickName = op.data.nickName;
        if (op.data.QRcodebase64 == '' || op.data.bg1_res == '' || op.data.avatarUrl_res == '') {
            wx.showToast({
                title: '请稍后再试',
                icon: "none",
            })
            op.setData({
                isShareShow: false,
                isPosterShow: false,
            })
            return;
        }
        wx.showLoading({
            title: '海报生成中...',
            mask: true
        })
        let QRcodebase64 = op.data.QRcodebase64;
        let bg1_res = op.data.bg1_res;
        let avatarUrl_res = op.data.avatarUrl_res;
        op.base64src(QRcodebase64).then(QRcodeurl => {
            //canvas的宽高
            let canvasW = util.rpx2px(400)
            let canvasH = util.rpx2px(455)
            //指定id为share 的canvas
            const ctx = wx.createCanvasContext('share', op)
            // 绘制背景色
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, canvasW, canvasH)

            //画主题图片
            ctx.drawImage(bg1_res.path, -30, 0, canvasW, util.rpx2px(300))

            //画二维码
            ctx.drawImage(QRcodeurl, util.rpx2px(250), util.rpx2px(375), util.rpx2px(65), util.rpx2px(65))

            // 产品名称
            ctx.setFontSize(util.rpx2px(17))
            ctx.setFillStyle('black')
            ctx.fillText(op.fittingString(ctx, op.data.name, 300) || '', util.rpx2px(20), util.rpx2px(325))
            // ￥ 免费产品或只有一个规格的免费活动不渲染
            let isAllStandardFree = true;
            for (let j = 0; j < op.data.standardList.length; j++) {
                if (op.data.standardList[j].price > 0) {
                    isAllStandardFree = false;
                    break;
                }
            }
            if (!isAllStandardFree) {
                ctx.setFontSize(util.rpx2px(13))
                ctx.setFillStyle('red')
                ctx.fillText('￥' || '', util.rpx2px(20), util.rpx2px(360))
            }
            // 现价
            let standardList = op.data.standardList;
            let presentPrice;
            if (standardList.length == 1) {
                //只有一个规格的活动
                presentPrice = standardList[0].price == 0 ? '免费' : standardList[0].price;
            } else {
                //多个规格的活动
                let minimumPrice = standardList[0].price;
                let isAllFree = true;
                for (let j = 0; j < standardList.length; j++) {
                    if (standardList[j].price > 0) {
                        isAllFree = false;
                        break;
                    }
                }
                if (isAllFree) {
                    presentPrice = '免费';
                } else {
                    for (let i = 0; i < standardList.length; i++) {
                        if (standardList[i].price < minimumPrice) {
                            minimumPrice = standardList[i].price;
                        }
                    }
                    presentPrice = minimumPrice + '元起';
                }
            }
            ctx.setFontSize(util.rpx2px(22))
            ctx.setFillStyle('red')
            ctx.fillText(presentPrice || '', util.rpx2px(33), util.rpx2px(360))
            // 活动最低价提示字符，只有多个规格的活动显示
            if (op.data.standardList > 1) {
                ctx.setFontSize(util.rpx2px(13))
                ctx.setFillStyle('red')
                let str = presentPrice == "免费" ? presentPrice : '￥' + presentPrice;
                ctx.fillText('起' || '', util.rpx2px(21) + op.calcTextLength(str) / 15 * 11, util.rpx2px(360))
            }
            //分割线
            ctx.setStrokeStyle('#f8f8f8')
            //距离画布x轴、y轴、宽 高
            ctx.strokeRect(0, util.rpx2px(370), canvasW, 1)
            // 微信昵称
            ctx.setFontSize(util.rpx2px(15))
            ctx.setFillStyle('black')
            ctx.fillText(op.fittingString(ctx, nickName, 130) || '', util.rpx2px(90), util.rpx2px(405))
            // 提示语
            ctx.setFontSize(util.rpx2px(10))
            ctx.setFillStyle('#989898')
            ctx.fillText('给你推荐了好东西' || '', util.rpx2px(90), util.rpx2px(430))


            // 绘制头像 （放在最后画，放在前面会被后续影响，未知原因）
            op.circleImg(ctx, avatarUrl_res.path, util.rpx2px(25), util.rpx2px(385), util.rpx2px(50))
            ctx.draw(true, () => {
                wx.hideLoading()
                setTimeout(() => {
                    op.canvasToTempFilePath({
                        canvasId: 'share',
                    }, op).then(({
                        tempFilePath
                    }) => {
                        wx.hideLoading()
                        op.setData({
                            posterSrc: tempFilePath //这个就是生成的图片
                        })
                    })
                }, 300)
            })
        })
    },

    getUserInfoById: function (e) {
        let op = this;
        app.post("/index/getUserInfoById", {
            id: app.getUserId(),
        }, function (data) {
            if (app.hasData(data)) {
                let userInfo = data[0];
                let nickName = userInfo.nick_name;
                let avatarUrl = userInfo.head_img_url;
                if (avatarUrl.indexOf("https://thirdwx.qlogo.cn") != -1) {
                    avatarUrl = avatarUrl.replace('thirdwx.qlogo.cn', "wx.qlogo.cn")
                }
                if (avatarUrl.indexOf("http://thirdwx.qlogo.cn") != -1) {
                    avatarUrl = avatarUrl.replace('http', "https")
                    avatarUrl = avatarUrl.replace('thirdwx.qlogo.cn', "wx.qlogo.cn")
                }
                op.setData({
                    nickName: nickName,
                })
                let imagesArr = [
                    op.data.main_image,
                    avatarUrl
                ]
                Promise.resolve().then(() => {
                    Promise.all([...imagesArr.map(item => {
                        return op.getImageInfo(item)
                    })]).then(([bg1_res, avatarUrl_res]) => {
                        op.setData({
                            bg1_res: bg1_res,
                            avatarUrl_res: avatarUrl_res,
                        })
                    })
                })
            }
        })
    },

    changeRecommendList: function (e) {
        this.getRecommendProductList();
    },

    getRecommendProductList: function (e) {
        let op = this;
        app.post("/product/getRecommendProductList", {
            productId: op.data.id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].main_image.indexOf("http") == -1) {
                            data[i].main_image = app.qinzi + data[i].main_image;
                        }
                    }
                }
                op.setData({
                    recommendProductList: data
                })
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
        let inventory = e.currentTarget.dataset.inventory;
        let is_hot = e.currentTarget.dataset.is_hot;
        let main_image = e.currentTarget.dataset.main_image;
        let name = e.currentTarget.dataset.name;
        let once_max_purchase_count = e.currentTarget.dataset.once_max_purchase_count;
        let original_price = e.currentTarget.dataset.original_price;
        let phone = e.currentTarget.dataset.phone;
        let present_price = e.currentTarget.dataset.present_price;
        let repeat_purchase = e.currentTarget.dataset.repeat_purchase;
        let video_path = e.currentTarget.dataset.vedio_path;
        let type = e.currentTarget.dataset.type;
        let product_type = e.currentTarget.dataset.product_type;
        let product_style = e.currentTarget.dataset.product_style;
        let shop_id = e.currentTarget.dataset.shop_id;
        let company_name = e.currentTarget.dataset.company_name;

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
            inventory: inventory,
            is_hot: is_hot,
            main_image: main_image,
            name: name,
            once_max_purchase_count: once_max_purchase_count,
            original_price: original_price,
            phone: phone,
            present_price: present_price,
            repeat_purchase: repeat_purchase,
            video_path: video_path,
            type: type,
            product_type: product_type,
            product_style: product_style,
            shop_id: shop_id,
            company_name: company_name,
        })

        wx.navigateTo({
            url: allUrl,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let op = this;
        if (!options.scene || options.scene == '') {
            let buy_count = options.buy_count;
            let address = options.address;
            let address_name = options.address_name;
            let longitude = options.longitude;
            let latitude = options.latitude;
            let card_id = options.card_id;
            let deadline_time = options.deadline_time.indexOf("9999") != -1 ? '不限' : options.deadline_time;
            let id = options.id;
            let instruction = options.instruction || '';
            let introduce = options.introduce || '';
            let is_hot = options.is_hot;
            let main_image = options.main_image;
            let name = options.name;
            let phone = options.phone;
            let present_price = options.present_price;
            let repeat_purchase = options.repeat_purchase;
            let video_path = options.video_path ? (options.video_path.indexOf("https") == -1 ? 'https://qinzi123.com' + options.video_path : options.video_path) : '';
            let type = options.type;
            let product_type = options.product_type;
            let shop_id = options.shop_id;
            let product_style = options.product_style;
            let orderBtnName;
            let disShopId = options.disShopId || "-1";
            let enterFromShop = options.enterFromShop ? JSON.parse(options.enterFromShop) : false;
            let wuyuType = options.wuyuType || "";
            let showDeFlag = false;
            let showZhiFlag = false;
            let showTiFlag = false;
            let showMeiFlag = false;
            let showLaoFlag = false;
            let enterFromForwardDetailPage = options.enterFromForwardDetailPage ? options.enterFromForwardDetailPage : 0;
            let forwardUserId = options.forwardUserId ? options.forwardUserId : "";
            if (wuyuType != "") {
                //先判断五育类型有几种
                if (wuyuType.indexOf("/") == -1) {
                    //一种五育类型
                    switch (wuyuType) {
                        case '1':
                            showDeFlag = true;
                            break;
                        case '2':
                            showZhiFlag = true;
                            break;
                        case '3':
                            showTiFlag = true;
                            break;
                        case '4':
                            showMeiFlag = true;
                            break;
                        case '5':
                            showLaoFlag = true;
                            break;
                    }
                } else {
                    //多种五育类型
                    let wuyuArr = wuyuType.split("/");
                    for (let i = 0; i < wuyuArr.length; i++) {
                        switch (wuyuArr[i]) {
                            case '1':
                                showDeFlag = true;
                                break;
                            case '2':
                                showZhiFlag = true;
                                break;
                            case '3':
                                showTiFlag = true;
                                break;
                            case '4':
                                showMeiFlag = true;
                                break;
                            case '5':
                                showLaoFlag = true;
                                break;
                        }
                    }
                }
            }
            if (present_price == "0") {
                orderBtnName = "免费领取";
            } else {
                orderBtnName = "立即抢购";
            }
            let isPlatDistribute = false;
            if (!enterFromShop && enterFromForwardDetailPage == 0) {
                isPlatDistribute = true;
            }

            this.setData({
                buy_count: buy_count,
                address: address,
                address_name: address_name,
                longitude: longitude,
                latitude: latitude,
                card_id: card_id,
                deadline_time: deadline_time,
                id: id,
                instruction: instruction,
                introduce: introduce,
                is_hot: is_hot,
                main_image: main_image,
                name: name,
                phone: phone,
                present_price: present_price,
                repeat_purchase: repeat_purchase,
                video_path: video_path,
                type: type,
                product_type: product_type,
                product_style: product_style,
                shop_id: shop_id,
                orderBtnName: orderBtnName,
                isPlatDistribute: isPlatDistribute,
                disShopId: disShopId,
                enterFromShop: enterFromShop,

                showDeFlag: showDeFlag,
                showZhiFlag: showZhiFlag,
                showTiFlag: showTiFlag,
                showMeiFlag: showMeiFlag,
                showLaoFlag: showLaoFlag,
                enterFromForwardDetailPage: enterFromForwardDetailPage,
                forwardUserId: forwardUserId,
            })

            this.getOtherImageList();
            if (product_type == 1) {
                this.getStandardList();
            } else if (product_type == 0) {
                this.getProductStandardList();
            }
        } else {
            let scene = decodeURIComponent(options.scene);
            if (scene == '') {
                wx.showToast({
                    title: '二维码有误',
                });
                return;
            }
            //产品id和分享者手机号码
            let productId = util.getUrlParam("i", scene);
            app.post("/product/checkProductStatus", {
                productId: productId,
            }, function (data) {
                if (app.hasData(data)) {
                    if (data == 1) {
                        let posterSharerPhone = util.getUrlParam("p", scene) || "";
                        let enterFromShopStr = util.getUrlParam("f", scene) || "1";
                        let enterFromShop = false;
                        if (enterFromShopStr == "0") {
                            enterFromShop = true;
                        } else if (enterFromShop == "1") {
                            enterFromShop = false;
                        }
                        let enterFromQr = false;
                        let enterFromQrStr = util.getUrlParam("qr", scene) || "";
                        if (enterFromQrStr == "1") {
                            enterFromQr = true;
                        }
                        let disShopId = util.getUrlParam("disShopId", scene) || '-1';
                        op.setData({
                            id: productId,
                            posterSharerPhone: posterSharerPhone,
                            disShopId: disShopId,
                            enterFromShop: enterFromShop,
                            enterFromQr: enterFromQr,
                        })
                        op.loadProductInfoById();
                    } else {
                        wx.showToast({
                            title: '商品暂未上架',
                        })
                        setTimeout(function () {
                            wx.switchTab({
                                url: '/pages/index/index',
                            })
                        }, 1000)
                    }
                }
            })
        }
        this.getcodeImg();
        setTimeout(this.getUserInfoById(), 50)
        this.getRecommendProductList();
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
    },

    closePoster(e) {
        this.setData({
            isPosterShow: false,
            posterSrc: "",
        })
    },

    savePoster(e) {
        let op = this;
        let imgSrc = op.data.posterSrc;
        if (imgSrc == "") {
            wx.showToast({
                title: '海报地址为空',
                icon: "none"
            });
            return;
        }
        wx.getImageInfo({
            src: imgSrc,
            success: res => {
                wx.saveImageToPhotosAlbum({
                    filePath: res.path,
                    success(res) {
                        wx.showToast({
                            title: '保存图片成功！',
                        })
                        op.setData({
                            isPosterShow: false,
                            posterSrc: "",
                        })
                    },
                    fail(res) {
                        //未授权操作
                        if (res.errMsg) {
                            //重新授权弹框确认
                            wx.showModal({
                                title: '温馨提示',
                                content: '您好,请先获取相册授权',
                                showCancel: false,
                                success(res) {
                                    if (res.confirm) {
                                        //重新授权弹框用户点击了确定
                                        wx.openSetting({
                                            //进入小程序授权设置页面
                                            success(settingdata) {
                                                if (settingdata.authSetting['scope.writePhotosAlbum']) {
                                                    //用户打开了保存图片授权开关
                                                } else {
                                                    //用户未打开保存图片到相册的授权开关
                                                    wx.showModal({
                                                        title: '温馨提示',
                                                        content: '授权失败，请稍后重新获取',
                                                        showCancel: false,
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
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
        let op = this;
        let allUrl = util.fillUrlParams('/pages/product/oneProduct', {
            id: op.data.id,
            is_hot: op.data.is_hot,
            card_id: op.data.card_id,
            shop_id: op.data.shop_id,
            name: op.data.name,
            type: op.data.type,
            product_type: op.data.product_type,
            main_image: op.data.main_image,
            present_price: op.data.present_price,
            repeat_purchase: op.data.repeat_purchase,
            phone: op.data.phone,
            introduce: op.data.introduce,
            video_path: op.data.video_path,
            instruction: op.data.instruction,
            buy_count: op.data.buy_count,
            deadline_time: op.data.deadline_time,
            standardList: op.data.standardList,
            pictureList: op.data.pictureList,
            showDeFlag: op.data.showDeFlag,
            showZhiFlag: op.data.showZhiFlag,
            showTiFlag: op.data.showTiFlag,
            showMeiFlag: op.data.showMeiFlag,
            showLaoFlag: op.data.showLaoFlag,
            enterFromForwardDetailPage: 1,
            forwardUserId: app.getUserId(),
        });

        let title = op.data.product_type == 0 ? '产品！' : '活动！'
        return {
            title: '分享了一个' + title,
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