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
        phone: "",
        start: 0,
        pageSize: 10,
        hasMoreData: true,
        productList: [],
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
                    phone: data.phone || "",
                })
            }
        })
    },

    toTechPage: function (e) {
        wx.navigateTo({
            url: '/pages/tech/index',
        })
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
                console.log("自增访问次数成功");
            } else {
                console.log("自增访问次数失败");
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let op = this;
        if (!options.scene || options.scene == '') {
            //通过分享进入
            op.setData({
                shopId: options.shopId,
            })
        } else {
            let scene = decodeURIComponent(options.scene);
            if (scene == '') {
                wx.showToast({
                    title: '二维码有误',
                });
                return;
            }
            let shopId = util.getUrlParam("shopId", scene);
            if (shopId != "") {
                this.setData({
                    shopId: shopId,
                })
            } else {
                wx.showToast({
                    title: '二维码有误',
                    icon: "none"
                })
            }
        }
        this.loadShopInfoById();
        this.loadAllProductByShopId();
        this.addVisitCountByShopId();

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
        var allUrl = util.fillUrlParams('/pages/shop/info', {
            shopId: op.data.shopId,
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