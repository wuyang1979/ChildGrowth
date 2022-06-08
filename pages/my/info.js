let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: "",
        nick_name: "",
        head_img_url: "",
        phone: "",
        birthday: "",
        columns: ["男", "女"],
        gender: 0,
        myBaby: "",
    },

    loadUserInfo: function (e) {
        let op = this;
        app.post("/index/getUserInfoById", {
            id: op.data.id
        }, function (data2) {
            if (app.hasData(data2)) {
                let userInfo = data2[0];
                op.setData({
                    nick_name: userInfo.nick_name,
                    head_img_url: userInfo.head_img_url,
                    phone: userInfo.phone,
                    birthday: userInfo.birthday,
                    gender: userInfo.gender,
                })
            }
        })
    },

    changeBirthday: function (e) {
        let op = this;
        let birthday = e.detail.value;
        app.post("/userInfo/updateBirthdayById", {
            id: op.data.id,
            birthday: birthday,
        }, function (data) {
            if (typeof data == 'number') {
                op.setData({
                    birthday: birthday
                })
            }
        })
    },

    changeGender: function (e) {
        let op = this;
        let gender = e.detail.value;
        app.post("/userInfo/updateGenderById", {
            id: op.data.id,
            gender: gender,
        }, function (data) {
            if (typeof data == 'number') {
                op.setData({
                    gender: gender
                })
            }
        })
    },

    toAddressPage: function (e) {
        let op = this;
        app.post("/userInfo/getReceiveAddressListById", {
            userId: op.data.id
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length < 1) {
                    let allUrl = util.fillUrlParams("/pages/my/addressInfo", {
                        userId: op.data.id
                    });
                    wx.navigateTo({
                        url: allUrl,
                    })
                } else {
                    let allUrl = util.fillUrlParams("/pages/my/addressList", {
                        userId: op.data.id
                    });
                    wx.navigateTo({
                        url: allUrl,
                    })
                }
            }
        })
    },

    toBabyListPage: function (e) {
        wx.navigateTo({
            url: '/pages/my/babyList',
        })
    },

    loadbabyList: function (e) {
        let op = this;
        let userId = op.data.id;
        app.post("/userInfo/getBabyListById", {
            userId: userId,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length > 0) {
                    let myBaby = "";
                    for (let i = 0; i < data.length; i++) {
                        if (i == data.length - 1) {
                            myBaby += data[i].name;
                        } else {
                            myBaby += data[i].name + '，';
                        }
                    }
                    op.setData({
                        myBaby: myBaby,
                    })
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let id = options.id;
        this.setData({
            id: id,
        });

        this.loadUserInfo();
        this.loadbabyList();
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