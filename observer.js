function Observer(data) {
    this.data = data;
    this.walk(data);
}

Observer.prototype = {
    constructor: Observer,

    walk: function(data) {
        Object.keys(data).forEach((key) => {
            this.convert(key, data[key]);
        })
    },

    convert: function(key, val) {
        this.defineReactive(this.data, key, val);
    },

    defineReactive: function(data, key, val) {
        const dep = new Dep();
        let childObj = observe(val);

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function() {
                if (dep.target) {
                    dep.depend();
                }
                return val;
            },
            set: function(newVal) {
                if (newVal === val) {
                    return;
                }

                val = newVal;

                childObj = observe(newVal);

                dep.notify();
            }
        })
    }
}

function observe(value, vm) {
    if (!value || typeof value !== 'object') {
        return;
    }

    return new Observer(value);
}

let uid = 0;

function Dep() {
    this.uid = uid++;
    this.subs = [];
}

Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },

    depend: function() {
        Dep.target.addDep(this);
    },

    removeSub: function(sub) {
        const index = this.subs.indexOf(sub);

        if (index != -1) {
            this.subs.splice(index, 1);
        }
    },

    notify: function() {
        this.subs.forEach((sub) => {
            sub.update();
        })
    }
};

Dep.target = null;
