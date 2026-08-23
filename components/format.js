(function (module) {
    /* 
       NOTE:
        This is mostly just a wrapper class that keeps stuff consistently OOP. 
        I plan to add a few more methods which will be exterior to the 'Formats' 
        object. 
    */
    class Format {
        constructor (name) {
            let format = module.Flats.Formats[name];

            /* Confirm named format exists */
            if (!format) {
                throw new Error(`No format named ${name} was found.`);
            }

            /* Read-only binding with format object */
            this.name = name;
            this.attributes = {
                format,
                style : {
                    stroke : {
                        color : '#000000',
                        opacity : 255,
                        width : 1
                    },
                    fill : {
                        color : '#96aa14',
                        opacity : 255
                    },
                    special : {

                    }
                }  
            };
        }
        static hexToRGB (hex) {
            /* Credit to @Tim Down on stackoverflow.com */
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
                a :parseInt(result[4], 16)
            } : null;
        }
        static componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        static rgbToHex(c) {
            return "#" + this.componentToHex(c.r) + this.componentToHex(c.g) + this.componentToHex(c.b) + this.componentToHex(c.a);
        }
        static lerp (v1, v2, a) {
            return (1 - a) * v1 + a * v2;
        }
        static colorLerp (c1, c2, alpha) {
            return {
                r : Math.round(this.lerp(c1.r, c2.r, alpha)),
                g : Math.round(this.lerp(c1.g, c2.g, alpha)),
                b : Math.round(this.lerp(c1.b, c2.b, alpha)),
                a : Math.round(this.lerp(c1.a, c2.a, alpha)),
            };
        }
        use (ctx, element, check) {
            /* Call the format 'main' rendering method */
            if (this.attributes.format.main !== undefined) {
                this.attributes.format.main(ctx, element, this.attributes.style, check);
            }
        }
        getColor (type, ext='') {
            const style = this.attributes.style;
            if (type === 'stroke') {
                return style.stroke.color + ((style.stroke.opacity < 16 ? '0' : '') + style.stroke.opacity.toString(16));
            } else if (type === 'fill') {
                return style.fill.color + ((style.fill.opacity < 16 ? '0' : '') + style.fill.opacity.toString(16));
            } else if (type === 'special') {
                return style.special?.[ext].color + ((style.special?.[ext].opacity < 16 ? '0' : '') + style.special?.[ext].opacity.toString(16));
            }
        }
        setColor (type, value, alpha=false) {
            const style = this.attributes.style;
            if (type === 'stroke') {
                style.stroke.color = value;
                style.stroke.opacity = alpha !== false ? alpha : style.stroke.opacity;
            } else if (type === 'fill') {
                style.fill.color = value;
                style.fill.opacity = alpha !== false ? alpha : style.fill.opacity;
            }
        }
    }
    module.Format = Format;
})(this);
