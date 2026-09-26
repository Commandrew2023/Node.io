/* RESOURCES */
(function (module) {
    class AlternativeCrypto {
        constructor (options) {
            this.FALLBACK_LENGTH = 32;
            this.MAX_LENGTH = ~~(options.max_length ?? this.FALLBACK_LENGTH);
            this.MIN_LENGTH = ~~(options.min_length ?? this.FALLBACK_LENGTH);
            this.LENGTH = ~~(options.length ?? this.FALLBACK_LENGTH);
            
            /* Ensure LENGTH is between min/max values */
            this.LENGTH = Math.max(this.MIN_LENGTH, Math.min(this.MAX_LENGTH, this.LENGTH));
        }
        static randomUUID (check = { objects : [], key : 'uuid' }) {
            while (true) {
                /* Cryptographically Secure UUID */
                /* - Credit to @broofa on stackoverflow.com {post converted to community wiki} */
                let id = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
                    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
                );
                if (!check) return id;

                /* Iterate checkable items */
                if (!!check?.objects && !!check?.key) {
                    let copyFound = false;
                    check.objects.forEach(item => {
                        if (item?.[check.key] === id) copyFound = true;
                    });
                    if (!copyFound) {
                        return id;
                    }
                } else {
                    throw new TypeError("Parameter 'check' requires 'object' and 'key' fields.");
                }
            }
        }
        create () {
            /* Cryptographically Not Secure ID */
            return (new Int8Array(options.LENGTH).fill(1).map(_ => String.fromCharCode(~~(Math.random() * 26) + 65))).join('');
        }
    }
    module.AlternativeCrypto = AlternativeCrypto;

    module.dragElement = function dragElement(elmnt) {
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      
      if (elmnt.querySelector(`#${elmnt.id}header`)) {
        // if present, the header is where you move the DIV from:
        elmnt.querySelector(`#${elmnt.id}header`).onmousedown = dragMouseDown;
      }/* else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
      }*/
    
      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }
    
      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }
    
      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }

    module.HTML_Build = function (struct) {
        const el = document.createElement(struct.type || 'div'),
              that = this;
        (struct.classes || []).forEach(c => {
            el.classList.add(c);
        });
        (struct.tags || []).forEach(t => {
            el.setAttribute(t.name, t.value);
        });
        (struct.events || []).forEach(event => {
            el.addEventListener(event.type, event.callback);
        });
        if (!!struct.id) {
            //el.setAttribute('id', struct.id);
            el.id = struct.id;
        }
        if (!!struct.html) {
            el.innerHTML += struct.html;
        }
        el.setAttribute('contenteditable', (struct.editable || false).toString());

        switch (struct.type) {
            case 'input':
                el.setAttribute('placeholder', struct.placeholder || '');
                el.setAttribute('value', struct.defaultValue || '');
            break;
        }

        if (struct.children?.length > 0) {
            (struct.children || []).forEach(child => {
                const child_El = module.HTML_Build(child);
                el.appendChild(child_El);
            });
        }
        if (struct.style !== undefined) {
            (Object.keys(struct.style) || []).forEach(style => {
                el.style[style] = struct.style[style];
            });
        }

        if (struct.extra !== undefined) {
            struct.extra();
        }

        return el;
    };

    module.mergeObjects = function (target, object) {
        Object.keys(target).forEach(key => {
            if (typeof target[key] === "object" && typeof object[key] === "object") {
                module.mergeObjects(target[key], object[key]);
            } else {
                object[key] = target[key];
            }
        });
        return object;
    }
    module.DeepMerge = function (template, target, options, path) {
        options = options || {};
        path = path || [];
        var blockedPaths = options.blockedPaths || [];
        for (var key in target) {
            var temp = template[key], tar = target[key];
            path.push(key);
            if (blockedPaths.includes(path.join('.'))) {
                path.pop();
                continue;
            }
            if (temp instanceof Object && tar instanceof Object) {
                module.DeepMerge(temp, tar, options, path);
            } else {
                template[key] = tar;
            }
            path.pop();
        }
        return template;
    }

    module.Parse = {
        Int : function (value) {
            return parseInt(value || '0');
        },
        Float : function (value) {
            return parseFloat(value || '0');
        },
    };
    module.Round = function (value) {
        return {
            /* Rounds value to significant figures */
            to : function (digits) {
                let float = value * (10 ** digits),
                    int = ~~(float),
                    roundBefore = Math.round(float - int);
                return ((int + roundBefore) * (10 ** -digits)).toFixed(digits);
            }
        };
    };
    module.Angle = function (value, degrees) {
        return value * (degrees ? 180 / Math.PI : 1);
    };
    module.ObjectSearch = function (object, key, depthLimiter=Infinity) {
        if (depthLimiter === 0) return null;

        for (let k of Object.keys(object)) {
            if (k !== key) {
                if (object[k] instanceof Object) {
                    let result = ObjectSearch(object[k], key, depthLimiter - 1);
                    if (result !== null) {
                        return result;
                    }
                } else {
                    continue;
                }
            } else {
                return object[k];
            }
        }
        return null;
    };

    class Vector {
        constructor (x, y) {
            this.x = x;
            this.y = y;
        }
        static create () {
            // For Later
        }
        static angleBetween (v1, v2) {
            return Math.atan2(v2.y - v1.y, v2.x - v1.x);
        }
        static dist (p1, p2) {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        }
        static basisFromAngle (angle) {
            return new Vector(Math.cos(angle), Math.sin(angle));
        }

        /* Math Methods */
        add (Vec) {
            this.x += Vec.x;
            this.y += Vec.y;
        }
        mult (scalar) {
            this.x *= scalar;
            this.y *= scalar;
        }

        /* Modifying Methods */
        mag () {
            return Vector.dist({x : 0, y : 0}, this);
        }
        dot (Vec) {
            return this.x * Vec.x + this.y * Vec.y;
        }
        project (Vec) {
            let Target = new Vector(this.x, this.y);
            Target.mult( Target.dot(Vec) / Math.pow(Target.mag(), 2) );
            return Target;
        }
        basis () {
            let m = this.mag();
            return new Vector(this.x / m, this.y / m);
        }
        equals (Vec, acc=10000) {
            return Math.floor(Vec.x * acc) === Math.floor(this.x * acc) && Math.floor(Vec.y * acc) === Math.floor(this.y * acc);
        }
        copy () {
            let newVec = new Vector(this.x, this.y);
            return newVec;
        }
        inv () {
            let newVec = new Vector(-this.x, -this.y);
            return newVec;
        }
    }
    module.Vector = Vector;
})(this);

