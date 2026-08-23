(function (module) {
    module.Flats.Formats["default:poly"] = {
        name : 'default:poly',
        formal_name : 'Polygon',
        minNodes : 1,
        maxNodes : Infinity,
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
                    vertices.push(`vertex(${node.x}, ${node.y});`);
                }
                return `fill(#fill_color);
stroke(#stroke_color);
strokeWeight(#stroke_width);
beginShape();
${vertices.join('\n')}
${vertices[0]}
endShape();`;
            }
        },
        main : function (ctx, element, style) {
            let mouse = module.Interactor.mouse,
                trans = element.attributes.transforms,
                verts = trans.scale.verts,
                nodes = element.nodes,
                format = element.attributes.format;

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
        }
    }; 
})(this);
