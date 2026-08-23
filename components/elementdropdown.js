
(function (module) {
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
})(this);
