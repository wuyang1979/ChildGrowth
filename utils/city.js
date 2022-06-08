var jsonData = require('../json/cityCode.js');

function init() {
    var cityArray = [
        [],
        [],
        [],
    ];
    for (let i = 0, len = jsonData.citylist.length; i < len; i++) {
        //获取省级数据
        let province = jsonData.citylist[i];
        let pObject = {
            id: province.p_code,
            name: province.p_name
        }
        //赋值第一个数组 省级数据
        cityArray[0].push(pObject);
    }
    // 默认北京市 市辖区
    //市级数据
    let city = jsonData.citylist[0].s;
    for (let j = 0; j < city.length; j++) {
        let cObject = {
            id: city[j].s_code,
            name: city[j].s_name
        }
        //赋值第二个数组 市级数据
        cityArray[1].push(cObject);
        //区级数据

    }
    let region = city[0].c;
    for (let k = 0; k < region.length; k++) {
        let rObject = {
            id: region[k].c_code,
            name: region[k].c_name
        }
        // 赋值区级数据
        cityArray[2].push(rObject);
    }
    return cityArray;
}

function changeCloumt(cityArray, index, column, province_index) {
    if (column == 0) {
        cityArray[1] = [];
        cityArray[2] = [];
        //第一列切换
        let city = jsonData.citylist[index].s;
        for (let j = 0; j < city.length; j++) {
            let cObject = {
                id: city[j].s_code,
                name: city[j].s_name
            }
            //赋值第二个数组 市级数据
            cityArray[1].push(cObject);
            //区级数据
        }
        let region = city[0].c;
        for (let k = 0; k < region.length; k++) {
            let rObject = {
                id: region[k].c_code,
                name: region[k].c_name
            }
            // 赋值区级数据
            cityArray[2].push(rObject);
        }
        return cityArray;
    }
    if (column == 1) {
        //第二列切换
        cityArray[2] = [];
        let province = cityArray[0][province_index];
        for (let i = 0, len = jsonData.citylist.length; i < len; i++) {
            let p = jsonData.citylist[i];
            if (province.id == p.p_code) {
                province = p;
            }
        }
        //获取已存在的省市区
        let city = province.s;
        let region = city[index].c;
        for (let k = 0; k < region.length; k++) {
            let rObject = {
                id: region[k].c_code,
                name: region[k].c_name
            }
            // 赋值区级数据
            cityArray[2].push(rObject);
        }
        return cityArray;
    }
}

function getCityCode(array) {
    let arrayText = [];
    let p = array[0];
    let c = array[1];
    let r = array[2];
    let city;
    for (let i = 0, len = jsonData.citylist.length; i < len; i++) {
        let province = jsonData.citylist[i];
        if (p == province.p_code) {
            city = province.s;
            arrayText[0] = province.p_name;
        }
    }
    let region;
    for (let j = 0; j < city.length; j++) {
        if (c == city[j].s_code) {
            region = city[j].c;
            arrayText[1] = city[j].s_name
        }
    }
    for (let k = 0; k < region.length; k++) {
        if (r == region[k].c_code) {
            arrayText[2] = region[k].c_name
        }
    }
    return arrayText;
}

function getCityIndex(cityArray, array) {
    let arrayText = [];
    let p = array[0];
    let c = array[1];
    let r = array[2];
    arrayText[0] = cityArray[0][p];
    arrayText[1] = cityArray[1][c];
    arrayText[2] = cityArray[2][r];
    return arrayText;
}
module.exports = {
    getCityCode: getCityCode,
    init: init,
    changeCloumt: changeCloumt,
    getCityIndex: getCityIndex
}