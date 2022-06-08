let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        certificateId: "",
        babyList: [],
        isChild: true,
        babyId: "",
        name: "",
        isCoverShow: false,
        certificateUrl: "",
    },

    loadBabyList: function (e) {
        let op = this;
        let userId = app.getUserId();
        app.post("/userInfo/getBabyListById", {
            userId: userId,
        }, function (data) {
            if (app.hasData(data)) {
                op.setData({
                    babyList: data,
                })
            }
        })
    },

    inputName: function (e) {
        this.setData({
            name: e.detail.value,
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

    changeAdultOrChild: function (e) {
        this.setData({
            isChild: !this.data.isChild,
            babyId: "",
            name: "",
        })
    },

    selectBaby: function (e) {
        let babyId = e.currentTarget.dataset.id;
        let name = e.currentTarget.dataset.name;
        if (this.data.babyId == babyId) {
            this.setData({
                babyId: "",
                name: "",
            })
        } else {
            this.setData({
                babyId: babyId,
                name: name,
            })
        }
    },

    addBaby: function (e) {
        let op = this;
        let allUrl = util.fillUrlParams("/pages/my/inputBabyInfo", {
            certificateId: op.data.certificateId
        })
        wx.navigateTo({
            url: allUrl,
        })
    },

    auth: function (e) {
        let op = this;
        if (op.data.isChild) {
            if (!op.checkChild()) {
                return;
            }
        } else {
            if (!op.checkAdult()) {
                return;
            }
        }
        op.generateCertificate();
    },

    checkChild: function (e) {
        if (this.data.name == "") {
            wx.showToast({
                title: '请选择宝贝',
                icon: "none"
            })
            return false;
        }
        return true;
    },

    checkAdult: function (e) {
        if (this.data.name == "") {
            wx.showToast({
                title: '请填写姓名',
                icon: "none"
            })
            return false;
        }
        return true;
    },

    generateCertificate: function (e) {
        let op = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        app.getUrlArraybuffer("/certificate/generateCertificate/" + op.data.name + '-' + op.data.certificateId, function (data2) {
            if (app.hasData(data2)) {
                let certificateUrl = 'data:image/png;base64,' + wx.arrayBufferToBase64(data2);
                op.setData({
                    isCoverShow: true,
                    certificateUrl: certificateUrl,
                })
                setTimeout(() => {
                    wx.hideLoading()
                }, 500)
            }
        })
    },

    closeCover: function (e) {
        wx.switchTab({
            url: '/pages/my/index',
        })
    },

    save: function (e) {
        let op = this;
        //获取文件管理器对象
        const fs = wx.getFileSystemManager()
        let number = Math.random();
        //文件保存路径
        const Imgpath = wx.env.USER_DATA_PATH + '/certificate' + number + '.png'
        //_this.data.imgsrc   base64图片文件
        let imageSrc = op.data.certificateUrl.replace(/^data:image\/\w+;base64,/, '')

        //写入本地文件
        fs.writeFile({
            filePath: Imgpath,
            data: imageSrc,
            encoding: 'base64',
            success(res) {
                //保存到手机相册
                wx.saveImageToPhotosAlbum({
                    filePath: Imgpath,
                    success(res) {
                        wx.showToast({
                            title: '保存成功',
                            icon: 'success'
                        })
                    },
                    fail: function (err) {}
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let certificateId = options.certificateId;
        this.setData({
            certificateId: certificateId,
        })
        this.loadBabyList();
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