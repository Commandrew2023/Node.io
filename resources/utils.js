(function (module) {
    module.Parse = {
        Int : function (value) {
            return parseInt(value || '0');
        },
        Float : function (value) {
            return parseFloat(value || '0');
        },
    };
    module.Round = function (value) {
        return {
            /* Rounds value to significant figures */
            to : function (digits) {
                let float = value * (10 ** digits),
                    int = ~~(float),
                    roundBefore = Math.round(float - int);
                return ((int + roundBefore) * (10 ** -digits)).toFixed(digits);
            }
        };
    };
    module.Angle = function (value, degrees) {
        return value * (degrees ? 180 / Math.PI : 1);
    };
    module.ObjectSearch = function (object, key, depthLimiter=Infinity) {
        if (depthLimiter === 0) return null;

        for (let k of Object.keys(object)) {
            if (k !== key) {
                if (object[k] instanceof Object) {
                    let result = ObjectSearch(object[k], key, depthLimiter - 1);
                    if (result !== null) {
                        return result;
                    }
                } else {
                    continue;
                }
            } else {
                return object[k];
            }
        }
        return null;
    };
})(this);
