/*
 * 启动
 * **/
function bootstrap(angular_app, apps, callback) {
    // 载入基本配置
    config_init(apps, function() {
        //载入语言包
        i18n_init(apps, function () {
            //启动angular
            try {
                angular_app = angular.isArray(angular_app) ? angular_app : [angular_app];
                angular.bootstrap(document, angular_app);
            } catch(e) {
                ones.DEBUG && console.error(e);
                frame_app_load_failed("bootstrap");
                return false;
            }
            //回调
            if (typeof(callback) === 'function') {
                callback();
            }
        });
    });
}


/**
 * 返回应用视图url
 * */
function appView(view, app) {
    app = app || ones.app_info.app;
    return sprintf('apps/%s/views/%s', app, ones.DEBUG ? view+'?'+Math.random() : view);
}

/*
* 强制转换数组中的字段类型
* */
function force_format_data_fields(data, map) {
    if(angular.isArray(data)) {
        var response = [];
        for(var i=0;i<data.length;i++) {
            response.push(force_format_data_fields(data[i], map));
        }
        return response;
    } else {
        angular.forEach(map, function(type, field) {
            data[field] = eval(type+'('+data[field]+')');
        });
        return data;
    }
}

/**
 * 字典转数组
 * */
function reIndex(data) {
    var a = [];
    angular.forEach(data, function(item){
        a.push(item);
    });
    return a;
};

/*
* 数组去重复
* */
function array_unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}
/*
* 根据某字段值过滤数组
* */
function filter_array_by_field(array, field, value) {
    var response = [];
    angular.forEach(array, function(item, k) {
        if(item[field] === value) {
            response.push(item);
        }
    });
    return response;
}

/*
* 检测节点是否已授权
* @todo 检测flag
* */
function is_node_authed(node) {
    if(node in ones.authed_nodes) {
        return true;
    } else {
        ones.DEBUG && console.debug('unauthed node: '+ node);
        return false;
    }
}

/*
* 返回一个指定范围内的随机整数
* */
function get_random_int(min, max) {
    var range = max - min;
    var rand = Math.random();
    return(min + Math.round(rand * range));
}

/*
* 格式化数字显示
* */
function to_decimal_display(value) {
    return value ? accounting.formatNumber(Number(value), ones.system_preference.decimal_scale) : value;
}

/*
* 返回数据的主显
* */
function to_item_display(item, data_api) {
    var label_field='name';
    data_api = data_api || {config: {}};

    if(data_api.config.label_field) {
        label_field = data_api.config.label_field;
    }

    if(typeof data_api.unicode === 'function') {
        return data_api.unicode(item);
    } else {
        return item[label_field] || '';
    }
}
/*
* 将一个包含多个元素属性的item，返回lable=>'', value=>''格式
* eg: {label: 'hello', value: 1}
* */
function item_to_kv(item, data_api) {
    var label_field='name', value_field='id', label;
    data_api = data_api || {config: {}};

    if(data_api.config.label_field) {
        label_field = data_api.config.label_field;
    }
    if(data_api.config.value_field) {
        value_field = data_api.config.value_field;
    }
    if(typeof data_api.unicode === 'function') {
        label = data_api.unicode(item);
    } else {
        label = item[label_field] || '';
    }

    return {label: label, value: item[value_field]};
}


/*
* 生成单据编号
* */
function generate_bill_no(prefix) {
    var time_str = 'ABCDEFGHIJKL';
    var date = new Date();
    var year = String(date.getFullYear());
    var day = date.getDate();
    day = day < 10 ? '0' + String(day) : String(day);
    return sprintf('%(prefix)s%(year)s%(month)s%(day)s%(second)s %(rand)s%(string)s', {
        prefix: prefix ? prefix.toUpperCase()+' ': '',
        year: time_str[year[3]] + year[2],
        month: time_str[date.getMonth()],
        day: day,
        second: String(date.getTime()).slice(5, 10),
        rand: get_random_int(10, 99),
        string: randomString(2).toUpperCase()
    });
}


/**
 * 转驼峰命名
 * */
var camelCase = (function () {
    var DEFAULT_REGEX = /[-_]+(.)?/g;

    function toUpper(match, group1) {
        return group1 ? group1.toUpperCase() : '';
    }
    return function (str, delimiters) {
        return str.replace(
            delimiters ? new RegExp('[' + delimiters + ']+(.)?', 'g') : DEFAULT_REGEX, toUpper
        ).ucfirst();
    };
})();

