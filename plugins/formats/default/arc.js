(function (module) {
    module.Flats.Formats["default:arc"] = {
        name : 'default:arc',
        formal_name : 'Arc',
        minNodes : 5,
        maxNodes : 5,
        nodes : [
            {
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
            {
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
            {
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
            {
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
            {
                mouseOn : {
                    color : 'yellow'
                },
                mouseOff : {
                    color : 'green'
                },
                width : 5,
                height : 5,
                $move : function (element, node) {
                    let int = module.Interactor;

                    node.x = int.mouse.rel.x;
                    node.y = int.mouse.rel.y;
                }
            },
            {
                mouseOn : {
                    color : 'yellow'
                },
                mouseOff : {
                    color : 'green'
                },
                width : 5,
                height : 5,
                $move : function (element, node) {
                    let int = module.Interactor;

                    node.x = int.mouse.rel.x;
                    node.y = int.mouse.rel.y;
                }
            }
        ],
        export : {
            registerVariables : {
                '#start_angle' : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.startAngle',
                    handler : (element) => {
                        return module.Exporter.getter(
                            element,
                            module.Exporter.path('#start_angle')
                        );
                    }
                },
                '#end_angle' : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.endAngle',
                    handler : (element) => {
                        return module.Exporter.getter(
                            element,
                            module.Exporter.path('#end_angle')
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
arc(0, 0, #width, #height, #start_angle, #end_angle);
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

            this.$fixNodes(ctx, element);
            
            /* Open path */
            ctx.beginPath();
            let x = (nodes[0].x + nodes[1].x + nodes[2].x + nodes[3].x) / 4,
                y = (nodes[0].y + nodes[1].y + nodes[2].y + nodes[3].y) / 4,
                width = Element.dist(nodes[0], nodes[3]) / 2,
                height = Element.dist(nodes[0], nodes[1]) / 2;

            let {sa, ea} = this.$computeStartStop(element, x, y, width, height, nodes);

            ctx.moveTo(x, y);
            ctx.translate(x, y);
            ctx.rotate(trans.rotation.radians);
            ctx.ellipse(0, 0, width, height, 0, sa, ea);
            ctx.rotate(-trans.rotation.radians);
            ctx.translate(-x, -y);
            ctx.lineTo(nodes[5].x, nodes[5].y);

            /* Close and render */
            ctx.fill();

            /* Check if mouse is inside drawing path */
            if (check) element.checkPath(ctx);

            ctx.beginPath();
            ctx.translate(x, y);
            ctx.rotate(trans.rotation.radians);
            ctx.ellipse(0, 0, width, height, 0, sa, ea);
            ctx.rotate(-trans.rotation.radians);
            ctx.translate(-x, -y);

            ctx.stroke();

            ctx.restore();
        },
        $computeStartStop : function (element, x, y, width, height, nodes) {
            let format = element.attributes.format,
                sa = Math.atan2((nodes[4].y - y) / height, (nodes[4].x - x) / width),
                ea = Math.atan2((nodes[5].y - y) / height, (nodes[5].x - x) / width);

            format.attributes.startAngle = sa * 180 / Math.PI;
            format.attributes.endAngle = ea * 180 / Math.PI + (ea < 0 ? 360 : 0);
            
            return {sa, ea};
        },
        $fixNodes : function (ctx, element) {
            let mouse = module.Interactor.mouse,
                nodes = element.nodes;

            let x = (nodes[0].x + nodes[1].x + nodes[2].x + nodes[3].x) / 4,
                y = (nodes[0].y + nodes[1].y + nodes[2].y + nodes[3].y) / 4,
                width = Element.dist(nodes[0], nodes[3]) / 2,
                height = Element.dist(nodes[0], nodes[1]) / 2;

            let sa = Math.atan2((nodes[4].y - y) / height, (nodes[4].x - x) / width),
                ea = Math.atan2((nodes[5].y - y) / height, (nodes[5].x - x) / width);
            
            if (module.Interactor.element.node.uuid === nodes[4].uuid) {
                nodes[4].x = x + width * Math.cos(sa);
                nodes[4].y = y + height * Math.sin(sa);
            }
            if (module.Interactor.element.node.uuid === nodes[5].uuid) {
                nodes[5].x = x + width * Math.cos(ea);
                nodes[5].y = y + height * Math.sin(ea);
            }
        },
        dropdown_fields : {}
    }; 
})(this);
