var util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        shopId: 0,
        userId: "",
        searchValue: "",
        start: 0,
        searchStart: 0,
        pageSize: 15,
        hasMoreData: true,
        searchHasMoreData: true,
        teamMemberList: [],

        teamMemberCount: 0,
    },

    inputTyping: function (e) {
        this.setData({
            searchValue: e.detail.value
        });
    },

    clearInput: function () {
        this.setData({
            teamMemberList: [],
            start: 0,
            hasMoreData: true,
            searchValue: "",
        });
        this.getAllTeamMemberList();
    },

    clearSearch: function (e) {
        this.setData({
            teamMemberList: [],
            start: 0,
            searchStart: 0,
            hasMoreData: true,
            searchHasMoreData: true,
            searchValue: "",
        });
        this.getAllTeamMemberList();
    },

    searchSubmit: function (e) {
        this.setData({
            teamMemberList: [],
            start: 0,
            hasMoreData: true,
            searchStart: 0,
            searchHasMoreData: true,
        });
        if (this.data.searchValue != '') {
            this.getSearchTeamMemberList();
        } else {
            this.getAllTeamMemberList();
        }
    },

    getSearchTeamMemberList: function (e) {
        let op = this;
        let teamMemberList = op.data.teamMemberList;
        app.post("/team/getSearchTeamMemberList", {
            shopId: op.data.shopId,
            start: op.data.start,
            num: op.data.pageSize,
            searchValue: op.data.searchValue,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length < op.data.pageSize) {
                    op.setData({
                        teamMemberList: teamMemberList.concat(data),
                        teamMemberCount: data.length,
                        searchHasMoreData: false
                    });
                } else {
                    op.setData({
                        teamMemberList: teamMemberList.concat(data),
                        teamMemberCount: data.length,
                        searchHasMoreData: true,
                        searchStart: op.data.searchStart + op.data.pageSize
                    })
                }
            }
        })
    },

    getAllTeamMemberList: function (e) {
        let op = this;
        let teamMemberList = op.data.teamMemberList;
        app.post("/team/getAllTeamMemberList", {
            userId: op.data.userId,
            shopId: op.data.shopId,
            start: op.data.start,
            num: op.data.pageSize,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length < op.data.pageSize) {
                    op.setData({
                        teamMemberList: teamMemberList.concat(data),
                        teamMemberCount: data.length,
                        hasMoreData: false
                    });
                } else {
                    op.setData({
                        teamMemberList: teamMemberList.concat(data),
                        teamMemberCount: data.length,
                        hasMoreData: true,
                        start: op.data.start + op.data.pageSize
                    })
                }
            }
        })
    },

    customerInfo: function (e) {
        let id = e.currentTarget.dataset.id;
        let headImgUrl = e.currentTarget.dataset.head_img_url;
        let phone = e.currentTarget.dataset.phone;
        let nickName = e.currentTarget.dataset.nick_name;
        let allUrl = util.fillUrlParams("/pages/team/info", {
            id: id,
            headImgUrl: headImgUrl,
            phone: phone,
            nickName: nickName,
        });
        wx.navigateTo({
            url: allUrl,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let userId = "";
        let shopId = 0;
        if (!options.shopId || options.shopId == '') {
            userId = options.userId;
        } else {
            shopId = parseInt(options.shopId);
        }
        this.setData({
            shopId: shopId,
            userId: userId,
        })
        this.getAllTeamMemberList();
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
            teamMemberList: [],
            start: 0,
            hasMoreData: true,
            searchStart: 0,
            searchHasMoreData: true,

            searchValue: "",
        });
        this.getAllTeamMemberList();

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
                this.getAllTeamMemberList();
            } else {
                wx.showToast({
                    title: '没有更多数据',
                    duration: 500,
                    icon: "none",
                })
            }
        } else {
            if (this.data.searchHasMoreData) {
                this.getSearchTeamMemberList();
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