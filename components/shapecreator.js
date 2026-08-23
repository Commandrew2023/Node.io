(function (module) {
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

})(this);
