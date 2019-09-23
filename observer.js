function Observer(data) {
    this.data = data;
}

Observer.prototype = {
    constructor: Observer,

    walk: (data) => {
        Object.keys(data).forEach((key) => {
            this.convert(key, data[key]);
        })
    },

    convert: (key, val) => {
        this.defineReactive(this.data, key, val);
    },

    defineReactive: (data, key, val) => {
        const dep = new dep();
        const childObj = observe(Val);

        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: () => {
                if (dep.target) {
                    dep.depend();
                }
                return val;
            },
            set: (newVal) => {
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
    addSub: (sub) => {
        this.subs.push(sub);
    },

    depend: () => {
        Dep.target.addDep(this);
    },

    removeSub: (sub) => {
        const index = this.subs.indexOf(sub);

        if (index != -1) {
            this.subs.splice(index, 1);
        }
    },

    notify: () => {
        this.subs.forEach((sub) => {
            sub.update();
        })
    }
};

Dep.target = null;
