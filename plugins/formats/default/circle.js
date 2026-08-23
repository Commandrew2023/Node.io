(function (module) {
    module.Flats.Formats["default:circle"] = {
        name : 'default:circle',
        formal_name : 'Circle',
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
                '#radius' : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.radius',
                    handler : (element) => {
                        return module.Exporter.getter(
                            element,
                            module.Exporter.path('#radius')
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
ellipse(0, 0, #radius, #radius);
popMatrix();`;
            }
        },
        main : function (ctx, element, style, check) {
            let mouse = module.Interactor.mouse,
                trans = element.attributes.transforms,
                verts = trans.scale.verts,
                nodes = element.nodes,
                format = element.attributes.format;

            let x = (nodes[0].x + nodes[1].x + nodes[2].x + nodes[3].x) / 4,
                y = (nodes[0].y + nodes[1].y + nodes[2].y + nodes[3].y) / 4,
                width = Element.dist(nodes[0], nodes[3]) / 2,
                height = Element.dist(nodes[0], nodes[1]) / 2,
                radius = Math.min(width, height);

            format.attributes.radius = radius * 2;

            ctx.save();

            /* Styling */
            ctx.fillStyle = format.getColor('fill');
            ctx.lineWidth = style.stroke.width;
            ctx.strokeStyle = format.getColor('stroke');
            
            /* Open path */
            ctx.beginPath();
            ctx.translate(x, y);
            ctx.rotate(trans.rotation.radians);
            ctx.ellipse(0, 0, radius, radius, 0, 0, 2 * Math.PI);
            ctx.rotate(-trans.rotation.radians);
            ctx.translate(-x, -y);

            /* Close and render */
            ctx.fill();
            ctx.stroke();

            /* Check if mouse is inside drawing path */
            if (check) element.checkPath(ctx);

            ctx.restore();
        },
        $fixSize : function (element, width, height) {
            if (width > height) {
                element.moveResize(null, width);
            } else {
                element.moveResize(height, null);
            }
        },
        dropdown_fields : {}
    }; 
})(this);
