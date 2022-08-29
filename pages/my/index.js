let util = require('../../utils/util.js');
const app = getApp()
const fsm = wx.getFileSystemManager();
const FILE_BASE_NAME = 'tmp_base64src';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '-1',
        nick_name: '',
        head_img_url: '',
        phone: "",
        certificateUrl: '',
        growthValue: '0',
        certificateNum: '0',

        isDistributionPartnerShow: false,
        hasDistributionRecord: false,
        hasShop: false,

        posterSrc: "",
        isPosterShow: false,
        develpmentTeamPosterSrc: "/pages/img/weekend-camp.png",
        nickName: "",
        bg1_res: "",
        avatarUrl_res: "",
        QRcodebase64: "",

        newMembersJoinTemplateId: "-06RHUlbrgdLIA_Ii7g4iNHSkXtZJ_j3g7Iq6i9N4wk"
    },

    myTeamAuth: function (e) {
        let op = this;
        op.authTemplate(op.myTeam);
    },

    myTeam: function (e) {
        let id = app.getUserId();
        app.post("/index/getShopListByUserId2", {
            userId: id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length > 0) {
                    //进入我的团队之前判断，最上级为店主还是分销合伙人
                    let allUrl = util.fillUrlParams("/pages/team/list", {
                        shopId: data[0].id
                    });
                    wx.navigateTo({
                        url: allUrl,
                    })
                } else {
                    let allUrl = util.fillUrlParams("/pages/team/list", {
                        userId: app.getUserId()
                    });
                    wx.navigateTo({
                        url: allUrl,
                    })
                }
            }
        })
    },

    closeDistributionPartnerShow: function (e) {
        this.setData({
            isDistributionPartnerShow: false,
        })
    },

    joinDistributionPartnerPrePay: function (e) {
        let op = this;
        let userId = op.data.id;
        app.post("/index/addDistributionPartnerOrder", {
            userId: userId,
        }, function (data) {
            if (typeof data == 'number') {
                let orderId = data;
                app.post('/index/joinDistributionPartnerPrePay', {
                    userId: userId,
                    id: orderId,
                    body: "分销合伙人订单",
                    total: '9.9',
                }, function (data) {
                    if (!!data && !!data.status) {
                        wx.showToast({
                            title: '后台处理失败',
                            icon: "none"
                        })
                        return;
                    }
                    if (app.hasData(data)) {
                        // 发起微信支付
                        wx.requestPayment({
                            'timeStamp': data.timeStamp,
                            'nonceStr': data.nonceStr,
                            'package': data.package,
                            'signType': data.signType,
                            'paySign': data.paySign,
                            'success': function (res) {
                                let allUrl = util.fillUrlParams('/pages/my/success', {

                                });
                                wx.navigateTo({
                                    url: allUrl
                                });
                            },
                            'fail': function (res) {
                                app.post('/index/deleteDistributionRecordByOrderId', {
                                    orderId: orderId,
                                }, function (data) {
                                    if (typeof data == 'number') {
                                        console.log("删除分销合伙人记录成功")
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    },

    toTechPage: function (e) {
        wx.navigateTo({
            url: '/pages/tech/index',
        })
    },

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

    joinDistributionPartner: function (e) {
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
            op.setData({
                isDistributionPartnerShow: true,
            })
        }
    },

    loadUserInfo: function (e) {
        let op = this;
        let id = app.getUserId();

        //判断是否注册
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

                                            //加载用户信息
                                            if (id == '-1') {
                                                op.setData({
                                                    id: id,
                                                    nick_name: '点击登录',
                                                    head_img_url: '/pages/img/default_bg.png',
                                                })
                                            } else {
                                                app.post("/index/getUserInfoById", {
                                                    id: id
                                                }, function (data2) {
                                                    if (app.hasData(data2)) {
                                                        let userInfo = data2[0];
                                                        op.setData({
                                                            id: id,
                                                            nick_name: userInfo.nick_name,
                                                            head_img_url: userInfo.head_img_url,
                                                            phone: userInfo.phone,
                                                        })
                                                        app.post("/index/getCertificateNum", {
                                                            id: id
                                                        }, function (data3) {
                                                            op.setData({
                                                                certificateNum: data3.certificateNum
                                                            })
                                                        })
                                                        //获取分销合伙人记录
                                                        op.getDistributionPartnerListByUserId()
                                                        //获取小店信息
                                                        op.loadShopInfoByUserId();
                                                    }
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

                        //加载用户信息
                        if (id == '-1') {
                            op.setData({
                                id: id,
                                nick_name: '点击登录',
                                head_img_url: '/pages/img/default_bg.png',
                            })
                        } else {
                            app.post("/index/getUserInfoById", {
                                id: id
                            }, function (data2) {
                                if (app.hasData(data2)) {
                                    let userInfo = data2[0];
                                    op.setData({
                                        id: id,
                                        nick_name: userInfo.nick_name,
                                        head_img_url: userInfo.head_img_url,
                                        phone: userInfo.phone,
                                    })
                                    app.post("/index/getCertificateNum", {
                                        id: id
                                    }, function (data3) {
                                        op.setData({
                                            certificateNum: data3.certificateNum
                                        })
                                    })
                                    //获取分销合伙人记录
                                    op.getDistributionPartnerListByUserId()
                                    //获取小店信息
                                    op.loadShopInfoByUserId();
                                }
                            })
                        }
                    }
                });
            }
        } else {
            app.post("/index/getUserInfoById", {
                id: id
            }, function (data2) {
                if (app.hasData(data2)) {
                    let userInfo = data2[0];
                    op.setData({
                        id: id,
                        nick_name: userInfo.nick_name,
                        head_img_url: userInfo.head_img_url,
                        phone: userInfo.phone,
                    })
                    app.post("/index/getCertificateNum", {
                        id: id
                    }, function (data3) {
                        op.setData({
                            certificateNum: data3.certificateNum
                        })
                    })
                    //获取分销合伙人记录
                    op.getDistributionPartnerListByUserId()
                    //获取小店信息
                    op.loadShopInfoByUserId();
                }
            })
        }
    },

    toOrderList: function (e) {
        let id = app.getUserId();
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
            let index = e.currentTarget.dataset.index;
            let allUrl = util.fillUrlParams("/pages/order/list", {
                index: index,
            })
            wx.navigateTo({
                url: allUrl,
            })
        }
    },

    toMyShop: function (e) {
        let id = app.getUserId();
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
            app.post("/index/getShopListByUserId2", {
                userId: id,
            }, function (data) {
                if (app.hasData(data)) {
                    if (data.length > 0) {
                        let allUrl = util.fillUrlParams("/pages/shop/myShop", {
                            shopId: data[0].id
                        });
                        wx.navigateTo({
                            url: allUrl,
                        })
                    } else {
                        wx.showToast({
                            title: '您未开通小店',
                        })
                        return;
                    }
                }
            })
        }
    },

    toCoopreatePage: function (e) {
        let allUrl = util.fillUrlParams("/pages/my/cooperate", {});
        wx.navigateTo({
            url: allUrl,
        })
    },

    toAboutPage: function (e) {
        let allUrl = util.fillUrlParams("/pages/my/about", {});
        wx.navigateTo({
            url: allUrl,
        })
    },

    dev: function (e) {
        wx.showToast({
            title: '敬请期待',
            icon: 'none'
        });
        return;
    },

    toCertificateList: function (e) {
        let id = app.getUserId();
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
            wx.navigateTo({
                url: '/pages/my/certificateList',
            })
        }
    },

    toGrowthValue: function (e) {
        let id = app.getUserId();
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
            wx.navigateTo({
                url: '/pages/growthValue/list',
            })
        }
    },

    toGrowthProcess: function (e) {
        let id = app.getUserId();
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
            wx.navigateTo({
                url: '/pages/growthValue/growthProcess',
            })
        }
    },

    getDistributionPartnerListByUserId: function (e) {
        let op = this;
        app.post("/index/getDistributionPartnerListByUserId", {
            userId: op.data.id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length == 0) {
                    //不是分销合伙人
                    op.setData({
                        hasDistributionRecord: false,
                    })
                } else {
                    //是分销合伙人
                    op.setData({
                        hasDistributionRecord: true,
                    })
                }
            }
        })
    },

    loadShopInfoByUserId: function (e) {
        let op = this;
        app.post("/index/getShopListByUserId", {
            userId: op.data.id,
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length == 0) {
                    //未在亲子云商开通分销小店
                    op.setData({
                        hasShop: false,
                    })
                } else {
                    //已在亲子云商开通分销小店
                    op.setData({
                        hasShop: true,
                    })
                }
            }
        })
    },

    distributionOrderAuth: function (e) {
        let op = this;
        op.authTemplate(op.distributionOrder);
    },

    distributionOrder: function (e) {
        let allUrl = util.fillUrlParams("/pages/distributionCenter/orderList", {});
        wx.navigateTo({
            url: allUrl,
        })
    },

    myEarningsAuth: function (e) {
        let op = this;
        op.authTemplate(op.myEarnings);
    },

    myEarnings: function (e) {
        let id = app.getUserId();
        //通过userId判断该用户是否是分销合伙人，该判断主要针对B端开通小店的店主
        app.post("/index/getDistributionRecordByUserId", {
            userId: id
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length == 0) {
                    //B端店主的身份进入成长GO，且该店主没有分销合伙人记录，则默认店主成为分销合伙人
                    app.post("/index/addDistributionRecordForShopkeeper", {
                        userId: id
                    }, function (data1) {
                        if (typeof data1 == 'number') {
                            let allUrl = util.fillUrlParams("/pages/profit/info", {});
                            wx.navigateTo({
                                url: allUrl,
                            })
                        }
                    })
                } else {
                    let allUrl = util.fillUrlParams("/pages/profit/info", {});
                    wx.navigateTo({
                        url: allUrl,
                    })
                }
            }
        })
    },

    getcodeImg: function (e) {
        let op = this;
        let userId = app.getUserId();
        //若为散客进入，则不执行以下代码
        if (userId != -1) {
            return new Promise((reslove, reject) => {
                app.getUrlArraybuffer("/product/generateDevelopmentTeamQrCode/" + userId, function (data) {
                    if (app.hasData(data)) {
                        let src = 'data:image/png;base64,' + wx.arrayBufferToBase64(data);
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
        }
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

    authTemplate: function (callBack) {
        let op = this;
        //该入口，用户已经注册，无需判断id
        let id = app.getUserId();
        let newMembersJoinTemplateId = op.data.newMembersJoinTemplateId;
        app.post("/index/getCEndUnAuthRecordList", {
            userId: id
        }, function (data) {
            if (app.hasData(data)) {
                if (data.length < 1) {
                    //无授权记录
                    wx.requestSubscribeMessage({
                        tmplIds: [newMembersJoinTemplateId],
                        success: (res) => {
                            // 如果用户点击允许
                            if (res[newMembersJoinTemplateId] == 'accept') {
                                app.post("/index/addOrUpdateNewMembersJoinAuthAcceptRecord", {
                                    userId: id
                                }, function (data) {})
                            }
                        },
                        fail: (res) => {},
                        complete: (res) => {
                            callBack();
                        }
                    })
                } else {
                    let authFlag = true;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].auth_status == 0) {
                            authFlag = false;
                        }
                    }

                    if (!authFlag) {
                        //有未授权记录
                        wx.requestSubscribeMessage({
                            tmplIds: [newMembersJoinTemplateId],
                            success: (res) => {
                                // 如果用户点击允许
                                if (res[newMembersJoinTemplateId] == 'accept') {
                                    app.post("/index/addOrUpdateNewMembersJoinAuthAcceptRecord", {
                                        userId: id
                                    }, function (data) {})
                                }
                            },
                            fail: (res) => {},
                            complete: (res) => {
                                callBack();
                            }
                        })
                    } else {
                        callBack();
                    }
                }
            }
        })
    },

    generateTeamPosterAuth: function (e) {
        let op = this;
        op.authTemplate(op.generateTeamPoster);
    },

    generateTeamPoster: function (e) {
        let op = this;
        op.setData({
            isPosterShow: true,
        })
        setTimeout(op.drawCanvas, 20)
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
            ctx.drawImage(QRcodeurl, util.rpx2px(250), util.rpx2px(305), util.rpx2px(65), util.rpx2px(65))

            //分割线
            ctx.setStrokeStyle('#f8f8f8')
            //距离画布x轴、y轴、宽 高
            ctx.strokeRect(0, util.rpx2px(300), canvasW, 1)
            // 微信昵称
            ctx.setFontSize(util.rpx2px(15))
            ctx.setFillStyle('black')
            ctx.fillText(op.fittingString(ctx, nickName, 130) || '', util.rpx2px(90), util.rpx2px(335))
            // 提示语
            ctx.setFontSize(util.rpx2px(12))
            ctx.setFillStyle('#989898')
            ctx.fillText('邀请你成为分销合伙人' || '', util.rpx2px(90), util.rpx2px(360))


            // 绘制头像 （放在最后画，放在前面会被后续影响，未知原因）
            op.circleImg(ctx, avatarUrl_res.path, util.rpx2px(25), util.rpx2px(315), util.rpx2px(50))
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

    getUserInfoById: function (e) {
        let op = this;
        let id = app.getUserId();
        //若为散客进入，则不执行以下代码
        if (id != -1) {
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
                        op.data.develpmentTeamPosterSrc,
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
        }
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadUserInfo();
        this.getcodeImg();
        setTimeout(this.getUserInfoById, 50)
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
            isDistributionPartnerShow: false,
        })
        this.loadUserInfo();
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