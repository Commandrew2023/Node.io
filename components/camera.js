(function (module) {
    module.Camera = {
        offset : {
            x : 0,
            y : 0
        },
        mouseRef : {
            x : 0,
            y : 0
        },
        fromRel : function (x, y) {
            return {
                x : x * this.scale + (this.mouseRef.x + this.offset.x * this.scale),
                y : y * this.scale + (this.mouseRef.y + this.offset.y * this.scale)
            };
        },
        toRel : function (x, y) {
            return {
                x : (x - (this.mouseRef.x + this.offset.x * this.scale)) / this.scale,
                y : (y - (this.mouseRef.y + this.offset.y * this.scale)) / this.scale
            };
        },
        scale : 1.00
    };
})(this);
