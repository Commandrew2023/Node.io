
(function (module) {
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
})(this);
