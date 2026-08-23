(function (module) {
    module.Flats.Formats["default:triangle"] = {
        name : 'default:triangle',
        formal_name : 'Triangle',
        minNodes : 3,
        maxNodes : 3,
        nodes : {
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
        export : {
            script : function (element) {
                let vertices = [];
                for (let node of element.nodes) {
                    vertices = vertices.concat([node.x, node.y]);
                }
                return `fill(#fill_color);
stroke(#stroke_color);
strokeWeight(#stroke_width);
triangle(${vertices.join(', ')});`;
            }
        },
        main : function (ctx, element, style) {
            let mouse = module.Interactor.mouse,
                nodes = element.nodes;

            /* Styling */
            ctx.lineWidth = 1 * 1/mouse.scale
            ctx.fillStyle = style.fill.color;
            ctx.strokeStyle = style.stroke.color;

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
        }
    }; 
})(this);
