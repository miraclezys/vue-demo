function Watcher(vm, expOrFn, cb) {
    this.cb = cb;
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.depIds = {};

    if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
    } else {
        this.getter = this.parseGetter(expOrFn.trim());
    }

    this.value = this.get();
}

Watcher.prototype = {
    constructor: Watcher,

    update: function() {
        this.run();
    },

    run: function() {
        const value = this.get();
        const ildValue = this.value;

        if (value !== oldValue) {
            this.value = value;
            this.cb.call(this.vm, value, oldValue);
        }
    },

    addDep: function(dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },

    get: function(key) {
        Dep.target = this;
        const value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    },

    parseGetter: function(exp) {
        if (/[^\w.$]/.test(exp)) return;

        const exps = exp.split('.');

        return (obj) => {
            for(let i=0, len = exps.length; i<len; i++) {
                if (!obj) return;
                obj = obj[exps[i]];
            }

            return obj;
        }
    }
}