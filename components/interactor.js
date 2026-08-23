(function (module) {
    module.Interactor = {
        global : {
            icon_scale : 1
        },
        holding : function (type, exclusive=true) {
            let passes = false,
                fail = false;
            let conditions = Object.entries({
                'pivot' : this.element.pivot.grab,
                'node' : this.element.node.uuid !== null,
                'resize' : this.element.resize.grab,
                'rotation' : this.element.rotation.grab,
                'snapper-node' : this.snapper.node.uuid !== null,
                'anchor-pivot' : this.anchor.pivot.grab,
                'anchor-rotation' : this.anchor.rotation.grab,
                'anchor-resize' : this.anchor.resize.grab,
                'shape-creation' : this.shape_creation.active,
                'moving' : this.keyboard.key.name === 'Control' && this.keyboard.pressed
            });
            conditions.forEach(v => {
                if (v[0] === type && v[1] === true) {
                    passes = true;
                }
                if (exclusive && v[0] !== type && v[1] === true) {
                    fail = true;
                }
            });

            // Special Conditions
            switch (type) {
                case 'none':
                    let none = false;
                    conditions.forEach(v => none = none || v[1]);
                    return !none;
                case 'any':
                    let any = false;
                    conditions.forEach(v => any = any || v[1]);
                    return any;
            }
            return passes && !fail;
        },
        set : function (type, uuid) {
            if (uuid !== null) {
                this.reset();
            } else {
                this[type].reset();
            }
            switch (type) {
                case 'element':
                    this.element.uuid = uuid;
                break;
                case 'anchor':
                    this.anchor.uuid = uuid;
                break;
                case 'snapper':
                    this.snapper.uuid = uuid;
                break;
            }
        },
        reset : function () {
            this.element.reset();
            this.snapper.reset();
            this.anchor.reset();
        },
        select_stack : {
            list : [],
            blocked : false,
            add : function (object) {
                if (!this.blocked) {
                    const prefix = object instanceof Element ? 'element' : (object instanceof Anchor ? 'anchor' : (object instanceof Snapper ? 'snapper' : 'format'));
                    this.list.push(`${prefix}#${object.uuid}`);
                }
            },
            block : function () {
                this.list = [];
                this.blocked = true;
            },
            selectTop : function () {
                /*
                  Select object that is on top.
                */
                if (this.list.length > 0) {
                    let item = this.list[this.list.length - 1],
                        prefix = item.slice(0, item.indexOf('#')),
                        uuid = item.slice(item.indexOf('#') + 1);
                        object = module.Flats.get[prefix](uuid);
                    object.select();
                    switch (prefix) {
                        case "e":

                        break;
                    }
                }
            },
            recycle : function () {
                this.list = [];
                this.blocked = false;
            }
        },
        element : {
            object : null,
            uuid : null,
            selected_on_cycle : false,
            resize : {
                side : null,
                grab : false
            },
            pivot : {
                grab : false
            },
            rotation : {
                grab : false
            },
            node : {
                uuid : null,
                grab : false,
                event : {
                    grab : function () {}
                }
            },
            select : function (uuid) {
                this.reset();
                this.uuid = uuid;
            },
            grabNode : function (uuid) {
                this.resetUI();
                this.node.uuid = uuid;
                this.node.grab = true;
            },
            grabRotation : function () {
                this.resetUI();
                this.rotation.grab = true;
            },
            grabPivot : function () {
                this.resetUI();
                this.pivot.grab = true;
            },
            grabSide : function (side) {
                this.resetUI();
                this.side = side;
                this.grab = true;
            },
            resetUI : function () {
                this.node.uuid = null;
                this.node.grab = false;
                this.resize.grab = false;
                this.resize.side = null;
                this.pivot.grab = false;
                this.rotation.grab = false;
            },
            reset : function () {
                this.uuid = null;
                this.node.uuid = null;
                this.node.grab = false;
                this.resize.grab = false;
                this.resize.side = null;
                this.pivot.grab = false;
                this.rotation.grab = false;
            },
            event : {
                select : function () {}
            }
        },
        snapper : {
            uuid : null,
            node : {
                uuid : null,
                grab : false
            },
            visible : false,
            __press_tick : false,
            checkKey : function () {
                let int = module.Interactor;
                if (['S', 's'].includes(int.keyboard.key.name) && int.keyboard.pressed && this.__press_tick) {
                    this.toggleVisibility();
                }
                if (!int.keyboard.pressed) {
                    this.__press_tick = true;
                }
            },
            toggleVisibility : function (force=false) {
                this.visible = !this.visible || force;
                this.__press_tick = false;
                Flats.Snappers.forEach(snapper => snapper.interface.isActive = this.visible);
            },
            select : function (uuid) {
                this.reset();
                this.uuid = uuid;
            },
            grabNode : function (uuid) {
                this.reset();
                this.uuid = uuid;
                this.grab = true;
            },
            resetUI : function () {
                this.node.uuid = null;
                this.node.grab = false;
            },
            reset : function () {
                this.uuid = null;
                this.node.uuid = null;
                this.node.grab = false;
            },
        },
        anchor : {
            uuid : null,
            selected_on_cycle : false,
            resize : {
                side : null,
                grab : false
            },
            pivot : {
                grab : false
            },
            rotation : {
                grab : false
            },
            checkKey : function () {
                let int = module.Interactor;
                if (['A', 'a'].includes(int.keyboard.key.name) && int.keyboard.pressed) {
                    Flats.Anchors.forEach(anchor => anchor.interface.isActive = true);
                } else {
                    Flats.Anchors.forEach(anchor => anchor.interface.isActive = false);
                }
            },
            adding : {
                isActive : false,
                currentElements : []
            },
            select : function (uuid) {
                this.reset();
                this.uuid = uuid;
            },
            grabRotation : function () {
                this.resetUI();
                this.rotation.grab = true;
            },
            grabPivot : function () {
                this.resetUI();
                this.pivot.grab = true;
            },
            grabSide : function (side) {
                this.resetUI();
                this.resize.side = side;
                this.resize.grab = true;
            },
            resetUI : function () {
                this.resize.side = null;
                this.resize.grab = false;
                this.pivot.grab = false;
                this.rotation.grab = false;
            },
            reset : function () {
                this.uuid = null;
                this.resize.side = null;
                this.resize.grab = false;
                this.pivot.grab = false;
                this.rotation.grab = false;
                this.adding.isActive = false;
                this.adding.currentElements = [];
            },
        },
        node_field : {
            element : null,
            x : 0,
            y : 0,
            tx : 0,
            ty : 0,
            grab : false,
        },
        draggedItem : {
            order : [],
            target : '',
            element : null
        },
        shape_creation : {
            format : null,
            sizing_active : false,
            node_on_tick : false,
            x : 0,
            y : 0,
            active : false,
            type : 'shape',
            setActive : function () {
                this.active = true;
            },
            setFormat : function (format) {
                this.format = format;
                this.setActive();
            },
            setType : function (type) {
                this.type = type;
            }
        },

        controller : {
            uuid : null,
            adding : {
                isActive : false,
                currentElements : []
            },
            reset : function () {
                this.uuid = null;
                this.adding.isActive = false;
                this.currentElements = [];
            }
        },
        widget : {
            from : {
                uuid : null
            },
            undo : {
                uuid : null
            },
            selectionActive : false
        },
        mouse : {
            cursor : 'DEFAULT',
            pressed : false,
            button : 0,
            rel : {
                x : 0,
                y : 0
            },
            abs : {
               x : 0,
               y : 0 
            },
            page : {
                x : 0, 
                y : 0
            },
            scale : 1.0
        },
        keyboard : {
            key : {
                name : '',
                code : -1
            },
            pressed : false
        },
        reset_cursor : function () {
            this.mouse.cursor = 'DEFAULT';
        },
        set_cursor : function () {
            /* Set cursor type */
            document.body.style.cursor = this.mouse.cursor;
        },
        clear_selector_on_cycle : function () {
            this.element.selected_on_cycle = false;
            this.anchor.selected_on_cycle = false;
        },
        update : function (DOM) {

            /* Clicking off */
            if (this.mouse.pressed && this.element.node.uuid === null) {
                this.element.node.grab = false;
            }

            /* Releasing mouse */
            if (!this.mouse.pressed) {
                let element = module.Flats.get.element(this.element.uuid);
                if (element) {
                    element.trigger('release');
                    element.releaseNodes();
                }
                this.element.resize.grab = false;
                this.element.resize.side = null;
                this.element.pivot.grab = false;
                this.element.rotation.grab = false;
                this.anchor.pivot.grab = false;
                this.anchor.rotation.grab = false;
                this.anchor.resize.grab = false;
                this.anchor.resize.side = null;
            }

            /* Deselecting element */
            if (this.keyboard.pressed) {
                if (this.keyboard.key.name === 'Escape') {
                    this.element.uuid = null;
                    this.element.node.uuid = null;
                    this.anchor.uuid = null;
                    this.reset();
                } else if (this.keyboard.key.name === 'Control') {
                    this.mouse.cursor = 'grab';
                } else if (this.keyboard.key.name === 'Delete') {
                    if (this.element.uuid !== null) {
                        let element = module.Flats.get.element(this.element.uuid);
                        element.remove();
                        this.reset();
                    }
                } else if (this.keyboard.key.name === 'x') {
                    module.Exporter.compileProject();
                }
            }

            /* Moving the canvas with 'Control' key */
            if (this.mouse.pressed) {
                if (this.keyboard.key.name === "Control" && this.keyboard.pressed) {
                    Camera.mouseRef.x += this.mouse.abs.x - this.mouse.px;
                    Camera.mouseRef.y += this.mouse.abs.y - this.mouse.py;
                    this.mouse.cursor = "grabbing";
                }
            }

            this.mouse.px = parseFloat(`${this.mouse.abs.x}`);
            this.mouse.py = parseFloat(`${this.mouse.abs.y}`);

            /* Update Mouse */
            let scope = this;
            if (!DOM.hasEventListener) {
                function mousePos (DOM, e) {
                    /* DISCLAIMER: Original code written by Google Gemini */
                    const rect = DOM.getBoundingClientRect();

                    const dX = e.clientX - rect.left,
                          dY = e.clientY - rect.top;
                    
                    const cX = dX * (DOM.width / rect.width),
                          cY = dY * (DOM.height / rect.height);
                    
                    return {x : cX, y : cY};
                }

                DOM.addEventListener("click", () => {
                    DOM.focus();
                });
                DOM.addEventListener('mousemove', function (e) {
                    scope.mouse.abs = mousePos(DOM, e);
                });
                DOM.addEventListener('mousedown', function (e) {
                    scope.mouse.pressed = true;
                    scope.mouse.button = e.button;
                    scope.mouse.abs = mousePos(DOM, e);
                });
                DOM.addEventListener('mouseup', function (e) {
                    scope.mouse.pressed = false;
                    scope.mouse.abs = mousePos(DOM, e);
                });
                DOM.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                });
                document.body.addEventListener('mousemove', (e) => {
                    scope.mouse.page = {x : e.clientX, y : e.clientY};
                });
                document.body.addEventListener('keydown', function (e) {
                    if (document.activeElement !== DOM) return;
                    
                    scope.keyboard.key = {
                        name : e.key,
                        code : e.code
                    };
                    scope.keyboard.pressed = true;
                });
                document.body.addEventListener('keyup', function (e) {
                    scope.keyboard.pressed = false;
                });
                DOM.addEventListener('wheel', function (e) {
                    e.preventDefault();

                    scope.mouse.pressed = false;
                    scope.mouse.abs = mousePos(DOM, e);

                    /* Updating mouse offset for zoom */
                    Camera.offset.x -= (scope.mouse.abs.x - Camera.mouseRef.x) / Camera.scale;
                    Camera.offset.y -= (scope.mouse.abs.y - Camera.mouseRef.y) / Camera.scale;
                    Camera.mouseRef.x = scope.mouse.abs.x;
                    Camera.mouseRef.y = scope.mouse.abs.y;
                    
                    /* Updating scaling */
                    Camera.scale *= Math.pow(1.1, -e.deltaY / 100);
                    scope.mouse.scale = Camera.scale;
                });

                DOM.hasEventListener = true;
            }
        }
    };
})(this);