/**
 * 驼峰中间加空格
 * */
var camelCaseSpace = function(str) {
    try {
        str = camelCase(str);
    } catch(e) {}

    return str.replace(/([a-z0-9]+)([A-Z])/g, '$1 $2').replace('_', ' ');
};

/**
 * 转下划线命名
 * eg: productCategory => product_category
 * */
var underlineCase = (function() {
    var DEFAULT_REGEX = /([a-z0-9])([A-Z])/g;

    function toLower(match, group1, group2) {
        return group1 + (group2 ? '_'+group2.toLowerCase() : '');
    }
    return function (str, delimiters) {
        return str.replace(
            delimiters ? new RegExp('[' + delimiters + ']+(.)?', 'g') : DEFAULT_REGEX, toLower
        ).lcfirst();
    };
})();

/*
* 应用是否启用
* */
var is_app_loaded = function(app) {
    return ones.loaded_apps && ones.loaded_apps.indexOf(app) >= 0;
};

/**
 * sprintf 变量
 * */
var apply_sprintf = function(str, p) {
    if(str && str.indexOf("%s") >= 0) {
        p = angular.isArray(p) ? p : [p];
        p.unshift(str);
        //console.log(p);
        str = sprintf.apply(null, p);
    }
    return str;
};

/*
* post_data_format
* 修正post的数据格式
* */
var post_data_format = function(data, column_def, $injector) {

    angular.forEach(data, function(v, k) {
        // __ 双下划线结尾为前端临时
        if(k.slice(-2) === '__') {
            delete(data[k]);
            return;
        }

        // 日期
        if(v instanceof Date) {
            data[k] = moment(v).format('YYYY-MM-DD HH:mm:ss');
            return;
        }

        // 控件
        if(column_def && column_def[k]) {
            switch(column_def[k].widget) {
                case "item_select": // 项目选择
                    data[k] = angular.isArray(v) ? v.join() : v;
                    break;
            }
        }

    });
    return data;
};

/*
* 二次格式化后端REST接口返回的数据
* @param object data 需格式化数据
* @param object fieldsDefine 字段配置
* @param scope 直接赋值至scope
* @param $parse $parse对象
* */
var format_data_form_rest = function(data, fieldsDefine, scope, $parse) {
    angular.forEach(fieldsDefine, function(config) {
        if(undefined === data[config.field_model] || null === data[config.field_model]) {
            return;
        }

        switch(config.widget) {
            case 'datetime':
            case 'date':
                data[config.field_model] = new Date(data[config.field_model]);
                break;
        }

        var getter = $parse(config['ng-model']);
        getter.assign(scope, data[config.field_model] || undefined);

    });

    return data;
};

/*
* 仅格式化数据
* */
var format_rest_data = function(data, fieldsDefine) {
    angular.forEach(data, function(v, k) {
        if(fieldsDefine[k] && fieldsDefine[k].widget) {
            var config = fieldsDefine[k];
            switch(config.widget) {
                case 'datetime':
                case 'date':
                    data[k] = new Date(v);
                    break;
            }
        }
    });
    return data;
};

/*
* 将 /key/value/key2/value2 转化为{} 形式参数，主要用于$routeParams.extra
* */
var parse_arguments = function(argv) {
    argv = argv || '';

    argv = argv.split('/');
    if(!argv[0]) {
        argv.shift();
    }

    var result = {};
    for(var i=0; i<argv.length; i++) {
        if((i+1) % 2 ==0) {
            continue;
        }
        result[argv[i]] = argv[i+1];
    }

    return result;
};

/**
 * angular.extend 多级合并
 * */
angular.deep_extend = function(dst) {
    angular.forEach(arguments, function(obj) {
        if (obj !== dst) {
            angular.forEach(obj, function(value, key) {
                if(angular.isObject(dst[key]) || angular.isArray(dst[key])){
                    angular.deep_extend(dst[key], value);
                } else {
                    dst[key] = angular.copy(value);
                }
            });
        }
    });
    return dst;
};

/**
 * 获取数据源中相应value的label
 * */
var get_data_source_display = function(data_source, value) {
    for(var i=0; i<data_source.length;i++) {
        if(data_source[i].value == value) {
            return data_source[i].label;
        }
    }
    return value;
};

/*
* 生成一个不重复的ID
*
* 公司签名ID + 当前时间
* */
var get_unique_id = function(prefix) {
    var sign_id = ones.caches.getItem('company_sign_id');
    var number = parseInt(sign_id) + parseInt(moment().format('YYYYMMDDHHmmss')) + parseInt(100*Math.random());
    return (prefix || '') + String(number);
};

