var util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        choosedDate: "",
        recordList: {},
        monthTotal: 0,
        allAmount: "",
    },

    changeDate: function (e) {
        let op = this;
        op.setData({
            recordList: [],
            choosedDate: e.detail.value,
        })
        this.loadRecordList();
    },

    loadRecordList: function (e) {
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
            app.post("/withdrawal/getDistributionPartnerRecordList", {
                year: op.data.choosedDate,
                userId: id,
            }, function (data) {
                if (app.hasData(data)) {
                    if (data.length > 0) {
                        let monthTotal = 0;
                        for (let i = 0; i < data.length; i++) {
                            data[i].initiate_amount = parseFloat(data[i].initiate_amount).toFixed(2);
                            monthTotal += parseFloat(data[i].initiate_amount);
                        }
                        op.setData({
                            monthTotal: parseFloat(monthTotal).toFixed(2),
                        })
                    } else {
                        op.setData({
                            monthTotal: 0.00,
                        })
                    }
                    op.setData({
                        recordList: data,
                    })
                }
            })
        }
    },

    getAllAmount: function (e) {
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
            app.post("/withdrawal/getDistributionPartnerAllAmount", {
                userId: id
            }, function (data) {
                if (app.hasData(data)) {
                    op.setData({
                        allAmount: parseFloat(data.total).toFixed(2)
                    })
                }
            })
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let date = new Date();
        let year = date.getFullYear();
        this.setData({
            choosedDate: year
        })
        this.loadRecordList();
        this.getAllAmount();
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