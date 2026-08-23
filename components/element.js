(function (module) {
    class Element {
        constructor () {
            /* ID generation checked against other elements */
            this.uuid = module.AlternativeCrypto.randomUUID({
                objects : module.Flats.Elements,
                key : 'uuid'
            });
            
            /* Rendering Properties */
            this.attributes = {
                name : 'Unknown Element',
                dropdown : null,
                anchor : null,
                format : null,
                transforms : {
                    pivot : {
                        x : 0,
                        y : 0,
                        hovered : false
                    },
                    scale : {
                        verts : [
                            { x : 0, y : 0 },
                            { x : 0, y : 0 },
                            { x : 0, y : 0 },
                            { x : 0, y : 0 }
                        ],
                        center : {
                            x : 0,
                            y : 0
                        },
                        width : 0,
                        height : 0
                    },
                    rotation : {
                        radians : 0,
                        hovered : false,
                    }
                }
            };

            this.events = {
                'release' : function (that) {
                    if (Interactor.holding('any')) {
                        that.attributes.dropdown.isLoaded = false;
                    }
                }
            };

            /* Internal UI Status */
            this.interface = {
                isHovered : false,
                isActive  : false,
                isResizing : false,
                isTranslating : false,
                isRotating : false,

                context : {
                    x : 0,
                    y : 0
                },
                resize_calculation : {
                    rel : true,
                },
                disabled_sides : [],
                passes_check : false,
                hold_until_reclick : false
            };

            /* Interactable Nodes */
            this.nodes = [];

            /* Field Copies for Transformations */
            this.transforms_copy = {};
            this.nodes_copy = [];
        }

        /* Utility Methods */
        static dist (p1, p2) {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        }
        static range (size) {
            return new Uint8Array(size);
        }
        static rotatePoints (pivot, points, angle) {
            points.forEach(point => {
                let cur_a = Math.atan2(point.y - pivot.y, point.x - pivot.x),
                    cur_d = Element.dist(pivot, point);
                point.x = pivot.x + cur_d * Math.cos(cur_a + angle);
                point.y = pivot.y + cur_d * Math.sin(cur_a + angle);
            });
            return points;
        }
        static copyFrom (data) {
            let element = new module.Element();
            let format = new module.Format(data.attributes.format.name);
            element.bindFormat(format);
            element.nodes = Array(data.nodes.length).fill(0).map((_, i) => {
                return module.DeepMerge([], data.nodes[i]);
            });
            element.idNodes();
            element.formatNodes();
            
            element.calculateResize();
            element.calculateCenter();

            element.attributes.transforms = module.DeepMerge(element.attributes.transforms, data.attributes.transforms);
            element.attributes.format.attributes.style = module.DeepMerge(element.attributes.format.attributes.style, data.attributes.format.attributes.style);
            element.addDropdown();

            return element;
        }

        attrib (name, depthLimiter=Infinity) {
            return ObjectSearch(this.attributes, name, depthLimiter);
        }

        /* Element Methods */
        addDropdown () {
            const format = this.attributes.format;
            this.attributes.dropdown = new module.ElementDropdown(
                this.attributes.name || format.attributes.format?.name || 'Unknown',
                this.uuid,
                format.attributes.format.dropdown_fields || {}
            );
            this.attributes.dropdown.bindParent(this);
            this.attributes.dropdown.load();
            this.attributes.dropdown.loadFields();
        }
        copy () {
            this.transforms_copy = structuredClone({...this.attributes.transforms});
            this.nodes_copy = structuredClone(this.nodes.map(node => {return {x : node.x, y : node.y}}));
        }
        select () {
            let int = module.Interactor;

            /* Check for current interactions and set new interaction */
            if (this.holding('none') && int.element.node.uuid === null) {
                int.reset();
                int.element.uuid = this.uuid;
                int.element.selected_on_cycle = true;
                
                this.interface.isActive = true;

                /* Interactor Event */
                int.element.event.select();
                this.interface.hold_until_reclick = true;
                UI.selectPanelPage('Elements');
            }
        }
        checkPath (ctx) {
            let int = module.Interactor, 
                abs = module.Interactor.mouse.abs;
            
            let passes = false;
            if (int.mouse.pressed && this.holding('none')) {
                if (ctx.isPointInPath(abs.x, abs.y)) {
                    passes = true;
                    int.select_stack.add(this);
                }
            }

            this.interface.passes_check = this.interface.passes_check || passes;
            if (this.holding('any')) {
                this.interface.passes_check = false;
            }
        }
        clearCheck () {
            this.interface.passes_check = false;
            this.interface.disabled_sides = [];
        }
        holding (type) {
            let int = module.Interactor;
            return int.holding(type);
        }


        /* Node Methods */
        insertNode (node, index=-1, beforeNode=null, afterNode=null) {
            node.uuid = node.uuid || module.AlternativeCrypto.randomUUID({
                objects : this.nodes,
                key : 'uuid'
            });
            if (index === -1) {
                index = this.nodes.length;
            } else if (index === null) {
                const UUIDs  = this.nodes.map(node => node.uuid),
                      before = UUIDs.indexOf(beforeNode),
                      after  = UUIDs.indexOf(afterNode);
                if (before > -1) {
                    this.nodes.splice(before, 0, node);
                } else if (after > -1) {
                    this.nodes.splice(after - 1, 0, node);
                } else {
                    this.nodes.splice(this.nodes.length, 0, node);
                }
            } else {
                this.nodes.splice(index, 0, node);
            }
        }
        removeNode (uuid) {
            for (let i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].uuid === uuid) {
                    this.nodes.splice(i, 1);
                    return;
                }
            }
        }
        setNodes (nodes) {
            this.nodes = nodes;
        }
        getNode (uuid, withIndex=false) {
            /* Iterate nodes for node matching 'uuid' */
            for (let i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].uuid === uuid) {
                    if (!withIndex) {
                        return this.nodes[i];
                    } else {
                        return {
                            node : this.nodes[i],
                            index : i
                        };
                    }
                }
            }
            return null;
        }
        idNodes () {
            this.nodes.forEach(node => {
                node.uuid = module.AlternativeCrypto.randomUUID({
                    objects : this.nodes,
                    key : 'uuid'
                })
            });
        }
        createNode () {
            return {
                x : 0,
                y : 0,
                hovered : false
            };
        }
        formatNodes () {
            let that = this,
                format = this.attributes.format;

            /* Ensure minimum number of nodes */
            if (this.nodes.length < format.minNodes) {
                for (let n in this.range(format.minNodes - this.nodes.length)) {
                    this.createNode();
                }
            }

            /* Iterate nodes and merge formatting */
            this.nodes.forEach((node, i) => {
                /* Check if element format exists */
                if (!!format) {
                    let n = format.attributes.format.nodes;

                    /* Check if format includes node attributes */
                    if (!!n) {
                        /* Individual Attributes */
                        if (n instanceof Array) {
                            if (n[i] !== null) {
                                module.mergeObjects(n[i], that.nodes[i]);
                            }
                        } 
                        /* Universal Attributes */
                        else {
                            that.nodes[i] = module.mergeObjects(n, that.nodes[i]);
                        }
                    }
                }
            });
        }
        renderNodes (ctx) {
            let int = module.Interactor;

            if (int.element.uuid !== this.uuid) return;

            this.nodes.forEach(node => {
                let hovered = (node.hovered || int.element.node.uuid === node.uuid || node.force_hover);

                /* No Stroke */
                ctx.strokeStyle = '#00000000';

                /* Hoever Coloration Effect */
                ctx.fillStyle = node[hovered ? 'mouseOn' : 'mouseOff'].color;

                /* Render Node */
                ctx.beginPath();
                ctx.ellipse(node.x, node.y, node.width * 1/int.mouse.scale, node.height * 1/int.mouse.scale, 0, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
        rotateNodes (angle) {
            let trans = this.attributes.transforms;

            /* Rotate nodes */
            Element.rotatePoints(trans.pivot, this.nodes, angle * Math.PI / 180);

            /* Set angle */
            this.attributes.transforms.rotation.radians = angle * Math.PI / 180;
        }
        snapNodesGlobal () {
            let int = module.Interactor,
                node = this.getNode(int.element.node.uuid);

            /* Check global snappers */
            Flats.Snappers.forEach(snapper => {
                const con = snapper.test(int.mouse.rel);
                if (con !== null && node !== null) {
                    node.x = parseFloat(con.x);
                    node.y = parseFloat(con.y);
                }
            });
        }
        hoverNodes () {
            let int = module.Interactor;

            /* Exit if element not active */
            if (int.element.uuid !== this.uuid) return;

            let that = this;
            if (this.holding('node') || this.holding('none')) {
                this.nodes.forEach((node, i) => {
                    /* Check for node grab & hovering */
                    if (Element.dist(int.mouse.rel, node) <= node.width * 1/int.mouse.scale) {
                        if (int.element.node.uuid === null) {
                            node.hovered = true;
                            int.mouse.cursor = 'crosshair';
                        }
                    }
                });
            }
        }
        grabNodes () {
            let int = module.Interactor;

            /* Exit if element not active */
            if (int.element.uuid !== this.uuid) return;

            let that = this;
            if (this.holding('node') || this.holding('none')) {
                this.nodes.forEach((node, i) => {
                    /* Check for node grab & hovering */
                    if (Element.dist(int.mouse.rel, node) <= node.width * 1/int.mouse.scale) {
                        if (int.element.node.uuid === null) {
                            /* Mouse interaction event */
                            if (int.mouse.pressed && int.mouse.button === 0) {
                                (node.$leftClick || function (element, node, i) {
                                    int.element.node.uuid = node.uuid;
                                })(that, node, i);
                            }
                        }
                    } else {
                        /* Not hovered/out of node range */
                        node.hovered = false;
                    }

                    /* Move grabbed node with mouse */
                    if (int.element.node.uuid === node.uuid) {
                        int.mouse.cursor = 'crosshair';
                        (node.$move || function (element, node, i) {
                            node.x = int.mouse.rel.x;
                            node.y = int.mouse.rel.y;
                        })(that, node, i);
                    }
                });
            }
        }
        releaseNodes () {
            let int = module.Interactor;

            int.element.node.grab = false;
            if (int.element.node.uuid !== null) {
                var node = this.getNode(int.element.node.uuid);
                (node?.$release || function (element, node, i) {
                    int.element.node.uuid = null;
                })(this, node);
            }
        }

        /* Format Methods */
        bindFormat (format) {
            if (format instanceof module.Format) {
                this.attributes.format = format;
                this.attributes.name = format.attributes.format.formal_name || 'Unknown';
                this.formatNodes();
                this.idNodes();
            } else {
                throw Error("Format must be of type 'Format'");
            }
        }
        render (ctx, check=true) {
            let format = this.attributes.format;

            /* Ensure format is bound and use */
            if (!!format) {
                format.use(ctx, this, check);
            }
        }

        /* UI Methods */
        snapPivotLocal () {
            let int = module.Interactor,
                pivot = this.attributes.transforms.pivot,
                verts = this.attributes.transforms.scale.verts,
                disabled_sides = this.interface.disabled_sides;
            
            if (int.element.uuid !== this.uuid) return;

            if (int.mouse.pressed && int.mouse.button === 2 && int.element.pivot.grab && 
                !(int.keyboard.key.name === 'Shift' && int.keyboard.pressed)) {
                /* Check resize verts */
                verts.forEach(vert => {
                    const d = Element.dist(vert, int.mouse.rel);
                    if (d < 10 * 1/int.mouse.scale) {
                        pivot.x = parseFloat(vert.x);
                        pivot.y = parseFloat(vert.y);
                    }
                });

                /* Check center */
                const center = this.attributes.transforms.scale.center;
                const center_d = Element.dist(center, int.mouse.rel);
                if (center_d < 10 * 1/int.mouse.scale) {
                    pivot.x = parseFloat(center.x);
                    pivot.y = parseFloat(center.y);
                }

                /* Check nodes */
                this.nodes.forEach(node => {
                    const d = Element.dist(node, int.mouse.rel);
                    if (d < 10 * 1/int.mouse.scale) {
                        pivot.x = parseFloat(node.x);
                        pivot.y = parseFloat(node.y);
                    }
                });

                /* Check global snappers */
                Flats.Snappers.forEach(snapper => {
                    let con = snapper.test(int.mouse.rel);
                    if (con !== null) {
                        pivot.x = parseFloat(con.x);
                        pivot.y = parseFloat(con.y);
                    }
                });
            }
        }
        ensurePivotVerts () {
            let int = module.Interactor,
                pivot = this.attributes.transforms.pivot,
                verts = this.attributes.transforms.scale.verts,
                disabled_sides = this.interface.disabled_sides;
            for (let i = 0; i < verts.length; i++) {
                let vert = verts[i];
                if (pivot.x === vert.x && pivot.y === vert.y) {
                    disabled_sides.push(i);
                    disabled_sides.push((i + 3) % 4);
                }
                let next_vert = verts[(i + 1) % 4],
                    side = new module.Vector(next_vert.x - vert.x, next_vert.y - vert.y),
                    pivot_vec = new module.Vector(vert.x - pivot.x, vert.y - pivot.y),
                    ext = side.project(pivot_vec),
                    dist = Element.dist(pivot_vec, ext);
                if (dist < 20 * 1/int.mouse.scale) {
                    disabled_sides.push(i);
                }
            }
        }
        hoverPivot () {
             let int = module.Interactor;

            /* Exit if element is not active */
            if (int.element.uuid !== this.uuid) return;

            if (this.holding('none') || this.holding('pivot')) {
                if (Element.dist(int.mouse.rel, this.attributes.transforms.pivot) < 9 * 1/int.mouse.scale) {
                    this.attributes.transforms.pivot.hovered = true;
                    int.mouse.cursor = 'move';
                }
            }
        }
        grabPivot () {
            let int = module.Interactor;

            /* Exit if element is not active */
            if (int.element.uuid !== this.uuid) return;

            if (this.holding('none') || this.holding('pivot')) {
                if (Element.dist(int.mouse.rel, this.attributes.transforms.pivot) < 9 * 1/int.mouse.scale) {
                    if (int.mouse.pressed) {
                        int.element.grabPivot();
                    }
                }
                if (int.element.pivot.grab && int.mouse.pressed) {
                    if (int.mouse.button === 2) {
                        this.attributes.transforms.pivot = {
                            x : int.mouse.rel.x,
                            y : int.mouse.rel.y
                        };
                    } else if (int.mouse.button === 0) {
                        if (!this.interface.isTranslating) {
                            this.interface.isTranslating = true;
                            this.copy();
                        }

                        Flats.Snappers.forEach(snapper => {
                            const con = snapper.test(int.mouse.rel);
                            if (con !== null) {
                                int.mouse.rel.x = parseFloat(con.x);
                                int.mouse.rel.y = parseFloat(con.y);
                            }
                        });
                        let pivot = this.attributes.transforms.pivot,
                            verts = this.attributes.transforms.scale.verts,
                            pivot_copy = this.transforms_copy.pivot,
                            verts_copy = this.transforms_copy.scale.verts,
                            nodes_copy = this.nodes_copy;
                        for (var i = 0; i < verts.length; i++) {
                            verts[i].x = verts_copy[i].x + int.mouse.rel.x - pivot_copy.x;
                            verts[i].y = verts_copy[i].y + int.mouse.rel.y - pivot_copy.y;
                        }
                        for (var i = 0; i < this.nodes.length; i++) {
                            this.nodes[i].x = nodes_copy[i].x + int.mouse.rel.x - pivot_copy.x;
                            this.nodes[i].y = nodes_copy[i].y + int.mouse.rel.y - pivot_copy.y;
                        }
                        this.attributes.transforms.pivot = {
                            x : int.mouse.rel.x,
                            y : int.mouse.rel.y
                        };
                    }
                }
            }
            if (!int.mouse.pressed) {
                this.interface.isTranslating = false;
            }
        }
        movePivot (x, y) {
            if (x === null) {
                x = this.attributes.transforms.pivot.x;
                y = y;
            } else if (y === null) {
                x = x;
                y = this.attributes.transforms.pivot.y;
            }

            this.copy();

            let pivot = this.attributes.transforms.pivot,
                verts = this.attributes.transforms.scale.verts,
                pivot_copy = this.transforms_copy.pivot,
                verts_copy = this.transforms_copy.scale.verts,
                nodes_copy = this.nodes_copy;
            for (var i = 0; i < verts.length; i++) {
                verts[i].x = verts_copy[i].x + x - pivot_copy.x;
                verts[i].y = verts_copy[i].y + y - pivot_copy.y;
            }
            for (var i = 0; i < this.nodes.length; i++) {
                this.nodes[i].x = nodes_copy[i].x + x - pivot_copy.x;
                this.nodes[i].y = nodes_copy[i].y + y - pivot_copy.y;
            }
            this.attributes.transforms.pivot = {
                x : x,
                y : y
            };
        }
        hoverRotation () {
            let int = module.Interactor,
                trans = this.attributes.transforms;

            /* Exit if element is not active */
            if (int.element.uuid !== this.uuid) return;

            if (this.holding('none') || this.holding('rotation')) {
                let d = Element.dist(int.mouse.rel, this.attributes.transforms.pivot);
                if (d > 10 * 1/int.mouse.scale && d < 15 * 1/int.mouse.scale) {
                    this.attributes.transforms.rotation.hovered = true;
                    int.mouse.cursor = 'pointer';
                }
            }
        }
        grabRotation () {
            let int = module.Interactor,
                trans = this.attributes.transforms;

            /* Exit if element is not active */
            if (int.element.uuid !== this.uuid) return;

            if (this.holding('none') || this.holding('rotation')) {
                let d = Element.dist(int.mouse.rel, this.attributes.transforms.pivot);
                if (d > 10 * 1/int.mouse.scale && d < 15 * 1/int.mouse.scale) {
                    if (int.mouse.pressed) {
                        int.element.rotation.grab = true;
                    }
                }
                if (int.element.rotation.grab) {
                    if (int.mouse.pressed && int.mouse.button === 0) {
                        if (!this.interface.isRotating) {
                            this.interface.isRotating = true;
                            this.copy();
                            Element.rotatePoints(trans.pivot, this.nodes_copy, -this.transforms_copy.rotation.radians);
                        }
                        
                        let angle = Math.atan2(int.mouse.rel.y - trans.pivot.y, int.mouse.rel.x - trans.pivot.x) * 180 / Math.PI;
                        if (!(int.keyboard.pressed && int.keyboard.key.name === 'Shift')) {
                            angle = Math.round(angle / 15) * 15;
                        }
                        this.nodes_copy.forEach((node, i) => {
                            this.nodes[i].x = parseFloat(node.x);
                            this.nodes[i].y = parseFloat(node.y);
                        });
                        this.rotateNodes(angle);
                    }
                }
            }
            if (!int.mouse.pressed) {
                this.interface.isRotating = false;
            }
        }
        calculateResize () {
            let trans = this.attributes.transforms;

            /* Rotate nodes to 'standard' positions */
            if (this.interface.resize_calculation.rel) {
                Element.rotatePoints(trans.pivot, this.nodes, -this.attributes.transforms.rotation.radians);
            }

            /* Find bounds */
            let minx = Math.min.apply(null, this.nodes.map(n => n.x)),
                miny = Math.min.apply(null, this.nodes.map(n => n.y)),
                maxx = Math.max.apply(null, this.nodes.map(n => n.x)),
                maxy = Math.max.apply(null, this.nodes.map(n => n.y));
            
            /* Put bounds in vertex list */
            trans.scale.verts = [
                {x : minx, y : miny},
                {x : minx, y : maxy},
                {x : maxx, y : maxy},
                {x : maxx, y : miny}
            ];

            /* Rotate vertex list */
            if (this.interface.resize_calculation.rel) {
                Element.rotatePoints(trans.pivot, trans.scale.verts, this.attributes.transforms.rotation.radians);
            }

            /* Calculate width/height (depracated feature) */
            let width = Element.dist(trans.scale.verts[0], trans.scale.verts[3]),
                height = Element.dist(trans.scale.verts[0], trans.scale.verts[1]);
            trans.scale.width = width;
            trans.scale.height = height;

            /* Rotate nodes back to rotated positions */
            if (this.interface.resize_calculation.rel) {
                Element.rotatePoints(trans.pivot, this.nodes, this.attributes.transforms.rotation.radians);
            }
        }
        calculateCenter () {
            let verts = this.attributes.transforms.scale.verts;
            this.attributes.transforms.scale.center = {
                x : (verts[0].x + verts[1].x + verts[2].x + verts[3].x) / 4,
                y : (verts[0].y + verts[1].y + verts[2].y + verts[3].y) / 4
            };
        }
        moveRotation (angle) {
            let int = module.Interactor,
                trans = this.attributes.transforms;

            this.copy();
            Element.rotatePoints(trans.pivot, this.nodes_copy, -this.transforms_copy.rotation.radians);
            
            this.nodes_copy.forEach((node, i) => {
                this.nodes[i].x = parseFloat(node.x);
                this.nodes[i].y = parseFloat(node.y);
            });
            this.rotateNodes(angle);
        }
        hoverResize () {
            let int = module.Interactor,
                mouse = int.mouse,
                resize = this.attributes.transforms.scale;

            /* Don't run resize if element isn't active */
            if (int.element.uuid !== this.uuid) return;

            let check = [0, 1, 2, 3, 0, 1],
                opp = [2, 3, 0, 1, 2];
            if (this.holding('none')) {
                int.element.resize.vecs = [];
                int.element.resize.side = null;
                for (let i = 1; i < check.length - 1; i++) {

                    /* Vectors for calculations */
                    let cur = resize.verts[check[i]],
                        prev = resize.verts[check[i - 1]],
                        side_vec = new module.Vector(cur.x - prev.x, cur.y - prev.y),
                        mouse_vec = new module.Vector(int.mouse.rel.x - prev.x, int.mouse.rel.y - prev.y),
                        proj = side_vec.project(mouse_vec),
                        side_vec_bas = side_vec.basis(),
                        proj_bas = proj.basis();

                    /* Calculate mouse dist from side */
                    let c = proj.copy();
                    c.add(prev);
                    let md = Element.dist(c, int.mouse.rel);
                    
                    /* Check if mouse is selecting a side */
                    if (proj.mag() < side_vec.mag() && proj_bas.equals(side_vec_bas) && md < 5 * 1/int.mouse.scale) {
                        int.element.resize.side = check[i - 1];
                    }
                    if (this.interface.disabled_sides.includes(int.element.resize.side)) {
                        int.element.resize.side = null
                    }
                }
            }
            if (int.element.resize.side !== null) {
                let cur_angle = parseFloat(this.attributes.transforms.rotation.radians) * 180 / Math.PI;
                if (cur_angle < 0) {
                    cur_angle = 180 - Math.abs(cur_angle);
                }
                let angle_index = Math.round(cur_angle / 45) % 4;
                if (int.mouse.cursor !== 'crosshair') {
                    if (this.interface.resize_calculation.rel) {
                        int.mouse.cursor = int.element.resize.side % 2 ? ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize'][angle_index] : ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize'][angle_index];
                    } else {
                        int.mouse.cursor = int.element.resize.side % 2 ? 'ns-resize' : 'ew-resize';
                    }
                }
            }
        }
        grabResize (ctx) {
            let int = module.Interactor,
                mouse = int.mouse,
                resize = this.attributes.transforms.scale;

            /* Don't run resize if element isn't active */
            if (int.element.uuid !== this.uuid) return;

            let check = [0, 1, 2, 3, 0, 1],
                opp = [2, 3, 0, 1, 2];
            if (this.holding('none')) {
                /* Grab side and copy current state */
                if (int.element.resize.side !== null) {
                    if (int.mouse.pressed && int.mouse.button === 0) {
                        if (!this.interface.isResizing) {
                            this.copy();
                            this.interface.isResizing = true;
                        }
                        int.element.resize.grab = true;
                    }
                }

                /* Clear resize */
                if (!int.mouse.pressed) {
                    this.interface.isResizing = false;
                }
            }

            /* Actual resizing rath */
            if (int.element.resize.side !== null && int.element.resize.grab) {
                /* Notes:
                    This method uses the pivot point as a local scaling, rotating, and translating anchor. 
                    I am using a vector approach to calculate these changes so there is a lot of variables 
                    and extra vectors required to properly scale it.
                */

                let cur_angle = parseFloat(this.attributes.transforms.rotation.radians) * 180 / Math.PI;
                if (cur_angle < 0) {
                    cur_angle = 180 - Math.abs(cur_angle);
                }
                let angle_index = Math.round(cur_angle / 45) % 4;
                if (int.mouse.cursor !== 'crosshair') {
                    if (this.interface.resize_calculation.rel) {
                        int.mouse.cursor = int.element.resize.side % 2 ? ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize'][angle_index] : ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize'][angle_index];
                    } else {
                        int.mouse.cursor = int.element.resize.side % 2 ? 'ns-resize' : 'ew-resize';
                    }
                }

                /* Recalculate using transforms copy */
                let side = int.element.resize.side,
                    resize_copy = this.transforms_copy.scale,
                    prev_copy = resize_copy.verts[check[side]],
                    cur_copy = resize_copy.verts[check[side + 1]],
                    side_vec_copy = new module.Vector(cur_copy.x - prev_copy.x, cur_copy.y - prev_copy.y),
                    mouse_vec_copy = new module.Vector(int.mouse.rel.x - prev_copy.x, int.mouse.rel.y - prev_copy.y),
                    proj = side_vec_copy.project(mouse_vec_copy),
                    copy_verts = resize_copy.verts,
                    verts = resize.verts;

                /* Calculate mouse dist from side */
                let c = proj.copy();
                    c.add(prev_copy);

                let resize_vec = new module.Vector(int.mouse.rel.x - c.x, int.mouse.rel.y - c.y);

                /* Scale main side from transforms copy */
                resize.verts[check[side]] = {
                    x : copy_verts[check[side]].x + resize_vec.x,
                    y : copy_verts[check[side]].y + resize_vec.y
                };
                resize.verts[check[side + 1]] = {
                    x : copy_verts[check[side + 1]].x + resize_vec.x,
                    y : copy_verts[check[side + 1]].y + resize_vec.y
                };

                /* Scale opposite side from transforms copy (using pivot) */
                let pivot = this.attributes.transforms.pivot,
                    adj_side_inv = new module.Vector(
                        copy_verts[check[side + 1]].x - copy_verts[check[side + 2]].x, 
                        copy_verts[check[side + 1]].y - copy_verts[check[side + 2]].y
                    ),
                    copy_vec = new module.Vector(
                        copy_verts[check[side + 1]].x - pivot.x,
                        copy_verts[check[side + 1]].y - pivot.y
                    ),
                    cur_vec = new module.Vector(
                        verts[check[side + 1]].x - pivot.x,
                        verts[check[side + 1]].y - pivot.y
                    ),
                    copy_proj = adj_side_inv.project(copy_vec),
                    cur_proj = adj_side_inv.project(cur_vec),
                    pivot_vec = new module.Vector(
                        copy_verts[check[side + 2]].x - pivot.x, 
                        copy_verts[check[side + 2]].y - pivot.y
                    ),
                    opp_proj = adj_side_inv.project(pivot_vec),
                    scale = (cur_proj.mag() / copy_proj.mag()) * (cur_proj.basis().equals(copy_proj.basis().inv()) ? -1 : 1);

                if (scale !== NaN) {

                    /* Scale and add resizing vector */
                    opp_proj.mult(scale - 1);
                    resize.verts[opp[side]] = {
                        x : copy_verts[opp[side]].x + opp_proj.x,
                        y : copy_verts[opp[side]].y + opp_proj.y
                    };
                    resize.verts[opp[side + 1]] = {
                        x : copy_verts[opp[side + 1]].x + opp_proj.x,
                        y : copy_verts[opp[side + 1]].y + opp_proj.y
                    };

                    /* Node rescaling calculations */
                    let copy_top = new module.Vector(copy_verts[3].x - copy_verts[0].x, copy_verts[3].y - copy_verts[0].y),
                        copy_left = new module.Vector(copy_verts[0].x - copy_verts[1].x, copy_verts[0].y - copy_verts[1].y),
                        top = new module.Vector(verts[3].x - verts[0].x, verts[3].y - verts[0].y),
                        left = new module.Vector(verts[0].x - verts[1].x, verts[0].y - verts[1].y);
                    this.nodes.forEach((node, i) => {
                        let node_vec = new module.Vector(this.nodes_copy[i].x - copy_verts[0].x, this.nodes_copy[i].y - copy_verts[0].y),
                            ct = copy_top.copy(),
                            cl = copy_left.copy(),
                            node_x_proj = ct.project(node_vec),
                            node_y_proj = cl.project(node_vec),
                            scale_x = (top.mag() / copy_top.mag()) || 1,
                            scale_y = (left.mag() / copy_left.mag()) || 1;
                        node_x_proj.mult(scale_x * (copy_top.basis().equals(top.basis().inv()) ? -1 : 1));
                        node_y_proj.mult(scale_y * (copy_left.basis().equals(left.basis().inv()) ? -1 : 1));
                        node.x = verts[0].x + node_x_proj.x + node_y_proj.x;
                        node.y = verts[0].y + node_x_proj.y + node_y_proj.y;
                    });
                }
            }
        }
        moveResize (w, h) {
            this.copy();

            if (w === 0 || h === 0) {
                return;
            }
            
            let int = module.Interactor,
                pivot = this.attributes.transforms.pivot,//this.attributes.transforms.scale.center,
                angle = this.attributes.transforms.rotation.radians,
                resize = this.attributes.transforms.scale,
                verts = resize.verts;
            
            if (w !== null) {
                let current_w = Element.dist(verts[0], verts[3]);

                this.nodes.forEach(node => {
                    let toNode = new module.Vector(node.x - pivot.x, node.y - pivot.y),
                        basis = module.Vector.basisFromAngle(angle),
                        proj = basis.project(toNode);
                        
                    if (proj.mag() > 0.001) {
                        let upToNode = new module.Vector(toNode.x - proj.x, toNode.y - proj.y);
                        proj.mult(w / current_w);
                        proj.add(upToNode);
                        node.x = pivot.x + proj.x;
                        node.y = pivot.y + proj.y;
                    }
                });
            } else {
                let current_h = Element.dist(verts[0], verts[1]);

                this.nodes.forEach(node => {
                    let toNode = new module.Vector(node.x - pivot.x, node.y - pivot.y),
                        basis = module.Vector.basisFromAngle(angle - 1/2 * Math.PI),
                        proj = basis.project(toNode);
                    if (proj.mag() > 0.001) {
                        let upToNode = new module.Vector(toNode.x - proj.x, toNode.y - proj.y);
                        proj.mult(h / current_h);
                        proj.add(upToNode);
                        node.x = pivot.x + proj.x;
                        node.y = pivot.y + proj.y;
                    }
                });
            }
        }
        clickContext () {
            let int = module.Interactor,
                context = this.interface.context;
            if (this.interface.passes_check && int.mouse.pressed && int.mouse.button === 2) {
                module.OpenContextMenu('element', {
                    data : this,
                    location : {
                        x : int.mouse.page.x,
                        y : int.mouse.page.y
                    },
                    buttons : [
                        {
                            name : 'Copy',
                            symbol : 'content_copy',
                            click : function (e, menu, data) {
                                let copy = module.Element.copyFrom(data);
                                module.Flats.Elements.push(copy);
                                copy.select();
                                menu.remove();
                            }
                        },
                        {
                            name : 'Delete',
                            symbol : 'delete',
                            click : function (e, menu, data) {
                                data.remove();
                                menu.remove();
                            }
                        },
                        {
                            name : 'Edit',
                            symbol : 'edit',
                            click : function (e, menu, data) {
                                module.UI.openController();
                                menu.remove();
                            }
                        }
                    ]
                });
            }
        }
        renderBox (ctx) {
            let int = module.Interactor,
                trans = this.attributes.transforms,
                mouse = module.Interactor.mouse,
                verts = trans.scale.verts,
                disabled_sides = this.interface.disabled_sides;
            let color = 'rgba(0, 0, 0, 0.3)',
                off_color = 'rgba(0, 0, 0, 0.15)'

            /* Resize Box UI */
            ctx.save();
            for (let i = 0; i < verts.length; i++) {
                let next_index = (i + 1) % 4;
                ctx.beginPath();
                ctx.lineWidth = 1 * 1/int.mouse.scale;
                ctx.strokeStyle = color;
                ctx.setLineDash([6 / mouse.scale, 6 / mouse.scale]);
                ctx.moveTo(trans.scale.verts[i].x, trans.scale.verts[i].y);
                ctx.lineTo(trans.scale.verts[next_index].x, trans.scale.verts[next_index].y);
                if (disabled_sides.includes(i)) ctx.strokeStyle = 'red';
                ctx.stroke();
                ctx.closePath();
            }
            ctx.restore();
        }
        renderUI (ctx) {
            let int = module.Interactor,
                trans = this.attributes.transforms,
                mouse = module.Interactor.mouse,
                verts = trans.scale.verts,
                disabled_sides = this.interface.disabled_sides;
            let color = 'rgba(0, 0, 0, 0.3)',
                off_color = 'rgba(0, 0, 0, 0.15)'

            /* Exit if element isn't active */
            if (int.element.uuid !== this.uuid) return;

            /* 'Spokes' from pivot to resize frame */
            ctx.save();
            trans.scale.verts.forEach(vert => { 
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.moveTo(trans.pivot.x, trans.pivot.y);
                ctx.lineTo(vert.x, vert.y);
                ctx.setLineDash([6 / mouse.scale, 6 / mouse.scale]);
                ctx.stroke();
                ctx.closePath();
            });
            ctx.restore();

            /* Rotation UI */
            const angle = trans.rotation.radians;
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillStyle = 'transparent';
            ctx.lineWidth = 5 * 1/int.mouse.scale;
            ctx.arc(trans.pivot.x, trans.pivot.y, 13 * 1/int.mouse.scale, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.beginPath();
            ctx.strokeStyle = trans.rotation.hovered ? 'red' : 'orange';
            ctx.fillStyle = '#00000000';
            ctx.lineWidth = 3 * 1/int.mouse.scale;
            ctx.arc(trans.pivot.x, trans.pivot.y, 12 * 1/int.mouse.scale, 0, angle);
            ctx.stroke();
            ctx.fill();
            ctx.moveTo(
                trans.pivot.x + 4 * 1/int.mouse.scale * Math.cos(angle),
                trans.pivot.y + 4 * 1/int.mouse.scale * Math.sin(angle),
            );
            ctx.lineTo(
                trans.pivot.x + 20 * 1/int.mouse.scale * Math.cos(angle),
                trans.pivot.y + 20 * 1/int.mouse.scale * Math.sin(angle),
            );
            ctx.stroke();
            ctx.closePath();
            ctx.restore();

            /* Pivot UI */
            ctx.beginPath();
            ctx.fillStyle = trans.pivot.hovered ? color : off_color;
            ctx.ellipse(trans.pivot.x, trans.pivot.y, 6 * 1/int.mouse.scale, 6 * 1/int.mouse.scale, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 * 1/int.mouse.scale;
            ctx.ellipse(trans.pivot.x, trans.pivot.y, 9 * 1/int.mouse.scale, 9 * 1/int.mouse.scale, 0, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();

            /* Resize Box UI */
            this.renderBox(ctx);

            /* Center UI */
            let center = this.attributes.transforms.scale.center;
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(center.x, center.y - 10 * 1/int.mouse.scale);
            ctx.lineTo(center.x, center.y + 10 * 1/int.mouse.scale);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(center.x - 10 * 1/int.mouse.scale, center.y);
            ctx.lineTo(center.x + 10 * 1/int.mouse.scale, center.y);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();

            /* Context UI */
            /*let context = this.interface.context;
            let cur_verts = verts.map(vert => {return {vert : vert, x : vert.x, y : vert.y}});
            cur_verts.sort((a, b) => (a.y * 0.2 - a.x * 0.8) - (b.y * 0.2 - b.x * 0.8));
            let vert = cur_verts[0].vert;
            context.x = vert.x;
            context.y = vert.y;
            if (this.holding('none')) {
                ctx.beginPath();
                //ctx.globalCompositeOperation = 'difference';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.ellipse(context.x + 30 * 1/int.mouse.scale, context.y, 18 * 1/int.mouse.scale, 18 * 1/int.mouse.scale, 0, 0, 2 * Math.PI);
                ctx.fill();
                //ctx.globalCompositeOperation = 'source-over';
                ctx.closePath();
                ctx.beginPath();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                if (Element.dist(int.mouse.rel, {x : context.x + 30 * 1/int.mouse.scale, y : context.y}) < 18 * 1/int.mouse.scale) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                    int.mouse.cursor = 'pointer';
                }
                ctx.ellipse(context.x + 30 * 1/int.mouse.scale, context.y, 15 * 1/int.mouse.scale, 15 * 1/int.mouse.scale, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            }*/

        }

        /* Element updating */
        trigger (event) {
            this.events[event](this);
        }
        updateName (name) {
            this.attributes.name = name;
        }
        update () {
            let int = module.Interactor;

            if (int.element.uuid !== this.uuid) {
                this.interface.isActive = false;
            }

            if (!this.interface.isActive) {
                // Do something here
            } else {
                Interactor.mouse.cursor = 'DEFAULT';
            }

            /* When not grabbing a node or the resize box, recalculate resize */
            if (int.element.node.uuid === null && !int.element.resize.grab) {
                this.calculateResize();
            }
            this.calculateCenter();
        }
        run () {
            if (!this.interface.hold_until_reclick && Interactor.element.uuid === this.uuid) {
                this.update();
                this.ensurePivotVerts();
                this.hoverResize();
                this.hoverNodes();
                this.hoverPivot();
                this.hoverRotation();
                this.grabPivot();
                this.grabRotation();
                this.grabNodes();
                this.grabResize();
                this.snapPivotLocal();
                this.snapNodesGlobal();
            }

            if (this.attributes.dropdown) {
                this.attributes.dropdown.Element = this;
            }

            if (!module.Interactor.mouse.pressed) {
                this.interface.hold_until_reclick = false;
            }
        }
        export () {
            let format = this.attributes.format;
            if (format) {
                return format.attributes.format.export.script(this);
            }
            return '';
        }

        /* Remove method */
        remove () {
            for (let e = 0; e < module.Flats.Elements.length; e++) {
                let Element = module.Flats.Elements[e];
                if (Element.uuid === this.uuid) {
                    module.Flats.Elements.splice(e, 1);
                    break;
                }
            }
            module.Flats.Anchors.forEach(anchor => {
                anchor.removeElement(this.uuid);
            });
            module.Flats.Controllers.forEach(controller => {
                controller.removeElement(this.uuid);
            });
            if (this.attributes.dropdown) {
                this.attributes.dropdown.remove();
            }
        }
    }
    module.CopyElement = function (element) {
        const copy = module.DeepMerge({}, element);
        copy.uuid = module.AlternativeCrypto.randomUUID({
            objects : module.Flats.Elements,
            key : 'uuid'
        });
        console.log(copy);
        copy.idNodes();
        return copy;
    };
  
    module.Element = Element;
})(this);
