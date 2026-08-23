(function (module) {
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
})(this);
