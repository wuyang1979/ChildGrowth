//app.js

// import 'umtrack-wx';

App({
    qinzi: "https://www.qinzi123.com",
    userCode: "0",
    openId: "",
    canIUseGetUserProfile: false,

    onLoad() {
        var self = this
        // 获取小程序更新机制兼容
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()
            //1. 检查小程序是否有新版本发布
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    //检测到新版本，需要更新，给出提示
                    wx.showModal({
                        title: '更新提示',
                        content: '检测到新版本，是否下载新版本并重启小程序？',
                        success: function (res) {
                            if (res.confirm) {
                                //2. 用户确定下载更新小程序，小程序下载及更新静默进行
                                self.downLoadAndUpdate(updateManager)
                            } else if (res.cancel) {
                                //用户点击取消按钮的处理，如果需要强制更新，则给出二次弹窗，如果不需要，则这里的代码都可以删掉了
                                wx.showModal({
                                    title: '温馨提示~',
                                    content: '本次版本更新涉及到新的功能添加，旧版本无法正常访问的哦~',
                                    showCancel: false, //隐藏取消按钮
                                    confirmText: "确定更新", //只保留确定更新按钮
                                    success: function (res) {
                                        if (res.confirm) {
                                            //下载新版本，并重新应用
                                            self.downLoadAndUpdate(updateManager)
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            })
        } else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }

        // 登录
        wx.login({
            success: res => {
                var code = res.code;
                if (code) {
                    this.userCode = code;
                    this.globalData.userCode = code;
                } else {}

                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        });
        if (wx.getUserProfile) {
            this.canIUseGetUserProfile = true
        }

        //获取屏幕宽度，获取自适应单位
        wx.getSystemInfo({
            success: function (res) {
                self.globalData.rpx = res.windowWidth / 375;
            },
        })
    },

    /**
     * 下载小程序新版本并重启应用
     */
    downLoadAndUpdate: function (updateManager) {
        var self = this
        wx.showLoading();
        //静默下载更新小程序新版本
        updateManager.onUpdateReady(function () {
            wx.hideLoading()
            //新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
        })
        updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
                title: '已经有新版本了哟~',
                content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
        })
    },

    login: function () {

        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    },

    onLaunch: function () {
        this.onLoad();
    },

    post: function (loadUrl, postData, func) {
        wx.request({
            url: this.qinzi + loadUrl,
            data: postData,
            method: "POST",
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                if (!!res.data.code) {
                    if (res.data.code != "00000000") {
                        wx.showToast({
                            title: res.data.msg,
                            icon: 'none',
                            duration: 2000
                        });
                    } else {
                        func(res.data.data);
                    }
                } else
                    func(res.data);
            }
        })
    },

    getUrlArraybuffer: function (loadUrl, func) {
        wx.request({
            url: this.qinzi + loadUrl,
            method: "GET",
            responseType: 'arraybuffer',
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                if (!!res.data.code) {
                    if (res.data.code != "00000000") {
                        wx.showToast({
                            title: res.data.msg,
                            icon: 'none',
                            duration: 2000
                        });
                    } else {
                        func(res.data.data);
                    }
                } else
                    func(res.data);
            }
        })
    },

    deleteUrl: function (loadUrl, func) {
        wx.request({
            url: this.qinzi + loadUrl,
            method: "DELETE",
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                func(res.data.data);
            }
        })
    },

    getUserId: function () {
        var id = wx.getStorageSync('id');
        return id == '' ? '-1' : id;
    },


    onGotUserInfo: function (e, func) {
        if (Object.keys(this.globalData.userInfo) == 0) {
            this.getUserProfile(e, func);
        } else {
            this.onGotUserInfoV1(e, func);
        }
    },

    getUserProfile(e, getFunction) {
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: '完善资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                this.globalData.userInfo = res.userInfo;
                this.globalData.hasUserInfo = true;
                getFunction();
            },
            fail: (res) => {
                wx.switchTab({
                    url: '/pages/index/index',
                })
                wx.showToast({
                    title: '请点允许继续',
                    icon: "none"
                })
            },
            complete: (res) => {

            }
        })
    },

    onGotUserInfoV1: function (e, getFunction) {
        if (this.getUserId() != "-1") {
            getFunction();
            return;
        }
        if (this.globalData.userInfo != null) {
            var op = this;
            if (op.globalData.openId == "") {
                op.post('/business/info/getSessionKeyAndOpenIdByCode', {
                    code: op.userCode,
                }, function (data) {
                    op.openId = data.openId;
                    op.globalData.openId = data.openId;
                    op.globalData.sessionKey = data.sessionKey;
                    op.post('/business/info/c_end_code', {
                        openId: op.openId
                    }, function (data1) {
                        if (op.hasData(data1)) {
                            if (data1.id == null || data1.id == "-1") {
                                //未注册

                                // wx.showModal({
                                //     title: '提示',
                                //     content: '请注册会员信息',
                                //     success: function (res) {
                                //         if (res.confirm) {
                                //             op.modifyCard();
                                //         }
                                //     }
                                // });
                            } else {
                                wx.setStorageSync('id', data1.id);
                                if (op.globalData.userInfo.avatarUrl != null) {
                                    op.post("/business/updateCendHeadingImgUrl", {
                                        id: data1.id,
                                        headingImgUrl: op.globalData.userInfo.avatarUrl,
                                    }, function (data2) {
                                        if (op.hasData(data2)) {} else {}
                                    })
                                }
                                getFunction();
                            }
                        }
                    });
                });
            } else {
                op.post('/business/info/c_end_code', {
                    openId: op.globalData.openId
                }, function (data3) {
                    if (op.hasData(data3)) {
                        if (data3.id == null || data3.id == "-1") {
                            //未注册

                            // wx.showModal({
                            //     title: '提示',
                            //     content: '请注册会员信息',
                            //     success: function (res) {
                            //         if (res.confirm) {
                            //             op.modifyCard();
                            //         }
                            //     }
                            // });
                        } else {
                            wx.setStorageSync('id', data3.id);
                            if (op.globalData.userInfo.avatarUrl != null) {
                                op.post("/business/updateCendHeadingImgUrl", {
                                    id: data3.id,
                                    headingImgUrl: op.globalData.userInfo.avatarUrl,
                                }, function (data4) {
                                    if (op.hasData(data4)) {} else {}
                                })
                            }
                            getFunction();
                        }
                    }
                });
            }


        }
    },

    // 后续要重构采用 result{code: msg: data}这种结构返回
    hasData: function (data) {
        if (data == undefined || data == null) return false;
        if (!!data.code && data.code != "00000000") return false;
        return true;
    },

    globalData: {
        userInfo: {},
        hasUserInfo: false,
        listDataUpdated: false,
        messageDataUpdated: false,
        messageBussinessUpdated: false,
        openId: "",
        userCode: "",
        joinerOpenId: "",
        rpx: "",
    }
})