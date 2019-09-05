function observe(data) {
    if (!data || typeof data !== 'object') {
        return;
    }

    // 遍历属性进行监听
    Object.keys(data).forEach((key) => {
        defineReactive(data, key, data[key]);
    })
}

function defineReactive(data, key, val) {
    let dep = new Dep();

    // 监听子属性
    observe(val);

    Object.defineProperties(data, key, {
        enumerable: true,
        configurable: false,
        get: () => {
            // 添加watcher
            Dep.target && dep.addSub(Dep.target);

            return val;
        },
        set: (newVal) => {
            console.log('监听到数据的变化');
            val = newVal;

            // 数据发生变化，通知所有订阅者
            dep.notify();
        }
    })
}                                

function Dep() {
    this.subs = [];
}

Dep.prototype = {
    addSub: (sub) => {
        this.subs.push(sub);
    },
    notify: () => {
        this.subs.forEach((sub) => {
            sub.uodate();
        })
    }
}