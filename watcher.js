Watcher.prototype = {
    get: (key) => {
        Dep.target = this;
        this.value = data[key];
        Dep.target = null;
    } 
}