(function (module) {
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
})(this);