/* COMPONENTS */
(function (module) {
    class Window {
        constructor () {
            /* ID generation checked against other windows */
            this.uuid = module.AlternativeCrypto.randomUUID({
                objects : module.Flats.Windows,
                key : 'uuid'
            });

            this.name = null;

            this.DOM_Window = null;
            this.DOM_Body = null;

            this.Fullscreen = {
                old : {
                    left : null,
                    top : null,
                    width : null, 
                    height : null
                }
            };

            this.Events = {
                Unload : []
            };
        }
        build () {
            this.DOM_Window = HTML_Build({
                type : 'div',
                classes : ['window'],
                id : 'window',
                tags : [
                    {name:'element-uuid-ref',value:this.uuid}
                ],
                style : {
                    display : 'flex',
                    flexDirection : 'column',
                    resize : 'both',
                    overflow : 'auto',
                    overflowY : 'hidden',
                    position : 'fixed',
                    minWidth : '10vw',
                    minHeight : '10vw',
                    maxWidth : '100vw',
                    maxHeight : '100vh',
                    left : '0px',
                    top : '0px',
                    background : 'black',
                    zIndex : '10000000'
                },
                children : [
                    {
                        type : 'div',
                        id : 'windowheader',
                        style : {
                            display : 'inline-flex',
                            position : 'relative',
                            width : '100%',
                            height : '1.5em',
                            background : 'var(--ui-outline)'
                        },
                        children : [
                            {
                                type : 'div',
                                id : 'windowname',
                                html : this.name || 'Unnamed Window'
                            },
                            {
                                type : 'button',
                                classes : ['material-symbols-outlined'],
                                html : 'fullscreen',
                                tags : [
                                    {name:'element-uuid-ref',value:this.uuid},
                                    {name:'button-mode',value:'fullscreen'}
                                ],
                                events : [
                                    {type:'click',callback:function(e){
                                        let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                            mode = e.currentTarget.getAttribute('button-mode'),
                                            window = module.Flats.get.window(uuid);
                                        if (mode === 'fullscreen') {
                                            window.fullscreen();
                                            e.currentTarget.setAttribute('button-mode','exitfullscreen');
                                            e.currentTarget.innerHTML = 'fullscreen_exit';
                                        } else if (mode === 'exitfullscreen') {
                                            window.exitFullscreen();
                                            e.currentTarget.setAttribute('button-mode','fullscreen');
                                            e.currentTarget.innerHTML = 'fullscreen';
                                        }
                                    }}
                                ]
                            },
                            {
                                type : 'button',
                                classes : ['material-symbols-outlined'],
                                html : 'close',
                                tags : [
                                    {name:'element-uuid-ref',value:this.uuid}
                                ],
                                events : [
                                    {type:'click',callback:function(e){
                                        let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                            window = module.Flats.get.window(uuid);
                                        window.close();
                                    }}
                                ]
                            }
                        ]
                    },
                    {
                        type : 'div',
                        id : 'windowbody',
                        style : {
                            display : 'block',
                            overflowY : 'hidden',
                            position : 'absolute',
                            top : '1.5em',
                            width : '100%',
                            height : '100%',
                            background : 'black'
                        },
                        html : '5'
                    }
                ]
            });
            this.DOM_Body = this.DOM_Window.querySelector('#windowbody');
            dragElement(this.DOM_Window);

            document.querySelector('body').appendChild(this.DOM_Window);
        }
        close () {
            const that = this;

            /* Run all unloading functions */
            this.Events.Unload.forEach(fn => fn(that));

            /* Remove DOM element */
            this.DOM_Window.remove();

            /* Remove self from Flats */
            module.Flats.Windows.splice(module.Flats.Windows.map(window => window.uuid).indexOf(this.uuid), 1);
        }
        width () {
            const elDim = this.DOM_Body.getBoundingClientRect();
            return elDim.width;
        }
        height () {
            const elDim = this.DOM_Body.getBoundingClientRect();
            return elDim.height;
        }
        resize (width, height) {
            if (width) {
                this.DOM_Window.style.width = `${width}px`;
            } 
            if (height) {
                this.DOM_Window.style.height = `${height}px`;
            }
        }
        fullscreen () {
            const bound = this.DOM_Window.getBoundingClientRect();
            this.Fullscreen.old = {
                left : bound.left,
                top : bound.top,
                width : bound.width,
                height : bound.height
            };
            this.DOM_Window.style.left = '0px';
            this.DOM_Window.style.top = '0px';
            this.DOM_Window.style.width = screen.availWidth + 'px';
            this.DOM_Window.style.height = screen.availHeight + 'px';
        }
        exitFullscreen () {
            this.DOM_Window.style.left = this.Fullscreen.old.left + 'px';
            this.DOM_Window.style.top = this.Fullscreen.old.top + 'px';
            this.DOM_Window.style.width = this.Fullscreen.old.width + 'px';
            this.DOM_Window.style.height = this.Fullscreen.old.height + 'px';
        }
    }
    module.Window = Window;
    
    class Dropdown {
        constructor (name, uuid, fields) {
            this.uuid = uuid;
            this.name = name;
    
            this.DOM_Element = null;
            this.Parent = null;
            this.body = null;
    
            this.attributes = {
                page : null
            };
    
            this.isLoaded = false;
    
            this.fields = fields;
            this.groups = [];
    
            this.loopSystem = {
                UPDATE_DELAY : 1,
                LOOP_ID : null,
                activeIntervals : {},
                registerInterval : function (callback, data) {
                    let id = module.AlternativeCrypto.randomUUID();
                    this.activeIntervals[id] = { id, callback, data };
                },
                wipe : function () {
                    this.activeIntervals = {};
                },
                _start : function () {
                    this.LOOP_ID = setInterval((that) => {
                        for (let [id, interval] of Object.entries(that.activeIntervals)) {
                            interval.callback(interval.data);
                        }
                    }, this.UPDATE_DELAY, this);
                },
                _end : function () {
                    clearInterval(this.LOOP_ID);
                }
            };
            this.loopSystem._start();
            //this.field_loops = {};
    
            /*this.loop = setInterval((e) => {
                let loops = e.ctx.field_loops;
                for (let key in loops) {
                    console.log(loops);
                    loops[key].callback(loops[key].data);
                }
            }, 2000, {ctx : this});*/
        }
        static fieldLoop (data, callback, condition=true, fail=undefined) {
            let input = data.DOM_Element.querySelector(`.${data.field.element_identifier}`);
            if (document.activeElement !== input) {
                data.input = input;
                if (condition) {
                    (callback || Function())(data);
                } else {
                    (fail || Function())(data);
                }
            }
        }
        
        setPage (page) {
            this.attributes.page = page;
        }
        mergeFields (defaultFields) {
            this.fields = module.DeepMerge(this.fields, defaultFields);
        }
        dropdownAction (e) {}
        dropdownUpdate (d) {}
        dropdownRename (e) {}
        dropdownDelete (e) {}
        load () {
            /* Calculate current number of dropdowns */
            const NUM_OF_DROPDOWNS = document.querySelector(`.panel-page[page=\'${this.attributes.page}\']`).querySelectorAll('.panel-dropdown').length;
    
            /* Dropdown DOM element */
            const dropdown = HTML_Build({
                type : 'div',
                classes : ['panel-dropdown','drag-item'],
                tags : [{name:'opened',value:'false'}, {name:'dropdown-uuid', value:this.uuid}, {name:'dropdown-page',value:this.attributes.page}],
                children : [
                    {
                        type : 'div',
                        classes : ['panel-dropdown-label'],
                        tags : [
                            {name:'draggable',value:true}
                        ],
                        children : [
                            {
                                type : 'div',
                                classes : ['material-symbols-outlined', 'dropdown-drag'],
                                tags : [{name:'element-uuid-ref',value:this.uuid},{name:'block-dropdown',value:true}],
                                html : 'drag_indicator',
                                events : [
                                    {type:'click',callback:this.dropdownAction}
                                ]
                            },
                            {
                                type : 'div',
                                classes : ['material-symbols-outlined', 'dropdown-indicator'],
                                html : 'keyboard_arrow_right'
                            },
                            {
                                type : 'div',
                                classes : ['panel-dropdown-name'],
                                tags : [{name:'element-uuid-ref',value:this.uuid}],
                                events : [{type : 'input', callback:this.dropdownRename}],
                                editable : true,
                                html : `${this.name} ${NUM_OF_DROPDOWNS + 1}`
                            },
                            {
                                type : 'button',
                                classes : ['panel-dropdown-delete'],
                                tags : [{name:'element-uuid-ref',value:this.uuid}],
                                events : [{type : 'click', callback:this.dropdownDelete}],
                                children : [
                                    {type : 'span', classes : ['material-symbols-outlined'], html : 'delete'}
                                ]
                            }
                        ]
                    },
                    {
                        type : 'div',
                        classes : ['panel-dropdown-body']
                    }
                ]
            });
    
            /* Event loop for dropdown UI */
            setInterval(this.dropdownUpdate, 0, {dropdown});
    
            /* Append dropdownt to panel page */
            const panel = document.querySelector(`.panel-page[page='${this.attributes.page}']`);
            panel.appendChild(dropdown);
            
            /* Cache DOM element reference */
            this.body = dropdown.querySelector('.panel-dropdown-body');
            this.DOM_Element = dropdown;
        }
    
        loadByType (name, field, field_el) {}
        loadLoops (name, field, field_el) {
            const that = this;
            (field.loops || []).forEach((loop, i) => {
                that.loopSystem.registerInterval(
                    loop.callback,
                    {
                        that : that,
                        uuid : that.uuid, 
                        field : field,
                        DOM_Element : field_el
                    }
                );
            });
        }
        loadGroups () {
            const that = this;
            function not (index, asCheck) {
                return that.groups[index - 1]?.as !== asCheck && that.groups[index + 1]?.as !== asCheck;
            }
    
            let tempGroups = [];
            for (let fieldName in this.fields) {
                let field = this.fields[fieldName];
                if (field.group && !field.disabled) {
                    tempGroups.push({name : fieldName, index : field.index, as : field.as});
                }
            }
    
            tempGroups.sort((a, b) => b.index - a.index);
    
            /* Add 'as first' groups first */
            for (let group of tempGroups) if (group.as === 'first') this.groups.unshift(group.name);
            
            tempGroups.sort((a, b) => a.index - b.index);
    
            /* Add middle groups next */
            for (let group of tempGroups) {
                if (group.as === 'before') {
                    let off = 1;
                    while (true) {
                        if (not(group.index + off, 'first') && not(group.index + off, 'last')) {
                            this.groups.splice(group.index + off, 0, group.name);
                            break;
                        } else {
                            off++;
                            if (off > tempGroups.length) {
                                this.groups.splice(group.index + off, 0, group.name);
                                break;
                            }
                        }
                    }
                }
                else if (group.as === 'after') {
                    let off = 1;
                    while (true) {
                        if (not(group.index + off + 1, 'first') && not(group.index + off + 1, 'last')) {
                            this.groups.splice(group.index + off + 1, 0, group.name);
                            break;
                        } else {
                            off++;
                            if (off > tempGroups.length) {
                                this.groups.splice(group.index + off + 1, 0, group.name);
                                break;
                            }
                        }
                    }
                }
            }
    
            /* Add 'as first' groups first */
            for (let group of tempGroups) if (group.as === 'last') this.groups.push(group.name);
        }
        loadField (name, field) {
            const $c = t => document.createElement(t);
    
            if (field.disabled) return;
    
            /* Field wrapper */
            let field_el;
            if (field.group) {
                field_el = HTML_Build({
                    type : 'div',
                    classes : ['panel-dropdown-field', 'group-field'],
                    children : [
                        {
                            type : 'label',
                            classes : ["field-label"],
                            tags : [{name:'for',value:'uuid'}],
                            html : `${name}`,
                            children : []
                        }
                    ]
                });
            } else {
                field_el = HTML_Build({
                    type : 'div',
                    classes : ['panel-dropdown-field'],
                    tags : [
                        {name : 'dropdown-uuid', value : this.uuid}
                    ],
                    children : [
                        {
                            type : 'label',
                            classes : ["field-label"],
                            tags : [{name:'for',value:'uuid'}],
                            html : `${field.alt_name || name}`,
                            children : []
                        }
                    ]
                });
            }
    
            this.loadByType(name, field, field_el);
            this.loadLoops(name, field, field_el);
    
            this.body.appendChild(field_el);
        }
    
        bindParent (parent) {
            this.Parent = parent;
        }
    
        remove () {
            this.loopSystem._end();
            this.DOM_Element.remove();
        }
    }
    module.Dropdown = Dropdown;
    
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

    class AnchorDropdown extends module.Dropdown {
        constructor (name, uuid, fields) {
            super(name, uuid, fields);

            this.setPage('Anchors');
            this.mergeFields(module.defaultFields.Anchors);

            this.elements_load_loop = null;
        }
        dropdownAction (e) {}
        dropdownUpdate (d) {}
        dropdownRename (e) {}
        dropdownDelete (e) {
            const uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                  anchor = Flats.get.anchor(uuid);
            anchor.remove();
        }
        loadByType (name, field, field_el) {
            switch (field.type) {
                case 'text':
                    let text = HTML_Build({
                        type : 'div',
                        classes : ['element-uuid'],
                        tags : [{name:'element-uuid-ref',value:this.uuid}],
                        html : this.uuid
                    });
                    field_el.appendChild(text);
                break;
                case 'input':
                    let input = HTML_Build({
                        type : 'input',
                        classes : [field.element_identifier || ''],
                        tags : [
                            {name:'type',value:(field.input_type || 'number')},
                            {name:'step',value:'0.01'},
                            {name:'element-uuid-ref',value:this.uuid},
                            ...(field.tags || [])
                        ],
                        events : field.events || []
                    });
                    field_el.appendChild(input);
                    if (field.append !== undefined) {
                        field.append?.forEach(el => {
                            field_el.appendChild(HTML_Build(el));
                        });
                    }
                break;
                case "elements":
                    let elements = HTML_Build({
                        type : 'div',
                        classes : ['elements-field', field.element_identifier || ''],
                        tags : [
                            {name:'element-uuid-ref',value:this.uuid}
                        ],
                        children : [
                            {
                                type : 'button',
                                classes : ['material-symbols-outlined'],
                                tags : [
                                    {name:'element-uuid-ref',value:this.uuid}
                                ],
                                id : 'addnew',
                                html : 'add',
                                events : [
                                    {type:'click',callback:function(e){
                                        let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                            anchor = module.Flats.get.anchor(uuid);
                                        UI.selectPanelPage('Elements');
                                        Interactor.anchor.uuid = uuid;
                                        Interactor.anchor.adding.isActive = true;
                                        Interactor.anchor.adding.currentElements = anchor.elements || [];
                                    }}
                                ]
                            }
                        ]
                    });
                    field_el.appendChild(elements);
                break;
            }
        }
        loadFields () {
            const that = this;
            Object.keys(this.fields).forEach(name => {
                const field = that.fields[name];
                that.loadField(name, field);
            });
        }

        remove () {
            clearInterval(this.loop);
            for (let loop in this.field_loops) {
                clearInterval(this.field_loops[loop]);
            }
            this.DOM_Element.remove();
        }
    }
    module.AnchorDropdown = AnchorDropdown;


    class Brush {
        constructor () {
            
        }
    }

    module.Camera = {
        offset : {
            x : 0,
            y : 0
        },
        mouseRef : {
            x : 0,
            y : 0
        },
        fromRel : function (x, y) {
            return {
                x : x * this.scale + (this.mouseRef.x + this.offset.x * this.scale),
                y : y * this.scale + (this.mouseRef.y + this.offset.y * this.scale)
            };
        },
        toRel : function (x, y) {
            return {
                x : (x - (this.mouseRef.x + this.offset.x * this.scale)) / this.scale,
                y : (y - (this.mouseRef.y + this.offset.y * this.scale)) / this.scale
            };
        },
        scale : 1.00
    };

    class ContextMenu {
        constructor (id, options) {
            this.id = id;
            this.element = null;

            this.options = options;
            this.load();
        }
        load () {
            this.element = HTML_Build({
                type : 'div',
                tags : [{name:'id',value:this.id}],
                events : [{type:'contextmenu',callback:(e) => {
                    e.preventDefault();
                    Interactor.mouse.pressed = false;
                }}],
                style : {
                    left : this.options.location.x + 'px',
                    top : this.options.location.y + 'px'
                },
                classes : ['context-menu']
            });
            this.options.buttons.forEach(btn => {
                this.element.appendChild(HTML_Build({
                    type : 'button',
                    tags : [{name:'id',value:this.id}],
                    events : [{type:'click',callback:(e) => {
                        btn.click(e, this, this.options.data);
                    }}],
                    children : [
                        {
                            type : 'span',
                            classes : ['material-symbols-outlined'],
                            html : btn.symbol
                        },
                        {
                            type : 'span',
                            classes : ['label'],
                            html : btn.name
                        }
                    ]
                }));
            });
            document.querySelector('body').appendChild(this.element);
        }
        remove () {
            this.element.remove();
            module.Flats.remove.contextMenu(this.id);
        }
    }

    module.OpenContextMenu = function (id, options) {
        if (module.Flats.ContextMenus.length === 0) {
            module.Flats.ContextMenus.push(new module.ContextMenu(id, options));
        }
    };
    module.ContextMenu = ContextMenu;


    class Controller {
        constructor () {
            /* ID generation checked against other controllers */
            this.uuid = module.AlternativeCrypto.randomUUID({
                objects : module.Flats.Controllers,
                key : 'uuid'
            });

            this.attributes = {
                name : `Unnamed Controller`,
                dropdown : null
            };

            this.elements = [];
            this.fields = {};

            this.control_space = {
                blocks : {},
                avail_inputs : [],
                avail_outputs : []
            };

            this.controlWindow = null;
        }
        addDropdown () {
            this.attributes.dropdown = new module.ControllerDropdown(
                this.attributes.name,
                this.uuid
            );
            this.attributes.dropdown.bindParent(this);
            this.attributes.dropdown.load();
            this.attributes.dropdown.loadFields();

            this.controlWindow = new module.ControllerWindow(this);
            this.controlWindow.create();
            this.controlWindow.close();
        }
        removeElement (uuid) {
            for (let i = 0; i < this.elements.length; i++) {
                if (this.elements[i] === uuid) {
                    this.elements.splice(i, 1);
                    this.attributes.dropdown.isLoaded = false;
                    return;
                }
            }
        }
        addElement (uuid) {
            if (!this.elements.includes(uuid)) {
                this.elements.push(uuid);
                this.attributes.dropdown.isLoaded = false;
            } else {
                alert('Controller already contains this element!');
            }
        }
        updateName (name) {
            this.attributes.name = name;
        }
        updateTargetField (input, value, fieldName) {
            input.focus();
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));

            let dropdown = this.attributes.dropdown,
                field = dropdown.body.querySelector(`input[element-field-name=${fieldName}]`);
            if (field) {
                field.focus();
                field.value = value;
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        removeField (field) {
            delete this.attributes.dropdown.fields[field];
        }
        copyField (field) {
            const element = Flats.get.element(this.elements[0]),
                  dropdown = this.attributes.dropdown;
            
            dropdown.fields[field] = module.DeepMerge({}, element.attributes.dropdown.fields[field]);
            delete dropdown.fields[field].events;
            delete dropdown.fields[field].loops;

            dropdown.fields[field].events = [
                {type:'input',callback:function(e){
                    let controller = Flats.get.controller(e.currentTarget.getAttribute('element-uuid-ref')),
                        value = e.currentTarget.value.slice(0, 1) === '#' ? e.currentTarget.value : Number(e.currentTarget.value);
                    if (controller) {
                        controller.elements.forEach((uuid) => {
                            let element = Flats.get.element(uuid),
                                dropdown = element.attributes.dropdown,
                                field = e.currentTarget.getAttribute('element-field-name'),
                                input = element.attributes.dropdown.DOM_Element.querySelector(
                                    `.${dropdown.fields[field].element_identifier}`
                                );
                            
                            if (!controller.controlWindow.executeWidgets()) {
                                controller.updateTargetField(input, value, 'null');
                            }
                        });
                    }
                }}
            ];

            //console.log(this.fields);
        }

        /* Remove method */
        remove () {
            for (let c = 0; c < module.Flats.Controllers.length; c++) {
                let Controller = module.Flats.Controllers[c];
                if (Controller.uuid === this.uuid) {
                    module.Flats.Controllers.splice(c, 1);
                    break;
                }
            }
            if (this.attributes.dropdown) {
                this.attributes.dropdown.remove();
            }
            if (this.controlWindow) {
                this.controlWindow = null;
            }
        }
    }
    module.Controller = Controller;


    class ControllerDropdown extends module.Dropdown {
        constructor (name, uuid, fields={}) {
            super(name, uuid, fields);
            //this.uuid = uuid;


            this.setPage('Controllers');
            this.mergeFields(module.defaultFields.Controllers);
            /* DOM references */
            //this.DOM_Element = null;
            //this.body = null;

            /* Controller name */
            //this.name = name;

            /* Status flags */
            //this.isLoaded = false;*/
            this.gotFields = false;

            /* Field update loops */
            this.loops = {};

            

            /* Used to update the elements list */
            this.elements_load_loop = null;

            /* Fields merged with default fields */
            //this.fields = module.mergeObjects({}, this.default_fields);
            
        }
        dropdownAction (e) {}
        dropdownUpdate (d) {}
        dropdownRename (e) {
            const uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                  controller = Flats.get.controller(uuid);
            controller.updateName(e.currentTarget.innerText);
        }
        dropdownDelete (e) {
            const uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                  controller = Flats.get.controller(uuid);
            controller.remove();
        }

        loadByType (name, field, field_el) {
            /* Field type */
            switch (field.type) {
                case 'text':
                    let text = HTML_Build({
                        type : 'div',
                        classes : ['element-uuid'],
                        tags : [
                            {name:'element-uuid-ref',value:this.uuid}
                        ],
                        html : this.uuid
                    });
                    field_el.appendChild(text);
                break;
                case 'input':
                    let input = HTML_Build({
                        type : 'input',
                        classes : [field.element_identifier || ''],
                        tags : [
                            {name:'type',value:(field.input_type || 'number')},
                            {name:'step',value:'0.01'},
                            {name:'element-uuid-ref',value:this.uuid},
                            {name:'element-field-name',value:name},
                            ...(field.tags || [])
                        ],
                        events : field.events || []
                    });

                    /* Controller and element reference aliases */
                    let controller = this.Parent,
                        element = Flats.get.element(controller.elements[0]);

                    /* Set the controller dropdown field to the corresponding element dropdown field value */
                    input.value = element.attributes.dropdown.DOM_Element.querySelector(`.${field.element_identifier}`).value;

                    /* Append input element to field */
                    field_el.appendChild(input);

                    /* Add any additional elements to the field */
                    if (field.append !== undefined) {
                        field.append?.forEach(el => {
                            field_el.appendChild(HTML_Build(el));
                        });
                    }

                    let deleteBtn = HTML_Build({
                        type : 'button',
                        classes : ['material-symbols-outlined', 'field-delete'],
                        tags : [{name : 'field-name', value : name}, {name:'element-uuid-ref',value:this.uuid}],
                        html : 'delete',
                        events : [
                            {type : 'click', callback : (e) => {
                                const controller = module.Flats.get.controller(e.currentTarget.getAttribute('element-uuid-ref')),
                                      dropdown = controller.attributes.dropdown,
                                      field = e.currentTarget.getAttribute('field-name');
                                controller.removeField(field);
                                console.log();
                                controller.attributes.dropdown.isLoaded = false;
                                controller.attributes.dropdown.gotFields = false;
                                controller.attributes.dropdown.loadFields();
                            }}
                        ]
                    });
                    field_el.appendChild(deleteBtn);
                break;
                case "elements":
                    let elements = HTML_Build({
                        type : 'div',
                        classes : ['elements-field', field.element_identifier || ''],
                        tags : [
                            {name:'element-uuid-ref',value:this.uuid}
                        ],
                        children : [
                            {
                                type : 'button',
                                classes : ['material-symbols-outlined'],
                                tags : [
                                    {name:'element-uuid-ref',value:this.uuid}
                                ],
                                id : 'addnew',
                                html : 'add',
                                events : [
                                    {type:'click',callback:function(e){
                                        let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                            controller = module.Flats.get.controller(uuid);
                                        UI.selectPanelPage('Elements');
                                        Interactor.controller.uuid = uuid;
                                        Interactor.controller.adding.isActive = true;
                                        Interactor.controller.adding.currentElements = controller.elements || [];
                                    }}
                                ]
                            }
                        ]
                    });
                    field_el.appendChild(elements);
                break;
            }
        }
        
        loadFields () {
            const that = this;

            /* Clear dropdown body */
            this.body.innerHTML = '';
            this.isLoaded = false;

            this.loopSystem.wipe();
            /* Clear all currently active loops */
            /*Object.keys(this.loops).forEach(loop => {
                clearInterval(that.loops[loop]);
            });*/

            /* Load all fields provided */
            Object.keys(this.fields).forEach(name => {
                const field = that.fields[name];
                that.loadField(name, field);
            });

            /* Adding fields UI for controller */
            const label = HTML_Build({
                type : 'label',
                tags : [{name:'for',value:'addfields'}],
                html : 'Add Field: '
            });
            const add_fields = HTML_Build({
                type : 'select',
                id : 'addfields',
                tags : [{name:'name',value:'Fields'}]
            });
            const add_button = HTML_Build({
                type : 'button',
                classes : ['material-symbols-outlined'],
                tags : [{name:'element-uuid-ref',value:this.uuid}],
                html : 'add',
                events : [
                    {type:'click',callback:function(e){
                        const uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                              controller = Flats.get.controller(uuid),
                              dropdown = e.currentTarget.previousElementSibling;
                        controller.copyField(dropdown.value);
                        controller.attributes.dropdown.gotFields = false;
                        controller.attributes.dropdown.loadFields();
                    }}
                ]
            });

            /* Advanced controls navigation */
            const advanced_control = HTML_Build({
                type : 'button',
                classes : ['advanced-controls-link'],
                tags : [{name:'element-uuid-ref',value:this.uuid}],
                html : 'Advanced',
                events : [
                    {type : 'click', callback:function(e){
                        const controller = Flats.get.controller(e.currentTarget.getAttribute('element-uuid-ref'));
                        if (controller !== null) {
                            controller.controlWindow.active();
                        }
                    }}
                ]
            });

            /* Clear load loop */
            if (this.elements_load_loop !== null) {
                clearInterval(this.elements_load_loop);
            }
            
            /* Makes a list of all available fields */
            this.elements_load_loop = setInterval((d) => {
                
                /* Dropdown element reference alias */
                const dropdown = d.dropdown.body.querySelector('#addfields');

                /* Controller reference alias */
                const controller =  Flats.get.controller(d.dropdown.uuid);

                if (controller !== null) {
                    if (!d.dropdown.gotFields) { // Checks whether the fields have already been appended

                        /* Find which fields are shared by all attached elements */
                        let fields = [];
                        controller.elements.forEach(uuid => {
                            const el = Flats.get.element(uuid);

                            /* Add all fields not already in the controller */
                            if (el) {
                                Object.keys(el.attributes.dropdown.fields).forEach(field => {
                                    if (!fields.includes(field) && !Object.keys(controller.fields).includes(field)) {
                                        fields.push(field);
                                    }
                                });
                            }

                            /* Remove fields which aren't shared */
                            fields.forEach((field, i) => {
                                if (!Object.keys(el.attributes.dropdown.fields).includes(field)) {
                                    fields.splice(i, 1);
                                }
                            });
                        });

                        /* Refresh dropdown with new fields */
                        dropdown.innerHTML = '';
                        fields.forEach(field => {
                            let option = HTML_Build({
                                type : 'option',
                                tags : [{name:'value',value:field}],
                                html : field
                            });
                            dropdown.appendChild(option);
                        });
                    }

                    /* Set flag for loaded status */
                    if (controller.elements.length > 0) {
                        d.dropdown.gotFields = true;
                    } else {
                        d.dropdown.gotFields = false;
                    }
                }
            }, 0, {dropdown : this});

            /* Add elements to dropdown */
            this.body.appendChild(label);
            this.body.appendChild(add_fields);
            this.body.appendChild(add_button);
            this.body.appendChild(advanced_control);
        }
    }

    module.ControllerDropdown = ControllerDropdown;


    class ControllerWindow extends module.Window {
        constructor (controller) {
            super(controller);

            this.controller = controller;
            this.uuid = this.controller.uuid;

            this.canvas = null;
            this.board = null;
            this.menu = null;

            /* Widget stuff */
            this.Widgets = [];
            this.Inputs = [];
            this.Elements = [];
            this.ElementGroups = [];

            /* Loop management */
            this.loops = [];

            this.widgetsChecked = [];

            this.isActive = false;
        }
        create () {
            const that = this;

            /* Check if controller window with uuid already exists */
            if (module.Flats.Windows.map(e => e.uuid).includes(this.uuid)) return;

            /* Create the window first */
            this.build();
            this.resize(600, 600);

            /* Create window content */
            const Main = HTML_Build({
                type : 'div',
                classes : ['advanced-control-back'],
                children : [
                    {
                        type : 'div',
                        classes : ['advanced-control-menu'],
                        children : [
                            {
                                type : 'div',
                                classes : ['section'],
                                html : 'Static'
                            },
                            {
                                type : 'div',
                                classes : ['section-drop'],
                                id : 'static-fields'
                            },
                            {
                                type : 'div',
                                classes : ['section'],
                                html : 'Inputs'
                            },
                            {
                                type : 'div',
                                classes : ['section-drop'],
                                id : 'input-fields'
                            },
                            {
                                type : 'div',
                                classes : ['section'],
                                html : 'Elements'
                            },
                            {
                                type : 'div',
                                classes : ['section-drop'],
                                id : 'elements-fields'
                            },
                            {
                                type : 'div',
                                classes : ['section'],
                                html  : 'Modifiers'
                            },
                            {
                                type : 'div',
                                classes : ['section-drop'],
                                id : 'modifiers-fields'
                            },
                        ]
                    },
                    {
                        type : 'canvas',
                        classes : ['advanced-control-canvas']
                    },
                    {
                        type : 'div',
                        classes : ['advanced-control-board'],
                        html : ''
                    }
                ]
            });

            /* Reference parts of window content */
            this.canvas = Main.querySelector('.advanced-control-canvas');
            this.board = Main.querySelector('.advanced-control-board');
            this.menu = Main.querySelector('.advanced-control-menu');

            /* Prep the widget menu */
            this.prepMenu();

            /* Update loop */
            const loop = setInterval((data) => {
                let that = data.window,
                    canvas = that.canvas,
                    board = that.board,
                    menu = that.menu,
                    board_dim = that.board.getBoundingClientRect(),
                    menu_dim = that.menu.getBoundingClientRect();

                /* Update canvas position and size */
                canvas.width = board_dim.width;
                canvas.height = board_dim.height;
                canvas.style.left = menu_dim.width + 'px';

                that.update(canvas, board, menu);
            }, 0, {window : this});

            /* Add to loop map */
            this.loops[loop.toString()] = loop;

            this.DOM_Body.appendChild(Main);

            /* Add the window to the global list */
            module.Flats.Windows.push(this);

            /* Add the unloading method to event process for unloading */
            this.Events.Unload.push(this.unload);
        }
        getWidget (uuid) {
            /* Iterate and return match */
            for (var i = 0; i < this.Widgets.length; i++) {
                if (this.Widgets[i].uuid === uuid) {
                    return this.Widgets[i];
                }
            }
            return null;
        }
        unpackConnection (connection) {
            return {
                uuid : connection.split('/')[0],
                index : connection.split('/')[1]
            };
        }
        menuStatics () {
            const that = this;

            /* Static widget creation buttons */
            ['Value'].forEach(type => {
                let el = HTML_Build({
                    type : 'button',
                    classes : ['widget-button'],
                    tags : [
                        {name:'element-uuid-ref',value:that.uuid},
                        {name:'widget-type',value:'elements'},
                        {name:'special',value:type}
                    ],
                    html : type,
                    events : [
                        {type:'click',callback:function(e){
                            let win = module.Flats.get.window(e.target.getAttribute('element-uuid-ref'));
                            let widget = new module.ControlWidget(e.target.getAttribute('special'), win);
                            widget.create();
                            that.Widgets.push(widget);
                        }}
                    ]
                });
                that.menu.querySelector('#static-fields').appendChild(el);
            });
        }
        menuInputs () {
            const that = this;

            /* Input widget creation buttons */
            Object.keys(this.controller.attributes.dropdown.fields).forEach(field => {
                if (['UUID', 'Elements', 'Nodes'].includes(field)) return;
                let el = HTML_Build({
                    type : 'button',
                    classes : ['widget-button'],
                    tags : [
                        {name:'element-uuid-ref',value:that.uuid},
                        {name:'widget-type',value:'input'},
                        {name:'special',value:field}
                    ],
                    html : field,
                    events : [
                        {type:'click',callback:function(e){
                            let win = module.Flats.get.window(e.target.getAttribute('element-uuid-ref'));
                            let widget = new module.ControlWidget('Input', win, {
                                field : e.target.getAttribute('special')
                            });
                            widget.create();
                            that.Widgets.push(widget);
                        }}
                    ]
                });
                that.menu.querySelector('#input-fields').appendChild(el);
            });
        }
        menuElements () {
            const that = this;

            /* Elements widget creation button */
            let elements = HTML_Build({
                type : 'button',
                classes : ['widget-button'],
                tags : [
                    {name:'element-uuid-ref',value:that.uuid},
                    {name:'widget-type',value:'elements'}
                ],
                html : 'All Elements',
                events : [
                    {type:'click',callback:function(e){
                        let win = module.Flats.get.window(e.target.getAttribute('element-uuid-ref'));
                        let widget = new module.ControlWidget('Elements', win);
                        widget.create();
                        that.Widgets.push(widget);
                    }}
                ]
            });
            that.menu.querySelector('#elements-fields').appendChild(elements);
        }
        menuModifiers () {
            const that = this;

            /* Modifiers widget creation button */
            ['Offset', 'Script', 'If', 'Boolean', 'Join', 'Gate', 'Loop Start', 'Loop End', 'Get', 'RGB'].forEach(type => {
                let el = HTML_Build({
                    type : 'button',
                    classes : ['widget-button'],
                    tags : [
                        {name:'element-uuid-ref',value:that.uuid},
                        {name:'widget-type',value:'elements'},
                        {name:'special',value:type}
                    ],
                    html : type,
                    events : [
                        {type:'click',callback:function(e){
                            let win = module.Flats.get.window(e.target.getAttribute('element-uuid-ref'));
                            let widget = new module.ControlWidget(e.target.getAttribute('special'), win);
                            widget.create();
                            that.Widgets.push(widget);
                        }}
                    ]
                });
                that.menu.querySelector('#modifiers-fields').appendChild(el);
            });
        }
        prepMenu () {
            const that = this;

            this.menuStatics();
            this.menuInputs();
            this.menuElements();
            this.menuModifiers();
        }
        update (canvas, board, menu) {
            const that = this;

            /* Ensure categorization of widgets */
            this.Widgets.forEach(widget => {
                if (widget.type === 'Input') {
                    if (!this.Inputs.map(e => e.uuid).includes(widget.uuid)) {
                        this.Inputs.push(widget);
                    }
                } else if (widget.type === 'Elements') {
                    if (!this.Elements.map(e => e.uuid).includes(widget.uuid)) {
                        this.Elements.push(widget);
                    }
                }

                widget.update();
            });

            /* Query all of the input widgets and get the field names as a list */
            let inputWidgetElements = this.menu.querySelector('#input-fields').querySelectorAll('.widget-button');
            let currentFields = Array(...inputWidgetElements).map(el => el.getAttribute('special'));

            /* Condition for refreshing fields */
            let foundMissing = false;
            
            /* Check if field is missing */
            Object.keys(this.controller.attributes.dropdown.fields).forEach(field => {
                if (['UUID', 'Elements', 'Nodes'].includes(field)) return;
                if (!currentFields.includes(field)) {
                    foundMissing = true;
                }
            });

            /* If missing, refresh the input widgets menu */
            if (foundMissing) {
                this.menu.querySelector('#input-fields').innerHTML = '';
                this.menuInputs();
            }
        }
        active () {
            /* Unhides the window */
            this.DOM_Window.style.display = 'block';
            this.isActive = true;
        }
        close () {
            /* Overrides the default window.close() method and just hides the window instead */
            this.DOM_Window.style.display = 'none';
            this.isActive = false;
        }
        unload (that) {
            /* Clears all of the loops attached to the window */
            that.loops.forEach(loop => {
                clearInterval(loop);
            });
        }
        rootFindNext (type, fromWidget) {
            let that = this;

            /* Finds the next widget of type 'type' downstream from a given widget */
            function Root (widget) {
                let result = null;
                widget.outputNodes.forEach(node => {
                    node.toWidgets.forEach(connection => {
                        let {uuid, index} = that.unpackConnection(connection),
                            nextWidget = that.getWidget(uuid);
                        
                        result = nextWidget.type === type ? nextWidget : Root(nextWidget);
                    });
                });
                return result;
            }
            return Root(fromWidget);
        }
        executeWidgets () {
            const that = this;

            /* Recursive checking function */
            function Check (widget) {
                let sufficientPayloads = true;

                /* If the widget has already been checked, don't run again */
                if (that.widgetsChecked.includes(widget.uuid)) return;

                /* Iterate input nodes */
                widget.inputNodes.forEach(node => {

                    /* If node doesn't have sufficient capsules, block widget execution */
                    if (node.payload.length < node.fromWidgets.length) {
                        sufficientPayloads = false;
                    }
                });

                /* Permit widget execution */
                if (sufficientPayloads) {
                    let output = widget.function();

                    /* If output has been obtained, clear inputs */
                    /* Note: Won't clear the input on a 'Loop Start' widget until the process is finished */
                    if (widget.type !== 'Loop Start' || (widget.type === 'Loop Start' && (widget.data.loop || {active : true}).active)) {
                        widget.inputNodes.forEach(node => {
                            node.payload = [];
                        });
                    }

                    /* Will be undefined if endpoint */
                    if (output !== undefined) {

                        /* Spread output capsules to output nodes */
                        /* Note: Only one capsule per output node */
                        output.forEach((capsule, i) => {
                            if (widget.outputNodes[i]) {
                                widget.outputNodes[i].payload.push(capsule);
                            } else {
                                throw new Error(`Missing output node index:${i}`);
                            }
                        });

                        /* If widget isn't inside loop thread, add to checking blacklist */
                        if (widget.inputNodes.length > 0) {
                            if (widget.inputNodes[0].payload.length > 0) {
                                let returnPoint = widget.inputNodes[0].payload[0][0].returnPoint;
                                if (returnPoint !== null) {
                                    if (!returnPoint.active) {
                                        that.widgetsChecked.push(widget.uuid);
                                    }
                                } else {
                                    that.widgetsChecked.push(widget.uuid);
                                }
                            }
                        }

                        /* Allows Loop Start/Loop End to be recursive */
                        if (widget.type === 'Loop End') {
                            console.log(widget.outputNodes[0].payload);
                            let returnPoint = widget.outputNodes[0].payload[0][0].returnPoint;
                            console.log(returnPoint);
                            if (returnPoint.data.loop.active) {
                                console.log('Looped');
                                Check(returnPoint);
                            }
                        }

                        /* Debug */
                        console.log(output);

                        /* Send each output to each connected widget */
                        widget.outputNodes.forEach(node => {
                            node.toWidgets.forEach(connection => {

                                /* Get widget uuid, input index and reference */
                                let {uuid, index} = that.unpackConnection(connection);
                                let toWidget = that.getWidget(uuid);

                                /* Push output to widget input node */
                                toWidget.inputNodes[index].payload.push(node.payload[0]);

                                /* Check connected widget */
                                Check(toWidget);
                            });

                            /* Clear output */
                            node.payload = [];
                        });
                    }
                }
            }

            /* Check every widget */
            for (let i = 0; i < this.Widgets.length; i++) {
                let widget = this.Widgets[i];
                Check(widget);
            }

            return this.Widgets.length > 0;
        }
    }
    module.ControllerWindow = ControllerWindow;

    class ControlWidget {
        constructor (type, window, data, subtype) {
            /* ID generation checked against other widgets */
            this.uuid = module.AlternativeCrypto.randomUUID({
                objects : window.Widgets,
                key : 'uuid'
            });
            this.DOM_Element = null;

            this.type = type;
            this.subtype = subtype || 'none';

            this.window = window;
            this.ctx = null;

            this.data = data || {};

            this.inputNodes = [];
            this.outputNodes = [];
        }
        unpackConnection (connection) {
            return {
                uuid : connection.split('/')[0],
                index : connection.split('/')[1]
            };
        }
        create () {

            /* Create widget element */
            const Main = HTML_Build({
                type : 'div',
                id : 'widget',
                classes : ['widget'],
                tags : [
                    {name:'window-uuid',value:this.window.uuid},
                    {name:'widget-uuid',value:this.uuid}
                ],
                children : [
                    {
                        type : 'div',
                        id : 'widgetheader',
                        html : this.type,
                        children : [
                            {
                                type : 'button',
                                classes : ['material-symbols-outlined', 'widget-delete'],
                                html : 'delete',
                                tags : [
                                    {name:'element-uuid-ref',value:this.uuid},
                                    {name:'controlwindow-uuid',value:this.window.uuid}
                                ],
                                events : [
                                    {type:'click',callback:function(e){
                                        let window = module.Flats.get.window(e.target.getAttribute('controlwindow-uuid'));
                                        let widget = window.getWidget(e.target.getAttribute('element-uuid-ref'));
                                        widget.remove();
                                    }}
                                ]
                            }
                        ]
                    },
                    {
                        type : 'div',
                        id : 'widgetbody'
                    }
                ]
            });

            /* Reference the widget body */
            let body = Main.querySelector('#widgetbody');

            /* Output node element creator */
            function Output (that, index) {
                return HTML_Build({
                    type : 'button',
                    classes : ['material-symbols-outlined', 'output-button'],
                    html : 'output_circle',
                    tags : [
                        {name:'window-uuid',value:that.window.uuid},
                        {name:'widget-uuid',value:that.uuid},
                        {name:'index',value:index.toString()}
                    ],
                    events : [
                        {type:'click',callback:function(e){
                            /* Get window */
                            let window = module.Flats.get.window(e.target.getAttribute('window-uuid'));
                            if (window) {

                                /* Get widget (self) */
                                let widget = window.getWidget(e.target.getAttribute('widget-uuid'));

                                /* Get output node index */
                                let index = Number(e.target.getAttribute('index'));

                                /* If we are undoing a connection */
                                if (module.Interactor.widget.undo.uuid !== null) {

                                    /* Alias for the input widget (undo-start-node) */
                                    let id = module.Interactor.widget.undo.uuid;

                                    /* Remove the input widget connection (undo-start-node) */
                                    widget.outputNodes[index].toWidgets.splice(
                                        widget.outputNodes[index].toWidgets.indexOf(id), 1
                                    );

                                    /* Get the uuid of the input widget (undo-start-node) */
                                    let uuid = id.split('/')[0];

                                    /* Get the index of input node on the input widget */
                                    let toIndex = Number(id.split('/')[1]);

                                    /* Get the input widget itself */
                                    let toWidget = window.getWidget(uuid);

                                    /* Remove the output widget connection (self) */
                                    toWidget.inputNodes[toIndex].fromWidgets.splice(
                                        toWidget.inputNodes[toIndex].fromWidgets.indexOf(widget.uuid + '/' + index), 1
                                    );

                                    /* Reset widget interactor for 'undo' (disconnection) */
                                    module.Interactor.widget.undo.uuid = null;

                                    /* Debug */
                                    //console.log(widget.outputNodes[index], toWidget.inputNodes[toIndex]);
                                    return;
                                }

                                /* Set widget interactor for 'from' (connection) */
                                module.Interactor.widget.from.uuid = widget.uuid + '/' + index;
                            }
                        }}
                    ]
                });
            }

            /* Input node element creator */
            function Input (that, index) {
                return HTML_Build({
                    type : 'button',
                    classes : ['material-symbols-outlined', 'output-button'],
                    html : 'output_circle',
                    tags : [
                        {name:'window-uuid',value:that.window.uuid},
                        {name:'widget-uuid',value:that.uuid},
                        {name:'index',value:index.toString()}
                    ],
                    events : [
                        {type:'click',callback:function(e){
                            /* Get window */
                            let window = module.Flats.get.window(e.target.getAttribute('window-uuid'));
                            if (window) {

                                /* Get widget (self) */
                                let widget = window.getWidget(e.target.getAttribute('widget-uuid'));

                                /* Get input node index */
                                let index = Number(e.target.getAttribute('index'));

                                /* Alias for the output widget (from-start-node) */
                                let id = module.Interactor.widget.from.uuid;

                                /* If we aren't forming a connection and input is selected, set 'undo' */
                                if (id === null) {
                                    module.Interactor.widget.undo.uuid = widget.uuid + "/" + index;
                                    return;
                                } 
                                /* If we are forming a connection */
                                else {

                                    /* Get the uuid of the output widget (from-start-node) */
                                    let uuid = id.split('/')[0];

                                    /* Get the index of output node on the output widget */
                                    let fromIndex = Number(id.split('/')[1]);

                                    /* Get the output widget itself */
                                    let fromWidget = window.getWidget(uuid);

                                    /* Add output widget to input widget (self) if not already connected */
                                    if (!widget.inputNodes[index].fromWidgets.includes(id)) {
                                        widget.inputNodes[index].fromWidgets.push(id);
                                    }

                                    /* Add input widget (self) to input widget if not already connected */
                                    if (!fromWidget.outputNodes[fromIndex].toWidgets.includes(widget.uuid + "/" + index)) {
                                        fromWidget.outputNodes[fromIndex].toWidgets.push(widget.uuid + "/" + index);
                                    }

                                    /* Reset widget interactor for 'from' (connection complete) */
                                    module.Interactor.widget.from.uuid = null;
                                }

                                /* Debug */
                                //console.log(fromWidget.outputNodes[fromIndex], widget.inputNodes[index]);
                            }
                        }}
                    ]
                });
            }

            /* Choose how widget fields & inputs/outputs should be generated */
            switch (this.type) {
                case 'Value':
                    body.appendChild(HTML_Build({
                        type : 'label',
                        html : 'Number: '
                    }));
                    body.appendChild(HTML_Build({
                        type : 'input',
                        classes : ['field-name', 'input'],
                        tags : [{name:'type',value:'number'}],
                        defaultValue : '0.00'
                    }));

                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                break;
                case 'Input':
                    body.appendChild(HTML_Build({
                        type : 'label',
                        html : 'Field: '
                    }));
                    body.appendChild(HTML_Build({
                        type : 'div',
                        classes : ['field-name'],
                        html : this.data.field
                    }));

                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                break;
                case 'Elements':
                    body.appendChild(HTML_Build({
                        type : 'label',
                        html : 'Elements: '
                    }));
                    body.appendChild(HTML_Build({
                        type : 'div',
                        classes : ['field-name'],
                        html : 'uuids'
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                break;
                case 'Offset':
                    body.appendChild(HTML_Build({
                        type : 'div',
                        classes : ['field-name'],
                        html : '[Input 1]'
                    }));
                    body.appendChild(HTML_Build({
                        type : 'select',
                        id : 'operation',
                        children : [
                            {
                                type : 'option',
                                tags : [{name:'value',value:'+'}],
                                html : '+'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'-'}],
                                html : '-'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'*'}],
                                html : '*'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'/'}],
                                html : '/'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'^'}],
                                html : '^'
                            }
                        ]
                    }));
                    body.appendChild(HTML_Build({
                        type : 'div',
                        classes : ['field-name'],
                        html : '[Input 2]'
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    this.inputNodes.push({ 
                        DOM : Input(this, 1),
                        fromWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                    body.appendChild(this.inputNodes[1].DOM);
                    
                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                break;
                case 'Script':
                    body.style.flexDirection = 'column';
                    body.appendChild(HTML_Build({
                        type : 'div',
                        style : {
                            display : 'block',
                            float : 'left',
                            justifyContent : 'left'
                        },
                        children : [
                            {
                                type : 'label',
                                html : 'Multi-thread:'
                            },
                            {
                                type : 'input',
                                id : 'multithread',
                                tags : [{name:'type',value:'checkbox'}]
                            }
                        ]
                    }));
                    body.appendChild(HTML_Build({
                        type : 'textarea',
                        classes : ['field-name', 'code'],
                        html : 'Put javavscript here...'
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                    
                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                break;
                case 'If':
                    body.appendChild(HTML_Build({
                        type : 'div',
                        classes : ['field-name'],
                        html : '[Input 1]'
                    }));
                    body.appendChild(HTML_Build({
                        type : 'select',
                        id : 'operation',
                        children : [
                            {
                                type : 'option',
                                tags : [{name:'value',value:'>'}],
                                html : '>'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'<'}],
                                html : '<'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'≥'}],
                                html : '≥'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'≤'}],
                                html : '≤'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'='}],
                                html : '='
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'!='}],
                                html : '!='
                            }
                        ]
                    }));
                    body.appendChild(HTML_Build({
                        type : 'div',
                        classes : ['field-name'],
                        html : '[Input 2]'
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    this.inputNodes.push({ 
                        DOM : Input(this, 1),
                        fromWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                    body.appendChild(this.inputNodes[1].DOM);
                    
                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    this.outputNodes.push({
                        DOM : Output(this, 1),
                        toWidgets : [],
                        payload : []
                    });
                    this.outputNodes.forEach((node, i) => {
                        node.DOM.style.color = ['lightgreen', 'red'][i];
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                    body.appendChild(this.outputNodes[1].DOM);
                break;
                case 'Join':
                    body.appendChild(HTML_Build({
                        type : 'div',
                        html : 'Combines inputs into<br>a single capsule.'
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                    
                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                break;
                case 'Boolean':
                    body.appendChild(HTML_Build({
                        type : 'div',
                        classes : ['field-name'],
                        html : '[Input 1]'
                    }));
                    body.appendChild(HTML_Build({
                        type : 'select',
                        id : 'operation',
                        children : [
                            {
                                type : 'option',
                                tags : [{name:'value',value:'>'}],
                                html : '>'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'<'}],
                                html : '<'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'≥'}],
                                html : '≥'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'≤'}],
                                html : '≤'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'='}],
                                html : '='
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'!='}],
                                html : '!='
                            }
                        ]
                    }));
                    body.appendChild(HTML_Build({
                        type : 'div',
                        classes : ['field-name'],
                        html : '[Input 2]'
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    this.inputNodes.push({ 
                        DOM : Input(this, 1),
                        fromWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                    body.appendChild(this.inputNodes[1].DOM);
                    
                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    this.outputNodes.forEach((node, i) => {
                        node.DOM.style.color = ['lightblue'][i];
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                break;
                case 'Gate':
                    body.appendChild(HTML_Build({
                        type : 'div',
                        classes : ['field-name'],
                        html : '[Input 1]'
                    }));
                    body.appendChild(HTML_Build({
                        type : 'select',
                        id : 'operation',
                        children : [
                            {
                                type : 'option',
                                tags : [{name:'value',value:'NOT'}],
                                html : 'NOT'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'AND'}],
                                html : 'AND'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'OR'}],
                                html : 'OR'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'XOR'}],
                                html : 'XOR'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'NAND'}],
                                html : 'NAND'
                            },
                            {
                                type : 'option',
                                tags : [{name:'value',value:'NOR'}],
                                html : 'NOR'
                            }
                        ]
                    }));
                    body.appendChild(HTML_Build({
                        type : 'div',
                        classes : ['field-name'],
                        html : '[Input 2]'
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    this.inputNodes.push({ 
                        DOM : Input(this, 1),
                        fromWidgets : [],
                        payload : []
                    });
                    this.inputNodes.forEach((node, i) => {
                        node.DOM.style.color = ['white', 'lightblue'][i];
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                    body.appendChild(this.inputNodes[1].DOM);
                    
                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                break;
                case 'Loop Start':
                    body.appendChild(HTML_Build({
                        type : 'div',
                        children : [
                            {
                                type : 'label',
                                html : 'Iteration type:'
                            },
                            {
                                type : 'select',
                                classes : ['input-resize'],
                                id : 'loop',
                                children : [
                                    {
                                        type : 'option',
                                        tags : [{name:'value',value:'i++'}],
                                        html : 'i++'
                                    },
                                    {
                                        type : 'option',
                                        tags : [{name:'value',value:'forEach'}],
                                        html : 'forEach'
                                    },
                                    {
                                        type : 'option',
                                        tags : [{name:'value',value:'of'}],
                                        html : 'of'
                                    }
                                ]
                            }
                        ]
                    }));
                    body.appendChild(HTML_Build({
                        type : 'span',
                        id : 'additional',
                        html : ''
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                    
                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    this.outputNodes.push({
                        DOM : Output(this, 1),
                        toWidgets : [],
                        payload : []
                    });
                    this.outputNodes.forEach((node, i) => {
                        node.DOM.style.color = ['white', 'orange'][i];
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                    body.appendChild(this.outputNodes[1].DOM);
                break;
                case 'Loop End':
                    body.appendChild(HTML_Build({
                        type : 'div',
                        html : 'Jumps thread back to Loop Start'
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                    
                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                break;
                case 'Get':
                    body.appendChild(HTML_Build({
                        type : 'label',
                        html : 'Key: '
                    }));
                    body.appendChild(HTML_Build({
                        type : 'input',
                        classes : ['field-name', 'input'],
                        tags : [{name:'type',value:'text'}],
                        defaultValue : ''
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                    
                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                break;
                case 'RGB':
                    body.appendChild(HTML_Build({
                        type : 'label',
                        html : 'Decomposes HEX inputs<br> to RGB outputs'
                    }));

                    this.inputNodes.push({ 
                        DOM : Input(this, 0),
                        fromWidgets : [],
                        payload : []
                    });
                    body.appendChild(this.inputNodes[0].DOM);
                    
                    this.outputNodes.push({
                        DOM : Output(this, 0),
                        toWidgets : [],
                        payload : []
                    });
                    this.outputNodes.push({
                        DOM : Output(this, 1),
                        toWidgets : [],
                        payload : []
                    });
                    this.outputNodes.push({
                        DOM : Output(this, 2),
                        toWidgets : [],
                        payload : []
                    });
                    this.outputNodes.forEach((node, i) => {
                        node.DOM.style.color = ['red', 'green', 'blue'][i];
                    });
                    body.appendChild(this.outputNodes[0].DOM);
                    body.appendChild(this.outputNodes[1].DOM);
                    body.appendChild(this.outputNodes[2].DOM);
                break;
            }

            /* Assign to self */
            this.DOM_Element = Main;

            /* Add element to window board section */
            this.window.board.appendChild(Main);
            
            /* Cache the canvas context */
            this.ctx = this.window.canvas.getContext('2d');

            /* Make element draggable */
            dragElement(Main);
        }
        update () {
            /* Output */
            const that = this;
            let body = this.DOM_Element.querySelector('#widgetbody');
            let body_dim = body.getBoundingClientRect(),
                widget_dim = this.DOM_Element.getBoundingClientRect(),
                btn_dim = {},
                win_body_dim = this.window.DOM_Body.getBoundingClientRect(),
                win_menu_dim = this.window.menu.getBoundingClientRect();

            let adjust = {x : win_body_dim.left + win_menu_dim.width, y : win_body_dim.top};

            
            this.outputNodes.forEach((node, idx, nodes) => {
                btn_dim = node.DOM.getBoundingClientRect();
                
                let gap = body_dim.width / (nodes.length + 1);
                node.DOM.style.left = `calc(${body_dim.left + (gap * (idx + 1)) - (btn_dim.width / 2) - adjust.x}px)`;
                node.DOM.style.top = `calc(${body_dim.top + (body_dim.height) - (btn_dim.height / 2) - adjust.y}px + 0.5em)`;

                node.toWidgets.forEach(id => {
                    let uuid = id.split('/')[0],
                        index = Number(id.split('/')[1]);
                    let fromWidget = that,
                        toWidget = that.window.getWidget(uuid);
                    let outputNode = fromWidget.outputNodes[idx].DOM,
                        inputNode = toWidget.inputNodes[index].DOM;
                    let o = node.DOM.getBoundingClientRect(),
                        i = inputNode.getBoundingClientRect();
                    that.ctx.strokeStyle = 'rgb(140, 80, 128)';
                    that.ctx.lineWidth = 5;
                    that.ctx.moveTo(o.left + (btn_dim.width / 2) - adjust.x, o.top + (btn_dim.height / 2) - adjust.y);
                    that.ctx.lineTo(i.left + (btn_dim.width / 2) - adjust.x, i.top + (btn_dim.height / 2) - adjust.y);
                    that.ctx.stroke();
                });
            });

            this.inputNodes.forEach((node, i, nodes) => {
                btn_dim = node.DOM.getBoundingClientRect();

                let gap = body_dim.width / (nodes.length + 1);
                node.DOM.style.left = `calc(${widget_dim.left + (gap * (i + 1)) - (btn_dim.width / 2) - adjust.x}px)`;
                node.DOM.style.top = `calc(${widget_dim.top - (btn_dim.height / 2) - adjust.y}px)`;
            });

            switch (this.type) {
                case 'Loop Start':
                    let loopType = body.querySelector('#loop').value,
                        additional = body.querySelector('#additional');
                    if (loopType === 'i++') {
                        body.style.flexDirection = 'column';
                        let start = body.querySelector('#start'),
                            step = body.querySelector('#step'),
                            end = body.querySelector('#end');
                        if (start === null && step === null && end === null) {
                            additional.innerHTML = '';
                            additional.appendChild(HTML_Build({
                                type : 'div',
                                classes : ['wrapper'],
                                children : [
                                    {type : 'label', html : 'Start: '},
                                    {
                                        type : 'input', 
                                        classes : ['field-name'],
                                        id : 'start', 
                                        tags : [{name:'type',value:'number'},{name:'step',value:'1'}],
                                        defaultValue : '0'
                                    }
                                ]
                            }));
                            additional.appendChild(HTML_Build({
                                type : 'div',
                                classes : ['wrapper'],
                                children : [
                                    {type : 'label', html : 'Step: '},
                                    {
                                        type : 'input', 
                                        classes : ['field-name'],
                                        id : 'step', 
                                        tags : [{name:'type',value:'number'},{name:'step',value:'1'}],
                                        defaultValue : '1'
                                    }
                                ]
                            }));
                            additional.appendChild(HTML_Build({
                                type : 'div',
                                classes : ['wrapper'],
                                children : [
                                    {type : 'label', html : 'End: '},
                                    {
                                        type : 'input', 
                                        classes : ['field-name'],
                                        id : 'end', 
                                        tags : [{name:'type',value:'number'},{name:'step',value:'1'}],
                                        defaultValue : '32'
                                    }
                                ]
                            }));
                        }
                    } else if (loopType === 'forEach') {
                        body.style.flexDirection = 'column';
                        let accept = body.querySelector('#accept');
                        if (accept === null) {
                            additional.innerHTML = '';
                            additional.appendChild(HTML_Build({
                                type : 'div',
                                classes : ['wrapper'],
                                children : [
                                    {type : 'label', html : 'Accept: '},
                                    {type : 'select', id : 'accept', children : [
                                        {type : 'option', tags : [{name:'value',value:'Input Array'}], html : 'Input Array'},
                                        {type : 'option', tags : [{name:'value',value:'Target Elements'}], html : 'Target Elements'},
                                    ]}
                                ]
                            }));
                        }
                    } else {
                        additional.innerHTML = '';
                    }
                break;
            }
        }
        createLoad (fromLoad, type, value, field, source, returnPoint, targetElement) {
            let load = fromLoad || {
                type : type,
                value : value,
                field : field || null,
                source : source || null,
                returnPoint : returnPoint || null,
                targetElement : targetElement || null
            };
            if (type !== undefined) load.type = type;
            if (value !== undefined) load.value = value;
            if (field !== undefined) load.field = field;
            if (source !== undefined) load.source = source;
            if (returnPoint !== undefined) load.returnPoint = returnPoint;
            if (targetElement !== undefined) load.targetElement = targetElement;
            return load;
        }
        function () {
            let body = this.DOM_Element.querySelector('#widgetbody');

            /* New capsule for next step */
            let newCapsule = [[]];

            switch (this.type) {
                case 'Value':
                    let value = body.querySelector('.input').value;
                    return [
                        [this.createLoad(null, 'number', Number(value), null, this)]
                    ];
                break;
                case 'Input':
                    let fieldname = body.querySelector('.field-name').innerText;
                    let window = this.window,
                        controller = window.controller,
                        dropdown = controller.attributes.dropdown,
                        field = dropdown.body.querySelector(`input[element-field-name=${fieldname}]`);
                    if (field !== null) {
                        let value = String(field.value);

                        /* Convert hex color input to rgb color input */
                        if (value.slice(0, 1) === '#') {
                            let rgb = module.Format.hexToRGB(value + 'ff');
                            return [
                                [this.createLoad(null, 'object', rgb, fieldname, this)]
                            ];
                        } else {
                            try {
                                /* Check if non-conventional input type */
                                if (value === 'undefined') {
                                    switch (field.getAttribute('get-type')) {
                                        case 'object':
                                            return [
                                                [this.createLoad(null, 'object', JSON.parse(field.fieldData), fieldname, this)]
                                            ];
                                        break;
                                        case 'string': default:
                                            return [
                                                [this.createLoad(null, 'string', String(field.fieldData), fieldname, this)]
                                            ];
                                        break;
                                    }
                                } else {
                                    return [
                                        [this.createLoad(null, 'number', Number(value), fieldname, this)]
                                    ];
                                }
                            } catch (e) {
                                return [
                                    [this.createLoad(null, 'number', Number(value), fieldname, this)]
                                ];
                            }
                        }
                    }
                break;
                case 'Elements':
                    if (this.inputNodes[0].payload.length >= this.inputNodes[0].fromWidgets.length) {
                        this.inputNodes[0].payload.forEach(capsule => {
                            capsule.forEach(load => {
                                console.log('Load: ' + load);
                                let field = load.field;
                                this.window.controller.elements.forEach(uuid => {
                                    let element = module.Flats.get.element(uuid),
                                        dropdown = element.attributes.dropdown,
                                        input = element.attributes.dropdown.DOM_Element.querySelector(
                                            `.${dropdown.fields[field].element_identifier}`
                                        );
                                    this.window.controller.updateTargetField(input, load.value, 'null');
                                });
                            });
                        });
                    }
                break;
                case 'Offset':

                    /* Check if sufficient inputs */
                    if (this.inputNodes[0].payload.length >= this.inputNodes[0].fromWidgets.length 
                        && this.inputNodes[1].payload.length === 1
                        && this.inputNodes[1].payload[0].length === 1
                    ) {

                        /* Get operation and respective function */
                        let operation = body.querySelector('#operation').value;
                        let fn = {
                            '+' : (v1, v2) => v1 + v2,
                            '-' : (v1, v2) => v1 - v2,
                            '*' : (v1, v2) => v1 * v2,
                            '/' : (v1, v2) => v1 / v2,
                            '^' : (v1, v2) => v2 !== 2 ? Math.pow(v1, v2) : v1 * v1
                        };

                        /* Alias for input #2 */
                        let input2 = this.inputNodes[1].payload[0][0];

                        /* Go through all of input #1 capsules */
                        this.inputNodes[0].payload.forEach(capsule => {
                            capsule.forEach(load => {

                                /* Alias for input #1 */
                                let input1 = load; 
                                
                                /* Confirm operation */
                                let op = fn[operation];
                                if (op !== undefined) {

                                    /* Confirm both inputs are of type number */
                                    if (input1.type === 'number' && input2.type === 'number') {

                                        /* Push new item to capsule with operation */
                                        newCapsule[0].push(this.createLoad(load, 'number', op(input1.value, input2.value))/*{
                                            type : 'number',
                                            value : op(input1.value, input2.value),
                                            field : load.field,
                                            source : load.source,
                                            returnPoint : load.returnPoint
                                        }*/);
                                    } else {

                                        /* Throw error if invalid comparison */
                                        throw new Error(`Cannot perform operation between types '${input1.type}' and '${input2.type}'`);
                                    }
                                } else {

                                    /* Throw error if operation is invalid */
                                    throw new Error(`Operation ${operation} is not a valid operation`);
                                }
                            });
                        });
                    }
                    return newCapsule;
                break;
                case 'Script':

                    if (this.inputNodes[0].payload.length >= this.inputNodes[0].fromWidgets.length) {
                        this.inputNodes[0].payload.forEach(capsule => {
                            capsule.forEach(load => {
                                try {
                                    let output = (Function('input', body.querySelector('.code').value))(load);
                                    if (output?.type !== undefined && output?.value !== undefined && output?.field !== undefined) {
                                        newCapsule[0].push(output);
                                    }
                                } catch (e) {
                                    console.log(e);
                                }
                            });
                        });
                    }

                    return newCapsule;
                break;
                case 'If':
                    /* Check if sufficient inputs */
                    if (this.inputNodes[0].payload.length >= this.inputNodes[0].fromWidgets.length 
                        && this.inputNodes[1].payload.length === 1
                        && this.inputNodes[1].payload[0].length === 1
                    ) {

                        /* Get operation and respective function */
                        let operation = body.querySelector('#operation').value;
                        let fn = {
                            '>' : (v1, v2) => v1 > v2,
                            '<' : (v1, v2) => v1 < v2,
                            '≥' : (v1, v2) => v1 >= v2,
                            '≤' : (v1, v2) => v1 <= v2,
                            '=' : (v1, v2) => v1 === v2,
                            '!=' : (v1, v2) => v1 !== v2
                        };

                        /* Alias for input #2 */
                        let input2 = this.inputNodes[1].payload[0][0];

                        /* Go through all of input #1 capsules */
                        this.inputNodes[0].payload.forEach(capsule => {
                            capsule.forEach(load => {

                                /* Alias for input #1 */
                                let input1 = load; 
                                
                                /* Confirm operation */
                                let op = fn[operation];
                                if (op !== undefined) {

                                    /* Confirm both inputs are of type number */
                                    if (input1.type === 'number' && input2.type === 'number') {

                                        /* Check if condition passes */
                                        let passes = op(input1.value, input2.value);
                                        if (passes) {

                                            /* Push load to first output (if) */
                                            newCapsule[0].push(load);
                                        } else {

                                            /* Ensure second output capsule exists */
                                            if (newCapsule.length < 2) {
                                                newCapsule.push([]);
                                            }

                                            /* Push load to second output (else) */
                                            newCapsule[1].push(load);
                                        }
                                    } else {

                                        /* Throw error if invalid comparison */
                                        throw new Error(`Cannot perform operation between types '${input1.type}' and '${input2.type}'`);
                                    }
                                } else {

                                    /* Throw error if operation is invalid */
                                    throw new Error(`Operation ${operation} is not a valid operation`);
                                }
                            });
                        });
                    }

                    return newCapsule;
                break;
                case 'Boolean':

                    /* Check if sufficient inputs */
                    if (this.inputNodes[0].payload.length >= this.inputNodes[0].fromWidgets.length 
                        && this.inputNodes[1].payload.length === 1
                        && this.inputNodes[1].payload[0].length === 1
                    ) {

                        /* Get operation and respective function */
                        let operation = body.querySelector('#operation').value;
                        let fn = {
                            '>' : (v1, v2) => v1 > v2,
                            '<' : (v1, v2) => v1 < v2,
                            '≥' : (v1, v2) => v1 >= v2,
                            '≤' : (v1, v2) => v1 <= v2,
                            '=' : (v1, v2) => v1 === v2,
                            '!=' : (v1, v2) => v1 !== v2
                        };

                        /* Alias for input #2 */
                        let input2 = this.inputNodes[1].payload[0][0];

                        /* Go through all of input #1 capsules */
                        this.inputNodes[0].payload.forEach(capsule => {
                            capsule.forEach(load => {

                                /* Alias for input #1 */
                                let input1 = load; 
                                
                                /* Confirm operation */
                                let op = fn[operation];
                                if (op !== undefined) {

                                    /* Confirm both inputs are of type number */
                                    if (input1.type === 'number' && input2.type === 'number') {

                                        /* Check if condition passes */
                                        let passes = op(input1.value, input2.value);

                                        /* Push out condition */
                                        newCapsule[0].push(this.createLoad(load, 'boolean', passes)/*{
                                            type : 'boolean',
                                            value : passes,
                                            field : load.field,
                                            source : load.source,
                                            returnPoint : load.returnPoint
                                        }*/);
                                    } else {

                                        /* Throw error if invalid comparison */
                                        throw new Error(`Cannot perform operation between types '${input1.type}' and '${input2.type}'`);
                                    }
                                } else {

                                    /* Throw error if operation is invalid */
                                    throw new Error(`Operation ${operation} is not a valid operation`);
                                }
                            });
                        });
                    }

                    return newCapsule;
                break;
                case 'Join':
                    /* Check if sufficient inputs */
                    if (this.inputNodes[0].payload.length > 0) {
                        return this.inputNodes[0].payload;
                    }
                    return [[]];
                break;
                case 'Gate':

                    /* Check if sufficient inputs */
                    if (this.inputNodes[0].payload.length >= this.inputNodes[0].fromWidgets.length 
                        && this.inputNodes[1].payload.length === 1
                        && this.inputNodes[1].payload[0].length === 1
                    ) {

                        let booleans = [];
                        this.inputNodes[1].payload.forEach(capsule => {
                            if (capsule[0].type === 'boolean') {
                                booleans.push(capsule[0].value);
                            }
                        });

                        /* Get operation and respective function */
                        let operation = body.querySelector('#operation').value;
                        let fn = {
                            'NOT' : () => {
                                if (booleans.length === 1) {
                                    return !booleans[0];
                                }
                                return 0;
                            },
                            'AND' : () => {
                                return booleans.every(v => v === true);
                            },
                            'OR' : () => {
                                let passes = false;
                                booleans.forEach(v => {
                                    passes = passes || v;
                                })
                                return passes;
                            },
                            'XOR' : () => {
                                let passing = [];
                                booleans.forEach(v => {
                                    if (v) passing.push(v);
                                });
                                return passing.length === 1;
                            },
                            'NAND' : () => {
                                return !booleans.every(v => v === true);
                            },
                            'NOR' : () => {
                                let passes = false;
                                booleans.forEach(v => {
                                    passes = passes || v;
                                })
                                return !passes;
                            }
                        };

                        /*console.log(
                            booleans, 
                            operation, 
                            booleans.every(v => v === true), 
                            fn[operation], 
                            fn[operation](),
                            this.inputNodes[0].payload
                        );*/

                        if (fn[operation]()) {
                            this.inputNodes[0].payload.forEach(capsule => {
                                capsule.forEach(load => {
                                    newCapsule[0].push(load);
                                });
                            });
                        }
                    }

                    return newCapsule;
                break;
                case 'Loop Start':
                    if (this.inputNodes[0].payload.length >= this.inputNodes[0].fromWidgets.length) {

                        /* Get loop type from widget select element */
                        let loopType = body.querySelector('#loop').value;

                        this.data.loop = this.data.loop || {};

                        /* Only run if loop hasn't already been triggered */
                        if (!this.data.loop.active) {
                            if (loopType === 'i++') {

                                /* Setup loop for incremental iterations */
                                this.data.loop = {
                                    current : 0,
                                    start : Number(body.querySelector('#start').value),
                                    step : Number(body.querySelector('#step').value),
                                    end : Number(body.querySelector('#end').value),
                                    target : null,
                                    active : true
                                };
                            } else if (loopType === 'forEach') {

                                /* Get the type of 'forEach' target from the widget select element */
                                let accept = body.querySelector('#accept').value;

                                if (accept === 'Input Array') {

                                    /* Alias for input node payload */
                                    let payload = this.inputNodes[0].payload;

                                    /* Only one capsule is allowed */
                                    if (payload.length === 1) {

                                        /* Alias for capsule */
                                        let capsule = payload[0];

                                        /* Only one item is allowed in the capsule */
                                        if (capsule.length === 1) {

                                            /* Ensure the item value is an array */
                                            if (capsule[0].value instanceof Array) {

                                                /* Setup loop for iteration over the array provided by the input */
                                                this.data.loop = {
                                                    current : 0,
                                                    start : 0,
                                                    step : 1,
                                                    end : capsule[0].value.length,
                                                    target : capsule[0].value,
                                                    active : true
                                                };
                                            } else {
                                                throw new Error('Input is not an array at Loop Start input #1');
                                            }
                                        } else {
                                            throw new Error('Too many items passed to Loop Start input #1');
                                        }
                                    } else {
                                        throw new Error('Invalid number of inputs on Loop Start input #1');
                                    }
                                } else if (accept === 'Target Elements') {

                                    /* Find the first connected 'Elements' widget */
                                    let rootElement = this.window.rootFindNext('Elements', this);

                                    /* Map element uuids into element references */
                                    let elements = rootElement.data.elements.map(uuid => module.Flats.get.element(uuid));

                                    /* Setup loop for iterating over elements */
                                    this.data.loop = {
                                        current : 0,
                                        start : 0,
                                        step : 1,
                                        end : elements.length,
                                        target : elements,
                                        active : true
                                    };
                                }
                            }
                            this.data.curCycle = 0;
                            this.data.loopActive = false;
                        }
                        this.inputNodes[0].payload.forEach(capsule => {
                            capsule.forEach(load => {
                                load.returnPoint = this;
                                newCapsule[0].push(load);
                            });
                        });
                        if (loopType === 'i++') {
                            if (newCapsule[1] === undefined) newCapsule.push([]);
                            newCapsule[1].push(this.createLoad(null, 'number', this.data.loop.current, null, this, this)/*{
                                type : 'number',
                                value : this.data.loop.current,
                                field : null,
                                source : this,
                                returnPoint : this
                            }*/);
                        } else if (loopType === 'forEach') {
                            if (newCapsule[1] === undefined) newCapsule.push([]);
                            newCapsule[1].push(this.createLoad(null, 'number', this.data.target[this.data.loop.current], null, this, this)/*{
                                type : 'number',
                                value : this.data.target[this.data.loop.current],
                                field : null,
                                source : this,
                                returnPoint : this
                            }*/);
                        } else if (loopType === 'of') {
                            /*newCapsule[1].push({
                                type : 'number',
                                value : this.data.target[this.data.loop.current],
                                field : null,
                                source : this,
                                returnPoint : this
                            });*/
                        }
                        this.data.loop.current++;
                        
                        if (this.data.loop.current >= this.data.loop.end) {
                            this.data.loop.active = false;
                        }
                    }

                    return newCapsule;
                break;
                case 'Loop End':
                    this.inputNodes[0].payload.forEach(capsule => {
                        capsule.forEach(load => {
                            newCapsule[0].push(load);
                        });
                    });
                    return newCapsule;
                break;
                case 'Get':
                    if (this.inputNodes[0].payload.length >= this.inputNodes[0].fromWidgets.length) {
                        let key = body.querySelector('.input').value;
                        this.inputNodes[0].payload.forEach(capsule => {
                            capsule.forEach(load => {
                                let item = load.value[key],
                                    type = 'number';

                                if (item) {
                                    if (item instanceof Object) {
                                        if (item instanceof Array) {
                                            type = 'array';
                                        } else {
                                            type = 'object';
                                        }
                                    }
                                    
                                    newCapsule[0].push(this.createLoad(load, type, item)/*{
                                        type : type,
                                        value : item,
                                        source : load.source,
                                        returnPoint : load.returnPoint
                                    }*/);
                                } else {
                                    throw new Error(`[Get-Widget#${this.uuid}] Could not get '${key}' from input`);
                                }
                            });
                        });
                    }
                break;
            }
        }
        remove () {
            const that = this;

            /* Remove DOM element */
            this.DOM_Element.remove();

            /* Get rid of input connections */
            this.inputNodes.forEach((node, i) => {
                node.fromWidgets.forEach(connection => {
                    let {uuid, index} = that.unpackConnection(connection),
                        widget = that.window.getWidget(uuid);
                    widget.outputNodes[index].toWidgets.splice(widget.outputNodes[index].toWidgets.indexOf(that.uuid + '/' + i), 1);
                    that.inputNodes[i].fromWidgets.splice(that.inputNodes[i].fromWidgets.indexOf(connection));
                });
            });

            /* Get rid of output connections */
            this.outputNodes.forEach((node, i) => {
                node.toWidgets.forEach(connection => {
                    let {uuid, index} = that.unpackConnection(connection),
                        widget = that.window.getWidget(uuid);
                    widget.inputNodes[index].fromWidgets.splice(widget.inputNodes[index].fromWidgets.indexOf(that.uuid + '/' + i), 1);
                    that.outputNodes[i].toWidgets.splice(that.outputNodes[i].toWidgets.indexOf(connection));
                });
            });

            /* Remove self from Flats */
            this.window.Widgets.splice(this.window.Widgets.map(widget => widget.uuid).indexOf(this.uuid), 1);
        }
    }
    module.ControlWidget = ControlWidget;

    module.defaultFields = Object.freeze({
        "Elements" : {
            'Transform' : {
                'group' : true,
                'index' : 0,
                'as' : 'after'
            },
            'Style' : {
                'group' : true,
                'index' : 1,
                'as' : 'after'
            },
            'Misc' : {
                'group' : true,
                'index' : Infinity,
                'as' : 'last'
            },
            'UUID' : {
                'assignGroup' : 'Misc',
                'type' : 'text'
            },
            'Pivot-X' : {
                'alt_name' : 'Pivot X',
                'type' : 'input',
                'assignGroup' : 'Transform',
                'get' : function (input, fieldName) {
                    return Number(input.value);
                },
                'element_identifier' : 'element-pivot-x',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, element} = Flats.eQuery(e, 'element');
                        element.calculateResize();
                        element.calculateCenter();
                        element.movePivot(Parse.Float(target.value), null);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let element = Flats.get.element(data.uuid);

                            data.input.value = Round(element.attributes.transforms.pivot.x).to(3);
                        });
                    }}
                ]
            },
            'Pivot-Y' : {
                'alt_name' : 'Pivot Y',
                'type' : 'input',
                'assignGroup' : 'Transform',
                'get' : function (input, fieldName) {
                    return Number(input.value);
                },
                'element_identifier' : 'element-pivot-y',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, element} = Flats.eQuery(e, 'element');
                        element.calculateResize();
                        element.calculateCenter();
                        element.movePivot(null, Parse.Float(target.value));
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let element = Flats.get.element(data.uuid);

                            data.input.value = Round(element.attributes.transforms.pivot.y).to(3);
                        });
                    }}
                ]
            },
            'Pivot-Rotation' : {
                'alt_name' : 'Rotation',
                'type' : 'input',
                'assignGroup' : 'Transform',
                'get' : function (input, fieldName) {
                    return Number(input.value);
                },
                'element_identifier' : 'element-pivot-rotation',
                'append' : [
                    {
                        type : 'input',
                        tags : [
                            {name:'type',value:'checkbox'},
                            {name:'title',value:'Use Degrees'}
                        ]
                    }
                ],
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, element} = Flats.eQuery(e, 'element'),
                            degrees = target.nextElementSibling.checked;
                        element.calculateResize();
                        element.calculateCenter();
                        element.moveRotation(Angle(Parse.Float(target.value), !degrees));
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let element = Flats.get.element(data.uuid),
                                degrees = data.input.nextElementSibling.checked;
                            
                            data.input.value = Round(Angle(element.attrib('radians', 3), degrees)).to(3);
                        });
                    }}
                ]
            },
            'Width' : {
                'type' : 'input',
                'assignGroup' : 'Transform',
                'get' : function (input, fieldName) {
                    return Number(input.value);
                },
                'element_identifier' : 'element-width',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, element} = Flats.eQuery(e, 'element');
                        element.calculateResize();
                        element.calculateCenter();

                        let value = Math.max(Round(Parse.Float(target.value)).to(3), 0.009);
                        element.moveResize(value, null);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let element = Flats.get.element(data.uuid);

                            data.input.value = Round(element.attrib('width', 3)).to(3);
                        });
                    }}
                ]
            },
            'Height' : {
                'type' : 'input',
                'assignGroup' : 'Transform',
                'get' : function (input, fieldName) {
                    return Number(input.value);
                },
                'element_identifier' : 'element-height',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, element} = Flats.eQuery(e, 'element');
                        element.calculateResize();
                        element.calculateCenter();

                        let value = Math.max(Round(Parse.Float(target.value)).to(3), 0.009);
                        element.moveResize(null, value);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let element = Flats.get.element(data.uuid);

                            data.input.value = Round(element.attrib('height', 3)).to(3);
                        });
                    }}
                ]
            },
            'Fill-Color' : {
                'type' : 'input',
                'assignGroup' : 'Style',
                'get' : function (input, fieldName) {
                    let opacity = input.parentElement.parentElement.querySelector(`input[element-field-name='Fill-Opacity']`);
                    let rgb;
                    if (opacity) {
                        opacity = Number(opacity.value);
                        rgb = module.Format.hexToRGB(input.value + (opacity < 16 ? '0' : '') + opacity.toString(16));
                    } else {
                        rgb = module.Format.hexToRGB(input.value + 'ff');
                    }
                    return `#color(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})#`;
                },
                'input_type' : 'color',
                'tags' : [{name:'alpha',value:true}],
                'element_identifier' : 'element-fill-color',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, element} = Flats.eQuery(e, 'element');
                        element.attributes.format.attributes.style.fill.color = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let element = Flats.get.element(data.uuid);
                            data.input.value = element.attrib('fill', 4).color;
                        });
                    }}
                ]
            },
            'Fill-Opacity' : {
                'type' : 'input',
                'assignGroup' : 'Style',
                'input_type' : 'range',
                'element_identifier' : 'element-fill-opacity',
                'tags' : [{name:'min',value:'0'},{name:'max',value:'255'}],
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, element} = Flats.eQuery(e, 'element');
                        element.attributes.format.attributes.style.fill.opacity = Parse.Int(target.value);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let element = Flats.get.element(data.uuid);
                            data.input.value = element.attrib('fill', 4).opacity;
                        });
                    }}
                ]
            },
            'Stroke-Color' : {
                'type' : 'input',
                'assignGroup' : 'Style',
                'input_type' : 'color',
                'element_identifier' : 'element-stroke-color',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, element} = Flats.eQuery(e, 'element');
                        element.attributes.format.attributes.style.stroke.color = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let element = Flats.get.element(data.uuid);
                            data.input.value = element.attrib('stroke', 4).color;
                        });
                    }}
                ]
            },
            'Stroke-Opacity' : {
                'type' : 'input',
                'assignGroup' : 'Style',
                'input_type' : 'range',
                'element_identifier' : 'element-stroke-opacity',
                'tags' : [{name:'min',value:'0'},{name:'max',value:'255'}],
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, element} = Flats.eQuery(e, 'element');
                        element.attributes.format.attributes.style.stroke.opacity = Parse.Int(target.value);;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let element = Flats.get.element(data.uuid);
                            data.input.value = element.attrib('stroke', 4).opacity;
                        });
                    }}
                ]
            },
            'Stroke-Width' : {
                'type' : 'input',
                'assignGroup' : 'Style',
                'input_type' : 'number',
                'element_identifier' : 'element-stroke-width',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, element} = Flats.eQuery(e, 'element');
                        element.attributes.format.attributes.style.stroke.width = Parse.Int(target.value);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let element = Flats.get.element(data.uuid);
                            data.input.value = element.attrib('stroke', 4).width;
                        });
                    }}
                ]
            },
            'Use-xy-Basis' : {
                'alt_name' : 'Toggle basis',
                'type' : 'input',
                'assignGroup' : 'Misc',
                'input_type' : 'checkbox',
                'element_identifier' : 'element-usexybasis',
                'tags' : [
                ],
                'events' : [
                    {type:'input',callback:function (e){
                        const {uuid, target, element} = Flats.eQuery(e, 'element');
                        element.interface.resize_calculation.rel = !target.checked;
                    }}
                ]
            },
            'Nodes' : {
                'type' : 'nodes',
                'input_type' : null,
                'assignGroup' : 'Misc',
                'element_identifier' : 'element-nodes',
                'events' : [],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const nodesElement = d.DOM_Element.querySelector('.nodes-field');
                        const uuid = nodesElement.getAttribute('element-uuid-ref'),
                            element = Flats.get.element(uuid),
                            dropdown = element.attributes.dropdown;

                        if (!dropdown?.isLoaded && Interactor.draggedItem.element === null) {
                            element.attributes.dropdown.isLoaded = true;
                            nodesElement.innerHTML = '';
                            if (Interactor.draggedItem.target === 'nodes') {
                                Interactor.draggedItem.target = '';
                                let copyNodes = [];
                                Interactor.draggedItem.order.forEach(uuid => {
                                    copyNodes.push(element.getNode(uuid));
                                });
                                element.nodes = copyNodes;
                            }
                            element.nodes.forEach((node, i) => {
                                node.force_hover = undefined;
                                let nodeField = HTML_Build({
                                    type : 'div',
                                    classes : [`uuid-${node.uuid}`,'node','drag-item'],
                                    tags : [
                                        {name:'node-uuid-ref',value:node.uuid},
                                        {name:'node-index',value:i},
                                        {name:'element-uuid-ref',value:uuid},
                                        {name:'draggable',value:true}
                                    ],
                                    events : [
                                        {
                                            type:'mouseover',callback:function(e){
                                                const target = e.currentTarget,
                                                    element_uuid = target.getAttribute('element-uuid-ref'),
                                                    node_uuid = target.getAttribute('node-uuid-ref'),
                                                    element = Flats.get.element(element_uuid),
                                                    node = element.getNode(node_uuid);
                                                node.force_hover = true;
                                            }
                                        },
                                        {
                                            type:'mouseout',callback:function(e){
                                                const target = e.currentTarget,
                                                    element_uuid = target.getAttribute('element-uuid-ref'),
                                                    node_uuid = target.getAttribute('node-uuid-ref'),
                                                    element = Flats.get.element(element_uuid),
                                                    node = element.getNode(node_uuid);
                                                node.force_hover = undefined;
                                            }
                                        }
                                    ],
                                    children : [
                                        {
                                            type : 'div',
                                            classes : ['material-symbols-outlined'],
                                            html : 'drag_indicator',
                                            events : []
                                        },
                                        {
                                            type : 'label',
                                            html : 'x: '
                                        },
                                        {
                                            type : 'input',
                                            classes : ['node-x','node-input'],
                                            tags : [
                                                {name:'type',value:'number'},
                                                {name:'element-uuid-ref'}
                                            ],
                                            defaultValue : node.x,
                                            events : [
                                                {type:'input',callback:function(e){
                                                    const target = e.currentTarget,
                                                        parent = target.parentElement,
                                                        element_uuid = parent.getAttribute('element-uuid-ref'),
                                                        node_uuid = parent.getAttribute('node-uuid-ref'),
                                                        element = Flats.get.element(element_uuid),
                                                        node = element.getNode(node_uuid);
                                                    node.x = parseFloat(target.value || '0') || 0;
                                                }}
                                            ]
                                        },
                                        {
                                            type : 'label',
                                            html : 'y: '
                                        },
                                        {
                                            type : 'input',
                                            classes : ['node-y','node-input'],
                                            tags : [
                                                {name:'type',value:'number'},
                                                {name:'element-uuid-ref'}
                                            ],
                                            defaultValue : node.y,
                                            events : [
                                                {type:'input',callback:function(e){
                                                    const target = e.currentTarget,
                                                        parent = target.parentElement,
                                                        element_uuid = parent.getAttribute('element-uuid-ref'),
                                                        node_uuid = parent.getAttribute('node-uuid-ref'),
                                                        element = Flats.get.element(element_uuid),
                                                        node = element.getNode(node_uuid);
                                                    node.y = parseFloat(target.value || '0') || 0;
                                                }}
                                            ]
                                        },
                                        {
                                            type : 'button',
                                            classes : ['node-button','material-symbols-outlined'],
                                            events : [
                                                {type : 'click', callback : (e) => {
                                                    const element = Flats.get.element(e.currentTarget.parentNode.getAttribute('element-uuid-ref')),
                                                        index = Number(e.currentTarget.parentNode.getAttribute('node-index'));
                                                    let n0 = element.nodes[index],
                                                        n1 = element.nodes[(index + 1) % element.nodes.length],
                                                        x = (n0.x + n1.x) / 2,
                                                        y = (n0.y + n1.y) / 2;
                                                    element.nodes.splice(index + 1, 0, {
                                                        x : x, 
                                                        y : y,
                                                        hovered : false
                                                    });
                                                    element.idNodes();
                                                    element.formatNodes();
                                                    element.attributes.dropdown.isLoaded = false;
                                                }}
                                            ],
                                            html : 'add'
                                        },
                                        {
                                            type : 'button',
                                            classes : ['node-button','material-symbols-outlined'],
                                            events : [
                                                {type : 'click', callback : (e) => {
                                                    const element = Flats.get.element(e.currentTarget.parentNode.getAttribute('element-uuid-ref')),
                                                        index = Number(e.currentTarget.parentNode.getAttribute('node-index'));
                                                    element.nodes.splice(index, 1);
                                                    element.attributes.dropdown.isLoaded = false;
                                                }}
                                            ],
                                            html : 'delete'
                                        }
                                    ]
                                });
                    
                                nodesElement.appendChild(nodeField);
                            });
                        }
                    }}
                ]
            }
        },
        "Controllers" : {
            'UUID' : {
                'type' : 'text' // This is just for debugging
            },
            'Elements' : {
                'type' : 'elements',
                'element_identifier' : 'handle-elements',
                'loops' : [
                    {interval:1,callback:function(d){
                        const elements = d.DOM_Element.querySelector('.elements-field');
                        const uuid = elements.getAttribute('element-uuid-ref'),
                              controller = d.that.Parent,
                              dropdown = controller.attributes.dropdown;

                        if (!dropdown?.isLoaded) { // Check if attached elements have been loaded in
                            dropdown.isLoaded = true;

                            /* Ensure erasure of elements */
                            elements.replaceChildren();

                            /* Add elements to element list */
                            controller.elements.forEach((uuid) => {
                                let elementField = HTML_Build({
                                    type : 'div',
                                    classes : ['element'],
                                    tags : [
                                        {name:'element-uuid-ref',value:uuid},
                                    ],
                                    events : [],
                                    children : [
                                        {
                                            type : 'text',
                                            classes : ['element-uuid'],
                                            html : uuid
                                        },
                                        {
                                            type : 'button',
                                            classes : ['material-symbols-outlined','element-delete'],
                                            tags : [
                                                {name:'uuid',value:uuid},
                                                {name:'element-uuid-ref',value:controller.uuid},
                                            ],
                                            html : 'delete',
                                            events : [
                                                {type:'click',callback:function(e){
                                                    let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                                        element_uuid = e.currentTarget.getAttribute('uuid'),
                                                        controller = Flats.get.controller(uuid);
                                                    controller.removeElement(element_uuid);
                                                }}
                                            ]
                                        }
                                    ]
                                });
                    
                                elements.appendChild(elementField);
                            });
                            
                            /* Element adding button */
                            const addnew = HTML_Build({
                                type : 'button',
                                classes : ['material-symbols-outlined'],
                                tags : [
                                    {name:'element-uuid-ref',value:controller.uuid}
                                ],
                                id : 'addnew',
                                html : 'add',
                                events : [
                                    {type:'click',callback:function(e){
                                        let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                            controller = Flats.get.controller(uuid);
                                        UI.selectPanelPage('Elements');
                                        Interactor.controller.uuid = uuid;
                                        Interactor.controller.adding.isActive = true;
                                        Interactor.controller.adding.currentElements = controller.elements || [];
                                    }}
                                ]
                            });
                            elements.appendChild(addnew);
                        }
                    }}
                ]

            }
        },
        "Anchors" : {
            'UUID' : {
                'type' : 'text'
            },
            'Elements' : {
                'type' : 'elements',
                'element_identifier' : 'handle-elements',
                'loops' : [
                    {interval:1,callback:function(d){
                        const elements = d.DOM_Element.querySelector('.elements-field');
                        const uuid = elements.getAttribute('element-uuid-ref'),
                                anchor = Flats.get.anchor(uuid),
                                dropdown = anchor.attributes.dropdown;

                        if (!dropdown?.isLoaded) { // Check if attached elements have been loaded in
                            dropdown.isLoaded = true;

                            /* Ensure erasure of elements */
                            elements.replaceChildren();

                            /* Add elements to element list */
                            anchor.elements.map(e => e.uuid).forEach((uuid) => {
                                let elementField = HTML_Build({
                                    type : 'div',
                                    classes : ['element'],
                                    tags : [
                                        {name:'element-uuid-ref',value:uuid},
                                    ],
                                    events : [],
                                    children : [
                                        {
                                            type : 'text',
                                            classes : ['element-uuid'],
                                            html : uuid
                                        },
                                        {
                                            type : 'button',
                                            classes : ['material-symbols-outlined','element-delete'],
                                            tags : [
                                                {name:'uuid',value:uuid},
                                                {name:'element-uuid-ref',value:anchor.uuid},
                                            ],
                                            html : 'delete',
                                            events : [
                                                {type:'click',callback:function(e){
                                                    let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                                        element_uuid = e.currentTarget.getAttribute('uuid'),
                                                        anchor = Flats.get.anchor(uuid);
                                                    anchor.removeElement(element_uuid);
                                                }}
                                            ]
                                        }
                                    ]
                                });
                    
                                elements.appendChild(elementField);
                            });
                            
                            /* Element adding button */
                            const addnew = HTML_Build({
                                type : 'button',
                                classes : ['material-symbols-outlined'],
                                tags : [
                                    {name:'element-uuid-ref',value:anchor.uuid}
                                ],
                                id : 'addnew',
                                html : 'add',
                                events : [
                                    {type:'click',callback:function(e){
                                        let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                            anchor = Flats.get.anchor(uuid);
                                        UI.selectPanelPage('Elements');
                                        Interactor.anchor.uuid = uuid;
                                        Interactor.anchor.adding.isActive = true;
                                        Interactor.anchor.adding.currentElements = anchor.elements || [];
                                    }}
                                ]
                            });
                            elements.appendChild(addnew);
                        }
                    }}
                ]

            },
            'Pivot-X' : {
                'type' : 'input',
                'element_identifier' : 'anchor-pivot-x',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, anchor} = Flats.eQuery(e, 'anchor');
                        anchor.calculateResize();
                        anchor.calculateCenter();
                        anchor.movePivot(Parse.Float(target.value), null);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let anchor = Flats.get.anchor(data.uuid);
                            data.input.value = Round(anchor.attrib('pivot', 2).x).to(3);
                        });
                    }}
                ]
            },
            'Pivot-Y' : {
                'type' : 'input',
                'element_identifier' : 'anchor-pivot-y',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, anchor} = Flats.eQuery(e, 'anchor');
                        anchor.calculateResize();
                        anchor.calculateCenter();
                        anchor.movePivot(null, Parse.Float(target.value));
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let anchor = Flats.get.anchor(data.uuid);
                            data.input.value = Round(anchor.attrib('pivot', 2).y).to(3);
                        });
                    }}
                ]
            },
            'Pivot-Rotation' : {
                'type' : 'input',
                'element_identifier' : 'anchor-pivot-rotation',
                'append' : [
                    {
                        type : 'input',
                        tags : [
                            {name:'type',value:'checkbox'},
                            {name:'title',value:'Use Degrees'}
                        ]
                    }
                ],
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, anchor} = Flats.eQuery(e, 'anchor'),
                            degrees = target.nextElementSibling.checked;
                        anchor.calculateResize();
                        anchor.calculateCenter();
                        anchor.moveRotation(Angle(Parse.Float(target.value), !degrees));//parseFloat(target.value || '0') * (!degrees ? (180 / Math.PI) : 1));
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        Dropdown.fieldLoop(data, (data) => {
                            let anchor = Flats.get.anchor(data.uuid),
                                degrees = data.input.nextElementSibling.checked;
                            data.input.value = Round(Angle(anchor.attrib('radians', 3), degrees)).to(3);
                        });
                    }}
                ]
            },
            'Width' : {
                'type' : 'input',
                'element_identifier' : 'anchor-width',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, anchor} = Flats.eQuery(e, 'anchor');
                        anchor.calculateResize();
                        anchor.calculateCenter();

                        let value = Math.max(Round(Parse.Float(target.value)).to(3), 0.009);
                        anchor.moveResize(value, null);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        let anchor = Flats.get.anchor(data.uuid);
                        Dropdown.fieldLoop(data, (data) => {
                            data.input.value = Round(anchor.attrib('width', 3)).to(3);
                        }, anchor.elements.length > 0, (data) => {
                            data.input.value = Round(0.000).to(3);
                        });
                    }}
                ]
            },
            'Height' : {
                'type' : 'input',
                'element_identifier' : 'anchor-height',
                'events' : [
                    {type:'input',callback:function (e) {
                        const {uuid, target, anchor} = Flats.eQuery(e, 'anchor');
                        anchor.calculateResize();
                        anchor.calculateCenter();

                        let value = Math.max(Round(Parse.Float(target.value)).to(3), 0.009);
                        anchor.moveResize(null, value);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (data) {
                        let anchor = Flats.get.anchor(data.uuid);
                        Dropdown.fieldLoop(data, (data) => {
                            data.input.value = Round(anchor.attrib('height', 3)).to(3);
                        }, anchor.elements.length > 0, (data) => {
                            data.input.value = Round(0.000).to(3);
                        });
                    }}
                ]
            }
        },
        "Snappers" : {
            'UUID' : {
                'type' : 'text'
            },
            'Nodes' : {
                'type' : 'nodes',
                'input_type' : null,
                'element_identifier' : 'element-nodes',
                'events' : [],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const nodesElement = d.DOM_Element.querySelector('.nodes-field');
                        const uuid = nodesElement.getAttribute('element-uuid-ref'),
                            snapper = Flats.get.snapper(uuid),
                            dropdown = snapper.attributes.dropdown;

                        if (!dropdown?.isLoaded && Interactor.draggedItem.element === null) {
                            snapper.attributes.dropdown.isLoaded = true;
                            nodesElement.innerHTML = '';
                            if (Interactor.draggedItem.target === 'nodes') {
                                Interactor.draggedItem.target = '';
                                let copyNodes = [];
                                Interactor.draggedItem.order.forEach(uuid => {
                                    copyNodes.push(snapper.getNode(uuid));
                                });
                                snapper.nodes = copyNodes;
                            }
                            snapper.nodes.forEach((node, i) => {
                                node.force_hover = undefined;
                                let nodeField = HTML_Build({
                                    type : 'div',
                                    classes : [`uuid-${node.uuid}`,'node','drag-item'],
                                    tags : [
                                        {name:'node-uuid-ref',value:node.uuid},
                                        {name:'node-index',value:i},
                                        {name:'element-uuid-ref',value:uuid},
                                        {name:'draggable',value:true}
                                    ],
                                    events : [
                                        {
                                            type:'mouseover',callback:function(e){
                                                const target = e.currentTarget,
                                                    snapper_uuid = target.getAttribute('element-uuid-ref'),
                                                    node_uuid = target.getAttribute('node-uuid-ref'),
                                                    snapper = Flats.get.snapper(snapper_uuid),
                                                    node = snapper.getNode(node_uuid);
                                                node.force_hover = true;
                                            }
                                        },
                                        {
                                            type:'mouseout',callback:function(e){
                                                const target = e.currentTarget,
                                                    snapper_uuid = target.getAttribute('element-uuid-ref'),
                                                    node_uuid = target.getAttribute('node-uuid-ref'),
                                                    snapper = Flats.get.snapper(snapper_uuid),
                                                    node = snapper.getNode(node_uuid);
                                                node.force_hover = undefined;
                                            }
                                        }
                                    ],
                                    children : [
                                        {
                                            type : 'div',
                                            classes : ['material-symbols-outlined'],
                                            html : 'drag_indicator',
                                            events : []
                                        },
                                        {
                                            type : 'label',
                                            html : 'x: '
                                        },
                                        {
                                            type : 'input',
                                            classes : ['node-x','node-input'],
                                            tags : [
                                                {name:'type',value:'number'},
                                                {name:'element-uuid-ref'}
                                            ],
                                            defaultValue : node.x,
                                            events : [
                                                {type:'input',callback:function(e){
                                                    const target = e.currentTarget,
                                                        parent = target.parentElement,
                                                        snapper_uuid = parent.getAttribute('element-uuid-ref'),
                                                        node_uuid = parent.getAttribute('node-uuid-ref'),
                                                        snapper = Flats.get.snapper(snapper_uuid),
                                                        node = snapper.getNode(node_uuid);
                                                    node.x = parseFloat(target.value || '0') || 0;
                                                }}
                                            ]
                                        },
                                        {
                                            type : 'label',
                                            html : 'y: '
                                        },
                                        {
                                            type : 'input',
                                            classes : ['node-y','node-input'],
                                            tags : [
                                                {name:'type',value:'number'},
                                                {name:'element-uuid-ref'}
                                            ],
                                            defaultValue : node.y,
                                            events : [
                                                {type:'input',callback:function(e){
                                                    const target = e.currentTarget,
                                                        parent = target.parentElement,
                                                        snapper_uuid = parent.getAttribute('element-uuid-ref'),
                                                        node_uuid = parent.getAttribute('node-uuid-ref'),
                                                        snapper = Flats.get.snapper(snapper_uuid),
                                                        node = snapper.getNode(node_uuid);
                                                    node.y = parseFloat(target.value || '0') || 0;
                                                }}
                                            ]
                                        },
                                        {
                                            type : 'button',
                                            classes : ['node-button','material-symbols-outlined'],
                                            events : [
                                                {type : 'click', callback : (e) => {
                                                    const snapper = Flats.get.snapper(e.currentTarget.parentNode.getAttribute('element-uuid-ref')),
                                                          index = Number(e.currentTarget.parentNode.getAttribute('node-index'));
                                                    let n0 = snapper.nodes[index],
                                                        n1 = snapper.nodes[(index + 1) % snapper.nodes.length],
                                                        x = (n0.x + n1.x) / 2,
                                                        y = (n0.y + n1.y) / 2;
                                                    snapper.nodes.splice(index + 1, 0, {
                                                        x : x, 
                                                        y : y,
                                                        hovered : false
                                                    });
                                                    snapper.idNodes();
                                                    snapper.formatNodes();
                                                    snapper.attributes.dropdown.isLoaded = false;
                                                }}
                                            ],
                                            html : 'add'
                                        },
                                        {
                                            type : 'button',
                                            classes : ['node-button','material-symbols-outlined'],
                                            events : [
                                                {type : 'click', callback : (e) => {
                                                    const snapper = Flats.get.snapper(e.currentTarget.parentNode.getAttribute('element-uuid-ref')),
                                                          index = Number(e.currentTarget.parentNode.getAttribute('node-index'));
                                                    snapper.nodes.splice(index, 1);
                                                    snapper.attributes.dropdown.isLoaded = false;
                                                }}
                                            ],
                                            html : 'delete'
                                        }
                                    ]
                                });
                    
                                nodesElement.appendChild(nodeField);
                            });
                        }
                    }}
                ]
            }
        }
    });

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


    class ElementDropdown extends module.Dropdown {
        constructor (name, uuid, fields) {
            super(name, uuid, fields);

            this.setPage('Elements');
            this.mergeFields(module.defaultFields.Elements);
        }
        dropdownAction (e) {
            if (Interactor.controller.adding.isActive) {
                let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                    controller = Flats.get.controller(Interactor.controller.uuid);
                controller.addElement(uuid);
                UI.selectPanelPage('Controllers');
                Interactor.reset();
                Interactor.controller.adding.isActive = false;
            }
            if (Interactor.anchor.adding.isActive) {
                let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                    anchor = Flats.get.anchor(Interactor.anchor.uuid);
                anchor.addElement(uuid);
                UI.selectPanelPage('Anchors');
                Interactor.reset();
                Interactor.anchor.adding.isActive = false;
            }
        }
        dropdownUpdate (d) {
            if (Interactor.controller.adding.isActive || Interactor.anchor.adding.isActive) {
                d.dropdown.querySelector('.dropdown-drag').innerHTML = 'add';
            } else {
                d.dropdown.querySelector('.dropdown-drag').innerHTML = 'drag_indicator';
            }
        }
        dropdownRename (e) {
            const uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                  element = Flats.get.element(uuid);
            element.updateName(e.currentTarget.innerText);
        }
        dropdownDelete (e) {
            const uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                  element = Flats.get.element(uuid);
            element.remove();
        }
        loadByType (name, field, field_el) {
            switch (field.type) {
                case 'text':
                    let text = HTML_Build({
                        type : 'div',
                        classes : ['element-uuid'],
                        tags : [{name:'element-uuid-ref',value:this.uuid}],
                        html : this.uuid
                    });
                    field_el.appendChild(text);
                break;
                case 'input':
                    let input = HTML_Build({
                        type : 'input',
                        classes : [field.element_identifier || ''],
                        tags : [
                            {name:'type',value:(field.input_type || 'number')},
                            {name:'step',value:'0.01'},
                            {name:'element-uuid-ref',value:this.uuid},
                            ...(field.tags || [])
                        ],
                        events : field.events || []
                    });
                    field_el.appendChild(input);
                    if (field.append !== undefined) {
                        field.append?.forEach(el => {
                            field_el.appendChild(HTML_Build(el));
                        });
                    }
                break;
                case 'textarea':
                    let textarea = HTML_Build({
                        type : 'textarea',
                        classes : [field.element_identifier || ''],
                        tags : [
                            {name:'element-uuid-ref',value:this.uuid},
                            ...(field.tags || [])
                        ],
                        events : field.events || []
                    });
                    field_el.appendChild(textarea);
                    if (field.append !== undefined) {
                        field.append?.forEach(el => {
                            field_el.appendChild(HTML_Build(el));
                        });
                    }
                break;
                case 'dropdown':
                    let dropdown = HTML_Build({
                        type : 'select',
                        classes : [field.element_identifier || ''],
                        tags : [
                            {name:'value'},
                            {name:'element-uuid-ref',value:this.uuid},
                            ...(field.tags || [])
                        ],
                        events : field.events || []
                    });
                    field.options.forEach(option => {
                        let optionEl = HTML_Build({
                            type : 'option',
                            tags : [{name:'value',value:option[1]}],
                            html : option[0]
                        });
                        dropdown.appendChild(optionEl);
                    });
                    field_el.appendChild(dropdown);
                    if (field.append !== undefined) {
                        field.append?.forEach(el => {
                            field_el.appendChild(HTML_Build(el));
                        });
                    }
                break;
                case 'nodes':
                    let ob = {
                        type : 'div',
                        classes : ['nodes-field', 'drag-list', field.element_identifier || ''],
                        tags : [
                            {name:'element-uuid-ref',value:this.uuid}
                        ],
                        children : []
                    };
                    
                    let nodes = HTML_Build(ob);
                    field_el.appendChild(nodes);
                    
                    let container = nodes;
                    if (container.getAttribute('added-dragging') !== 'true') {
                        container.setAttribute('added-dragging','true');

                        container.addEventListener('dragstart', (e) => {
                            if (e.target.classList.contains('drag-item')) {
                                Interactor.draggedItem.element = e.target;
                                Interactor.draggedItem.target = 'nodes';
                                e.target.classList.add('dragging');
                            }
                        });

                        container.addEventListener('dragend', (e) => {
                            if (e.target.classList.contains('drag-item')) {
                                e.target.classList.remove('dragging');
                                let innerNodes = container.querySelectorAll('.node');
                                Interactor.draggedItem.order = [];
                                for (let i = 0; i < innerNodes.length; i++) {
                                    let innerNode = innerNodes[i];
                                    Interactor.draggedItem.order.push(innerNode.getAttribute('node-uuid-ref'));
                                }
                                const element = module.Flats.get.element(e.currentTarget.getAttribute('element-uuid-ref'));
                                element.attributes.dropdown.isLoaded = false;
                                Interactor.draggedItem.element = null;
                            }
                        });

                        container.addEventListener('dragover', (e) => {
                            e.preventDefault();
                            const afterElement = getDragAfterElement(e.currentTarget, e.clientY);
                            if (afterElement == null) {
                                e.currentTarget.appendChild(Interactor.draggedItem.element);
                            } else {
                                e.currentTarget.insertBefore(Interactor.draggedItem.element, afterElement);
                            }
                        });
                    }
                break;
            }
        }
        loadFields () {
            this.loadGroups();

            let fieldsPicked = [];
            for (let group of this.groups) {
                this.loadField(group, this.fields[group]);
                for (let fieldName in this.fields) {
                    let field = this.fields[fieldName];
                    if (field.assignGroup === group && !fieldsPicked.includes(fieldName)) {
                        fieldsPicked.push(fieldName);
                        this.loadField(fieldName, field);
                    }
                }
            }
            for (let fieldName in this.fields) {
                let field = this.fields[fieldName];
                if (!fieldsPicked.includes(fieldName) && !field.group) {
                    this.loadField(fieldName, field);
                }
            }
        }
    }
    module.ElementDropdown = ElementDropdown;


    module.Exporter = {
        __accumulator : {
            code : ""
        },
        __dependents : {},
        __controllerData : {},
        __defaultFieldCorrelations : {
            '#center' : null,
            '#fill_color' : 'Fill-Color',
            '#stroke_color' : 'Stroke-Color',
            '#stroke_width' : 'Stroke-Width',
            '#width' : 'Width',
            '#height' : 'Height'
        },
        __defaultPaths : {
            '#center' : 'attributes.transforms.scale.center',
            '#format' : 'attributes.format',
            '#stroke_width' : 'attributes.format.attributes.style.stroke.width',
            '#nodes' : 'nodes',
            '#angle' : 'attributes.transforms.rotation.radians'
        
        },
        __defaultHandlers : {
            '#center' : (element) => {
                let center = Exporter.getter(
                    element, 
                    Exporter.path('#center')
                );
                return [center.x.toFixed(2), center.y.toFixed(2)].join(', ');
            },
            '#fill_color' : (element) => {
                let format = Exporter.getter(
                    element, 
                    Exporter.path('#format')
                );
                return Object.values(
                    module.Format.hexToRGB(
                        format.getColor('fill')
                    )
                ).join(', ');
            },
            '#stroke_color' : (element) => {
                let format = Exporter.getter(
                    element, 
                    Exporter.path('#format')
                );
                return Object.values(
                    module.Format.hexToRGB(
                        format.getColor('stroke')
                    )
                ).join(', ');
            },
            '#stroke_width' : (element) => {
                let stroke_width = Exporter.getter(
                    element, 
                    Exporter.path('#stroke_width')
                );
                return stroke_width;
            },
            '#width' : (element) => {
                let nodes = Exporter.getter(
                    element, 
                    Exporter.path('#nodes')
                );
                console.log(nodes);
                return Element.dist(nodes[0], nodes[3]);
            },
            '#height' : (element) => {
                let nodes = Exporter.getter(
                    element, 
                    Exporter.path('#nodes')
                );
                return Element.dist(nodes[0], nodes[1]);
            },
            '#angle' : (element) => {
                let angle = Exporter.getter(
                    element, 
                    Exporter.path('#angle')
                );
                return angle * 180 / Math.PI;
            }
        },
        __reset : function () {
            this.__accumulator.code = '';
            this.__dependents = {};
            this.__controllerData = {};
        },
        __preloadLibraries : function () {
            for (let name in module.Flats.Formats) {
                let form = module.Flats.Formats[name],
                    libs = form.export?.libs;
                if (libs && libs?.length > 0) {
                    for (let libName of libs) {
                        let lib = module.ExportLibraries[libName];
                        if (lib) lib.active = true;
                    }
                }
            }
        },
        __preloadFormatVariables : function () {
            for (let name in module.Flats.Formats) {
                let form = module.Flats.Formats[name],
                    registerVariables = form.export?.registerVariables;
                if (registerVariables) {
                    if (Object.keys(registerVariables).length > 0) {
                        for (let varName in registerVariables) {
                            this.__defaultFieldCorrelations[varName] = registerVariables[varName].field_correlation;
                            this.__defaultPaths[varName] = registerVariables[varName].path;
                            this.__defaultHandlers[varName] = registerVariables[varName].handler;
                        }
                    }
                }
            }
        },
        __preloadControllerDependencies : function () {
            for (let c in module.Flats.Controllers) {
                let controller = module.Flats.Controllers[c];
                for (let e in controller.elements) {
                    let element = controller.elements[e];
                    if (this.__dependents[element]) {
                        this.__dependents[element].push(controller.uuid);
                    } else {
                        this.__dependents[element] = [controller.uuid];
                    }
                }
            }
        },
        __preloadControllerData : function () {
            for (let c in module.Flats.Controllers) {
                let controller = module.Flats.Controllers[c];
                this.__controllerData[controller.uuid] = {};
                for (let fieldName in controller.attributes.dropdown.fields) {
                    let dropdown = controller.attributes.dropdown,
                        field = dropdown.fields[fieldName],
                        input = dropdown.body.querySelector(`input[element-field-name=${fieldName}]`),
                        value = (field.get || Function())(input, fieldName) || input?.value;
                    if (value !== undefined) {
                        this.__controllerData[controller.uuid][fieldName] = value;
                    }
                }
            }
        },
        exportLibraries : function () {
            this.__accumulator.code += `// Libraries {\n`;
            for (let [key, value] of Object.entries(module.ExportLibraries)) {
                if (value.active) {
                    this.__accumulator.code += `var CustomText = (${String(value.code)})();\n`;
                }
            }
            this.__accumulator.code += `// }\n\n`;
        },
        exportControllers : function () {
            this.__accumulator.code += `// Controller objects {\n`;
            for (let c in this.__controllerData) {
                let controller = module.Flats.get.controller(c);
                if (controller) {
                    let name = controller.attributes.name,
                        object = this.__controllerData[c];
                    name = name.replaceAll(' ', '_');
                    let json = JSON.stringify(object, null, 4);
                    /*for (let field in json) {
                        let v = json[field];
                        if (v instanceof String) {
                            if (v) {}
                        }
                    }*/
                    this.__accumulator.code += `var ${name} = ${json};\n`;
                }
            }
            this.__accumulator.code += `// }\n\n`;
        },
        exportElement : function (element) {
            let script = element.export(),
                vars = this.scriptVars(script);
            
            let hasDependent = this.__dependents[element.uuid]?.length > 0;

            for (let v in vars) {
                let insert = this.handler(element, vars[v]);

                /* Fill-in controller dependencies */
                if (hasDependent) {
                    let fieldName = this.correlate(vars[v]);
                    if (fieldName) {
                        let data = this.queryField(element.uuid, fieldName);
                        if (data) {
                            let controller = module.Flats.get.controller(data.uuid),
                                name = controller.attributes.name.replaceAll(' ', '_');
                            insert = `${name}[['${fieldName}']]`;
                        }
                    }
                }

                script = script.replaceAll(vars[v], insert);
            }
            return `\n// ${element.attributes.name.replaceAll(' ', '_')}\n` + script;
        },
        path : function (varName) {
            return this.__defaultPaths[varName];
        },
        getter : function (element, str) {
            const path = str.split('.');
            function recur (root, path) {
                let found = false;
                for (let sub in root)
                    if (sub === path[0]) {
                        if (path.length === 1) 
                            return root[sub];
                        else {
                            path.shift();
                            return recur(root[sub], path);
                        }
                        found = true;
                    }
                if (!found) return null;
            }
            return recur(element, path);
        },
        handler : function (element, varName) {
            const handler = this.__defaultHandlers[varName];
            if (handler) return handler(element);
        },
        correlate : function (varName) {
            return this.__defaultFieldCorrelations[varName];
        },
        queryField : function (elementUUID, field) {
            let deps = this.__dependents[elementUUID];
            for (let d in deps) {
                let dependent = deps[d],
                    data = this.__controllerData[dependent];
                if (data[field] !== undefined) {
                    return {
                        uuid : dependent,
                        value : data[field]
                    };
                }
            }
            return null;
        },
        scriptVars : function (script) {
            let vars = [];
            for (let variable in this.__defaultHandlers) {
                if (script.includes(variable)) {
                    vars.push(variable);
                }
            }
            return vars;
        },
        compileProject : function () {
            this.__reset();
            this.__preloadLibraries();
            this.__preloadFormatVariables();
            this.__preloadControllerDependencies();
            this.__preloadControllerData();

            this.exportLibraries();
            this.exportControllers();

            module.Flats.Elements.forEach(element => {
                this.__accumulator.code += this.exportElement(element) + '\n';
            });

            console.log(this.__accumulator.code);
        }
    };

    module.ExportLibraries = {
        'text' : {
            active : false,
            code : function () {
                return {
                    computeTextHeight : function (text, x, y, lineHeight, fitWidth) {
                        fitWidth = fitWidth || 0;

                        if (fitWidth <= 0)
                        {
                            return {lines : 0};
                        }
                        var words = text.split(' ');
                        var currentLine = 0;
                        var idx = 1;
                        while (words.length > 0 && idx <= words.length) {
                            var str = words.slice(0, idx).join(' ');
                            var w = textWidth(str);
                            if ( w > fitWidth ) {
                                if (idx === 1) {
                                    idx = 2;
                                }
                                currentLine++;
                                words = words.splice(idx - 1);
                                idx = 1;
                            }
                            else {idx++;}
                        }
                        return {
                            lines : currentLine
                        };
                    },
                    xAlign : function (d) {
                        //console.log(lines);
                        
                        switch (d.options.align.x) {
                            case 'center':
                                return 0;
                            case 'left':
                                return -d.options.width;
                            case 'right':
                                return d.options.width;
                        }
                    },
                    yAlign : function (d) {
                        //console.log(lines);
                        
                        switch (d.options.align.y) {
                            case 'middle':
                                return -d.lines * (d.options.lineHeight / 2);
                            case 'top':
                                return -d.options.height;
                            case 'bottom':
                                return d.options.height - (d.lines * d.options.lineHeight);
                        }
                    },
                    printAtWordWrap : function (txt, x, y, lineHeight, fitWidth) {
                        /* Credit to Gabriele Petrioli on StackOverflow for this function */

                        fitWidth = fitWidth || 0;

                        if (fitWidth <= 0)
                        {
                            text( txt, x, y );
                            return;
                        }
                        var words = txt.split(' ');
                        var currentLine = 0;
                        var idx = 1;
                        while (words.length > 0 && idx <= words.length) {
                            var str = words.slice(0, idx).join(' ');
                            var w = textWidth(str);
                            if ( w > fitWidth ) {
                                if (idx === 1) {
                                    idx = 2;
                                }
                                text( words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine) );
                                currentLine++;
                                words = words.splice(idx - 1);
                                idx = 1;
                            }
                            else {idx++;}
                        }
                        if  (idx > 0) {
                            text( words.join(' '), x, y + (lineHeight * currentLine) );
                        }
                    },
                    render : function (options) {
                        var matchAlignments = {
                            'center' : CENTER,
                            'left' : LEFT,
                            'middle' : CENTER,
                            'right' : RIGHT,
                            'top' : TOP,
                            'bottom' : BOTTOM
                        };
                        //text, outlineThickness, innerColor, outerColor, align, italics, bold, fontSize, fontFamily
                        textAlign(
                            matchAlignments[options.align.x], 
                            matchAlignments[options.align.y]
                        );
                        textFont(createFont(options.fontFamily + (options.bold ? ' Bold' : '') + (options.italics ? ' Italic' : ''), options.fontSize));
                        
                        var metrics = this.computeTextHeight(options.text, 0, 0, options.lineHeight, options.width * 2),
                            xAlign = this.xAlign({options : options}),
                            yAlign = this.yAlign({options : options, lines : metrics.lines}),
                            outThick = options.outlineThickness;
                        
                        pushMatrix();
                        translate(xAlign, yAlign);
                        fill(options.outerColor);
                        for (var y = -outThick; y < outThick; y += 0.5) {
                            for (var x = -outThick; x < outThick; x += 0.5) {
                                this.printAtWordWrap(options.text, x, y, options.lineHeight, options.width * 2);
                            }
                        }
                        fill(options.innerColor);
                        this.printAtWordWrap(options.text, 0, 0, options.lineHeight, options.width * 2);
                        popMatrix();
                    }
                };
            }
        }
    };


    module.Flats = {
        Elements : [],
        Snappers : [],
        Anchors : [],
        Controllers : [],
        Windows : [],
        Formats : {},
        Snaps : {},
        Pickers : {},
        ContextMenus : [],
        reorder : {
            elements : function () {
                if (Interactor.draggedItem.target === 'elements') {
                    Interactor.draggedItem.target = '';

                    let copyElements = [];
                    Interactor.draggedItem.order.forEach(uuid => {
                        const el = module.Flats.get.element(uuid);
                        if (el !== null) copyElements.push(el);
                    });
                    Flats.Elements = copyElements;
                }
            }
        },
        eQuery : function (event, type) {
            let uuid = event.currentTarget.getAttribute('element-uuid-ref');
            if (uuid) {
                let getter = this.get[type];
                if (getter) {
                    return {
                        uuid,
                        target : event.currentTarget,
                        [type] : getter(uuid)
                    };
                }
                throw new Error(`Invalid Flats.get method "${type}".`);
            }
            throw new Error('No uuid present in event target.');
        },
        get : {
            element : function (uuid) {
                var that = module.Flats;
                for (let i = 0; i < that.Elements.length; i++) {
                    if (that.Elements[i].uuid === uuid) {
                        return that.Elements[i];
                    }
                }
                return null;
            },
            snapper : function (uuid) {
                var that = module.Flats;
                for (let i = 0; i < that.Snappers.length; i++) {
                    if (that.Snappers[i].uuid === uuid) {
                        return that.Snappers[i];
                    }
                }
                return null;
            },
            format : function (name) {
                return module.Flats.Formats[name];
            },
            anchor : function (uuid) {
                var that = module.Flats;
                for (let i = 0; i < that.Anchors.length; i++) {
                    if (that.Anchors[i].uuid === uuid) {
                        return that.Anchors[i];
                    }
                }
                return null;
            },
            controller : function (uuid) {
                var that = module.Flats;
                for (let i = 0; i < that.Controllers.length; i++) {
                    if (that.Controllers[i].uuid === uuid) {
                        return that.Controllers[i];
                    }
                }
                return null;
            },
            window : function (uuid) {
                var that = module.Flats;
                for (let i = 0; i < that.Windows.length; i++) {
                    if (that.Windows[i].uuid === uuid) {
                        return that.Windows[i];
                    }
                }
                return null;
            },
            contextMenu : function (id) {
                var that = module.Flats;
                for (let i = 0; i < that.ContextMenus.length; i++) {
                    if (that.ContextMenus[i].id === id) {
                        return that.ContextMenus[i];
                    }
                }
                return null;
            }
        },
        findTopAnchor : function () {
            let int = module.Interactor;
            let anchors = this.Anchors.map(a => {
                return {v : a.interface.passes_check, an : a}
            });
            anchors = anchors.filter(e => e.v);
            if (int.mouse.pressed && int.mouse.button === 0) {
                return (anchors[anchors.length - 1] || {an:undefined}).an;
            } else return undefined;
        },
        findTopElement : function () {
            let int = module.Interactor;
            let elements = this.Elements.map(e => {
                return {v : e.interface.passes_check, el : e}
            });
            elements = elements.filter(e => e.v);
            if (int.mouse.pressed && int.mouse.button === 0) {
                return (elements[elements.length - 1] || {el:undefined}).el;
            } else return undefined;
        },
        remove : {
            element : function (uuid) {
                let elements = module.Flats.Elements;
                
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].uuid === uuid) {
                        elements[i].remove();
                        elements.splice(i, 1);
                        break;
                    }
                }
            },
            snapper : function (uuid) {
                let snaps = module.Flats.Snappers;
                
                for (let i = 0; i < snaps.length; i++) {
                    if (snaps[i].uuid === uuid) {
                        snaps.splice(i, 1);
                        break;
                    }
                }
            },
            contextMenu : function (id) {
                let menus = module.Flats.ContextMenus;
                
                for (let i = 0; i < menus.length; i++) {
                    if (menus[i].id === id) {
                        menus.splice(i, 1);
                        break;
                    }
                }
            }
        }
    };


    /* 
       NOTE:
        This is mostly just a wrapper class that keeps stuff consistently OOP. 
        I plan to add a few more methods which will be exterior to the 'Formats' 
        object. 
    */
    class Format {
        constructor (name) {
            let format = module.Flats.Formats[name];

            /* Confirm named format exists */
            if (!format) {
                throw new Error(`No format named ${name} was found.`);
            }

            /* Read-only binding with format object */
            this.name = name;
            this.attributes = {
                format,
                style : {
                    stroke : {
                        color : '#000000',
                        opacity : 255,
                        width : 1
                    },
                    fill : {
                        color : '#96aa14',
                        opacity : 255
                    },
                    special : {

                    }
                }  
            };
        }
        static hexToRGB (hex) {
            /* Credit to @Tim Down on stackoverflow.com */
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
                a :parseInt(result[4], 16)
            } : null;
        }
        static componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        static rgbToHex(c) {
            return "#" + this.componentToHex(c.r) + this.componentToHex(c.g) + this.componentToHex(c.b) + this.componentToHex(c.a);
        }
        static lerp (v1, v2, a) {
            return (1 - a) * v1 + a * v2;
        }
        static colorLerp (c1, c2, alpha) {
            return {
                r : Math.round(this.lerp(c1.r, c2.r, alpha)),
                g : Math.round(this.lerp(c1.g, c2.g, alpha)),
                b : Math.round(this.lerp(c1.b, c2.b, alpha)),
                a : Math.round(this.lerp(c1.a, c2.a, alpha)),
            };
        }
        use (ctx, element, check) {
            /* Call the format 'main' rendering method */
            if (this.attributes.format.main !== undefined) {
                this.attributes.format.main(ctx, element, this.attributes.style, check);
            }
        }
        getColor (type, ext='') {
            const style = this.attributes.style;
            if (type === 'stroke') {
                return style.stroke.color + ((style.stroke.opacity < 16 ? '0' : '') + style.stroke.opacity.toString(16));
            } else if (type === 'fill') {
                return style.fill.color + ((style.fill.opacity < 16 ? '0' : '') + style.fill.opacity.toString(16));
            } else if (type === 'special') {
                return style.special?.[ext].color + ((style.special?.[ext].opacity < 16 ? '0' : '') + style.special?.[ext].opacity.toString(16));
            }
        }
        setColor (type, value, alpha=false) {
            const style = this.attributes.style;
            if (type === 'stroke') {
                style.stroke.color = value;
                style.stroke.opacity = alpha !== false ? alpha : style.stroke.opacity;
            } else if (type === 'fill') {
                style.fill.color = value;
                style.fill.opacity = alpha !== false ? alpha : style.fill.opacity;
            }
        }
    }
    module.Format = Format;


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

    
    module.Settings = {
        canvas : {
            width : 400,
            height : 400,
            size : 1200,
            layout : '1:1',
            forElement : function () {
                let str = this.layout.split(':'),
                    sw = Number(str[0]), sh = Number(str[1]);
                return {
                    width : this.size * (sw > sh ? 1 : (sw / sh)),
                    height : this.size * (sh > sw ? 1 : (sh / sw))
                };
            },
            update : function () {
                let size = document.querySelector('#canvas-size-ghti');
                this.size = size.value;
            },
            set : function (key, value) {
                this[key] = value;
            }
        },
    };
    setInterval(() => {
        Object.keys(module.Settings).forEach(setting => {
            module.Settings[setting].update();
        });
    }, 1);

    module.ShapeCreator = {
        setup : {
            pointType : function (element) {
                let sc = Interactor.shape_creation,
                    mouse = Interactor.mouse.rel;
                element.nodes = [{x : sc.x, y : sc.y, hovered : false}];
            },
            polyType : function (element) {
                let sc = Interactor.shape_creation,
                    mouse = Interactor.mouse.rel;
                element.nodes[0] = {x : sc.x, y : sc.y, hovered : false};
                element.nodes[1] = element.nodes[1] || {x : sc.x, y : sc.y, hovered : false};
                element.nodes[element.nodes.length - 1] = {x : Number(mouse.x), y : Number(mouse.y), hovered : false};
            },
            bezierType : function (element) {
                let sc = Interactor.shape_creation,
                    mouse = Interactor.mouse.rel,
                    len = element.nodes.length;

                element.nodes[0] = {x : sc.x, y : sc.y, hovered : false};
                if (element.nodes.length === 1) {
                    element.nodes = element.nodes.concat([0, 0, 0]);
                }
                if ((element.nodes.length + 2) % 3 === 1) {
                    element.nodes = element.nodes.concat([0, 0]);
                }
                len = element.nodes.length;

                for (let i = 0; i < len; i++) {
                    if (i === len - 3 || i === len - 2) {
                        let lastVertex = element.nodes[len - 4];
                        element.nodes[i] = {
                            x : lastVertex.x + (mouse.x - lastVertex.x) / 3 * (i % 3), 
                            y : lastVertex.y + (mouse.y - lastVertex.y) / 3 * (i % 3),
                            hovered : false
                        };
                    }
                }

                element.nodes[(element.nodes.length - 1)] = {
                    x : Number(mouse.x), 
                    y : Number(mouse.y), 
                    hovered : false
                };
            },
            squareType : function (element) {
                let sc = Interactor.shape_creation,
                    mouse = Interactor.mouse.rel;
                element.nodes = [
                    {x : sc.x, y : sc.y, hovered : false},
                    {x : sc.x, y : sc.y + (mouse.x - sc.x), hovered : false},
                    {x : mouse.x, y : sc.y + (mouse.x - sc.x), hovered : false},
                    {x : mouse.x, y : sc.y, hovered : false}
                ];
            },
            rectType : function (element) {
                let sc = Interactor.shape_creation,
                    mouse = Interactor.mouse.rel;
                element.nodes = [
                    {x : sc.x, y : sc.y, hovered : false},
                    {x : sc.x, y : mouse.y, hovered : false},
                    {x : mouse.x, y : mouse.y, hovered : false},
                    {x : mouse.x, y : sc.y, hovered : false}
                ];
            },
            lineType : function (element) {
                let sc = Interactor.shape_creation,
                    mouse = Interactor.mouse.rel;
                element.nodes[0] = {x : sc.x, y : sc.y, hovered : false};
                element.nodes[element.nodes.length - 1] = {x : Number(mouse.x), y : Number(mouse.y), hovered : false};
            },
            arcType : function (element) {
                let sc = Interactor.shape_creation,
                    mouse = Interactor.mouse.rel;
                element.nodes = [
                    {x : sc.x, y : sc.y, hovered : false},
                    {x : sc.x, y : mouse.y, hovered : false},
                    {x : mouse.x, y : mouse.y, hovered : false},
                    {x : mouse.x, y : sc.y, hovered : false},
                    {x : sc.x, y : (sc.y + mouse.y) / 2, hovered : false},
                    {x : (sc.x + mouse.x) / 2, y : sc.y, hovered : false}
                ];
            },
            preload : {
                'default:point' : function (element) {
                    ShapeCreator.setup.pointType(element);
                },
                'default:line' : function (element) {
                    ShapeCreator.setup.lineType(element);
                },
                'default:circle' : function (element) {
                    ShapeCreator.setup.squareType(element);
                },
                'default:ellipse' : function (element) {
                    ShapeCreator.setup.rectType(element);
                },
                'default:arc' : function (element) {
                    ShapeCreator.setup.arcType(element);
                },
                'default:triangle' : function (element) {
                    ShapeCreator.setup.polyType(element);
                    if (element.nodes.length > 3) {
                        element.nodes.pop();
                        ShapeCreator.end_creation = true;
                    }
                },
                'default:quad' : function (element) {
                    ShapeCreator.setup.rectType(element);
                },
                'default:poly' : function (element) {
                    ShapeCreator.setup.polyType(element);
                },
                'default:poly_regular' : function (element) {
                    let special = ShapeCreator.format.attributes.style.special;
                    special.sides = 5;
                    special.startAngle = 0;
                    ShapeCreator.setup.rectType(element);
                },
                'default:rect' : function (element) {
                    ShapeCreator.setup.rectType(element);
                },
                'default:bezier' : function (element) {
                    ShapeCreator.setup.bezierType(element);
                },
                'default:bezier_chain' : function (element) {
                    ShapeCreator.setup.bezierType(element);
                },
                'default:gradient' : function (element) {
                    let special = ShapeCreator.format.attributes.style.special;
                    special.gradient1 = {
                        color : '#ffff00',
                        opacity : 255
                    };
                    special.gradient2 = {
                        color : '#ff00ff',
                        opacity : 255
                    };
                    ShapeCreator.setup.rectType(element);
                },
                'default:text' : function (element) {
                    let special = ShapeCreator.format.attributes.style.special;
                    special.text = {
                        string : 'Example text here... Testing',
                        inner : {
                            color : '#ffffff',
                            opacity : 255
                        },
                        outer : {
                            color : '#000000',
                            opacity : 255
                        },
                        outlineThickness : 2,
                        fontFamily : 'times',
                        fontSize : 12,
                        fontStyle : {
                            bold : false,
                            italics : false
                        },
                        lineHeight : 24,
                        align : {
                            x_axis : 'center',
                            y_axis : 'middle'
                        }
                    };
                    ShapeCreator.setup.rectType(element);
                },
            },
            type : 'append'
        },
        format : null,
        element : null,
        end_creation : false,
        render : function (ctx) {
            let creation = Interactor.shape_creation,
                mouse = Interactor.mouse;

            if (creation.format === null) {
                this.element = null;
                creation.sizing_active = false;
                creation.active = false;
                creation.node_on_tick = false;
            }

            if (Interactor.keyboard.pressed) {
                if (this.setup.type !== 'append' || (Interactor.keyboard.key.name !== 'n')) {
                    this.format = null;
                    this.element = null;
                    creation.sizing_active = false;
                    creation.active = false;
                }
                if (this.setup.type === 'append' && Interactor.keyboard.key.name === 'n') {
                    if (creation.sizing_active && !creation.node_on_tick) {
                        this.element.nodes.push({
                            x : mouse.rel.x,
                            y : mouse.rel.y,
                            hovered : false
                        });
                        //creation.x = Number(mouse.rel.x);
                        //creation.y = Number(mouse.rel.y);
                        creation.node_on_tick = true;
                    }
                }
            } else {
                creation.node_on_tick = false;
            }
            if ((!mouse.pressed && creation.sizing_active) || this.end_creation) {
                this.end_creation = false;
                creation.x = Number(mouse.rel.x);
                creation.y = Number(mouse.rel.y);
                if (creation.active) {
                    if (creation.type === 'shape') {
                        this.element.attributes.transforms.pivot = {
                            x : this.element.attributes.transforms.scale.center.x,
                            y : this.element.attributes.transforms.scale.center.y,
                            hovered : false
                        };
                        /*console.log(this.element.nodes);

                        let element = this.element;
                        var angles = [];
                        for (let i = 0; i < element.nodes.length; i++) {
                            if (i % 3 === 0) {
                                let cur = element.nodes[i],
                                    next = element.nodes[(i + 1) % element.nodes.length]
                                angles.push(Math.atan2(
                                    next.y - cur.y, next.x - cur.x
                                ));
                            }
                        }
                        
                        //console.log(angles);
                        for (let i = 0; i < element.nodes.length; i++) {
                            if ([1, 2].includes(i % 3)) {
                                let lastVertex = element.nodes[Math.floor(i / 3)];
                                let dif = angles[(Math.floor(i / 3) + 1) % angles.length] - angles[Math.floor(i / 3)];
                                console.log(dif);
                                console.log(lastVertex);
                                if (i % 3 === 1) {
                                    let d = Vector.dist(mouse, lastVertex) * 1/3;
                                    
                                    element.nodes[i] = {
                                        x : lastVertex.x + d * Math.cos(-dif / 2),
                                        y : lastVertex.y + d * Math.sin(-dif / 2),
                                        hovered : false
                                    };
                                }
                                if (i % 3 === 2) {
                                    let d = Vector.dist(mouse, lastVertex) * 2/3;
                                    element.nodes[i] = {
                                        x : lastVertex.x + d * Math.cos(-dif * 3/4),
                                        y : lastVertex.y + d * Math.sin(-dif * 3/4),
                                        hovered : false
                                    };
                                }
                            } else if (i === element.nodes.length - 3 || i === element.nodes.length - 2) {
                                let lastVertex = element.nodes[element.nodes.length - 4];
                                element.nodes[i] = {
                                    x : lastVertex.x + (mouse.x - lastVertex.x) / 3 * (i % 3), 
                                    y : lastVertex.y + (mouse.y - lastVertex.y) / 3 * (i % 3),
                                    hovered : false
                                };
                            }
                        }
                        //console.log(element.nodes);*/
                        this.element.addDropdown();
                        module.Flats.Elements.push(this.element);
                    } else if (creation.type === 'snapper') {
                        this.element.addDropdown();
                        module.Flats.Snappers.push(this.element);
                    }

                    this.format = null;
                    this.element = null;
                    creation.sizing_active = false;
                    creation.active = false;
                }
            } else if (mouse.pressed && creation.active) {
                if (creation.type === 'shape') {
                    this.format = this.format || new module.Format(creation.format);
                    this.element = this.element || new module.Element();

                    this.setup.preload[creation.format](this.element);

                    this.element.bindFormat(this.format);
                    this.element.calculateResize();
                    this.element.calculateCenter();
                    this.element.render(ctx, false);
                    this.element.renderBox(ctx);
                    
                    if (!creation.sizing_active) {
                        creation.x = Number(mouse.rel.x);
                        creation.y = Number(mouse.rel.y);
                    }
                    creation.sizing_active = true;

                    if (this.setup.type === 'paste') {
                        //element.render(ctx);
                    }
                } else if (creation.type === 'snapper') {
                    this.format = module.Flats.Snaps[creation.format];
                    this.element = this.element || new module.Snapper(creation.format);
                    this.element.interface.isActive = true;

                    this.setup.preload[creation.format](this.element);
                    this.element.bindSnap(this.format);
                    this.element.setWidth(10);
                    
                    if (!creation.sizing_active) {
                        Interactor.snapper.toggleVisibility(true);
                        creation.x = Number(mouse.rel.x);
                        creation.y = Number(mouse.rel.y);
                        this.element.nodes.push({
                            x : creation.x, y : creation.y, hovered : false
                        });
                    }
                    creation.sizing_active = true;

                    this.element.update();
                    this.element.hoverNodes();
                    this.element.grabNodes();
                    this.element.render(ctx);
                }
            }
        }
    };


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


    class SnapperDropdown extends module.Dropdown {
        constructor (name, uuid, fields={}) {
            super(name, uuid, fields);

            this.setPage('Snappers');
            this.mergeFields(module.defaultFields.Snappers);
        }
        dropdownRename (e) {
            const uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                  snapper = Flats.get.snapper(uuid);
            snapper.updateName(e.currentTarget.innerText);
        }
        dropdownDelete (e) {
            const uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                  snapper = Flats.get.snapper(uuid);
            snapper.remove();
        }
        loadByType (name, field, field_el) {
            switch (field.type) {
                case 'text':
                    let text = HTML_Build({
                        type : 'div',
                        classes : ['element-uuid'],
                        tags : [{name:'element-uuid-ref',value:this.uuid}],
                        html : this.uuid
                    });
                    field_el.appendChild(text);
                break;
                case 'input':
                    let input = HTML_Build({
                        type : 'input',
                        classes : [field.element_identifier || ''],
                        tags : [
                            {name:'type',value:(field.input_type || 'number')},
                            {name:'step',value:'0.01'},
                            {name:'element-uuid-ref',value:this.uuid},
                            ...(field.tags || [])
                        ],
                        events : field.events || []
                    });
                    field_el.appendChild(input);
                    if (field.append !== undefined) {
                        field.append?.forEach(el => {
                            field_el.appendChild(HTML_Build(el));
                        });
                    }
                break;
                case 'textarea':
                    let textarea = HTML_Build({
                        type : 'textarea',
                        classes : [field.element_identifier || ''],
                        tags : [
                            {name:'element-uuid-ref',value:this.uuid},
                            ...(field.tags || [])
                        ],
                        events : field.events || []
                    });
                    field_el.appendChild(textarea);
                    if (field.append !== undefined) {
                        field.append?.forEach(el => {
                            field_el.appendChild(HTML_Build(el));
                        });
                    }
                break;
                case 'dropdown':
                    let dropdown = HTML_Build({
                        type : 'select',
                        classes : [field.element_identifier || ''],
                        tags : [
                            {name:'value'},
                            {name:'element-uuid-ref',value:this.uuid},
                            ...(field.tags || [])
                        ],
                        events : field.events || []
                    });
                    field.options.forEach(option => {
                        let optionEl = HTML_Build({
                            type : 'option',
                            tags : [{name:'value',value:option[1]}],
                            html : option[0]
                        });
                        dropdown.appendChild(optionEl);
                    });
                    field_el.appendChild(dropdown);
                    if (field.append !== undefined) {
                        field.append?.forEach(el => {
                            field_el.appendChild(HTML_Build(el));
                        });
                    }
                break;
                case 'nodes':
                    let ob = {
                        type : 'div',
                        classes : ['nodes-field', 'drag-list', field.element_identifier || ''],
                        tags : [
                            {name:'element-uuid-ref',value:this.uuid}
                        ],
                        children : []
                    };
                    
                    let nodes = HTML_Build(ob);
                    field_el.appendChild(nodes);
                    
                    let container = nodes;
                    if (container.getAttribute('added-dragging') !== 'true') {
                        container.setAttribute('added-dragging','true');

                        container.addEventListener('dragstart', (e) => {
                            if (e.target.classList.contains('drag-item')) {
                                Interactor.draggedItem.element = e.target;
                                Interactor.draggedItem.target = 'nodes';
                                e.target.classList.add('dragging');
                            }
                        });

                        container.addEventListener('dragend', (e) => {
                            if (e.target.classList.contains('drag-item')) {
                                e.target.classList.remove('dragging');
                                let innerNodes = container.querySelectorAll('.node');
                                Interactor.draggedItem.order = [];
                                for (let i = 0; i < innerNodes.length; i++) {
                                    let innerNode = innerNodes[i];
                                    Interactor.draggedItem.order.push(innerNode.getAttribute('node-uuid-ref'));
                                }
                                const snapper = module.Flats.get.snapper(e.currentTarget.getAttribute('element-uuid-ref'));
                                snapper.attributes.dropdown.isLoaded = false;
                                Interactor.draggedItem.element = null;
                            }
                        });

                        container.addEventListener('dragover', (e) => {
                            e.preventDefault();
                            const afterElement = getDragAfterElement(e.currentTarget, e.clientY);
                            if (afterElement == null) {
                                e.currentTarget.appendChild(Interactor.draggedItem.element);
                            } else {
                                e.currentTarget.insertBefore(Interactor.draggedItem.element, afterElement);
                            }
                        });
                    }
                break;
            }
        }
        loadFields () {
            const that = this;
            Object.keys(this.fields).forEach(name => {
                const field = that.fields[name];
                that.loadField(name, field);
            });
        }
    }
    module.SnapperDropdown = SnapperDropdown;

    module.CreateAnchor = function CreateAnchor () {
    	let anchor = new Anchor(200, 200);
    	anchor.addDropdown();
    	Flats.Anchors.push(anchor);
    }
    module.CreateController = function CreateController () {
    	let controller = new Controller();
    	controller.addDropdown();
    	Flats.Controllers.push(controller);
    }
    
    module.UI = {
        __update_canvas_flag : true,
        setUpdateCanvasFlag : function () {
            this.__update_canvas_flag = true;
        },
        panes : {
            open : false
        },
        controller : {
            element_dropdowns : [],
            open : false
        },
        ribbonButtonHandlers : {
            'shape-add' : {
                click : function () {
                    Interactor.shape_creation.setActive(); 
                    Interactor.shape_creation.setType('shape');
                },
                update : function (e) {
                    UI.toggleButton(e, Interactor.shape_creation.active && Interactor.shape_creation.type === 'shape');
                }
            },
            'anchor-add' : {
                click : function () {
                    console.log('Creating Anchor');
                    module.CreateAnchor()
                },
                update : function () {}
            },
            'controller-add' : {
                click : function () {
                    console.log('Creating Anchor');
                    module.CreateController()
                },
                update : function () {}
            },
            'snapper-add' : {
                click : function (e) {
                    Interactor.shape_creation.setActive();
                    Interactor.shape_creation.setType('snapper');
                },
                update : function (e) {
                    UI.toggleButton(e, Interactor.shape_creation.active && Interactor.shape_creation.type === 'snapper');
                }
            },
            'snapper-visible' : {
                click : function (e) {
                    UI.toggleButton(e);
                    Interactor.snapper.toggleVisibility();
                },
                update : function () {}
            },
        },
        toggleButton : function (btn, override) {
            let state = btn.getAttribute('toggled') === 'true';
            if (override !== undefined) 
                btn.setAttribute('toggled', `${override}`);
            else 
                btn.setAttribute('toggled', `${!state}`);
        },
        updateRibbonButtons : function () {
            const buttons = document.querySelectorAll('.rbutton');
            [...buttons].forEach(btn => {
                let button_name = btn.getAttribute('name'),
                    hasEvent = btn.getAttribute('hasevent');
                console.log(hasEvent, Boolean(hasEvent));
                /*if (hasEvent === null) {
                    console.log('Added to ' + button_name);
                    btn.addEventListener('click', e => {
                        alert("testing");
                        //console.log('Testing Button Point');
                        let name = e.currentTarget.getAttribute('name');
                        this.ribbonButtonHandlers[name].click(e.currentTarget);
                    });

                    btn.setAttribute('hasevent', true);
                }
                this.ribbonButtonHandlers[button_name].update(btn);*/
            });
        },
        selectRibbon : function (name) {
            const ribbons = document.querySelectorAll(".ribbon");
            for (let r = 0; r < ribbons.length; r++) {
                const ribbon = ribbons[r];
                if (ribbon.getAttribute('ribbon') !== name) {
                    ribbon.style.display = "none";
                } else {
                    ribbon.style.display = "flex";
                }
            }
            const ribbon_buttons = document.querySelectorAll(".navbar-button");
            for (let b = 0; b < ribbon_buttons.length; b++) {
                const btn = ribbon_buttons[b];
                if (btn.getAttribute('ribbon') !== name) {
                    btn.setAttribute("selected", "false");
                } else {
                    btn.setAttribute("selected", "true");
                }
            }
        },
        selectPanelPage : function (name) {
            const panel_pages = document.querySelectorAll(".panel-page");
            for (let p = 0; p < panel_pages.length; p++) {
                const panel_page = panel_pages[p];
                if (panel_page.getAttribute('page') !== name) {
                    panel_page.style.display = 'none';
                } else {
                    panel_page.style.display = 'flex';
                }
            }
            const panel_page_buttons = document.querySelectorAll(".controller-button");
            for (let b = 0; b < panel_page_buttons.length; b++) {
                const btn = panel_page_buttons[b];
                if (btn.getAttribute('page') !== name) {
                    btn.setAttribute("selected", "false");
                } else {
                    btn.setAttribute("selected", "true");
                }
            }

            // Reset controller element addition
            Interactor.controller.adding.isActive = false;
            
        },
        openController : function () {
            const controllerEl = document.querySelector("#controller");
            const openPanelRight = document.querySelector(".panel-button[side='right']");

            this.controller.open = true;
            this.setUpdateCanvasFlag();
            controllerEl.setAttribute('open', true);
            openPanelRight.innerHTML = `<span class='material-symbols-outlined'>arrow_forward</span>`;
        },
    };
    document.addEventListener('DOMContentLoaded', () => {
        setInterval(() => {
            module.UI.updateRibbonButtons();
        }, 1);
    });

})(this);


