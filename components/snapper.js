(function (module) {
    class Snapper {
        constructor (type) {
            /* ID generation checked against other elements */
            this.uuid = module.AlternativeCrypto.randomUUID({
                objects : module.Flats.Snappers,
                key : 'uuid'
            });
            this.type = type;

            this.attributes = {
                name : `Unnamed Snapper`,
                dropdown : null,
                snap : null,
                width : 5,
                node_width : 5
            };

            this.events = {
                'release' : function (that) {
                    if (Interactor.holding('any')) {
                        that.attributes.dropdown.isLoaded = false;
                    }
                }
            };

            this.interface = {
                isHovered : false,
                isActive : false
            };

            this.nodes = [
                {x : 200, y : 200}
            ];

            this.idNodes();
            this.bindSnap(module.Flats.Snaps[type]);
        }
        static range (size) {
            return new Uint8Array(size);
        }
        addDropdown () {
            this.attributes.dropdown = new module.SnapperDropdown(
                this.attributes.name,
                this.uuid,
                {}
            );
            this.attributes.dropdown.bindParent(this);
            this.attributes.dropdown.load();
            this.attributes.dropdown.loadFields();
        }
        setWidth (width) {
            this.attributes.width = width;
        }
        setNodes (nodes) {
            this.nodes = nodes;
            this.idNodes();
        }
        updateName (name) {
            this.attributes.name = name;
        }
        test (point) {
            if (this.interface.isActive) {
                return this.attributes.snap.test(this, point);
            } else return null
        }
        bindSnap (snap) {
            this.attributes.snap = snap;
            this.idNodes();
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
        createNode () {
            return {
                x : 0,
                y : 0,
                hovered : false
            };
        }
        idNodes () {
            let that = this;
            this.nodes.forEach(node => {
                node.uuid = module.AlternativeCrypto.randomUUID({
                    objects : this.nodes,
                    key : 'uuid'
                })
            });
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
        hoverNodes () {
            let int = module.Interactor;

            if (!this.interface.isActive) return;

            const that = this;
            if (int.holding('none') || int.holding('snapper-node')) {
                this.nodes.forEach(node => {
                    if (Element.dist(node, int.mouse.rel) < (that.attributes.width * 2) * 1/int.mouse.scale) {
                        that.interface.isHovered = true;
                    }
                });
            }
        }
        grabNodes () {
            let int = module.Interactor,
                that = this;

            if (!this.interface.isActive) return;

            if (int.holding('none') || int.holding('snapper-node')) {
                this.nodes.forEach(node => {
                    if (int.mouse.pressed && int.mouse.button === 0) {
                        if (Element.dist(node, int.mouse.rel) < (that.attributes.width * 2) * 1/int.mouse.scale && int.snapper.node.uuid === null) {
                            int.reset();
                            int.snapper.uuid = this.uuid;
                            int.snapper.node.uuid = node.uuid;
                            int.snapper.node.grab = true;
                        }
                        if (int.snapper.node.uuid === node.uuid) {
                            node.x = int.mouse.rel.x;
                            node.y = int.mouse.rel.y;
                        }
                    }
                });
                if (int.holding('snapper-node')) {
                    UI.selectPanelPage('Snappers');
                }
            }
        }
        render (ctx) {
            let int = module.Interactor,
                that = this;

            if (!this.interface.isActive) return;
            if (this.attributes.snap !== null) {
                this.attributes.snap.main(this, ctx);
            }
            this.nodes.forEach(node => {
                ctx.beginPath();
                ctx.fillStyle = node.mouseOff?.color || 'black';
                ctx.ellipse(node.x, node.y, (that.attributes.node_width * 1.1) * 1/int.mouse.scale, (that.attributes.node_width * 1.1) * 1/int.mouse.scale, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
                ctx.beginPath();
                ctx.fillStyle = node.mouseOff?.color || 'red';
                if (Element.dist(node, int.mouse.rel) < (that.attributes.width * 2) * 1/int.mouse.scale) {
                    ctx.fillStyle = node.mouseOn?.color || 'orange';
                }
                ctx.ellipse(node.x, node.y, that.attributes.node_width * 1/int.mouse.scale, that.attributes.node_width * 1/int.mouse.scale, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            });
        }
        update () {
            let int = module.Interactor;
            this.interface.isHovered = false;

            if (int.mouse.pressed && int.holding('snapper-node') && int.snapper.uuid === this.uuid &&
                int.keyboard.pressed && int.keyboard.key.name === 'Delete') {
                this.remove();
                //module.Flats.remove.snapper(this.uuid);
                int.reset();
            }

            if (!int.mouse.pressed) {
                if (int.snapper.node.uuid !== null) {
                    this.events.release(this);
                }
                int.snapper.node.uuid = null
                int.snapper.node.grab = false;
            }
        }

        /* Remove method */
        remove () {
            for (let e = 0; e < module.Flats.Snappers.length; e++) {
                let Snapper = module.Flats.Snappers[e];
                if (Snapper.uuid === this.uuid) {
                    module.Flats.Snappers.splice(e, 1);
                    break;
                }
            }
            if (this.attributes.dropdown) {
                this.attributes.dropdown.remove();
            }
        }
    }
  
    module.Snapper = Snapper;
})(this);
