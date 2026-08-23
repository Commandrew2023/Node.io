(function (module) {
    module.UI = {
        __update_canvas_flag : true,
        setUpdateCanvasFlag : function () {
            this.__update_canvas_flag = true;
        },
        panes : {
            open : false
        },
        controller : {
            element_dropdowns : [],
            open : false
        },
        ribbonButtonHandlers : {
            'shape-add' : {
                click : function () {
                    Interactor.shape_creation.setActive(); 
                    Interactor.shape_creation.setType('shape');
                },
                update : function (e) {
                    UI.toggleButton(e, Interactor.shape_creation.active && Interactor.shape_creation.type === 'shape');
                }
            },
            'anchor-add' : {
                click : function () {
                    CreateAnchor()
                },
                update : function () {}
            },
            'controller-add' : {
                click : function () {
                    CreateController()
                },
                update : function () {}
            },
            'snapper-add' : {
                click : function (e) {
                    Interactor.shape_creation.setActive();
                    Interactor.shape_creation.setType('snapper');
                },
                update : function (e) {
                    UI.toggleButton(e, Interactor.shape_creation.active && Interactor.shape_creation.type === 'snapper');
                }
            },
            'snapper-visible' : {
                click : function (e) {
                    UI.toggleButton(e);
                    Interactor.snapper.toggleVisibility();
                },
                update : function () {}
            },
        },
        toggleButton : function (btn, override) {
            let state = btn.getAttribute('toggled') === 'true';
            if (override !== undefined) 
                btn.setAttribute('toggled', `${override}`);
            else 
                btn.setAttribute('toggled', `${!state}`);
        },
        updateRibbonButtons : function () {
            const buttons = document.querySelectorAll('.rbutton');
            [...buttons].forEach(btn => {
                let button_name = btn.getAttribute('name');
                if (!Boolean(btn.getAttribute('hasevent'))) {
                    btn.setAttribute('hasevent', true);
                    btn.addEventListener('click', e => {
                        let name = e.currentTarget.getAttribute('name');
                        this.ribbonButtonHandlers[name].click(e.currentTarget);
                    });
                }
                this.ribbonButtonHandlers[button_name].update(btn);
            });
        },
        selectRibbon : function (name) {
            const ribbons = document.querySelectorAll(".ribbon");
            for (let r = 0; r < ribbons.length; r++) {
                const ribbon = ribbons[r];
                if (ribbon.getAttribute('ribbon') !== name) {
                    ribbon.style.display = "none";
                } else {
                    ribbon.style.display = "flex";
                }
            }
            const ribbon_buttons = document.querySelectorAll(".navbar-button");
            for (let b = 0; b < ribbon_buttons.length; b++) {
                const btn = ribbon_buttons[b];
                if (btn.getAttribute('ribbon') !== name) {
                    btn.setAttribute("selected", "false");
                } else {
                    btn.setAttribute("selected", "true");
                }
            }
        },
        selectPanelPage : function (name) {
            const panel_pages = document.querySelectorAll(".panel-page");
            for (let p = 0; p < panel_pages.length; p++) {
                const panel_page = panel_pages[p];
                if (panel_page.getAttribute('page') !== name) {
                    panel_page.style.display = 'none';
                } else {
                    panel_page.style.display = 'flex';
                }
            }
            const panel_page_buttons = document.querySelectorAll(".controller-button");
            for (let b = 0; b < panel_page_buttons.length; b++) {
                const btn = panel_page_buttons[b];
                if (btn.getAttribute('page') !== name) {
                    btn.setAttribute("selected", "false");
                } else {
                    btn.setAttribute("selected", "true");
                }
            }

            // Reset controller element addition
            Interactor.controller.adding.isActive = false;
            
        },
        openController : function () {
            const controllerEl = document.querySelector("#controller");
            const openPanelRight = document.querySelector(".panel-button[side='right']");

            this.controller.open = true;
            this.setUpdateCanvasFlag();
            controllerEl.setAttribute('open', true);
            openPanelRight.innerHTML = `<span class='material-symbols-outlined'>arrow_forward</span>`;
        },
    };
    setInterval(() => {
        module.UI.updateRibbonButtons();
    }, 1);
})(this);
