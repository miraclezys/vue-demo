function MVVM(options = {}) {
    this.$options = options;

    this._data = options.data;

    // 数据代理
    // vm.xxx = vm._data.xxx
    Object.keys(this._data).forEach((key) => {
        this._proxyData(key);
    });

    // 初始化计算属性
    this._initComputed();

    observe(this._data, this);

    this.$compile = new Compile(options.el || document.body, this);
}

MVVM.prototype = {
    constructor: MVVM,
    $watch: function (key, cb, options) {
        new Watcher(this, key, cb);
    },
    _proxyData: function (key) {
        Object.defineProperty(this, key, {
            configurable: false,
            enumerable: true,
            get: () => {
                return this._data[key];
            },
            set: (val) => {
                this._data[key] = val;
            }
        })
    },
    _initComputed: function () {
        let computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(key => {
                Object.defineProperty(this, key, {
                    configurable: false, 
                    enumerable: true,
                    get: typeof computed[key] === 'function' ? computed[key] : computed[key].get,
                    set: () => {}
                })
            });
        }
    }
}