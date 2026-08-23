(function (module) {
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
})(this);
