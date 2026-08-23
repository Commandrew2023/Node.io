(function (module) {
    module.Flats.Formats["default:poly_regular"] = {
        name : 'default:poly_regular',
        formal_name : 'Regular Polygon',
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
                "#number_of_sides" : {
                    field_correlation : 'Side-Number',
                    path : 'attributes.format.attributes.style.special.sides',
                    handler : (element) => {
                        return module.Exporter.getter(
                            element,
                            module.Exporter.path('#number_of_sides')
                        );
                    }
                },
                "#start_angle" : {
                    field_correlation : 'Start-Rotation',
                    path : 'attributes.format.attributes.style.special.startAngle',
                    handler : (element) => {
                        return module.Exporter.getter(
                            element,
                            module.Exporter.path('#start_angle')
                        );
                    }
                }
            },
            script : function (element) {
                return `pushMatrix();
translate(#center);
rotate(#angle);
fill(#fill_color);
stroke(#stroke_color);
strokeWeight(#stroke_width);
beginShape();
for (var i = 0; i < #number_of_sides + 1; i++) {
    vertex(
        (#width / 2) * cos((i / #number_of_sides) * 360 + #start_angle * 180 / Math.PI),
        (#height / 2) * sin((i / #number_of_sides) * 360 + #start_angle * 180 / Math.PI)
    );
}
endShape();
popMatrix();`;
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
            ctx.lineWidth = style.stroke.width;
            ctx.strokeStyle = format.getColor('stroke');
            
            /* Open path */
            ctx.beginPath();
            let x = (nodes[0].x + nodes[1].x + nodes[2].x + nodes[3].x) / 4,
                y = (nodes[0].y + nodes[1].y + nodes[2].y + nodes[3].y) / 4,
                width = Element.dist(nodes[0], nodes[3]) / 2,
                height = Element.dist(nodes[0], nodes[1]) / 2,
                a_shift = style.special.startAngle;

            ctx.translate(x, y);
            ctx.rotate(trans.rotation.radians);

            let sides = style.special.sides;
            for (let i = 0; i < sides; i++) {
                if (i === 0) {
                    ctx.moveTo((width) * Math.cos((i / sides) * Math.PI * 2 + a_shift), (height) * Math.sin((i / sides) * Math.PI * 2 + a_shift));
                } else {
                    ctx.lineTo(
                        (width) * Math.cos((i / sides) * Math.PI * 2 + a_shift),
                        (height) * Math.sin((i / sides) * Math.PI * 2 + a_shift)
                    );
                    if (i === sides - 1) {
                        ctx.lineTo(
                            (width) * Math.cos(a_shift),
                            (height) * Math.sin(a_shift)
                        );
                    }
                }
            }
            /*ctx.lineTo(0, -(height / 2));*/
            
            ctx.rotate(-trans.rotation.radians);
            ctx.translate(-x, -y);

            /* Close and render */
            ctx.fill();
            ctx.stroke();

            /* Check if mouse is inside drawing path */
            if (check) element.checkPath(ctx);

            ctx.restore();
        },
        dropdown_fields : {
            'Side-Number' : {
                "alt_name" : "# of Sides",
                'type' : 'input',
                'input_type' : 'number',
                'tags' : [{name:'step',value:'1'}],
                'element_identifier' : 'poly-sides',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.sides = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.poly-sides');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.sides;
                        }
                    }}
                ]
            },
            'Start-Rotation' : {
                'alt_name' : 'Start Rotation',
                'type' : 'input',
                'element_identifier' : 'poly-rotation',
                'append' : [
                    {
                        type : 'input',
                        tags : [
                            {name:'type',value:'checkbox'},
                            {name:'title',value:'Use Degrees'}
                        ]
                    }
                ],
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid),
                                degrees = Boolean(target.nextElementSibling.checked);
                        element.attributes.format.attributes.style.special.startAngle = parseFloat(target.value || '0') * (degrees ? (Math.PI / 180) : 1);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.poly-rotation'),
                              degrees = Boolean(inputElement.nextElementSibling.checked);
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            inputElement.value = Math.floor(
                                element.attributes.format.attributes.style.special.startAngle * (degrees ? (180 / Math.PI) : 1)
                                    * 1000
                            ) / 1000;
                        }
                    }}
                ]
            },
        }
    }; 
})(this);
