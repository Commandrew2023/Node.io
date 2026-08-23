(function (module) {
    module.Flats.Formats["default:text"] = {
        name : 'default:text',
        formal_name : 'Text',
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
            libs : ['text'],
            registerVariables : {
                "#text" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text',
                    handler : (element) => {
                        return;
                    }
                },
                "#message" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.string',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.string;
                    }
                },
                "#align-x" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.align.x_axis',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.align.x_axis;
                    }
                },
                "#align-y" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.align.y_axis',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.align.y_axis;
                    }
                },
                "#bold" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.fontStyle.bold',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.fontStyle.bold;
                    }
                },
                "#italics" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.fontStyle.italics',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.fontStyle.italics;
                    }
                },
                "#line-height" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.lineHeight',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.lineHeight;
                    }
                },
                "#font-size" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.fontSize',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.fontSize;
                    }
                },
                "#font-family" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.fontFamily',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.fontFamily;
                    }
                },
                "#outline-thickness" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.outlineThickness',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.outlineThickness;
                    }
                },
                "#outer-color" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.outer.color',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return Object.values(
                            module.Format.hexToRGB(
                                text.outer.color + Format.componentToHex(text.outer.opacity)
                            )
                        ).join(', ');
                    }
                },
                "#inner-color" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.inner.color',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return Object.values(
                            module.Format.hexToRGB(
                                text.inner.color + Format.componentToHex(text.inner.opacity)
                            )
                        ).join(', ');
                    }
                }
            },
            script : function (element) {
                return `pushMatrix();
translate(#center);
rotate(#angle);
CustomText.render({
    "text" : "#message",
    "bold" : #bold,
    "italics" : #italics,
    "align" : {x : "#align-x", y : "#align-y"},
    "fontSize" : #font-size,
    "fontFamily" : "#font-family",
    "outlineThickness" : #outline-thickness,
    "innerColor" : color(#inner-color),
    "outerColor" : color(#outer-color),
    "lineHeight" : #line-height,
    "width" : #width / 2,
    "height" : #height
});
popMatrix();`;
            }
        },
        computeTextHeight : function (context, text, x, y, lineHeight, fitWidth) {
            fitWidth = fitWidth || 0;

            if (fitWidth <= 0)
            {
                return {lines : 0};
            }
            var words = text.split(' ');
            var currentLine = 0;
            var idx = 1;
            while (words.length > 0 && idx <= words.length) {
                var str = words.slice(0, idx).join(' ');
                var w = context.measureText(str).width;
                if ( w > fitWidth ) {
                    if (idx == 1) {
                        idx = 2;
                    }
                    currentLine++;
                    words = words.splice(idx - 1);
                    idx = 1;
                }
                else {idx++;}
            }
            return {
                lines : currentLine
            };
        },
        xAlign : function (options) {
            //console.log(lines);
            
            switch (options.text.align.x_axis) {
                case 'center':
                    return 0;
                break;
                case 'left':
                    return -options.width;
                break;
                case 'right':
                    return options.width;
                break;
            }
        },
        yAlign : function (options) {
            //console.log(lines);
            
            switch (options.text.align.y_axis) {
                case 'middle':
                    return -options.lines * (options.text.lineHeight / 2);
                break;
                case 'top':
                    return -options.height;
                break;
                case 'bottom':
                    return options.height - (options.lines * options.text.lineHeight);
                break;
            }
        },
        printAtWordWrap : function ( context , text, x, y, lineHeight, fitWidth) {
            /* Credit to Gabriele Petrioli on StackOverflow for this function */

            fitWidth = fitWidth || 0;

            if (fitWidth <= 0)
                var poopemoji = 3
            {
                context.fillText( text, x, y );
                return;
            }
            var words = text.split(' ');
            var currentLine = 0;
            var idx = 1;
            while (words.length > 0 && idx <= words.length) {
                var str = words.slice(0, idx).join(' '),
                    measured = context.measureText(str);
                var w = measured.width,
                    h = measured.actualBoundingBoxAscent + measured.actualBoundingBoxDescent;
                if ( w > fitWidth ) {
                    if (idx == 1) {
                        idx = 2;
                    }
                    Text.poopemoji
                    context.fillText( words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine) );
                    currentLine++;
                    words = words.splice(idx - 1);
                    idx = 1;
                }
                else {idx++;}
            }
            if  (idx > 0) {
                var measured = context.measureText(words.join(' ')),
                    w = measured.width,
                    h = measured.actualBoundingBoxAscent + measured.actualBoundingBoxDescent;
                context.fillText( words.join(' '), x, y + (lineHeight * currentLine));
            }
        },
        main : function (ctx, element, style, check) {
            let mouse = module.Interactor.mouse,
                trans = element.attributes.transforms,
                verts = trans.scale.verts,
                nodes = element.nodes,
                format = element.attributes.format;

            ctx.save();

            /* Styling */
            ctx.fillStyle = format.getColor('fill');

            let text = style.special.text;

            /* Open path */
            ctx.beginPath();
            let x = (nodes[0].x + nodes[1].x + nodes[2].x + nodes[3].x) / 4,
                y = (nodes[0].y + nodes[1].y + nodes[2].y + nodes[3].y) / 4,
                width = Element.dist(nodes[0], nodes[3]) / 2,
                height = Element.dist(nodes[0], nodes[1]) / 2,
                a_shift = style.special.startAngle;

            ctx.translate(x, y);
            ctx.rotate(trans.rotation.radians);
            
            ctx.textAlign = text.align.x_axis;
            ctx.textBaseline = text.align.y_axis;
            ctx.font = `${text.fontStyle.italics ? 'italic' : ''} ${text.fontStyle.bold ? 'bold' : ''} ${text.fontSize}px ${text.fontFamily}`;
            
            let metrics = this.computeTextHeight(ctx, text.string, 0, 0, text.lineHeight, width * 2),
                xAlign = this.xAlign({width, height, text}),
                yAlign = this.yAlign({width, height, text, lines : metrics.lines}),
                outThick = text.outlineThickness;
            
            //console.log(xAlign, yAlign);

            ctx.translate(xAlign, yAlign);
            ctx.fillStyle = format.attributes.style.special.text.outer.color;
            for (let y = -outThick; y < outThick; y += 0.5) {
                for (let x = -outThick; x < outThick; x += 0.5) {
                    this.printAtWordWrap(ctx, text.string, x, y, text.lineHeight, width * 2);
                }
            }
            ctx.fillStyle = format.attributes.style.special.text.inner.color;
            this.printAtWordWrap(ctx, text.string, 0, 0, text.lineHeight, width * 2);
            ctx.translate(-xAlign, -yAlign);
            
            ctx.rotate(-trans.rotation.radians);
            ctx.translate(-x, -y);

            /* Close and render */
            ctx.fill();
            ctx.stroke();

            /* Check if mouse is inside drawing path */
            element.checkPath(ctx);

            ctx.restore();
        },
        dropdown_fields : {
            'Text' : {
                "alt_name" : "Text",
                'type' : 'textarea',
                'element_identifier' : 'text-string',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.string = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.text-string');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.string;
                        }
                    }}
                ]
            },
            'Inner-Color' : {
                "alt_name" : "Inner Color",
                'type' : 'input',
                'input_type' : 'color',
                'element_identifier' : 'inner-color',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.inner.color = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.inner-color');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.inner.color;
                        }
                    }}
                ]
            },
            'Outer-Color' : {
                "alt_name" : "Outline Color",
                'type' : 'input',
                'input_type' : 'color',
                'element_identifier' : 'outer-color',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.outer.color = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.outer-color');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.outer.color;
                        }
                    }}
                ]
            },
            'Outline-Thickness' : {
                "alt_name" : "Outline Width",
                'type' : 'input',
                'input_type' : 'number',
                'tags' : [
                    {name:'step',value:'1'},
                    {name:'min',value:'1'}
                ],
                'element_identifier' : 'outline-width',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid),
                              asFontRatio = target.nextElementSibling.checked,
                              style = element.attributes.format.attributes.style;
                        style.special.text.outlineThickness = asFontRatio ? Number(target.value) * style.special.text.outlineThickness : Number(target.value);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.outline-width'),
                              asFontRatio = Boolean(inputElement.nextElementSibling.checked);
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = asFontRatio ? inputElement.value : style.special.text.outlineThickness;
                            if (asFontRatio) style.special.text.outlineThickness = Number(inputElement.value) * style.special.text.fontSize;
                        }
                    }}
                ],
                'append' : [
                    {
                        type : 'input',
                        tags : [
                            {name:'type',value:'checkbox'},
                            {name:'title',value:'Calculate as font-size ratio'}
                        ]
                    }
                ],
            },
            'Font-Family' : {
                "alt_name" : "Font",
                'type' : 'dropdown',
                'element_identifier' : 'text-font',
                'options' : [
                    ['Times New Roman', 'times'],
                    ['Courier', 'courier'],
                    ['Sans-serif', 'sans-serif'],
                    ['Serif', 'serif'],
                    ['Tahoma', 'tahoma'],
                    ['Helvetica', 'helvetica'],
                    ['Consolas', 'consolas'],
                    ['Monospace', 'monospace']
                ],
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.fontFamily = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.text-font');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.fontFamily;
                        }
                    }}
                ]
            },
            'Font-Size' : {
                "alt_name" : "Size",
                'type' : 'input',
                'input_type' : 'number',
                'tags' : [
                    {name:'step',value:'1'},
                    {name:'min',value:'1'}
                ],
                'element_identifier' : 'text-font',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.fontSize = Number(target.value);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.text-font');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.fontSize;
                        }
                    }}
                ]
            },
            'Font-Line-Height' : {
                "alt_name" : "Line Height",
                'type' : 'input',
                'input_type' : 'number',
                'tags' : [
                    {name:'step',value:'1'},
                    {name:'min',value:'1'}
                ],
                'element_identifier' : 'line-height',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid),
                              asFontRatio = target.nextElementSibling.checked,
                              style = element.attributes.format.attributes.style;
                        style.special.text.lineHeight = asFontRatio ? Number(target.value) * style.special.text.fontSize : Number(target.value);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.line-height'),
                              asFontRatio = Boolean(inputElement.nextElementSibling.checked);
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = asFontRatio ? inputElement.value : style.special.text.lineHeight;
                            if (asFontRatio) style.special.text.lineHeight = Number(inputElement.value) * style.special.text.fontSize;
                        }
                    }}
                ],
                'append' : [
                    {
                        type : 'input',
                        tags : [
                            {name:'type',value:'checkbox'},
                            {name:'title',value:'Calculate as font-size ratio'}
                        ]
                    }
                ],
            },
            'Font-Bold' : {
                "alt_name" : "Bold",
                'type' : 'input',
                'input_type' : 'checkbox',
                'element_identifier' : 'font-bold',
                'events' : [
                    {type:'input',callback:function (e){
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.fontStyle.bold = target.checked;
                    }}
                ]
            },
            'Font-Italics' : {
                "alt_name" : "Italic",
                'type' : 'input',
                'input_type' : 'checkbox',
                'element_identifier' : 'font-italics',
                'events' : [
                    {type:'input',callback:function (e){
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.fontStyle.italics = target.checked;
                    }}
                ]
            },
            'Align-X' : {
                "alt_name" : "Align X",
                'type' : 'dropdown',
                'element_identifier' : 'align-x',
                'options' : [
                    ['left', 'left'],
                    ['right', 'right'],
                    ['center', 'center']
                ],
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.align.x_axis = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.align-x');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.align.x_axis;
                        }
                    }}
                ]
            },
            'Align-Y' : {
                "alt_name" : "Align Y",
                'type' : 'dropdown',
                'element_identifier' : 'align-y',
                'options' : [
                    ['top', 'top'],
                    ['bottom', 'bottom'],
                    ['middle', 'middle']
                ],
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.align.y_axis = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.align-y');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.align.y_axis;
                        }
                    }}
                ]
            },
            
        }
    }; 
})(this);
