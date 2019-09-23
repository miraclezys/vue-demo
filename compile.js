function Compile(el, vm) {
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);

    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    constructor: Compile,

    node2Fragment: function(el) {
        const fragment = document.createDocumentFragment();
        let child;

        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            console.log(el, child, el.childrens)
            fragment.appendChild(child);
            console.log(fragment)
        }
        return fragment;
    },

    init: function() {
        console.log(this.$fragment)
        this.compileElement(this.$fragment);
    },

    compileElement: function(el) {
        let childNodes = el.childNodes;
        let _this = this;

        [].slice.call(childNodes).forEach(node => {
            const text = node.textContent;
            const reg = /\{\{(.*)\}\}/;

            if (_this.isElementNode(node)) {
                _this.compile(node);
            } else if (_this.isTextNode(node) && reg.test(text)) {
                _this.compileText(node, RegExp.$1.trim());
            }

            if (node.childNodes && node.childNodes.length) {
                _this.compileElement(node);
            }
        });
    },

    compile: function(node) {
        const nodeAttrs = node.attributes;
        let _this = this;

        [].slice.call(nodeAttrs).forEach((attr) => {
            const attrName = attr.name;

            if(_this.isDirective(attrName)) {
                const exp = attr.value;
                const dir = attrName.substring(2);

                // 事件指令
                if (_this.isEventDirective(dir)) {
                    compileUtil.eventHandler(node, _this.$vm, exp, dir);
                } else {
                    compileUtil[dir] && compileUtil[dir](node, _this.$vm, exp);
                }

                node.removeAttribute(attrName);
            }
        })
    },

    compileText: function(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },

    isDirective: function(attr) {
        return attr.indexOf('v-') === '0';
    },

    isEventDirective: function(dir) {
        return dir.indexOf('on') === 0;
    },

    isElementNode: function(node) {
        return node.nodeType === 1;
    },

    isTextNode: function(node) {
        return node.nodeType === 3;
    }
}

const compileUtil = {
    text: function(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },

    html: function(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },

    model: function(node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        const _this = this;
        let val = this._getVMVal(vm, exp);

        node.addEventListener('input', (e) => {
            const newValue = e.target.value;

            if (val === newValue) {
                return;
            }

            _this.setVMVal(vm, exp, newValue);
            val = newValue;
        })
    },

    class: function(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },

    bind: function(node, vm, exp, dir) {
        const updateFn = updater[dir + 'Updater'];

        updaterFn && updaterFn(node, this._getVMVal(vm, exp));

        new Watcher(vm, exp, (value, oldValue) => {
            updateFn && updateFn(node, value, oldValue);
        });
    },

    eventHandler: function(node, vm, exp, dir) {
        const eventType = dir.split(':')[1];
        const fn = vm.$options.methods && vm.$options.methods[exp];

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },

    _getVMVal: function(vm, exp) {
        let val = vm;

        exp = exp.split('.');
        exp.forEach((k) => {
            val = val[k];
        });

        return val;
    },

    _setVMVal: function(vm, exp, value) {
        let val = vm;
        exp = exp.split('.');
        exp.forEach((k, i) => {
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        })
    }
}

const updater = {
    textUpdater: (node, value) => {
        node.textConent = typeof value === 'undefined' ? '' : value;
    },

    htmlUpdater: (node, value) => {
        node.innerHTML = typeof value === 'undefined' ? '' : value;
    },

    classUpdater: (node, value, oldValue) => {
        let className = node.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');

        const space = className && String(value) ? ' ' : '';

        node.className = className + space + value;
    },

    modelUpdater: (node, value, oldValue) => {
        node.value = typeof value === 'undefined' ? '' : value;
    }
}