/* PLUGINS */
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

    module.Flats.Formats["default:bezier"] = {
        name : 'default:bezier',
        formal_name : 'Bezier',
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
bezier(${vertices.join(', ')});`;
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
            ctx.bezierCurveTo(
                nodes[1].x, nodes[1].y, 
                nodes[2].x, nodes[2].y, 
                nodes[3].x, nodes[3].y, 
            );
            
            /* Close and render */
            ctx.fill();
            ctx.stroke();

            /* Check if mouse is inside drawing path */
            element.checkPath(ctx);

            if (element.interface.isActive) {
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1 * 1/mouse.scale;
                ctx.setLineDash([6 / mouse.scale, 6 / mouse.scale]);
                ctx.moveTo(nodes[0].x, nodes[0].y);
                ctx.lineTo(nodes[1].x, nodes[1].y);
                ctx.lineTo(nodes[2].x, nodes[2].y);
                ctx.lineTo(nodes[3].x, nodes[3].y);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            }
        }
    }; 

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

    module.Flats.Formats["default:ellipse"] = {
        name : 'default:ellipse',
        formal_name : 'Ellipse',
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
ellipse(0, 0, #width, #height);
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
            let x = (nodes[0].x + nodes[1].x + nodes[2].x + nodes[3].x) / 4,
                y = (nodes[0].y + nodes[1].y + nodes[2].y + nodes[3].y) / 4,
                width = Element.dist(nodes[0], nodes[3]) / 2,
                height = Element.dist(nodes[0], nodes[1]) / 2;
            ctx.translate(x, y);
            ctx.rotate(trans.rotation.radians);
            ctx.ellipse(0, 0, width, height, 0, 0, 2 * Math.PI);
            ctx.rotate(-trans.rotation.radians);
            ctx.translate(-x, -y);

            /* Close and render */
            ctx.fill();
            ctx.stroke();

            /* Check if mouse is inside drawing path */
            if (check) element.checkPath(ctx);

            ctx.restore();
        },
        dropdown_fields : {}
    }; 

    module.Flats.Formats["default:gradient"] = {
        name : 'default:ellipse',
        formal_name : 'Gradient',
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
                "#color1" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.gradient1',
                    handler : (element) => {
                        let format = Exporter.getter(
                            element, 
                            Exporter.path('#format')
                        );
                        return Object.values(
                            module.Format.hexToRGB(
                                format.getColor('special', 'gradient1')
                            )
                        ).join(', ');
                    }
                },
                "#color2" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.gradient2',
                    handler : (element) => {
                        let format = Exporter.getter(
                            element, 
                            Exporter.path('#format')
                        );
                        return Object.values(
                            module.Format.hexToRGB(
                                format.getColor('special', 'gradient2')
                            )
                        ).join(', ');
                    }
                },
            },
            script : function (element) {
                return `pushMatrix();
translate(#center);
rotate(#angle);
for (var i = 0; i < #height; i++) {
    var c = lerpColor(color(#color1), color(#color2), i / #height);
    fill(c);
    stroke(c);
    rect(-#width / 2, -#height / 2 + i, #width, 1);
}
popMatrix();`;
            }
        },
        main : function (ctx, element, style) {
            let mouse = module.Interactor.mouse,
                trans = element.attributes.transforms,
                verts = trans.scale.verts,
                nodes = element.nodes,
                format = element.attributes.format;

            ctx.save();

            /* Open path */
            ctx.beginPath();
            let x = nodes[0].x,
                y = nodes[0].y,
                width = Element.dist(nodes[0], nodes[3]),
                height = Element.dist(nodes[0], nodes[1]);
            ctx.translate(x, y);
            ctx.rotate(trans.rotation.radians);

            var color1 = Format.hexToRGB(format.getColor('special', 'gradient1')),
                color2 = Format.hexToRGB(format.getColor('special', 'gradient2'));

            for (var i = 0; i < height; i++) {
                ctx.beginPath();
                var color = Format.colorLerp(color1, color2, i / height);
                ctx.fillStyle = Format.rgbToHex(color);
                ctx.strokeStyle = Format.rgbToHex(color);
                ctx.rect(0, i, width, 2);
                ctx.fill();
            }

            ctx.beginPath();
            ctx.fillStyle = '#00000000';
            ctx.rect(0, 0, width, height);
            ctx.fill();

            ctx.rotate(-trans.rotation.radians);
            ctx.translate(-x, -y);

            /* Check if mouse is inside drawing path */
            element.checkPath(ctx);

            ctx.restore();

        },
        dropdown_fields : {
            'Gradient' : {
                'group' : true,
                'index' : 2,
                'as' : 'last'
            },
            'Gradient-Color-1' : {
                "alt_name" : "Color 1",
                'type' : 'input',
                'assignGroup' : 'Gradient',
                'input_type' : 'color',
                'tags' : [{name:'alpha',value:true}],
                'element_identifier' : 'element-gradient-color-f',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.gradient1 = element.attributes.format.attributes.style.special.gradient1 || {};
                        element.attributes.format.attributes.style.special.gradient1.color = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.element-gradient-color-f');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            style.special.gradient1 = style.special.gradient1 || {};
                            style.special.gradient1.color = style.special.gradient1.color || '#ff0000';
                            inputElement.value = style.special.gradient1.color;
                        }
                    }}
                ]
            },
            'Gradient-Opacity-1' : {
                "alt_name" : "Opacity 1",
                'type' : 'input',
                'assignGroup' : 'Gradient',
                'input_type' : 'range',
                'tags' : [{name:'min',value:'0'},{name:'max',value:'255'}],
                'element_identifier' : 'element-gradient-opacity-f',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.gradient1 = element.attributes.format.attributes.style.special.gradient1 || {};
                        element.attributes.format.attributes.style.special.gradient1.opacity = Math.floor(parseFloat(target.value));
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.element-gradient-opacity-f');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            style.special.gradient1 = style.special.gradient1 || {};
                            style.special.gradient1.opacity = style.special.gradient1.opacity || 255;
                            inputElement.value = style.special.gradient1.opacity;
                        }
                    }}
                ]
            },
            'Gradient-Color-2' : {
                "alt_name" : "Color 2",
                'type' : 'input',
                'assignGroup' : 'Gradient',
                'input_type' : 'color',
                'tags' : [{name:'alpha',value:true}],
                'element_identifier' : 'element-gradient-color-l',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.gradient2 = element.attributes.format.attributes.style.special.gradient2 || {};
                        element.attributes.format.attributes.style.special.gradient2.color = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.element-gradient-color-l');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            style.special.gradient2 = style.special.gradient2 || {};
                            style.special.gradient2.color = style.special.gradient2.color || '#00ff00';
                            inputElement.value = style.special.gradient2.color;
                        }
                    }}
                ]
            },
            'Gradient-Opacity-2' : {
                "alt_name" : "Opacity 2",
                'type' : 'input',
                'assignGroup' : 'Gradient',
                'input_type' : 'range',
                'tags' : [{name:'min',value:'0'},{name:'max',value:'255'}],
                'element_identifier' : 'element-gradient-opacity-l',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.gradient2 = element.attributes.format.attributes.style.special.gradient2 || {};
                        element.attributes.format.attributes.style.special.gradient2.opacity = Math.floor(parseFloat(target.value));
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.element-gradient-opacity-l');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            style.special.gradient2 = style.special.gradient2 || {};
                            style.special.gradient2.opacity = style.special.gradient2.opacity || 255;
                            inputElement.value = style.special.gradient2.opacity;
                        }
                    }}
                ]
            },
            'Style' : {
                disabled : true
            },
            'Fill-Color' : {
                disabled : true
            },
            'Fill-Opacity' : {
                disabled : true
            },
            'Stroke-Color' : {
                disabled : true
            },
            'Stroke-Opacity' : {
                disabled : true
            },
            'Stroke-Width' : {
                disabled : true
            }
        }
    }; 

    module.Flats.Formats["default:poly_regular"] = {
        name : 'default:poly_regular',
        formal_name : 'Regular Polygon',
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
                "#number_of_sides" : {
                    field_correlation : 'Side-Number',
                    path : 'attributes.format.attributes.style.special.sides',
                    handler : (element) => {
                        return module.Exporter.getter(
                            element,
                            module.Exporter.path('#number_of_sides')
                        );
                    }
                },
                "#start_angle" : {
                    field_correlation : 'Start-Rotation',
                    path : 'attributes.format.attributes.style.special.startAngle',
                    handler : (element) => {
                        return module.Exporter.getter(
                            element,
                            module.Exporter.path('#start_angle')
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
beginShape();
for (var i = 0; i < #number_of_sides + 1; i++) {
    vertex(
        (#width / 2) * cos((i / #number_of_sides) * 360 + #start_angle * 180 / Math.PI),
        (#height / 2) * sin((i / #number_of_sides) * 360 + #start_angle * 180 / Math.PI)
    );
}
endShape();
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
            let x = (nodes[0].x + nodes[1].x + nodes[2].x + nodes[3].x) / 4,
                y = (nodes[0].y + nodes[1].y + nodes[2].y + nodes[3].y) / 4,
                width = Element.dist(nodes[0], nodes[3]) / 2,
                height = Element.dist(nodes[0], nodes[1]) / 2,
                a_shift = style.special.startAngle;

            ctx.translate(x, y);
            ctx.rotate(trans.rotation.radians);

            let sides = style.special.sides;
            for (let i = 0; i < sides; i++) {
                if (i === 0) {
                    ctx.moveTo((width) * Math.cos((i / sides) * Math.PI * 2 + a_shift), (height) * Math.sin((i / sides) * Math.PI * 2 + a_shift));
                } else {
                    ctx.lineTo(
                        (width) * Math.cos((i / sides) * Math.PI * 2 + a_shift),
                        (height) * Math.sin((i / sides) * Math.PI * 2 + a_shift)
                    );
                    if (i === sides - 1) {
                        ctx.lineTo(
                            (width) * Math.cos(a_shift),
                            (height) * Math.sin(a_shift)
                        );
                    }
                }
            }
            /*ctx.lineTo(0, -(height / 2));*/
            
            ctx.rotate(-trans.rotation.radians);
            ctx.translate(-x, -y);

            /* Close and render */
            ctx.fill();
            ctx.stroke();

            /* Check if mouse is inside drawing path */
            if (check) element.checkPath(ctx);

            ctx.restore();
        },
        dropdown_fields : {
            'Side-Number' : {
                "alt_name" : "# of Sides",
                'type' : 'input',
                'input_type' : 'number',
                'tags' : [{name:'step',value:'1'}],
                'element_identifier' : 'poly-sides',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.sides = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.poly-sides');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.sides;
                        }
                    }}
                ]
            },
            'Start-Rotation' : {
                'alt_name' : 'Start Rotation',
                'type' : 'input',
                'element_identifier' : 'poly-rotation',
                'append' : [
                    {
                        type : 'input',
                        tags : [
                            {name:'type',value:'checkbox'},
                            {name:'title',value:'Use Degrees'}
                        ]
                    }
                ],
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid),
                                degrees = Boolean(target.nextElementSibling.checked);
                        element.attributes.format.attributes.style.special.startAngle = parseFloat(target.value || '0') * (degrees ? (Math.PI / 180) : 1);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.poly-rotation'),
                              degrees = Boolean(inputElement.nextElementSibling.checked);
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            inputElement.value = Math.floor(
                                element.attributes.format.attributes.style.special.startAngle * (degrees ? (180 / Math.PI) : 1)
                                    * 1000
                            ) / 1000;
                        }
                    }}
                ]
            },
        }
    }; 

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

    module.Flats.Formats["default:quad"] = {
        name : 'default:quad',
        formal_name : 'Quad',
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
quad(${vertices.join(', ')});`;
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

    module.Flats.Formats["default:text"] = {
        name : 'default:text',
        formal_name : 'Text',
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
            libs : ['text'],
            registerVariables : {
                "#text" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text',
                    handler : (element) => {
                        return;
                    }
                },
                "#message" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.string',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.string;
                    }
                },
                "#align-x" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.align.x_axis',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.align.x_axis;
                    }
                },
                "#align-y" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.align.y_axis',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.align.y_axis;
                    }
                },
                "#bold" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.fontStyle.bold',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.fontStyle.bold;
                    }
                },
                "#italics" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.fontStyle.italics',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.fontStyle.italics;
                    }
                },
                "#line-height" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.lineHeight',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.lineHeight;
                    }
                },
                "#font-size" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.fontSize',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.fontSize;
                    }
                },
                "#font-family" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.fontFamily',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.fontFamily;
                    }
                },
                "#outline-thickness" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.outlineThickness',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return text.outlineThickness;
                    }
                },
                "#outer-color" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.outer.color',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return Object.values(
                            module.Format.hexToRGB(
                                text.outer.color + Format.componentToHex(text.outer.opacity)
                            )
                        ).join(', ');
                    }
                },
                "#inner-color" : {
                    field_correlation : null,
                    path : 'attributes.format.attributes.style.special.text.inner.color',
                    handler : (element) => {
                        let text = Exporter.getter(
                            element, 
                            Exporter.path('#text')
                        );
                        return Object.values(
                            module.Format.hexToRGB(
                                text.inner.color + Format.componentToHex(text.inner.opacity)
                            )
                        ).join(', ');
                    }
                }
            },
            script : function (element) {
                return `pushMatrix();
translate(#center);
rotate(#angle);
CustomText.render({
    "text" : "#message",
    "bold" : #bold,
    "italics" : #italics,
    "align" : {x : "#align-x", y : "#align-y"},
    "fontSize" : #font-size,
    "fontFamily" : "#font-family",
    "outlineThickness" : #outline-thickness,
    "innerColor" : color(#inner-color),
    "outerColor" : color(#outer-color),
    "lineHeight" : #line-height,
    "width" : #width / 2,
    "height" : #height
});
popMatrix();`;
            }
        },
        computeTextHeight : function (context, text, x, y, lineHeight, fitWidth) {
            fitWidth = fitWidth || 0;

            if (fitWidth <= 0)
            {
                return {lines : 0};
            }
            var words = text.split(' ');
            var currentLine = 0;
            var idx = 1;
            while (words.length > 0 && idx <= words.length) {
                var str = words.slice(0, idx).join(' ');
                var w = context.measureText(str).width;
                if ( w > fitWidth ) {
                    if (idx == 1) {
                        idx = 2;
                    }
                    currentLine++;
                    words = words.splice(idx - 1);
                    idx = 1;
                }
                else {idx++;}
            }
            return {
                lines : currentLine
            };
        },
        xAlign : function (options) {
            //console.log(lines);
            
            switch (options.text.align.x_axis) {
                case 'center':
                    return 0;
                break;
                case 'left':
                    return -options.width;
                break;
                case 'right':
                    return options.width;
                break;
            }
        },
        yAlign : function (options) {
            //console.log(lines);
            
            switch (options.text.align.y_axis) {
                case 'middle':
                    return -options.lines * (options.text.lineHeight / 2);
                break;
                case 'top':
                    return -options.height;
                break;
                case 'bottom':
                    return options.height - (options.lines * options.text.lineHeight);
                break;
            }
        },
        printAtWordWrap : function ( context , text, x, y, lineHeight, fitWidth) {
            /* Credit to Gabriele Petrioli on StackOverflow for this function */

            fitWidth = fitWidth || 0;

            if (fitWidth <= 0)
                var poopemoji = 3
            {
                context.fillText( text, x, y );
                return;
            }
            var words = text.split(' ');
            var currentLine = 0;
            var idx = 1;
            while (words.length > 0 && idx <= words.length) {
                var str = words.slice(0, idx).join(' '),
                    measured = context.measureText(str);
                var w = measured.width,
                    h = measured.actualBoundingBoxAscent + measured.actualBoundingBoxDescent;
                if ( w > fitWidth ) {
                    if (idx == 1) {
                        idx = 2;
                    }
                    Text.poopemoji
                    context.fillText( words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine) );
                    currentLine++;
                    words = words.splice(idx - 1);
                    idx = 1;
                }
                else {idx++;}
            }
            if  (idx > 0) {
                var measured = context.measureText(words.join(' ')),
                    w = measured.width,
                    h = measured.actualBoundingBoxAscent + measured.actualBoundingBoxDescent;
                context.fillText( words.join(' '), x, y + (lineHeight * currentLine));
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

            let text = style.special.text;

            /* Open path */
            ctx.beginPath();
            let x = (nodes[0].x + nodes[1].x + nodes[2].x + nodes[3].x) / 4,
                y = (nodes[0].y + nodes[1].y + nodes[2].y + nodes[3].y) / 4,
                width = Element.dist(nodes[0], nodes[3]) / 2,
                height = Element.dist(nodes[0], nodes[1]) / 2,
                a_shift = style.special.startAngle;

            ctx.translate(x, y);
            ctx.rotate(trans.rotation.radians);
            
            ctx.textAlign = text.align.x_axis;
            ctx.textBaseline = text.align.y_axis;
            ctx.font = `${text.fontStyle.italics ? 'italic' : ''} ${text.fontStyle.bold ? 'bold' : ''} ${text.fontSize}px ${text.fontFamily}`;
            
            let metrics = this.computeTextHeight(ctx, text.string, 0, 0, text.lineHeight, width * 2),
                xAlign = this.xAlign({width, height, text}),
                yAlign = this.yAlign({width, height, text, lines : metrics.lines}),
                outThick = text.outlineThickness;
            
            //console.log(xAlign, yAlign);

            ctx.translate(xAlign, yAlign);
            ctx.fillStyle = format.attributes.style.special.text.outer.color;
            for (let y = -outThick; y < outThick; y += 0.5) {
                for (let x = -outThick; x < outThick; x += 0.5) {
                    this.printAtWordWrap(ctx, text.string, x, y, text.lineHeight, width * 2);
                }
            }
            ctx.fillStyle = format.attributes.style.special.text.inner.color;
            this.printAtWordWrap(ctx, text.string, 0, 0, text.lineHeight, width * 2);
            ctx.translate(-xAlign, -yAlign);
            
            ctx.rotate(-trans.rotation.radians);
            ctx.translate(-x, -y);

            /* Close and render */
            ctx.fill();
            ctx.stroke();

            /* Check if mouse is inside drawing path */
            element.checkPath(ctx);

            ctx.restore();
        },
        dropdown_fields : {
            'Text' : {
                "alt_name" : "Text",
                'type' : 'textarea',
                'element_identifier' : 'text-string',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.string = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.text-string');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.string;
                        }
                    }}
                ]
            },
            'Inner-Color' : {
                "alt_name" : "Inner Color",
                'type' : 'input',
                'input_type' : 'color',
                'element_identifier' : 'inner-color',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.inner.color = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.inner-color');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.inner.color;
                        }
                    }}
                ]
            },
            'Outer-Color' : {
                "alt_name" : "Outline Color",
                'type' : 'input',
                'input_type' : 'color',
                'element_identifier' : 'outer-color',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.outer.color = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.outer-color');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.outer.color;
                        }
                    }}
                ]
            },
            'Outline-Thickness' : {
                "alt_name" : "Outline Width",
                'type' : 'input',
                'input_type' : 'number',
                'tags' : [
                    {name:'step',value:'1'},
                    {name:'min',value:'1'}
                ],
                'element_identifier' : 'outline-width',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid),
                              asFontRatio = target.nextElementSibling.checked,
                              style = element.attributes.format.attributes.style;
                        style.special.text.outlineThickness = asFontRatio ? Number(target.value) * style.special.text.outlineThickness : Number(target.value);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.outline-width'),
                              asFontRatio = Boolean(inputElement.nextElementSibling.checked);
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = asFontRatio ? inputElement.value : style.special.text.outlineThickness;
                            if (asFontRatio) style.special.text.outlineThickness = Number(inputElement.value) * style.special.text.fontSize;
                        }
                    }}
                ],
                'append' : [
                    {
                        type : 'input',
                        tags : [
                            {name:'type',value:'checkbox'},
                            {name:'title',value:'Calculate as font-size ratio'}
                        ]
                    }
                ],
            },
            'Font-Family' : {
                "alt_name" : "Font",
                'type' : 'dropdown',
                'element_identifier' : 'text-font',
                'options' : [
                    ['Times New Roman', 'times'],
                    ['Courier', 'courier'],
                    ['Sans-serif', 'sans-serif'],
                    ['Serif', 'serif'],
                    ['Tahoma', 'tahoma'],
                    ['Helvetica', 'helvetica'],
                    ['Consolas', 'consolas'],
                    ['Monospace', 'monospace']
                ],
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.fontFamily = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.text-font');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.fontFamily;
                        }
                    }}
                ]
            },
            'Font-Size' : {
                "alt_name" : "Size",
                'type' : 'input',
                'input_type' : 'number',
                'tags' : [
                    {name:'step',value:'1'},
                    {name:'min',value:'1'}
                ],
                'element_identifier' : 'text-font',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.fontSize = Number(target.value);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.text-font');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.fontSize;
                        }
                    }}
                ]
            },
            'Font-Line-Height' : {
                "alt_name" : "Line Height",
                'type' : 'input',
                'input_type' : 'number',
                'tags' : [
                    {name:'step',value:'1'},
                    {name:'min',value:'1'}
                ],
                'element_identifier' : 'line-height',
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid),
                              asFontRatio = target.nextElementSibling.checked,
                              style = element.attributes.format.attributes.style;
                        style.special.text.lineHeight = asFontRatio ? Number(target.value) * style.special.text.fontSize : Number(target.value);
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.line-height'),
                              asFontRatio = Boolean(inputElement.nextElementSibling.checked);
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = asFontRatio ? inputElement.value : style.special.text.lineHeight;
                            if (asFontRatio) style.special.text.lineHeight = Number(inputElement.value) * style.special.text.fontSize;
                        }
                    }}
                ],
                'append' : [
                    {
                        type : 'input',
                        tags : [
                            {name:'type',value:'checkbox'},
                            {name:'title',value:'Calculate as font-size ratio'}
                        ]
                    }
                ],
            },
            'Font-Bold' : {
                "alt_name" : "Bold",
                'type' : 'input',
                'input_type' : 'checkbox',
                'element_identifier' : 'font-bold',
                'events' : [
                    {type:'input',callback:function (e){
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.fontStyle.bold = target.checked;
                    }}
                ]
            },
            'Font-Italics' : {
                "alt_name" : "Italic",
                'type' : 'input',
                'input_type' : 'checkbox',
                'element_identifier' : 'font-italics',
                'events' : [
                    {type:'input',callback:function (e){
                        const target = e.currentTarget,
                                uuid = target.getAttribute('element-uuid-ref'),
                                element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.fontStyle.italics = target.checked;
                    }}
                ]
            },
            'Align-X' : {
                "alt_name" : "Align X",
                'type' : 'dropdown',
                'element_identifier' : 'align-x',
                'options' : [
                    ['left', 'left'],
                    ['right', 'right'],
                    ['center', 'center']
                ],
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.align.x_axis = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.align-x');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.align.x_axis;
                        }
                    }}
                ]
            },
            'Align-Y' : {
                "alt_name" : "Align Y",
                'type' : 'dropdown',
                'element_identifier' : 'align-y',
                'options' : [
                    ['top', 'top'],
                    ['bottom', 'bottom'],
                    ['middle', 'middle']
                ],
                'events' : [
                    {type:'input',callback:function (e) {
                        const target = e.currentTarget,
                              uuid = target.getAttribute('element-uuid-ref'),
                              element = Flats.get.element(uuid);
                        element.attributes.format.attributes.style.special.text.align.y_axis = target.value;
                    }}
                ],
                'loops' : [
                    {interval:1,callback:function (d) {
                        const inputElement = d.DOM_Element.querySelector('.align-y');
                        if (document.activeElement !== inputElement) {
                            const element = Flats.get.element(d.uuid);
                            const style = element.attributes.format.attributes.style;
                            inputElement.value = style.special.text.align.y_axis;
                        }
                    }}
                ]
            },
            
        }
    }; 

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

    module.Flats.Snaps["default:line"] = {
        minNodes : 2,
        maxNodes : 2,
        nodes : {},
        test : function (snapper, point) {
            let int = module.Interactor,
                nodes = snapper.nodes;
            let line_vec = new module.Vector(nodes[1].x - nodes[0].x, nodes[1].y - nodes[0].y),
                point_vec = new module.Vector(point.x - nodes[0].x, point.y - nodes[0].y),
                proj = line_vec.project(point_vec),
                proj_bas = proj.basis(),
                proj_len = proj.mag();
            proj.add(nodes[0]);
            if (Element.dist(proj, point) < (snapper.attributes.width) * 1/int.mouse.scale && proj_bas.equals(line_vec.basis()) && proj_len <= line_vec.mag()) {
                return {
                    x : proj.x,
                    y : proj.y
                };
            } else return null;
        },
        main : function (snapper, ctx) {
            let int = module.Interactor,
                nodes = snapper.nodes;

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(249, 206, 106, 0.5)';
            ctx.moveTo(nodes[0].x, nodes[0].y);
            ctx.lineTo(nodes[1].x, nodes[1].y);
            ctx.setLineDash([6 / int.mouse.scale, 6 / int.mouse.scale]);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
    };

    module.Flats.Snaps["default:point"] = {
        minNodes : 1,
        maxNodes : 1,
        nodes : {},
        test : function (snapper, point) {
            let int = module.Interactor;
            if (Element.dist(snapper.nodes[0], point) < (snapper.attributes.width) * 1/int.mouse.scale) {
                return {
                    x : snapper.nodes[0].x,
                    y : snapper.nodes[0].y
                };
            } else return null;
        },
        main : function (snapper, ctx) {
            // No extra graphics need to be drawn. This is only a single node.
        }
    };
})(this);

