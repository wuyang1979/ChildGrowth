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
        sessionKey: "",
        productList: [],
        start: 0,
        pageSize: 10,
        hasMoreData: true,
        searchStart: 0,
        searchHasMoreData: true,

        searchValue: "",
        inputShowed: false,
        cityCode: 0,
        cityName: '',

        isDistributor: false,
        activityType1: "",
        activityType2: "",
    },

    chooseAllActivityType1: function (e) {
        let op = this;
        if (op.data.activityType1 != "") {
            op.setData({
                activityType1: e.currentTarget.dataset.value,
                start: 0,
                hasMoreData: true,
                searchStart: 0,
                searchHasMoreData: true,
                productList: [],
            })
            if (op.data.searchValue == "") {
                //搜索关键字为空
                op.loadAllProduct();
            } else {
                op.loadSearchProduct();
            }
        }
    },

    chooseChildren: function (e) {
        let op = this;
        if (op.data.activityType1 != "0") {
            op.setData({
                activityType1: e.currentTarget.dataset.value,
                start: 0,
                hasMoreData: true,
                searchStart: 0,
                searchHasMoreData: true,
                productList: [],
            })
            if (op.data.searchValue == "") {
                //搜索关键字为空
                op.loadAllProduct();
            } else {
                op.loadSearchProduct();
            }
        }
    },

    chooseParentAndChildren: function (e) {
        let op = this;
        if (op.data.activityType1 != "1") {
            op.setData({
                activityType1: e.currentTarget.dataset.value,
                start: 0,
                hasMoreData: true,
                searchStart: 0,
                searchHasMoreData: true,
                productList: [],
            })
            if (op.data.searchValue == "") {
                //搜索关键字为空
                op.loadAllProduct();
            } else {
                op.loadSearchProduct();
            }
        }
    },

    chooseWeekendCamp: function (e) {
        let op = this;
        op.setData({
            activityType2: op.data.activityType2 === '0' ? "" : e.currentTarget.dataset.value,
            start: 0,
            hasMoreData: true,
            searchStart: 0,
            searchHasMoreData: true,
            productList: [],
        })
        if (op.data.searchValue == "") {
            //搜索关键字为空
            op.loadAllProduct();
        } else {
            op.loadSearchProduct();
        }
    },

    chooseVacationCamp: function (e) {
        let op = this;
        op.setData({
            activityType2: op.data.activityType2 === '1' ? "" : e.currentTarget.dataset.value,
            start: 0,
            hasMoreData: true,
            searchStart: 0,
            searchHasMoreData: true,
            productList: [],
        })
        if (op.data.searchValue == "") {
            //搜索关键字为空
            op.loadAllProduct();
        } else {
            op.loadSearchProduct();
        }
    },

    chooseWinterAndSummerCamp: function (e) {
        let op = this;
        op.setData({
            activityType2: op.data.activityType2 === '2' ? "" : e.currentTarget.dataset.value,
            start: 0,
            hasMoreData: true,
            searchStart: 0,
            searchHasMoreData: true,
            productList: [],
        })
        if (op.data.searchValue == "") {
            //搜索关键字为空
            op.loadAllProduct();
        } else {
            op.loadSearchProduct();
        }
    },

    toTechPage: function (e) {
        wx.navigateTo({
            url: '/pages/tech/index',
        })
    },

    loadAllProduct: function () {
        let op = this;
        let productList = op.data.productList;
        // 加载商户
        app.post('/product/getAllList', {
            start: op.data.start,
            num: op.data.pageSize,
            type: 1,
            activityType1: op.data.activityType1,
            activityType2: op.data.activityType2,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].main_image.indexOf("http") == -1) {
                            data[i].main_image = app.qinzi + data[i].main_image;
                        }
                        data[i].showDeFlag = false;
                        data[i].showZhiFlag = false;
                        data[i].showTiFlag = false;
                        data[i].showMeiFlag = false;
                        data[i].showLaoFlag = false;
                        if (data[i].wuyu_type.indexOf("1") != -1) {
                            data[i].showDeFlag = true;
                        }
                        if (data[i].wuyu_type.indexOf("2") != -1) {
                            data[i].showZhiFlag = true;
                        }
                        if (data[i].wuyu_type.indexOf("3") != -1) {
                            data[i].showTiFlag = true;
                        }
                        if (data[i].wuyu_type.indexOf("4") != -1) {
                            data[i].showMeiFlag = true;
                        }
                        if (data[i].wuyu_type.indexOf("5") != -1) {
                            data[i].showLaoFlag = true;
                        }
                    }
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
        });
    },

    inputTyping: function (e) {
        this.setData({
            searchValue: e.detail.value
        });
    },

    clearInput: function () {
        this.setData({
            productList: [],
            start: 0,
            hasMoreData: true,
            searchValue: "",
            inputShowed: false,
        });
        this.loadAllProduct();
    },

    showInput: function () {
        this.setData({
            inputShowed: true
        });
    },

    clearSearch: function (e) {
        this.setData({
            productList: [],
            start: 0,
            searchStart: 0,
            hasMoreData: true,
            searchHasMoreData: true,
            searchValue: "",
            inputShowed: false,
        });
        this.loadAllProduct();
    },

    searchSubmit: function (e) {
        this.setData({
            productList: [],
            start: 0,
            hasMoreData: true,
            searchStart: 0,
            searchHasMoreData: true,
            inputShowed: false
        });
        if (this.data.searchValue != '') {
            this.loadSearchProduct();
        } else {
            this.loadAllProduct();
        }
    },

    loadSearchProduct: function (e) {
        let op = this;
        let productList = op.data.productList;
        // 加载商户
        app.post('/product/getSearchList', {
            searchValue: op.data.searchValue,
            start: op.data.searchStart,
            num: op.data.pageSize,
            type: 1,
            activityType1: op.data.activityType1,
            activityType2: op.data.activityType2,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].main_image.indexOf("http") == -1) {
                            data[i].main_image = app.qinzi + data[i].main_image;
                        }
                        data[i].showDeFlag = false;
                        data[i].showZhiFlag = false;
                        data[i].showTiFlag = false;
                        data[i].showMeiFlag = false;
                        data[i].showLaoFlag = false;
                        if (data[i].wuyu_type.indexOf("1") != -1) {
                            data[i].showDeFlag = true;
                        }
                        if (data[i].wuyu_type.indexOf("2") != -1) {
                            data[i].showZhiFlag = true;
                        }
                        if (data[i].wuyu_type.indexOf("3") != -1) {
                            data[i].showTiFlag = true;
                        }
                        if (data[i].wuyu_type.indexOf("4") != -1) {
                            data[i].showMeiFlag = true;
                        }
                        if (data[i].wuyu_type.indexOf("5") != -1) {
                            data[i].showLaoFlag = true;
                        }
                    }
                }
                if (data.length < op.data.pageSize) {
                    op.setData({
                        productList: productList.concat(data),
                        searchHasMoreData: false
                    });
                } else {
                    op.setData({
                        productList: productList.concat(data),
                        searchHasMoreData: true,
                        searchStart: op.data.searchStart + op.data.pageSize
                    })
                }
            }
        });
    },

    loadCity: function () {
        let op = this;
        app.loadCity(function (city) {
            op.setData({
                cityCode: city.cityCode,
                cityName: city.cityName
            });
        })
    },

    // loadUserInfo: function (e) {
    //     let op = this;
    //     let id = app.getUserId();

    //     //判断是否注册
    //     if (id == "-1") {
    //         if (app.globalData.openId == "") {
    //             wx.login({
    //                 success: res => {
    //                     let code = res.code;
    //                     if (code) {
    //                         app.post("/business/info/getSessionKeyAndOpenIdByCode", {
    //                             code: code,
    //                         }, function (data) {
    //                             if (app.hasData(data)) {
    //                                 app.globalData.openId = data.openId;
    //                                 app.globalData.sessionKey = data.sessionKey;
    //                                 app.post('/business/info/c_end_code', {
    //                                     openId: data.openId
    //                                 }, function (data1) {
    //                                     if (app.hasData(data1)) {
    //                                         if (data1.id == null || data1.id == "-1") {
    //                                             wx.setStorageSync('id', '-1');
    //                                             id = '-1';
    //                                         } else {
    //                                             wx.setStorageSync('id', data1.id);
    //                                             id = data1.id;
    //                                         }

    //                                         //加载用户信息
    //                                         if (id == '-1') {
    //                                             op.setData({
    //                                                 id: id,
    //                                                 nick_name: '游客',
    //                                                 head_img_url: '/pages/img/default_bg.png',
    //                                             })
    //                                         } else {
    //                                             app.post("/index/getUserInfoById", {
    //                                                 id: id
    //                                             }, function (data2) {
    //                                                 if (app.hasData(data2)) {
    //                                                     let userInfo = data2[0];
    //                                                     op.setData({
    //                                                         id: id,
    //                                                         nick_name: userInfo.nick_name,
    //                                                         head_img_url: userInfo.head_img_url,
    //                                                     })
    //                                                 }
    //                                             })
    //                                         }
    //                                     }
    //                                 });
    //                             }
    //                         })
    //                     }
    //                 }
    //             });
    //         } else {
    //             app.post('/business/info/c_end_code', {
    //                 openId: app.globalData.openId
    //             }, function (data1) {
    //                 if (app.hasData(data1)) {
    //                     if (data1.id == null || data1.id == "-1") {
    //                         wx.setStorageSync('id', '-1');
    //                         id = '-1';
    //                     } else {
    //                         wx.setStorageSync('id', data1.id);
    //                         id = data1.id;
    //                     }

    //                     //加载用户信息
    //                     if (id == '-1') {
    //                         op.setData({
    //                             id: id,
    //                             nick_name: '游客',
    //                             head_img_url: '/pages/img/default_bg.png',
    //                         })
    //                     } else {
    //                         app.post("/index/getUserInfoById", {
    //                             id: id
    //                         }, function (data2) {
    //                             if (app.hasData(data2)) {
    //                                 let userInfo = data2[0];
    //                                 op.setData({
    //                                     id: id,
    //                                     nick_name: userInfo.nick_name,
    //                                     head_img_url: userInfo.head_img_url,
    //                                 })
    //                             }
    //                         })
    //                     }
    //                 }
    //             });
    //         }
    //     } else {
    //         app.post("/index/getUserInfoById", {
    //             id: id
    //         }, function (data2) {
    //             if (app.hasData(data2)) {
    //                 let userInfo = data2[0];
    //                 op.setData({
    //                     id: id,
    //                     nick_name: userInfo.nick_name,
    //                     head_img_url: userInfo.head_img_url,
    //                 })
    //             }
    //         })
    //     }
    //     app.post("/index/getDistributionShopByUserId", {
    //         userId: id,
    //     }, function (data) {
    //         if (app.hasData(data)) {
    //             if (data.length > 0) {
    //                 //是分销商
    //                 op.setData({
    //                     isDistributor: true,
    //                 })
    //             } else {
    //                 //不是分销商
    //                 op.setData({
    //                     isDistributor: false,
    //                 })
    //             }
    //         }
    //     })
    // },

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
        let activity_type1 = e.currentTarget.dataset.activity_type1;
        let activity_type2 = e.currentTarget.dataset.activity_type2;
        let shop_id = e.currentTarget.dataset.shop_id;
        let company_name = e.currentTarget.dataset.company_name;
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
            activity_type1: activity_type1,
            activity_type2: activity_type2,
            shop_id: shop_id,
            company_name: company_name,
            wuyuType: wuyuType,
        })

        wx.navigateTo({
            url: allUrl,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let activityType2 = options.activityType2;
        this.setData({
            activityType2: activityType2
        })
        this.loadAllProduct();
        // this.loadUserInfo();

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
    onShow: function () {
        this.setData({
            productList: [],
            start: 0,
            hasMoreData: true,
            searchStart: 0,
            searchHasMoreData: true,

            searchValue: "",
            inputShowed: false,
        })
        // this.loadUserInfo();
        this.loadAllProduct();
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
            searchStart: 0,
            searchHasMoreData: true,

            searchValue: "",
            inputShowed: false,
        });
        this.loadAllProduct();

        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.searchValue == "") {
            if (this.data.hasMoreData) {
                this.loadAllProduct();
            } else {
                wx.showToast({
                    title: '没有更多数据',
                    duration: 500,
                    icon: "none"
                })
            }
        } else {
            if (this.data.searchHasMoreData) {
                this.loadSearchProduct();
            } else {
                wx.showToast({
                    title: '没有更多数据',
                    duration: 500,
                    icon: "none"
                })
            }
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        let op = this;
        let allUrl = util.fillUrlParams('/pages/index/index', {
            productList: op.data.productList,
            start: op.data.start,
            pageSize: op.data.pageSize,
            hasMoreData: op.data.hasMoreData,
        });

        return {
            title: '分享了一些活动！',
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