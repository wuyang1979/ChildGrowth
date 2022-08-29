var util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        seltProfitStart: 0,
        selfProfitHasMoreData: true,
        teamProfitStart: 0,
        teamProfitHasMoreData: true,
        pageSize: 15,
        profitList: [],

        can_withdrawal_money: "",
        already_withdrawal_money: "",
        amount: "",
        profitType: "0"
    },

    showSelfProfitList: function (e) {
        let op = this;
        if (op.data.profitType != "0") {
            op.setData({
                profitType: e.currentTarget.dataset.value,
                seltProfitStart: 0,
                selfProfitHasMoreData: true,
                teamProfitStart: 0,
                teamProfitHasMoreData: true,
                profitList: [],
            })
            op.loadSelfProfitList();
        }
    },

    showTeamProfitList: function (e) {
        let op = this;
        if (op.data.profitType != "1") {
            op.setData({
                profitType: e.currentTarget.dataset.value,
                seltProfitStart: 0,
                selfProfitHasMoreData: true,
                teamProfitStart: 0,
                teamProfitHasMoreData: true,
                profitList: [],
            })
            op.loadTeamProfitList();
        }
    },

    loadSelfProfitList: function (e) {
        let op = this;
        let profitList = op.data.profitList;
        let userId = app.getUserId();
        // 加载商户
        app.post('/profit/loadSelfProfitList', {
            start: op.data.seltProfitStart,
            num: op.data.pageSize,
            userId: userId
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length < op.data.pageSize) {
                    op.setData({
                        profitList: profitList.concat(data),
                        selfProfitHasMoreData: false
                    });
                } else {
                    op.setData({
                        profitList: profitList.concat(data),
                        selfProfitHasMoreData: true,
                        seltProfitStart: op.data.seltProfitStart + op.data.pageSize
                    })
                }
            }
        });
    },

    loadTeamProfitList: function (e) {
        let op = this;
        let profitList = op.data.profitList;
        let userId = app.getUserId();
        app.post('/profit/loadTeamProfitList', {
            start: op.data.teamProfitStart,
            num: op.data.pageSize,
            userId: userId
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length < op.data.pageSize) {
                    op.setData({
                        profitList: profitList.concat(data),
                        teamProfitHasMoreData: false
                    });
                } else {
                    op.setData({
                        profitList: profitList.concat(data),
                        teamProfitHasMoreData: true,
                        teamProfitStart: op.data.teamProfitStart + op.data.pageSize
                    })
                }
            }
        });
    },

    makePhone: function (e) {
        let phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone,
        })
    },

    inputAmountOfMoney: function (e) {
        this.setData({
            amount: e.detail.value,
        })
    },

    allWithdrawal: function (e) {
        this.setData({
            amount: this.data.can_withdrawal_money,
        })
    },

    auth: function (e) {
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
            if (op.data.amount == "") {
                wx.showToast({
                    title: '请输入金额',
                });
                return;
            }
            if (op.data.amount < 2) {
                wx.showToast({
                    title: '最低2元/笔',
                })
                return;
            }
            if (op.data.amount > 50000) {
                wx.showToast({
                    title: '最高50000元/笔',
                })
                return;
            }
            if (op.data.amount > op.data.can_withdrawal_money) {
                wx.showToast({
                    title: '可提现金额不足',
                });
                return;
            }
            //当天限额10万元
            app.post("/withdrawal/getDistributionPartnerTotalOfCurrentDay", {
                userId: id,
            }, function (data) {
                if (app.hasData(data)) {
                    let total = data.total;
                    if (total >= 100000) {
                        wx.showToast({
                            title: '限额10万元/天',
                        })
                        return;
                    } else {
                        //0.6%支付通道服务费
                        let actualAmount = (op.data.amount * (1 - 0.006)).toFixed(2);
                        wx.showModal({
                            title: "提示",
                            showCancel: true,
                            confirmText: "继续提现",
                            content: '实际到账：' + actualAmount + '元' + '\r\n' + '已扣除0.6%的支付通道服务费',
                            success: function (res) {
                                if (res.confirm) {
                                    app.post("/withdrawal/distributionPartnerStartWithdrawal", {
                                        userId: id,
                                        oldAmount: op.data.amount,
                                        actualAmount: actualAmount,
                                    }, function (data) {
                                        if (1 == data.flag) {
                                            wx.navigateTo({
                                                url: '/pages/profit/success',
                                            })
                                        } else if (0 == data.flag) {
                                            wx.showToast({
                                                title: data.msg,
                                            })
                                        }
                                    })
                                } else {}
                            }
                        })
                    }
                }
            })
        }
    },

    seeRecord: function (e) {
        wx.navigateTo({
            url: '/pages/profit/record',
        })
    },

    getDistributionPartnerProfitInfo: function (e) {
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
            app.post("/profit/getDistributionPartnerProfitInfo", {
                userId: id,
            }, function (data) {
                if (app.hasData(data)) {
                    op.setData({
                        can_withdrawal_money: data.can_withdrawal_money,
                        already_withdrawal_money: data.already_withdrawal_money,
                    })
                }
            })
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadSelfProfitList();
        this.getDistributionPartnerProfitInfo();
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
        if (this.data.profitType == "0") {
            //直卖收益列表
            if (this.data.selfProfitHasMoreData) {
                this.loadSelfProfitList();
            } else {
                wx.showToast({
                    title: '没有更多数据',
                    duration: 500,
                    icon: "none"
                })
            }
        } else if (this.data.profitType == "1") {
            //团队收益列表
            if (this.data.teamProfitHasMoreData) {
                this.loadTeamProfitList();
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

    }
})