(function (module) {
    module.Flats.Formats["default:bezier_chain"] = {
        name : 'default:bezier_chain',
        formal_name : 'Bezier Chain',
        minNodes : 4,
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
                for (let i = 0; i < element.nodes.length; i += 1) {
                    let ns = element.nodes;
                    if (i === 0) {
                        vertices.push(`vertex(${ns[0].x}, ${ns[0].y});`);
                        vertices.push(`bezierVertex(${ns[1].x}, ${ns[1].y}, ${ns[2].x}, ${ns[2].y}, ${ns[3].x}, ${ns[3].y});`);
                    } else if (i % 3 === 0 && i !== element.nodes.length - 1) {
                        vertices.push(`bezierVertex(${ns[i + 1].x}, ${ns[i + 1].y}, ${ns[i + 2].x}, ${ns[i + 2].y}, ${ns[i + 3].x}, ${ns[i + 3].y});`);
                    }
                }
                return `fill(#fill_color);
stroke(#stroke_color);
strokeWeight(#stroke_width);
beginShape();
${vertices.join('\n')}
endShape();`;
            }
        },
        main : function (ctx, element, style) {
            let mouse = module.Interactor.mouse,
                trans = element.attributes.transforms,
                verts = trans.scale.verts,
                nodes = element.nodes,
                format = element.attributes.format;

            let repeats = Math.floor(element.nodes.length / 3);  

            /* Styling */
            ctx.fillStyle = format.getColor('fill');
            ctx.lineWidth = style.stroke.width;
            ctx.strokeStyle = format.getColor('stroke');

            /* Open path */
            ctx.beginPath();
            ctx.moveTo(nodes[0].x, nodes[0].y);
            for (let i = 0; i < repeats; i++) {
                let c = i * 3;

                ctx.bezierCurveTo(
                    nodes[c + 1].x, nodes[c + 1].y, 
                    nodes[c + 2].x, nodes[c + 2].y, 
                    nodes[c + 3].x, nodes[c + 3].y, 
                );
            }

            /* Check if mouse is inside drawing path */
            element.checkPath(ctx);

            /* Close and render */
            ctx.fill();
            ctx.stroke();

            for (let i = 0; i < repeats; i++) {
                let c = i * 3;

                /* Display UI */
                if (module.Interactor.element.uuid === element.uuid) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 1 * 1/mouse.scale;
                    ctx.setLineDash([6 / mouse.scale, 6 / mouse.scale]);
                    ctx.moveTo(nodes[c + 0].x, nodes[c + 0].y);
                    ctx.lineTo(nodes[c + 1].x, nodes[c + 1].y);
                    ctx.lineTo(nodes[c + 2].x, nodes[c + 2].y);
                    ctx.lineTo(nodes[c + 3].x, nodes[c + 3].y);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();
                }
            }
        }
    }; 
})(this);
