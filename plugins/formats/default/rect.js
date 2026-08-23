(function (module) {
    module.Flats.Formats["default:rect"] = {
        name : 'default:rect',
        formal_name : 'Rect',
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
            script : function (element) {
                return `pushMatrix();
translate(#center);
rotate(#angle);
fill(#fill_color);
stroke(#stroke_color);
strokeWeight(#stroke_width);
rect(-#width / 2, -#height / 2, #width, #height);
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
            ctx.moveTo(nodes[0].x, nodes[0].y);
            nodes.forEach((node, i) => {
                ctx.lineTo(node.x, node.y);
            });
            ctx.lineTo(nodes[0].x, nodes[0].y);

            /* Close and render */
            ctx.fill();
            ctx.stroke();

            /* Check if mouse is inside drawing path */
            element.checkPath(ctx);

            ctx.restore();
        }
    }; 
})(this);
