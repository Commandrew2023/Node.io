(function (module) {
    module.Settings = {
        canvas : {
            width : 400,
            height : 400,
            size : 1200,
            layout : '1:1',
            forElement : function () {
                let str = this.layout.split(':'),
                    sw = Number(str[0]), sh = Number(str[1]);
                return {
                    width : this.size * (sw > sh ? 1 : (sw / sh)),
                    height : this.size * (sh > sw ? 1 : (sh / sw))
                };
            },
            update : function () {
                let size = document.querySelector('#canvas-size-ghti');
                this.size = size.value;
            },
            set : function (key, value) {
                this[key] = value;
            }
        },
    };
    setInterval(() => {
        Object.keys(module.Settings).forEach(setting => {
            module.Settings[setting].update();
        });
    }, 1);
})(this);
