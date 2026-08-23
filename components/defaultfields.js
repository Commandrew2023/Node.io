(function (module) {
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
})(this);
