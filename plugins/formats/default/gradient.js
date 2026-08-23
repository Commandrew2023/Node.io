(function (module) {
    module.Flats.Formats["default:gradient"] = {
        name : 'default:ellipse',
        formal_name : 'Gradient',
        minNodes : 4,
        maxNodes : 4,
        nodes : {
            mouseOn : {
                color : 'yellow'
            },
            mouseOff : {
                color : 'green'
            },
            width : 5,
            height : 5,
            $move : function (element, node) {}
        },
        export : {
            registerVariables : {
                "#color1" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.gradient1',
                    handler : (element) => {
                        let format = Exporter.getter(
                            element, 
                            Exporter.path('#format')
                        );
                        return Object.values(
                            module.Format.hexToRGB(
                                format.getColor('special', 'gradient1')
                            )
                        ).join(', ');
                    }
                },
                "#color2" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.gradient2',
                    handler : (element) => {
                        let format = Exporter.getter(
                            element, 
                            Exporter.path('#format')
                        );
                        return Object.values(
                            module.Format.hexToRGB(
                                format.getColor('special', 'gradient2')
                            )
                        ).join(', ');
                    }
                },
            },
            script : function (element) {
                return `pushMatrix();
translate(#center);
rotate(#angle);
for (var i = 0; i < #height; i++) {
    var c = lerpColor(color(#color1), color(#color2), i / #height);
    fill(c);
    stroke(c);
    rect(-#width / 2, -#height / 2 + i, #width, 1);
}
popMatrix();`;
            }
        },
        main : function (ctx, element, style) {
            let mouse = module.Interactor.mouse,
                trans = element.attributes.transforms,
                verts = trans.scale.verts,
                nodes = element.nodes,
                format = element.attributes.format;

            ctx.save();

            /* Open path */
            ctx.beginPath();
            let x = nodes[0].x,
                y = nodes[0].y,
                width = Element.dist(nodes[0], nodes[3]),
                height = Element.dist(nodes[0], nodes[1]);
            ctx.translate(x, y);
            ctx.rotate(trans.rotation.radians);

            var color1 = Format.hexToRGB(format.getColor('special', 'gradient1')),
                color2 = Format.hexToRGB(format.getColor('special', 'gradient2'));

            for (var i = 0; i < height; i++) {
                ctx.beginPath();
                var color = Format.colorLerp(color1, color2, i / height);
                ctx.fillStyle = Format.rgbToHex(color);
                ctx.strokeStyle = Format.rgbToHex(color);
                ctx.rect(0, i, width, 2);
                ctx.fill();
            }

            ctx.beginPath();
            ctx.fillStyle = '#00000000';
            ctx.rect(0, 0, width, height);
            ctx.fill();

            ctx.rotate(-trans.rotation.radians);
            ctx.translate(-x, -y);

            /* Check if mouse is inside drawing path */
            element.checkPath(ctx);

            ctx.restore();

        },
        dropdown_fields : {
            'Gradient' : {
                'group' : true,
                'index' : 2,
                'as' : 'last'
            },
            'Gradient-Color-1' : {
                "alt_name" : "Color 1",
                'type' : 'input',
                'assignGroup' : 'Gradient',
                'input_type' : 'color',
                'tags' : [{name:'alpha',value:true}],
                'element_identifier' : 'element-gradient-color-f',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.gradient1 = element.attributes.format.attributes.style.special.gradient1 || {};
                        element.attributes.format.attributes.style.special.gradient1.color = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.element-gradient-color-f');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            style.special.gradient1 = style.special.gradient1 || {};
                            style.special.gradient1.color = style.special.gradient1.color || '#ff0000';
                            inputElement.value = style.special.gradient1.color;
                        }
                    }}
                ]
            },
            'Gradient-Opacity-1' : {
                "alt_name" : "Opacity 1",
                'type' : 'input',
                'assignGroup' : 'Gradient',
                'input_type' : 'range',
                'tags' : [{name:'min',value:'0'},{name:'max',value:'255'}],
                'element_identifier' : 'element-gradient-opacity-f',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.gradient1 = element.attributes.format.attributes.style.special.gradient1 || {};
                        element.attributes.format.attributes.style.special.gradient1.opacity = Math.floor(parseFloat(target.value));
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.element-gradient-opacity-f');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            style.special.gradient1 = style.special.gradient1 || {};
                            style.special.gradient1.opacity = style.special.gradient1.opacity || 255;
                            inputElement.value = style.special.gradient1.opacity;
                        }
                    }}
                ]
            },
            'Gradient-Color-2' : {
                "alt_name" : "Color 2",
                'type' : 'input',
                'assignGroup' : 'Gradient',
                'input_type' : 'color',
                'tags' : [{name:'alpha',value:true}],
                'element_identifier' : 'element-gradient-color-l',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.gradient2 = element.attributes.format.attributes.style.special.gradient2 || {};
                        element.attributes.format.attributes.style.special.gradient2.color = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.element-gradient-color-l');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            style.special.gradient2 = style.special.gradient2 || {};
                            style.special.gradient2.color = style.special.gradient2.color || '#00ff00';
                            inputElement.value = style.special.gradient2.color;
                        }
                    }}
                ]
            },
            'Gradient-Opacity-2' : {
                "alt_name" : "Opacity 2",
                'type' : 'input',
                'assignGroup' : 'Gradient',
                'input_type' : 'range',
                'tags' : [{name:'min',value:'0'},{name:'max',value:'255'}],
                'element_identifier' : 'element-gradient-opacity-l',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.gradient2 = element.attributes.format.attributes.style.special.gradient2 || {};
                        element.attributes.format.attributes.style.special.gradient2.opacity = Math.floor(parseFloat(target.value));
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.element-gradient-opacity-l');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            style.special.gradient2 = style.special.gradient2 || {};
                            style.special.gradient2.opacity = style.special.gradient2.opacity || 255;
                            inputElement.value = style.special.gradient2.opacity;
                        }
                    }}
                ]
            },
            'Style' : {
                disabled : true
            },
            'Fill-Color' : {
                disabled : true
            },
            'Fill-Opacity' : {
                disabled : true
            },
            'Stroke-Color' : {
                disabled : true
            },
            'Stroke-Opacity' : {
                disabled : true
            },
            'Stroke-Width' : {
                disabled : true
            }
        }
    }; 
})(this);