/*
* 返回链接样式
* */
var to_link_style = function(label) {
    return sprintf('<a>%s</a>', label);
};

/**
 * 对象成员数量
 * */
count_object_size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/*
* 返回对号/叉号
* */
var to_boolean_icon = function(bool) {
    var cls = bool ? 'check-circle text-success' : 'minus-circle text-danger';
    return '<i class="fa fa-'+cls+'"></i>';
};

/*
* 返回应用名称
* */
var to_app_name = function(alias) {
    var app_name = _(alias+'.APP_NAME');
    return app_name === 'APP_NAME' ? camelCaseSpace(alias) : app_name;
};

/*
* 返回用户创建/负责状态
* */
var to_belongs_to_user_icon = function(item) {

    if(!item) {
        return;
    }

    var user_info = ones.user_info;
    if(("head_id" in item) &&  item.head_id == user_info.id) {
        return sprintf('<i class="fa fa-user text-danger"></i>');
    }
    if(("user_id" in item && item.user_id == user_info.id)) {
        return sprintf('<i class="fa fa-user text-primary"></i>');
    }
};

function nl2br(str) {
    return str.replace("\n", '<br />');
}

/*
* 验证email
* */
function is_email(str) {
    var regex = /^(?:\w+\.?)*\w+@(?:\w+\.)*\w+$/;;
    return regex.test(str);
}

/*
* 返回datetime-local 默认值
* */
function get_date_for_input(timestamp, mask) {
    var d;
    if(timestamp instanceof Date) {
        d = timestamp;
    } else if(timestamp) {
        timestamp = parseInt(timestamp);
        if(String(timestamp) <= 10) {
            timestamp *= 1000;
        }
        d = new Date(timestamp);
        d.setHours(d.getHours()-8);
    } else {
        d  = new Date();
        d.setHours(d.getHours()-8);
    }
    return new Date(d.format(mask || "yyyy-MM-dd HH:mm").replace(" ", "T"))
}

/**
 * 生成随机字符串
 * */
function randomString(len) {
    len = len || 6;
    var $chars = 'abcdefghijklmnopqrstuvwxyz01234567890';
    var maxPos = $chars.length;
    var str = '';
    for (var i = 0; i < len; i++) {
        str += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return str;
}

function display_as_barcode(element, string, width, height, displayValue) {

    JsBarcode(element.find('img'), string, {
        width: width || 180,
        height: height || 40,
        quite: 10,
        format: "CODE128",
        displayValue: false === displayValue ? false : true,
        fontSize: 12,
        backgroundColor:"",
        lineColor:"#000"
    });
}



/*
* JS 四则运算精度解决
* */
//加法
Number.prototype.add = function(arg){
    var r1,r2,m;
    try{r1=this.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=arg.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2));
    return (this*m+arg*m)/m;
};

//减法
Number.prototype.sub = function (arg){
    return this.add(-arg);
};

//乘法
Number.prototype.mul = function (arg)
{
    var m=0,s1=this.toString(),s2=arg.toString();
    try{m+=s1.split(".")[1].length}catch(e){}
    try{m+=s2.split(".")[1].length}catch(e){}
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
};

//除法
Number.prototype.div = function (arg){
    var t1=0,t2=0,r1,r2;
    try{t1=this.toString().split(".")[1].length}catch(e){}
    try{t2=arg.toString().split(".")[1].length}catch(e){};
    with(Math){
        r1=Number(this.toString().replace(".",""));
        r2=Number(arg.toString().replace(".",""));
        return (r1/r2)*pow(10,t2-t1);
    }
};


/**
 * 数组对象扩展
 * */
//删除元素
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
//去重复元素
Array.prototype.delRepeat=function(){
    var newArray=[];
    var provisionalTable = {};
    for (var i = 0, item; (item= this[i]) != null; i++) {
        if (!provisionalTable[item]) {
            newArray.push(item);
            provisionalTable[item] = true;
        }
    }
    return newArray;
};
//在index位置插入元素
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

String.prototype.ucfirst = function() {
    return this[0].toUpperCase() + this.substr(1);
};
String.prototype.lcfirst = function(){
    return this[0].toLowerCase() + this.substr(1);
};

String.prototype.start_with = function(start) {
    return this.slice(0, start.length) === start;
};
String.prototype.end_with = function(end) {
    return this.slice(0-end.length) === end;
};