/* FRONT-END */
(function (module) {
    UI.selectRibbon('Draw');
    UI.selectPanelPage('Elements');
    
    /* EVENT HANDLERS FOR LEFT & RIGHT PANEL BUTTONS */
    (function () {
        const openPanelLeft = document.querySelector(".panel-button[side='left']");
        openPanelLeft.addEventListener('click', (e) => {
            const panesEl = document.querySelector("#panes");
            UI.panes.open = !UI.panes.open;
            UI.setUpdateCanvasFlag();
            if (UI.panes.open) {
                panesEl.setAttribute('open', true);
                openPanelLeft.innerHTML = `<span class='material-symbols-outlined'>arrow_back</span>`;
            } else {
                panesEl.setAttribute('open', false);
                openPanelLeft.innerHTML = `<span class='material-symbols-outlined'>arrow_forward</span>`;
            }
        });
        const openPanelRight = document.querySelector(".panel-button[side='right']");
        openPanelRight.addEventListener('click', (e) => {
            const controllerEl = document.querySelector("#controller");
            UI.controller.open = !UI.controller.open;
            UI.setUpdateCanvasFlag();
            if (UI.controller.open) {
                controllerEl.setAttribute('open', true);
                openPanelRight.innerHTML = `<span class='material-symbols-outlined'>arrow_forward</span>`;
            } else {
                controllerEl.setAttribute('open', false);
                openPanelRight.innerHTML = `<span class='material-symbols-outlined'>arrow_back</span>`;
            }
        });
    })();
    
    /* HANDLING PANEL DROPDOWNS */
    (function () {
        setInterval(() => {
            const panelDropdowns = document.querySelectorAll('.panel-dropdown');
            for (let i = 0; i < panelDropdowns.length; i++) {
                const dropdown = panelDropdowns[i],
                    label = dropdown.querySelector('.panel-dropdown-label');
                if (label.getAttribute('assignedevent') !== 'true') {
                    label.setAttribute('assignedevent', true);
                    label.addEventListener('click', (e) => {
                        const target = e.currentTarget,
                            opened = target.getAttribute('opened'),
                            body = target.nextElementSibling,
                            tag = target.querySelector('.dropdown-indicator'),
                            uuid = dropdown.getAttribute('dropdown-uuid'),
                            page = (dropdown.getAttribute('dropdown-page') || '').toLowerCase().slice(0, -1);
                            
                        // Exit if element is blocking the dropdown opening
                        if (e.target.getAttribute('block-dropdown') === 'true') return;
    
                        Interactor.set(page, uuid);
                        if (opened === 'false' || opened === null) {
                            target.setAttribute('opened', 'true');
                            target.setAttribute('draggable','false');
                            body.style.display = 'flex';
                            tag.innerHTML = 'keyboard_arrow_down';
                            Interactor.set(page, uuid);
                        } else {
                            target.setAttribute('opened', 'false');
                            target.setAttribute('draggable','true');
                            body.style.display = 'none';
                            tag.innerHTML = 'keyboard_arrow_right';
                            Interactor.set(page, null);
                        }
                    });
                }
            }
    
            for (let i = 0; i < panelDropdowns.length; i++) {
                const dropdown = panelDropdowns[i],
                      body = dropdown.querySelector('.panel-dropdown-body'),
                      tag = dropdown.querySelector('.dropdown-indicator'),
                      uuid = dropdown.getAttribute('dropdown-uuid'),
                      page = (dropdown.getAttribute('dropdown-page') || '').toLowerCase().slice(0, -1);
    
                if (uuid === Interactor[page].uuid) {
                    dropdown.setAttribute('opened', 'true');
                    dropdown.setAttribute('draggable','false');
                    body.style.display = 'flex';
                    tag.innerHTML = 'keyboard_arrow_down';
                } else {
                    dropdown.setAttribute('opened', 'false');
                    dropdown.setAttribute('draggable','true');
                    body.style.display = 'none';
                    tag.innerHTML = 'keyboard_arrow_right';
                }
            }
        }, 1000);
    
        const pages = document.querySelectorAll('.panel-page');
        for (var i = 0; i < 1; i++) {
            let container = pages[i];
            if (container.getAttribute('added-dragging') !== 'true') {
                container.setAttribute('added-dragging','true');
    
                container.addEventListener('dragstart', (e) => {
                    if (e.target.parentNode.classList.contains('drag-item')) {
                        Interactor.draggedItem.element = e.target.parentNode;
                        Interactor.draggedItem.target = 'elements';
                        e.target.classList.add('dragging');
                    }
                });
    
                container.addEventListener('dragend', (e) => {
                    if (e.target.parentNode.classList.contains('drag-item')) {
                        e.target.parentNode.classList.remove('dragging');
                        let innerElements = container.querySelectorAll('.panel-dropdown');
                        Interactor.draggedItem.order = [];
                        for (let i = 0; i < innerElements.length; i++) {
                            let innerElement = innerElements[i];
                            Interactor.draggedItem.order.push(innerElement.querySelector('.element-uuid').innerText);
                        }
                        Flats.reorder.elements();
                        Interactor.draggedItem.element = null;
                    }
                });
    
                container.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    const afterElement = getDragAfterElement(e.currentTarget, e.clientY);
                    if (afterElement == null) {
                        e.currentTarget.appendChild(Interactor.draggedItem.element);
                    } else {
                        e.currentTarget.insertBefore(Interactor.draggedItem.element, afterElement);
                    }
                });
            }
        }
    })();
    
    /* HANDLING RIBBON DROPDOWNS */
    (function (module) {
        class Picker {
            constructor (id, options) {
                this.id = id;
                this.element = document.querySelector(`#${id}`);
                this.value = this.element?.querySelector('.value');
                this.dropdown = this.element?.querySelector('.dropdown');
    
                this.options = options;
                this.load();
            }
            load () {
                this.dropdown.innerHTML = '';
                for (let option in this.options) {
                    this.dropdown.appendChild(HTML_Build({
                        type : 'button',
                        tags : [{name:'onclick',value:`Pick("${this.id}", "${option}")`}],
                        classes : ['option'],
                        children : [
                            {type : 'div', classes : ['shape-text'], html : option}
                        ]
                    }));
                }
            }
            display () {
                this.dropdown.style.display = 'flex';
            }
            hide () {
                this.dropdown.style.display = 'none';
            }
            pick (optionID) {
                /* Get option from ID */
                let op = this.options[optionID];
    
                /* Call the option */
                op(this);
    
                /* Set 'value' element to the option value */
                this.value.innerHTML = optionID;
    
                /* Hide dropdown */
                this.hide();
            }
        }
    
        Flats.Pickers['layout'] = (new Picker('layout', {
            "1:1 (Square)" : function () {
                Settings.canvas.set('layout', "1:1");
            },
            "2:1 (Landscape)" : function () {
                Settings.canvas.set('layout', "2:1");
            },
            "4:3 (Landscape)" : function () {
                Settings.canvas.set('layout', "4:3");
            },
            "3:2 (Landscape)" : function () {
                Settings.canvas.set('layout', "3:2");
            },
            "16:9 (Landscape)" : function () {
                Settings.canvas.set('layout', "16:9");
            },
            "25:16 (Landscape)" : function () {
                Settings.canvas.set('layout', "25:16");
            },
            "1:2 (Portrait)" : function () {
                Settings.canvas.set('layout', "1:2");
            },
            "3:4 (Portrait)" : function () {
                Settings.canvas.set('layout', "3:4");
            },
            "2:3 (Portrait)" : function () {
                Settings.canvas.set('layout', "2:3");
            },
            "9:16 (Portrait)" : function () {
                Settings.canvas.set('layout', "9:16");
            },
            "16:25 (Portrait)" : function () {
                Settings.canvas.set('layout', "16:25");
            }
        }));
        Flats.Pickers['shape'] = (new Picker('shape', {
            "Ellipse" : function () {
                Interactor.shape_creation.setFormat('default:ellipse');
                Interactor.shape_creation.setType('shape');
            },
            "Rect" : function () {
                Interactor.shape_creation.setFormat('default:rect');
                Interactor.shape_creation.setType('shape');
            },
            "Circle" : function () {
                Interactor.shape_creation.setFormat('default:circle');
                Interactor.shape_creation.setType('shape');
            },
            "Arc" : function () {
                Interactor.shape_creation.setFormat('default:arc');
                Interactor.shape_creation.setType('shape');
            },
            "Triangle" : function () {
                Interactor.shape_creation.setFormat('default:triangle');
                Interactor.shape_creation.setType('shape');
            },
            "Quad" : function () {
                Interactor.shape_creation.setFormat('default:quad');
                Interactor.shape_creation.setType('shape');
            },
            "Polygon" : function () {
                Interactor.shape_creation.setFormat('default:poly');
                Interactor.shape_creation.setType('shape');
            },
            "N-gon" : function () {
                Interactor.shape_creation.setFormat('default:poly_regular');
                Interactor.shape_creation.setType('shape');
            },
            "Bezier" : function () {
                Interactor.shape_creation.setFormat('default:bezier');
                Interactor.shape_creation.setType('shape');
            },
            "Bezier Chain" : function () {
                Interactor.shape_creation.setFormat('default:bezier_chain');
                Interactor.shape_creation.setType('shape');
            },
            "Linear Gradient" : function () {
                Interactor.shape_creation.setFormat('default:gradient');
                Interactor.shape_creation.setType('shape');
            },
            "Text" : function () {
                Interactor.shape_creation.setFormat('default:text');
                Interactor.shape_creation.setType('shape');
            },
        }));
        Flats.Pickers['snapper'] = (new Picker('snapper', {
            "Point" : function () {
                Interactor.shape_creation.setFormat('default:point');
                Interactor.shape_creation.setType('snapper');
            },
            "Line" : function () {
                Interactor.shape_creation.setFormat('default:line');
                Interactor.shape_creation.setType('snapper');
            }
        }));
    
        document.querySelector('body').addEventListener('mousedown', (e) => {
            Flats.ContextMenus.forEach((menu) => {
                const dims = menu.element.getBoundingClientRect(),
                      mouseX = e.clientX,
                      mouseY = e.clientY;
                if (!(mouseX > dims.left && mouseX < dims.left + dims.width && mouseY > dims.top && mouseY < dims.top + dims.height)) {
                    menu.remove();
                }
            });
            Object.keys(Flats.Pickers).forEach((key) => {
                const picker = Flats.Pickers[key],
                      dims = picker.dropdown.getBoundingClientRect(),
                      mouseX = e.clientX,
                      mouseY = e.clientY;
                if (!(mouseX > dims.left && mouseX < dims.left + dims.width && mouseY > dims.top && mouseY < dims.top + dims.height)) {
                    picker.hide();
                }
            });
        });
    
        function Pick (id, optionID) {
            if (Flats.Pickers[id] !== undefined) {
                Flats.Pickers[id].pick(optionID);
            }
        }
        function OpenPicker (id) {
            if (Flats.Pickers[id] !== undefined) {
                Flats.Pickers[id].display();
            }
        }
    
        module.Picker = Picker;
        module.Pick = Pick;
        module.OpenPicker = OpenPicker;
    
    })(this);
    
    
    
    function UpdatePanels () {
        const panesEl = document.querySelector("#panes"),
              controllerEl = document.querySelector("#controller"),
              canvasEl = document.querySelector("#canvas"),
              canvas = canvasEl.querySelector('canvas');
    
        let w = 100;
        if (UI.panes.open) w -= 20;
        if (UI.controller.open) w -= 20;
        canvasEl.style.width = w + 'vw';
    }
    function UpdateCanvas () {
        if (UI.__update_canvas_flag) {
            UI.__update_canvas_flag = false;
            const canvasEl = document.querySelector("#canvas"),
                canvas = canvasEl.querySelector('canvas'),
                dims = canvasEl.getBoundingClientRect(),
                cdims = Settings.canvas.forElement();
    
            canvas.width = dims.width + 20;
            canvas.height = dims.height + 16;
            Camera.offset.x = ((dims.width + 20) / 2) - (cdims.width / 2);
            Camera.offset.y = ((dims.height + 16) / 2) - (cdims.height / 2);
            Camera.mouseRef = {
                x : 0, y : 0
            };
            Camera.scale = 1.00;
        }
    }
    
    setInterval(() => {
        UpdatePanels();
        UpdateCanvas();
    }, 1)
})(this);

