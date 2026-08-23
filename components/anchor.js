(function (module) {
    class Anchor {
        constructor (x, y) {
            /* ID generation checked against other anchors */
            this.uuid = module.AlternativeCrypto.randomUUID({
                objects : module.Flats.Anchors,
                key : 'uuid'
            });

            /* Rendering Properties */
            this.attributes = {
                name : 'Unknown Anchor',
                dropdown : null,
                anchor : null,
                transforms : {
                    pivot : {
                        x : x,
                        y : y,
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
                        width : 32,
                        height : 32
                    },
                    rotation : {
                        radians : 0,//Math.PI * 1/4,
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
                    include_pivots : false
                },
                detection_radius : 10,
                disabled_sides : [],
                passes_check : false
            };

            /* Attached Elements */
            this.elements = [];

            /* Field Copies for Transformations */
            this.transforms_copy = {};
        }

        attrib (name, depthLimiter=Infinity) {
            return ObjectSearch(this.attributes, name, depthLimiter);
        }

        /* Anchor Methods */
        addDropdown () {
            this.attributes.dropdown = new module.AnchorDropdown(
                this.attributes.name,
                this.uuid,
                {}
            );
            this.attributes.dropdown.bindParent(this);
            this.attributes.dropdown.load();
            this.attributes.dropdown.loadFields();
        }
        removeElement (uuid) {
            for (let i = 0; i < this.elements.length; i++) {
                if (this.elements[i].uuid === uuid) {
                    this.elements.splice(i, 1);
                    this.attributes.dropdown.isLoaded = false;
                    return;
                }
            }
        }
        addElement (uuid) {
            if (!this.elements.map(e => e.uuid).includes(uuid)) {
                this.elements.push(module.Flats.get.element(uuid));
                this.attributes.dropdown.isLoaded = false;
            } else {
                alert('Anchor already contains this element!');
            }
        }
        copy () {
            this.transforms_copy = structuredClone({...this.attributes.transforms});
        }
        select () {
            let int = module.Interactor;

            /* Check for current interactions and set new interaction */
            if (this.holding('none')) {
                int.reset();
                int.anchor.uuid = this.uuid;
                int.anchor.selected_on_cycle = true;

                this.interface.isActive = true;

                /* Interactor Event */
                //int.anchor.event.select();
                this.interface.hold_until_reclick = true;
                UI.selectPanelPage('Anchors');
            }
        }
        checkPivotSelect () {
            let int = module.Interactor, 
                abs = module.Interactor.mouse.abs;
            
            let passes = false;
            if (int.mouse.pressed && int.mouse.button === 0 && this.holding('none')) {
                if (Element.dist(this.attributes.transforms.pivot, int.mouse.rel) < this.interface.detection_radius * 1/int.mouse.scale) {
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


        snapPivotLocal () {
            let int = module.Interactor,
                pivot = this.attributes.transforms.pivot,
                verts = this.attributes.transforms.scale.verts,
                disabled_sides = this.interface.disabled_sides;
            
            /* Exit if anchor is not active */
            if (int.anchor.uuid !== this.uuid) return;

            if (int.mouse.pressed && int.mouse.button === 2 && int.anchor.pivot.grab && 
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

            /* Exit if anchor is not active */
            if (int.anchor.uuid !== this.uuid) return;

            if (this.holding('none') || this.holding('anchor-pivot')) {
                if (Element.dist(int.mouse.rel, this.attributes.transforms.pivot) < 9 * 1/int.mouse.scale) {
                    this.attributes.transforms.pivot.hovered = true;
                    int.mouse.cursor = 'move';
                }
            }
        }
        grabPivot () {
            let int = module.Interactor;

            /* Exit if anchor is not active */
            if (int.anchor.uuid !== this.uuid) return;

            if (this.holding('none') || this.holding('anchor-pivot')) {
                if (Element.dist(int.mouse.rel, this.attributes.transforms.pivot) < 9 * 1/int.mouse.scale) {
                    if (int.mouse.pressed) {
                        int.anchor.pivot.grab = true;
                    }
                }
                if (int.anchor.pivot.grab && int.mouse.pressed) {
                    if (int.mouse.button === 2) {
                        this.attributes.transforms.pivot = {
                            x : int.mouse.rel.x,
                            y : int.mouse.rel.y
                        };
                    } else if (int.mouse.button === 0) {
                        if (!this.interface.isTranslating) {
                            this.interface.isTranslating = true;
                            this.elements.forEach(element => {
                                element.copy();
                            })
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
                            pivot_copy = this.transforms_copy.pivot;
                        this.elements.forEach(element => {
                            let other_pivot_copy = element.transforms_copy.pivot,
                                verts = element.attributes.transforms.scale.verts,
                                verts_copy = element.transforms_copy.scale.verts,
                                nodes_copy = element.nodes_copy;
                            for (var i = 0; i < verts.length; i++) {
                                verts[i].x = verts_copy[i].x + int.mouse.rel.x - pivot_copy.x;
                                verts[i].y = verts_copy[i].y + int.mouse.rel.y - pivot_copy.y;
                            }
                            for (var i = 0; i < element.nodes.length; i++) {
                                element.nodes[i].x = nodes_copy[i].x + int.mouse.rel.x - pivot_copy.x;
                                element.nodes[i].y = nodes_copy[i].y + int.mouse.rel.y - pivot_copy.y;
                            }
                            element.attributes.transforms.pivot = {
                                x : other_pivot_copy.x + int.mouse.rel.x - pivot_copy.x,
                                y : other_pivot_copy.y + int.mouse.rel.y - pivot_copy.y
                            };
                        });
                        let verts = this.attributes.transforms.scale.verts,
                            verts_copy = this.transforms_copy.scale.verts;
                        for (var i = 0; i < verts.length; i++) {
                            verts[i].x = verts_copy[i].x + int.mouse.rel.x - pivot_copy.x;
                            verts[i].y = verts_copy[i].y + int.mouse.rel.y - pivot_copy.y;
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
            for (var i = 0; i < this.elements.length; i++) {
                let element = this.elements[i];
                element.copy();
                element.movePivot(
                    x + element.transforms_copy.pivot.x - pivot_copy.x, 
                    y + element.transforms_copy.pivot.y - pivot_copy.y
                );
            }

            this.attributes.transforms.pivot = {
                x : x,
                y : y
            };
        }
        hoverRotation () {
            let int = module.Interactor,
                trans = this.attributes.transforms;

            /* Exit if anchor is not active */
            if (int.anchor.uuid !== this.uuid) return;

            if (this.holding('none') || this.holding('anchor-rotation')) {
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

            /* Exit if anchor is not active */
            if (int.anchor.uuid !== this.uuid) return;

            if (this.holding('none') || this.holding('anchor-rotation')) {
                let d = Element.dist(int.mouse.rel, this.attributes.transforms.pivot);
                if (d > 10 * 1/int.mouse.scale && d < 15 * 1/int.mouse.scale) {
                    if (int.mouse.pressed) {
                        int.anchor.rotation.grab = true;
                    }
                }
                if (int.anchor.rotation.grab && int.mouse.pressed) {
                    if (int.mouse.button === 0) {
                        if (!this.interface.isRotating) {
                            this.interface.isRotating = true;
                            let that = this;
                            this.copy();
                            this.elements.forEach(element => {
                                element.copy();
                                Element.rotatePoints(trans.pivot, element.nodes_copy, -that.transforms_copy.rotation.radians);
                                element.transforms_copy.pivot = Element.rotatePoints(trans.pivot, [element.transforms_copy.pivot], -that.transforms_copy.rotation.radians)[0];
                                Element.rotatePoints(
                                    trans.pivot, 
                                    element.transforms_copy.scale.verts, 
                                    -that.transforms_copy.rotation.radians
                                );
                                element.transforms_copy.rotation.radians = 0;
                            })
                        }
                        
                        let angle = Math.atan2(
                            int.mouse.rel.y - trans.pivot.y, 
                            int.mouse.rel.x - trans.pivot.x
                        );
                        if (!(int.keyboard.pressed && int.keyboard.key.name === 'Shift')) {
                            let by = Math.PI / 12;
                            angle = Math.round(angle / by) * by;
                        }
                        this.elements.forEach(element => {

                            element.nodes_copy.forEach((node, i) => {
                                element.nodes[i].x = parseFloat(node.x);
                                element.nodes[i].y = parseFloat(node.y);
                            });
                            element.transforms_copy.scale.verts.forEach((vert, i) => {
                                element.attributes.transforms.scale.verts[i].x = parseFloat(vert.x);
                                element.attributes.transforms.scale.verts[i].y = parseFloat(vert.y);
                            });
                            element.attributes.transforms.pivot = {
                                x : parseFloat(element.transforms_copy.pivot.x),
                                y : parseFloat(element.transforms_copy.pivot.y)
                            };

                            Element.rotatePoints(trans.pivot, element.nodes, angle);
                            Element.rotatePoints(trans.pivot, element.attributes.transforms.scale.verts, angle);
                            element.attributes.transforms.pivot = Element.rotatePoints(trans.pivot, [element.attributes.transforms.pivot], angle)[0];

                            //Element.rotatePoints(trans.pivot, element.nodes, angle);

                            
                            element.attributes.transforms.rotation.radians = Vector.angleBetween(
                                element.attributes.transforms.scale.verts[0],
                                element.attributes.transforms.scale.verts[3]
                            );

                            //element.attributes.transforms.rotation.radians = element.transforms_copy.rotation.radians + angle * Math.PI / 180;
                            //element.attributes.transforms.pivot = Element.rotatePoints(trans.pivot, [element.attributes.transforms.pivot], angle)[0];
                        });
                        this.attributes.transforms.rotation.radians = angle;
                    }
                }
            }
            if (!int.mouse.pressed) {
                this.interface.isRotating = false;
            }
        }
        calculateResize () {
            let trans = this.attributes.transforms,
                points = [];

            /* Rotate nodes to 'standard' positions */
            if (this.interface.resize_calculation.rel) {
                let that = this;
                this.elements.forEach(element => {
                    Element.rotatePoints(trans.pivot, element.nodes, -that.attributes.transforms.rotation.radians);
                    element.attributes.transforms.pivot = (Element.rotatePoints(trans.pivot, [element.attributes.transforms.pivot], -this.attributes.transforms.rotation.radians))[0];
                    points = points.concat(element.nodes);
                    if (this.interface.resize_calculation.include_pivots) {
                        points.push(element.attributes.transforms.pivot);
                    }
                });
            }

            /* Find bounds */
            let minx = Math.min.apply(null, points.map(n => n.x)),
                miny = Math.min.apply(null, points.map(n => n.y)),
                maxx = Math.max.apply(null, points.map(n => n.x)),
                maxy = Math.max.apply(null, points.map(n => n.y));
            
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

            /* Calculat width/height (depracated feature) */
            let width = Element.dist(trans.scale.verts[0], trans.scale.verts[3]),
                height = Element.dist(trans.scale.verts[0], trans.scale.verts[1]);
            trans.scale.width = width;
            trans.scale.height = height;

            /* Rotate nodes to 'standard' positions */
            if (this.interface.resize_calculation.rel) {
                let that = this;
                this.elements.forEach(element => {
                    Element.rotatePoints(trans.pivot, element.nodes, that.attributes.transforms.rotation.radians);
                    element.attributes.transforms.pivot = (Element.rotatePoints(trans.pivot, [element.attributes.transforms.pivot], this.attributes.transforms.rotation.radians))[0];
                });
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
                trans = this.attributes.transforms,
                old_angle = this.attributes.transforms.rotation.radians;

            this.copy();
            this.elements.forEach(element => {
                element.copy();
                Element.rotatePoints(trans.pivot, element.nodes_copy, -old_angle);
                element.transforms_copy.pivot = Element.rotatePoints(trans.pivot, [element.transforms_copy.pivot], -old_angle)[0];
                element.attributes.transforms.rotation.radians -= old_angle;
            })
        
            this.elements.forEach(element => {
                element.nodes_copy.forEach((node, i) => {
                    element.nodes[i].x = parseFloat(node.x);
                    element.nodes[i].y = parseFloat(node.y);
                });
                element.attributes.transforms.pivot = {
                    x : parseFloat(element.transforms_copy.pivot.x),
                    y : parseFloat(element.transforms_copy.pivot.y)
                };
                Element.rotatePoints(trans.pivot, element.nodes, angle * Math.PI / 180);
                element.attributes.transforms.rotation.radians += angle * Math.PI / 180;
                element.attributes.transforms.pivot = Element.rotatePoints(trans.pivot, [element.attributes.transforms.pivot], angle * Math.PI / 180)[0];
            });
            this.attributes.transforms.rotation.radians = angle * Math.PI / 180;
        }
        hoverResize () {
            let int = module.Interactor,
                mouse = int.mouse,
                resize = this.attributes.transforms.scale;

            /* Exit if anchor is not active */
            if (int.anchor.uuid !== this.uuid) return;

            let check = [0, 1, 2, 3, 0, 1],
                opp = [2, 3, 0, 1, 2];
            if (this.holding('none')) {
                int.anchor.resize.side = null;
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
                        int.anchor.resize.side = check[i - 1];
                    }
                    if (this.interface.disabled_sides.includes(int.anchor.resize.side)) {
                        int.anchor.resize.side = null
                    }
                }
            }
            if (int.anchor.resize.side !== null) {
                let cur_angle = parseFloat(this.attributes.transforms.rotation.radians) * 180 / Math.PI;
                if (cur_angle < 0) {
                    cur_angle = 180 - Math.abs(cur_angle);
                }
                let angle_index = Math.round(cur_angle / 45) % 4;
                if (int.mouse.cursor !== 'crosshair') {
                    if (this.interface.resize_calculation.rel) {
                        int.mouse.cursor = int.anchor.resize.side % 2 ? ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize'][angle_index] : ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize'][angle_index];
                    } else {
                        int.mouse.cursor = int.anchor.resize.side % 2 ? 'ns-resize' : 'ew-resize';
                    }
                }
            }
        }
        grabResize (ctx) {
            let int = module.Interactor,
                mouse = int.mouse,
                resize = this.attributes.transforms.scale;

            /* Exit if anchor is not active */
            if (int.anchor.uuid !== this.uuid) return;

            let check = [0, 1, 2, 3, 0, 1],
                opp = [2, 3, 0, 1, 2];
            if (this.holding('none')) {
                /* Grab side and copy current state */
                if (int.anchor.resize.side !== null) {
                    if (int.mouse.pressed && int.mouse.button === 0) {
                        if (!this.interface.isResizing) {
                            this.copy();
                            this.elements.forEach(element => {
                                element.copy();
                            })
                            this.interface.isResizing = true;
                        }
                        int.anchor.resize.grab = true;
                    }
                }

                /* Clear resize */
                if (!int.mouse.pressed) {
                    this.interface.isResizing = false;
                }
            }

            /* Actual resizing rath */
            if (int.anchor.resize.side !== null && int.anchor.resize.grab) {
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
                        int.mouse.cursor = int.anchor.resize.side % 2 ? ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize'][angle_index] : ['ew-resize', 'nwse-resize', 'ns-resize', 'nesw-resize', 'ew-resize'][angle_index];
                    } else {
                        int.mouse.cursor = int.anchor.resize.side % 2 ? 'ns-resize' : 'ew-resize';
                    }
                }

                /* Recalculate using transforms copy */
                let side = int.anchor.resize.side,
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
                    this.elements.forEach(element => {
                        element.nodes.forEach((node, i) => {
                            let node_vec = new module.Vector(element.nodes_copy[i].x - copy_verts[0].x, element.nodes_copy[i].y - copy_verts[0].y),
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
                        let pivot_vec = new module.Vector(element.transforms_copy.pivot.x - copy_verts[0].x, element.transforms_copy.pivot.y - copy_verts[0].y),
                            ct = copy_top.copy(),
                            cl = copy_left.copy(),
                            pivot_x_proj = ct.project(pivot_vec),
                            pivot_y_proj = cl.project(pivot_vec),
                            scale_x = (top.mag() / copy_top.mag()) || 1,
                            scale_y = (left.mag() / copy_left.mag()) || 1;
                        pivot_x_proj.mult(scale_x * (copy_top.basis().equals(top.basis().inv()) ? -1 : 1));
                        pivot_y_proj.mult(scale_y * (copy_left.basis().equals(left.basis().inv()) ? -1 : 1));
                        element.attributes.transforms.pivot.x = verts[0].x + pivot_x_proj.x + pivot_y_proj.x;
                        element.attributes.transforms.pivot.y = verts[0].y + pivot_x_proj.y + pivot_y_proj.y;
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
                that = this,
                pivot = that.attributes.transforms.pivot,
                angle = that.attributes.transforms.rotation.radians,
                resize = that.attributes.transforms.scale,
                verts = resize.verts;
                
            if (w !== null) {
                this.elements.forEach(element => {
                    let current_w = Element.dist(verts[0], verts[3]);
                    element.nodes.forEach(node => {
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
                });
            } else {
                this.elements.forEach(element => {
                    let current_h = Element.dist(verts[0], verts[1]);
                    element.nodes.forEach(node => {
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
                });
            }
        }
        renderUI (ctx) {
            let int = module.Interactor,
                trans = this.attributes.transforms,
                mouse = module.Interactor.mouse,
                verts = trans.scale.verts,
                disabled_sides = this.interface.disabled_sides;
            let color = 'rgba(0, 0, 0, 0.3)',
                off_color = 'rgba(0, 0, 0, 0.15)'

            /* Exit if anchor is not active */
            if (int.anchor.uuid !== this.uuid) {
                ctx.beginPath();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `${16 * 1/int.mouse.scale * int.global.icon_scale}px sans-serif`;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                if (Element.dist(int.mouse.rel, trans.pivot) < this.interface.detection_radius *1/int.mouse.scale * int.global.icon_scale) {
                    ctx.fillStyle = 'black';
                    int.mouse.cursor = 'pointer';
                }
                ctx.fillText('⚓', trans.pivot.x, trans.pivot.y);

                ctx.closePath();
                return;
            };

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
            ctx.lineWidth = 5 * 1/int.mouse.scale * int.global.icon_scale;
            ctx.arc(trans.pivot.x, trans.pivot.y, 13 * 1/int.mouse.scale * int.global.icon_scale, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.beginPath();
            ctx.strokeStyle = trans.rotation.hovered ? 'red' : 'orange';
            ctx.fillStyle = '#00000000';
            ctx.lineWidth = 3 * 1/int.mouse.scale * int.global.icon_scale;
            ctx.arc(trans.pivot.x, trans.pivot.y, 12 * 1/int.mouse.scale * int.global.icon_scale, 0, angle);
            ctx.stroke();
            ctx.fill();
            ctx.moveTo(
                trans.pivot.x + 4 * 1/int.mouse.scale * Math.cos(angle) * int.global.icon_scale,
                trans.pivot.y + 4 * 1/int.mouse.scale * Math.sin(angle) * int.global.icon_scale,
            );
            ctx.lineTo(
                trans.pivot.x + 20 * 1/int.mouse.scale * Math.cos(angle) * int.global.icon_scale,
                trans.pivot.y + 20 * 1/int.mouse.scale * Math.sin(angle) * int.global.icon_scale,
            );
            ctx.stroke();
            ctx.closePath();
            ctx.restore();

            /* Pivot UI */
            ctx.beginPath();
            ctx.fillStyle = trans.pivot.hovered ? color : off_color;
            ctx.ellipse(trans.pivot.x, trans.pivot.y, 6 * 1/int.mouse.scale * int.global.icon_scale, 6 * 1/int.mouse.scale * int.global.icon_scale, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 * 1/int.mouse.scale;
            ctx.ellipse(trans.pivot.x, trans.pivot.y, 9 * 1/int.mouse.scale * int.global.icon_scale, 9 * 1/int.mouse.scale * int.global.icon_scale, 0, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();

            /* Resize Box UI */
            ctx.save();
            for (let i = 0; i < verts.length; i++) {
                let next_index = (i + 1) % 4;
                ctx.beginPath();
                ctx.lineWidth = 1 * 1/int.mouse.scale * int.global.icon_scale;
                ctx.strokeStyle = color;
                ctx.setLineDash([6 / mouse.scale, 6 / mouse.scale]);
                ctx.moveTo(trans.scale.verts[i].x, trans.scale.verts[i].y);
                ctx.lineTo(trans.scale.verts[next_index].x, trans.scale.verts[next_index].y);
                if (disabled_sides.includes(i)) ctx.strokeStyle = 'red';
                ctx.stroke();
                ctx.closePath();
            }
            ctx.restore();

            /* Center UI */
            let center = this.attributes.transforms.scale.center;
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(center.x, center.y - 10 * 1/int.mouse.scale) * int.global.icon_scale;
            ctx.lineTo(center.x, center.y + 10 * 1/int.mouse.scale) * int.global.icon_scale;
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.moveTo(center.x - 10 * 1/int.mouse.scale, center.y) * int.global.icon_scale;
            ctx.lineTo(center.x + 10 * 1/int.mouse.scale, center.y) * int.global.icon_scale;
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }


        /* Element updating */
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
            if (!int.anchor.resize.grab) {
                this.calculateResize();
            }
            this.calculateCenter();
        }
        run () {
            if (!this.interface.hold_until_reclick) {
                this.update();
                this.ensurePivotVerts();
                this.hoverResize();
                this.hoverPivot();
                this.hoverRotation();
                this.grabPivot();
                this.grabRotation();
                this.grabResize();
                this.snapPivotLocal();
            }

            if (!module.Interactor.mouse.pressed) {
                this.interface.hold_until_reclick = false;
            }
        }

        /* Remove method */
        remove () {
            for (let a = 0; a < module.Flats.Anchors.length; a++) {
                let Anchor = module.Flats.Anchors[a];
                if (Anchor.uuid === this.uuid) {
                    module.Flats.Anchors.splice(a, 1);
                    break;
                }
            }
            if (this.attributes.dropdown) {
                this.attributes.dropdown.remove();
            }
        }
    }

    module.Anchor = Anchor;
})(this);
