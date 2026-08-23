(function (module) {
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
        /*loadLoops (name, field, field_el) {
            /* Add all loops provided in field constructor *//*
            const that = this;
            (field.loops || []).forEach((loop, i) => {
                var loop = setInterval(
                    loop.callback, 
                    loop.interval || 1, 
                    {uuid : that.uuid, DOM_Element:field_el}
                );
                that.loops[loop.toString()] = loop;
            });
        }*/
        /*load () {
            this.Anchors = Flats.get.anchor(this.uuid);
            const NUM_OF_DROPDOWNS = document.querySelector('.panel-page[page=\'Controllers\']').querySelectorAll('.panel-dropdown').length;

            const dropdown = HTML_Build({
                type : 'div',
                classes : ['panel-dropdown','drag-item'],
                tags : [{name:'opened',value:'false'}],
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
                                html : 'drag_indicator',
                                events : []
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
                                events : [{type : 'input', callback : (e) => {
                                    const uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                          controller = Flats.get.controller(uuid);
                                    controller.updateName(e.currentTarget.innerText);
                                }}],
                                editable : true,
                                html : `${this.name} ${NUM_OF_DROPDOWNS + 1}`
                            },
                            {
                                type : 'button',
                                classes : ['panel-dropdown-delete'],
                                tags : [{name:'element-uuid-ref',value:this.uuid}],
                                events : [{type : 'click', callback : (e) => {
                                    const uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                          controller = Flats.get.controller(uuid);
                                    controller.remove();
                                }}],
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

            const anchors_panel = document.querySelector('.panel-page[page=\'Controllers\']');
            anchors_panel.appendChild(dropdown);
            
            this.body = dropdown.querySelector('.panel-dropdown-body');
            this.DOM_Element = dropdown;
        }*/
        /*loadField (name, field) {
            const $c = t => document.createElement(t);

            *//* Main dropdown *//*
            const field_el = HTML_Build({
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

            *//* Field type *//*
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

                    *//* Controller and element reference aliases *//*
                    let controller = Flats.get.controller(this.uuid),
                        element = Flats.get.element(controller.elements[0]);

                    *//* Set the controller dropdown field to the corresponding element dropdown field value *//*
                    input.value = element.attributes.dropdown.DOM_Element.querySelector(`.${field.element_identifier}`).value;

                    *//* Append input element to field *//*
                    field_el.appendChild(input);

                    *//* Add any additional elements to the field *//*
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

            *//* Add all loops provided in field constructor *//*
            const that = this;
            (field.loops || []).forEach((loop, i) => {
                var loop = setInterval(
                    loop.callback, 
                    loop.interval || 1, 
                    {uuid : that.uuid, DOM_Element:field_el}
                );
                that.loops[loop.toString()] = loop;
            });*//*

            *//* Add field to dropdown body *//*
            this.body.appendChild(field_el);
        }*/
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
})(this);
