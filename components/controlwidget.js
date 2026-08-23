(function (module) {
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

            /*this.DOM_Element.addEventListener('click', (e) => {
                let window = module.Flats.get.window(e.currentTarget.getAttribute('window-uuid'));
                if (window) {

                    
                    let widget = window.getWidget(e.currentTarget.getAttribute('widget-uuid'));

                    if (widget.inputNodes.length > 0) {
                        if (widget.inputNodes[0].payload.length === 0) {
                            widget.inputNodes[0].payload.push([{
                                value : 123.456,
                                type : 'number',
                                field : 'Pivot-X',
                                source : {}
                            },
                            {
                                value : 5,
                                type : 'number',
                                field : 'Pivot-Y',
                                source : {}
                            }]);
                        }
                        if (widget.inputNodes[1] !== undefined) {
                            if (widget.inputNodes[1].payload.length === 0) {
                                widget.inputNodes[1].payload.push([{
                                    value : 6,
                                    type : 'number',
                                    field : null,
                                    source : {}
                                }]);
                            }
                        }
                    }

                    console.log(widget.function());
                }
            });*/

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
})(this);
