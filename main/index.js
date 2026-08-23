(function (module) {
	module.canvasWrapper = document.querySelector("#canvas");
	module.dims = canvasWrapper.getBoundingClientRect();
	
	module.canvas = document.querySelector("#draw-canvas");
	module.canvas.width = dims.width;
	module.canvas.height = dims.height;
	module.ctx = canvas.getContext('2d');
	
	// Code written by Gemini but modified to fit my needs {
	Interactor.draggedItem.element = null;
	module.getDragAfterElement = function (container, y) {
	  	const draggableElements = [...container.querySelectorAll('.drag-item:not(.dragging)')];
	
	  	return draggableElements.reduce((closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			if (offset < 0 && offset > closest.offset) {
				return { offset: offset, element: child };
			} else {
				return closest;
			}
	  	}, { offset: Number.NEGATIVE_INFINITY }).element;
	};
	// }
	
	module.CreateAnchor = function () {
		let anchor = new Anchor(200, 200);
		anchor.addDropdown();
		Flats.Anchors.push(anchor);
	};
	module.CreateAnchor = function () {
		let controller = new Controller();
		controller.addDropdown();
		Flats.Controllers.push(controller);
	};
	
	module.graphics = {
		canvasBackground : function (ctx) {
			ctx.beginPath();
			ctx.fillStyle = 'rgb(190, 190, 190)';
			ctx.rect(0, 0, canvas.width, canvas.height);
			ctx.fill();
			ctx.closePath();
		},
		canvasCanvas : function (ctx) {
			ctx.beginPath();
			ctx.fillStyle = 'white';
			ctx.rect(0, 0, width, height);
			ctx.fill();
			ctx.closePath();
		}
	};
	
	module.loop = setInterval(function () {
		Interactor.reset_cursor();
	
		const {width, height} = Settings.canvas.forElement();
	
		graphics.canvasBackground();
	
		Interactor.update(canvas);
	
		var offset = Camera.offset
		var mouseRef = Camera.mouseRef;
		var s = Camera.scale;
		
		var mouse = Camera.toRel(Interactor.mouse.abs.x, Interactor.mouse.abs.y);
		Interactor.mouse.rel.x = mouse.x;
		Interactor.mouse.rel.y = mouse.y;
		Interactor.snapper.checkKey();
	
		ctx.translate(mouseRef.x, mouseRef.y);
		ctx.scale(s, s);
		ctx.translate(offset.x, offset.y);

		graphics.canvasCanvas();
	
		for (let i = 0; i < Flats.Elements.length; i++) {
			const element = Flats.Elements[i];
			element.run();
			element.render(ctx);
			element.clickContext();
		}
	
		for (let i = 0; i < Flats.Anchors.length; i++) {
			const anchor = Flats.Anchors[i];
			anchor.run();
			anchor.checkPivotSelect();
		}
	
		if (Interactor.element.uuid !== null) {
			const element = Flats.get.element(Interactor.element.uuid);
			if (element) {
				element.renderNodes(ctx);
				element.renderUI(ctx);
				element.clearCheck();
			}
		}
		
		for (let i = 0; i < Flats.Anchors.length; i++) {
			const anchor = Flats.Anchors[i];
			anchor.renderUI(ctx);
			anchor.clearCheck();
		}
	
		for (let i = 0; i < Flats.Snappers.length; i++) {
			const snapper = Flats.Snappers[i];
			snapper.update();
			snapper.hoverNodes();
			snapper.grabNodes();
			snapper.render(ctx);
		}
	
		Interactor.select_stack.selectTop();
	
		ShapeCreator.render(ctx);
	
		ctx.translate(-offset.x, -offset.y);
		ctx.scale(1 / s, 1 / s);
		ctx.translate(-mouseRef.x, -mouseRef.y);
	
		Interactor.set_cursor();
		Interactor.clear_selector_on_cycle();
		Interactor.select_stack.recycle();
	}, 1);

	UI.selectRibbon('Draw');
	UI.selectPanelPage('Elements');

	/* EVENT HANDLERS FOR LEFT & RIGHT PANEL BUTTONS */
    module.openPanelLeft = document.querySelector(".panel-button[side='left']");
    module.openPanelLeft.addEventListener('click', (e) => {
        const panesEl = document.querySelector("#panes");
        UI.panes.open = !UI.panes.open;
        UI.setUpdateCanvasFlag();
        if (UI.panes.open) {
            panesEl.setAttribute('open', true);
            openPanelLeft.innerHTML = `<span class='material-symbols-outlined'>arrow_back</span>`;
        } else {
            panesEl.setAttribute('open', false);
            openPanelLeft.innerHTML = `<span class='material-symbols-outlined'>arrow_forward</span>`;
        }
    });
    module.openPanelRight = document.querySelector(".panel-button[side='right']");
    module.openPanelRight.addEventListener('click', (e) => {
        const controllerEl = document.querySelector("#controller");
        UI.controller.open = !UI.controller.open;
        UI.setUpdateCanvasFlag();
        if (UI.controller.open) {
            controllerEl.setAttribute('open', true);
            openPanelRight.innerHTML = `<span class='material-symbols-outlined'>arrow_forward</span>`;
        } else {
            controllerEl.setAttribute('open', false);
            openPanelRight.innerHTML = `<span class='material-symbols-outlined'>arrow_back</span>`;
        }
    });


    setInterval(() => {
        const panelDropdowns = document.querySelectorAll('.panel-dropdown');
        for (let i = 0; i < panelDropdowns.length; i++) {
            const dropdown = panelDropdowns[i],
                label = dropdown.querySelector('.panel-dropdown-label');
            if (label.getAttribute('assignedevent') !== 'true') {
                label.setAttribute('assignedevent', true);
                label.addEventListener('click', (e) => {
                    const target = e.currentTarget,
                        opened = target.getAttribute('opened'),
                        body = target.nextElementSibling,
                        tag = target.querySelector('.dropdown-indicator'),
                        uuid = dropdown.getAttribute('dropdown-uuid'),
                        page = (dropdown.getAttribute('dropdown-page') || '').toLowerCase().slice(0, -1);
                        
                    // Exit if element is blocking the dropdown opening
                    if (e.target.getAttribute('block-dropdown') === 'true') return;

                    Interactor.set(page, uuid);
                    if (opened === 'false' || opened === null) {
                        target.setAttribute('opened', 'true');
                        target.setAttribute('draggable','false');
                        body.style.display = 'flex';
                        tag.innerHTML = 'keyboard_arrow_down';
                        Interactor.set(page, uuid);
                    } else {
                        target.setAttribute('opened', 'false');
                        target.setAttribute('draggable','true');
                        body.style.display = 'none';
                        tag.innerHTML = 'keyboard_arrow_right';
                        Interactor.set(page, null);
                    }
                });
            }
        }

        for (let i = 0; i < panelDropdowns.length; i++) {
            const dropdown = panelDropdowns[i],
                  body = dropdown.querySelector('.panel-dropdown-body'),
                  tag = dropdown.querySelector('.dropdown-indicator'),
                  uuid = dropdown.getAttribute('dropdown-uuid'),
                  page = (dropdown.getAttribute('dropdown-page') || '').toLowerCase().slice(0, -1);

            if (uuid === Interactor[page].uuid) {
                dropdown.setAttribute('opened', 'true');
                dropdown.setAttribute('draggable','false');
                body.style.display = 'flex';
                tag.innerHTML = 'keyboard_arrow_down';
            } else {
                dropdown.setAttribute('opened', 'false');
                dropdown.setAttribute('draggable','true');
                body.style.display = 'none';
                tag.innerHTML = 'keyboard_arrow_right';
            }
        }
    }, 1000);

    module.pages = document.querySelectorAll('.panel-page');
    for (var i = 0; i < 1; i++) {
        let container = module.pages[i];
        if (container.getAttribute('added-dragging') !== 'true') {
            container.setAttribute('added-dragging','true');

            container.addEventListener('dragstart', (e) => {
                if (e.target.parentNode.classList.contains('drag-item')) {
                    Interactor.draggedItem.element = e.target.parentNode;
                    Interactor.draggedItem.target = 'elements';
                    e.target.classList.add('dragging');
                }
            });

            container.addEventListener('dragend', (e) => {
                if (e.target.parentNode.classList.contains('drag-item')) {
                    e.target.parentNode.classList.remove('dragging');
                    let innerElements = container.querySelectorAll('.panel-dropdown');
                    Interactor.draggedItem.order = [];
                    for (let i = 0; i < innerElements.length; i++) {
                        let innerElement = innerElements[i];
                        Interactor.draggedItem.order.push(innerElement.querySelector('.element-uuid').innerText);
                    }
                    Flats.reorder.elements();
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
    }

	/* HANDLING RIBBON DROPDOWNS */
    class Picker {
        constructor (id, options) {
            this.id = id;
            this.element = document.querySelector(`#${id}`);
            this.value = this.element?.querySelector('.value');
            this.dropdown = this.element?.querySelector('.dropdown');

            this.options = options;
            this.load();
        }
        load () {
            this.dropdown.innerHTML = '';
            for (let option in this.options) {
                this.dropdown.appendChild(HTML_Build({
                    type : 'button',
                    tags : [{name:'onclick',value:`Pick("${this.id}", "${option}")`}],
                    classes : ['option'],
                    children : [
                        {type : 'div', classes : ['shape-text'], html : option}
                    ]
                }));
            }
        }
        display () {
            this.dropdown.style.display = 'flex';
        }
        hide () {
            this.dropdown.style.display = 'none';
        }
        pick (optionID) {
            /* Get option from ID */
            let op = this.options[optionID];

            /* Call the option */
            op(this);

            /* Set 'value' element to the option value */
            this.value.innerHTML = optionID;

            /* Hide dropdown */
            this.hide();
        }
    }
	module.Picker = Picker;

    Flats.Pickers['layout'] = (new Picker('layout', {
        "1:1 (Square)" : function () {
            Settings.canvas.set('layout', "1:1");
        },
        "2:1 (Landscape)" : function () {
            Settings.canvas.set('layout', "2:1");
        },
        "4:3 (Landscape)" : function () {
            Settings.canvas.set('layout', "4:3");
        },
        "3:2 (Landscape)" : function () {
            Settings.canvas.set('layout', "3:2");
        },
        "16:9 (Landscape)" : function () {
            Settings.canvas.set('layout', "16:9");
        },
        "25:16 (Landscape)" : function () {
            Settings.canvas.set('layout', "25:16");
        },
        "1:2 (Portrait)" : function () {
            Settings.canvas.set('layout', "1:2");
        },
        "3:4 (Portrait)" : function () {
            Settings.canvas.set('layout', "3:4");
        },
        "2:3 (Portrait)" : function () {
            Settings.canvas.set('layout', "2:3");
        },
        "9:16 (Portrait)" : function () {
            Settings.canvas.set('layout', "9:16");
        },
        "16:25 (Portrait)" : function () {
            Settings.canvas.set('layout', "16:25");
        }
    }));
    Flats.Pickers['shape'] = (new Picker('shape', {
        "Ellipse" : function () {
            Interactor.shape_creation.setFormat('default:ellipse');
            Interactor.shape_creation.setType('shape');
        },
        "Rect" : function () {
            Interactor.shape_creation.setFormat('default:rect');
            Interactor.shape_creation.setType('shape');
        },
        "Circle" : function () {
            Interactor.shape_creation.setFormat('default:circle');
            Interactor.shape_creation.setType('shape');
        },
        "Arc" : function () {
            Interactor.shape_creation.setFormat('default:arc');
            Interactor.shape_creation.setType('shape');
        },
        "Triangle" : function () {
            Interactor.shape_creation.setFormat('default:triangle');
            Interactor.shape_creation.setType('shape');
        },
        "Quad" : function () {
            Interactor.shape_creation.setFormat('default:quad');
            Interactor.shape_creation.setType('shape');
        },
        "Polygon" : function () {
            Interactor.shape_creation.setFormat('default:poly');
            Interactor.shape_creation.setType('shape');
        },
        "N-gon" : function () {
            Interactor.shape_creation.setFormat('default:poly_regular');
            Interactor.shape_creation.setType('shape');
        },
        "Bezier" : function () {
            Interactor.shape_creation.setFormat('default:bezier');
            Interactor.shape_creation.setType('shape');
        },
        "Bezier Chain" : function () {
            Interactor.shape_creation.setFormat('default:bezier_chain');
            Interactor.shape_creation.setType('shape');
        },
        "Linear Gradient" : function () {
            Interactor.shape_creation.setFormat('default:gradient');
            Interactor.shape_creation.setType('shape');
        },
        "Text" : function () {
            Interactor.shape_creation.setFormat('default:text');
            Interactor.shape_creation.setType('shape');
        },
    }));
    Flats.Pickers['snapper'] = (new Picker('snapper', {
        "Point" : function () {
            Interactor.shape_creation.setFormat('default:point');
            Interactor.shape_creation.setType('snapper');
        },
        "Line" : function () {
            Interactor.shape_creation.setFormat('default:line');
            Interactor.shape_creation.setType('snapper');
        }
    }));

    document.querySelector('body').addEventListener('mousedown', (e) => {
        Flats.ContextMenus.forEach((menu) => {
            const dims = menu.element.getBoundingClientRect(),
                  mouseX = e.clientX,
                  mouseY = e.clientY;
            if (!(mouseX > dims.left && mouseX < dims.left + dims.width && mouseY > dims.top && mouseY < dims.top + dims.height)) {
                menu.remove();
            }
        });
        Object.keys(Flats.Pickers).forEach((key) => {
            const picker = Flats.Pickers[key],
                  dims = picker.dropdown.getBoundingClientRect(),
                  mouseX = e.clientX,
                  mouseY = e.clientY;
            if (!(mouseX > dims.left && mouseX < dims.left + dims.width && mouseY > dims.top && mouseY < dims.top + dims.height)) {
                picker.hide();
            }
        });
    });

    module.Pick = function (id, optionID) {
        if (Flats.Pickers[id] !== undefined) {
            Flats.Pickers[id].pick(optionID);
        }
    };
    module.OpenPicker = function (id) {
        if (Flats.Pickers[id] !== undefined) {
            Flats.Pickers[id].display();
        }
    };

    module.Picker = Picker;
    module.Pick = Pick;
    module.OpenPicker = OpenPicker;

	module.UpdatePanels = function () {
	    const panesEl = document.querySelector("#panes"),
	          controllerEl = document.querySelector("#controller"),
	          canvasEl = document.querySelector("#canvas"),
	          canvas = canvasEl.querySelector('canvas');
	
	    let w = 100;
	    if (UI.panes.open) w -= 20;
	    if (UI.controller.open) w -= 20;
	    canvasEl.style.width = w + 'vw';
	};
	module.UpdateCanvas = function () {
	    if (UI.__update_canvas_flag) {
	        UI.__update_canvas_flag = false;
	        const canvasEl = document.querySelector("#canvas"),
	            canvas = canvasEl.querySelector('canvas'),
	            dims = canvasEl.getBoundingClientRect(),
	            cdims = Settings.canvas.forElement();
	
	        canvas.width = dims.width + 20;
	        canvas.height = dims.height + 16;
	        Camera.offset.x = ((dims.width + 20) / 2) - (cdims.width / 2);
	        Camera.offset.y = ((dims.height + 16) / 2) - (cdims.height / 2);
	        Camera.mouseRef = {
	            x : 0, y : 0
	        };
	        Camera.scale = 1.00;
	    }
	};

	setInterval(() => {
	    UpdatePanels();
	    UpdateCanvas();
	}, 1)
})(this);