/* MAIN.JS */
(function (module) {
    /* * * * * * * * * * * *  PEREGRINE 2026  * * * * * * * * * * * */
    /*
       /$$   /$$  /$$$$$$  /$$$$$$$  /$$$$$$$$     /$$$$$$  /$$$$$$ 
      | $$$ | $$ /$$__  $$| $$__  $$| $$_____/    |_  $$_/ /$$__  $$
      | $$$$| $$| $$  \ $$| $$  \ $$| $$            | $$  | $$  \ $$
      | $$ $$ $$| $$  | $$| $$  | $$| $$$$$         | $$  | $$  | $$
      | $$  $$$$| $$  | $$| $$  | $$| $$__/         | $$  | $$  | $$
      | $$\  $$$| $$  | $$| $$  | $$| $$            | $$  | $$  | $$
      | $$ \  $$|  $$$$$$/| $$$$$$$/| $$$$$$$$ /$$ /$$$$$$|  $$$$$$/
      |__/  \__/ \______/ |_______/ |________/|__/|______/ \______/ 
    */
    /* --------------- EXPORTABLE ART CREATION TOOL --------------- */
    /* ------------------------------------------------------------ */
    /* ----------------------GETTING STARTED----------------------- */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------- DISTRIBUTION POLICY -------------------- */
    /*  > When you export, a comment crediting this tool will be 
          included for your convenience. Please, do not remove
          this comment.
        > If content is found on the Hotlist or any other page 
          that violates KA guidelines for user-generated drawings,
          I ask that anyone aware of these guidelines to flag
          that project and have it removed.
    /*
    /* ------------------------------------------------------------ */
    /* ------------------------- DEV-LOG -------------------------- */
    /*
    Start: 6.12.2026 (v0.0.0)
    NOTE: The update log wasn't started until version 0.12.4, so I 
    have laid out the feature updates chronologically but without
    fine details as seen in the updates after that version.
    ----------------------------------------------------------------
    0.0.0 - Initial commit
    
    0.1.0 - Canvas & event handlers
    
    0.2.0 - Element class & interactor object
    : UI : Pivot : Movement : Nodes : Resize box : Rotation : Holding System :
    -- 0.2.1 - Resize box mouse-proximity patch
    -- 0.2.2 - Node selection patch
    
    0.3.0 - Format class & format data structure
    : Attributes : Custom node formats : Call function :
    -- 0.3.1 - Scope error patch
    -- 0.3.2 - Node limit patch
    -- 0.3.3a - Path selection patch
    -- 0.3.3b - Element API update & path selection patch
    -- 0.3.4 - Format exportation implementation (not compatible w/ controllers)
    
    0.4.0 - Snapper class & internal snapping
    : Pointer snapper : Line snapper : Pivot-node snapping :
    
    0.5.0 - Flats object
    : Elements : Snapperes : Formats : Selection stack :
    -- 0.5.1 - Selection stack patch
    
    0.6.0 - Anchor class
    : Child Element resizing, rotation, & movement : UI & icon :
    -- 0.6.1 - Element copy correction
    
    0.7.0 - Environment UI
    : Canvas inline : Panels : Ribbons : Pages : Color scheme and style :
    -- 0.7.1 - Panel pop-out patch
    
    0.8.0 - ElementDropdown class, UI, and HTML builder
    : Element property fields : Dropdown UI: Input update loops : HTML element constructor :
    -- 0.8.1 - Field auto-update patch
    -- 0.8.2a - Nodes field update
    -- 0.8.2b - Nodes field auto-update patch
    -- 0.8.2b1 - Panel page button UI patch
    -- 0.8.3 - Static element transformation methods patch
    
    0.9.0 - AnchorDropdown class & UI, Dropdown reordering
    : Child element resizing, movement, & rotation : Dropdown reordering function :
    -- 0.9.1 - Dropdown reordering update
    
    0.10.0 - Controller class, ControllerDropdown class & Element selection system
    : Element uuid append button : Element field inheritance : Element field override : Element field adder :
    -- 0.10.1a - Field inheritance patch
    -- 0.10.1b - Shared field validation patch
    
    0.11.0 - Window class, UI, ControllerWindow class & ControlWidget class
    : Window w/ UI interface : Advanced controller : Widget menu : Widget system :
    -- 0.11.1 - Widget input threader patch
    -- 0.11.2 - Element targeting widget patch
    -- 0.11.3 - Loop system semi-implementation
    
    0.12.0 - Shape creation object, Canvas resizing, & Picker class
    : Drawing system for simple and complex formats : Element trigger events : Added shape creation to interactor :
    -- 0.12.1 - Patched panel UI adaptation
    -- 0.12.2 - Interactor holding for shape creation patch
    -- 0.12.3 - Append node preview
    -- 0.12.4a - Implemented node insertion & deletion buttons
    -- 0.12.4b - Implemented element deletion buttons
    -- 0.12.4c - Implemented anchor deletion buttons
    -- 0.12.4d - Implemented controller deletion buttons
    
    0.13.0
    
    */
    
    
    const canvas = document.querySelector("#draw-canvas");
    const canvasWrapper = document.querySelector("#canvas");
    const dims = canvasWrapper.getBoundingClientRect();
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext('2d');
    
    // Code written by Gemini but modified to fit my needs {
    Interactor.draggedItem.element = null;
    function getDragAfterElement(container, y) {
      	const draggableElements = [...container.querySelectorAll('.drag-item:not(.dragging)')];
    
      	return draggableElements.reduce((closest, child) => {
    		const box = child.getBoundingClientRect();
    		const offset = y - box.top - box.height / 2;
    		if (offset < 0 && offset > closest.offset) {
    			return { offset: offset, element: child };
    		} else {
    			return closest;
    		}
      	}, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    // }
    
    let loop = setInterval(function () {
    	Interactor.reset_cursor();
    
    	const {width, height} = Settings.canvas.forElement();
    
    	/* Editor background */
    	ctx.beginPath();
    	ctx.fillStyle = 'rgb(190, 190, 190)';
    	ctx.rect(0, 0, canvas.width, canvas.height);//400, 400);//window.innerWidth, window.innerHeight);
    	ctx.fill();
    	ctx.closePath();
    
    	Interactor.update(canvas);
    
    	var offset = Camera.offset
    	var mouseRef = Camera.mouseRef;
    	var s = Camera.scale;
    
    	var mouse = Camera.toRel(Interactor.mouse.abs.x, Interactor.mouse.abs.y);
    	Interactor.mouse.rel.x = mouse.x;
    	Interactor.mouse.rel.y = mouse.y;
    	Interactor.snapper.checkKey();
    
    	ctx.translate(mouseRef.x, mouseRef.y);
    	ctx.scale(s, s);
    	ctx.translate(offset.x, offset.y);
    
    	/* Canvas reference */
    	ctx.beginPath();
    	ctx.fillStyle = 'white';
    	ctx.rect(0, 0, width, height);
    	ctx.fill();
    	ctx.closePath();
    
    	for (let i = 0; i < Flats.Elements.length; i++) {
    		const element = Flats.Elements[i];
    		element.run();
    		element.render(ctx);
    		element.clickContext();
    	}
    
    	for (let i = 0; i < Flats.Anchors.length; i++) {
    		const anchor = Flats.Anchors[i];
    		anchor.run();
    		anchor.checkPivotSelect();
    	}
    
    	if (Interactor.element.uuid !== null) {
    		const element = Flats.get.element(Interactor.element.uuid);
    		if (element) {
    			element.renderNodes(ctx);
    			element.renderUI(ctx);
    			element.clearCheck();
    		}
    	}
    	
    	for (let i = 0; i < Flats.Anchors.length; i++) {
    		const anchor = Flats.Anchors[i];
    		anchor.renderUI(ctx);
    		anchor.clearCheck();
    	}
    
    	for (let i = 0; i < Flats.Snappers.length; i++) {
    		const snapper = Flats.Snappers[i];
    		snapper.update();
    		snapper.hoverNodes();
    		snapper.grabNodes();
    		snapper.render(ctx);
    	}
    
    	Interactor.select_stack.selectTop();
    
    	ShapeCreator.render(ctx);
    
    	ctx.translate(-offset.x, -offset.y);
    	ctx.scale(1 / s, 1 / s);
    	ctx.translate(-mouseRef.x, -mouseRef.y);
    
    	Interactor.set_cursor();
    	Interactor.clear_selector_on_cycle();
    	Interactor.select_stack.recycle();
    }, 1);

})(this);
