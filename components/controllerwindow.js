(function (module) {
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
})(this);
