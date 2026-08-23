(function (module) {
    module.mergeObjects = function (target, object) {
        Object.keys(target).forEach(key => {
            if (typeof target[key] === "object" && typeof object[key] === "object") {
                module.mergeObjects(target[key], object[key]);
            } else {
                object[key] = target[key];
            }
        });
        return object;
    }
    module.DeepMerge = function (template, target, options, path) {
        options = options || {};
        path = path || [];
        var blockedPaths = options.blockedPaths || [];
        for (var key in target) {
            var temp = template[key], tar = target[key];
            path.push(key);
            if (blockedPaths.includes(path.join('.'))) {
                path.pop();
                continue;
            }
            if (temp instanceof Object && tar instanceof Object) {
                module.DeepMerge(temp, tar, options, path);
            } else {
                template[key] = tar;
            }
            path.pop();
        }
        return template;
    }
})(this);
