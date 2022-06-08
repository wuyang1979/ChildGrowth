let util = require('../../utils/util.js');
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        certificateId: "",
        name: "",
        gender: "",
        birthday: "",
        columns: ["男", "女"],
        certificateUrl: "",
        isChild: true,
        isCoverShow: false,
        certificateUrl: "",
    },

    inputName: function (e) {
        this.setData({
            name: e.detail.value,
        })
    },

    changeGender: function (e) {
        this.setData({
            gender: e.detail.value,
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

    changeBirthday: function (e) {
        this.setData({
            birthday: e.detail.value,
        })
    },

    changeAdultOrChild: function (e) {
        this.setData({
            isChild: !this.data.isChild,
            name: "",
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
                title: '请填写宝贝姓名',
                icon: "none"
            })
            return false;
        }
        if (this.data.gender == "") {
            wx.showToast({
                title: '请选择宝贝性别',
                icon: "none"
            })
            return false;
        }
        if (this.data.birthday == "") {
            wx.showToast({
                title: '请选择出生日期',
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
        if (op.data.isChild) {
            app.post("/userInfo/addBabyInfo", {
                parent_id: app.getUserId(),
                name: op.data.name,
                gender: op.data.gender,
                birthday: op.data.birthday,
            }, function (data) {
                if (typeof data == 'number') {
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
                }
            })
        } else {
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
        }
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