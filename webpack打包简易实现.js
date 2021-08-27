//index.js
import test, { test2 } from './test'
console.log(test, test2);

//test.js
let test = { name: 'chi' }

export let test2 = 111;

export default test;

//webpack模块加载
/*

使用自执行函数，隔离作用域；

*/
(function (modules) {
    var installedModules = {};

    function __webpack_require__() {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }

        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        // Flag the module as loaded
        module.l = true;

        return module.exports;
    }
    //初始化模块的exports
    __webpack_require__.r = function (exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exports, '__esModule', { value: true });
    };

    //处理每一个export,定义属性的get方法，即使被覆写修改，值也不会发生变化
    __webpack_require__.d = function (exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, { enumerable: true, get: getter });
        }
    };

    //判断属性是否在对象中已存在
    __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    return __webpack_require__("index.js");

})({
    'index.js': (function (module, __webpack_exports__, __webpack_require__) {
        //初始化模块的exports
        __webpack_require__.r(__webpack_exports__);
        //import
        var _test__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./test */ "test.js");
        //执行代码逻辑
        console.log(_test__WEBPACK_IMPORTED_MODULE_0__['default'], _test__WEBPACK_IMPORTED_MODULE_0__['test2']);

    }),
    'test.js': (function (module, __webpack_exports__, __webpack_require__) {
        //初始化模块的exports
        __webpack_require__.r(__webpack_exports__);

        //处理每一个export,test2通过变量提升取值
        __webpack_require__.d(__webpack_exports__, "test2", function () { return test2; });

        //执行代码逻辑
        var test = {
            name: 'chi'
        };
        var test2 = 111;

        //exports导出，因为挂载到了default上，所以取值时无固定属性名的要求
        __webpack_exports__["default"] = (test);
    }),
})