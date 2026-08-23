(function (module) {
    module.Flats = {
        Elements : [],
        Snappers : [],
        Anchors : [],
        Controllers : [],
        Windows : [],
        Formats : {},
        Snaps : {},
        Pickers : {},
        ContextMenus : [],
        reorder : {
            elements : function () {
                if (Interactor.draggedItem.target === 'elements') {
                    Interactor.draggedItem.target = '';

                    let copyElements = [];
                    Interactor.draggedItem.order.forEach(uuid => {
                        const el = module.Flats.get.element(uuid);
                        if (el !== null) copyElements.push(el);
                    });
                    Flats.Elements = copyElements;
                }
            }
        },
        eQuery : function (event, type) {
            let uuid = event.currentTarget.getAttribute('element-uuid-ref');
            if (uuid) {
                let getter = this.get[type];
                if (getter) {
                    return {
                        uuid,
                        target : event.currentTarget,
                        [type] : getter(uuid)
                    };
                }
                throw new Error(`Invalid Flats.get method "${type}".`);
            }
            throw new Error('No uuid present in event target.');
        },
        get : {
            element : function (uuid) {
                var that = module.Flats;
                for (let i = 0; i < that.Elements.length; i++) {
                    if (that.Elements[i].uuid === uuid) {
                        return that.Elements[i];
                    }
                }
                return null;
            },
            snapper : function (uuid) {
                var that = module.Flats;
                for (let i = 0; i < that.Snappers.length; i++) {
                    if (that.Snappers[i].uuid === uuid) {
                        return that.Snappers[i];
                    }
                }
                return null;
            },
            format : function (name) {
                return module.Flats.Formats[name];
            },
            anchor : function (uuid) {
                var that = module.Flats;
                for (let i = 0; i < that.Anchors.length; i++) {
                    if (that.Anchors[i].uuid === uuid) {
                        return that.Anchors[i];
                    }
                }
                return null;
            },
            controller : function (uuid) {
                var that = module.Flats;
                for (let i = 0; i < that.Controllers.length; i++) {
                    if (that.Controllers[i].uuid === uuid) {
                        return that.Controllers[i];
                    }
                }
                return null;
            },
            window : function (uuid) {
                var that = module.Flats;
                for (let i = 0; i < that.Windows.length; i++) {
                    if (that.Windows[i].uuid === uuid) {
                        return that.Windows[i];
                    }
                }
                return null;
            },
            contextMenu : function (id) {
                var that = module.Flats;
                for (let i = 0; i < that.ContextMenus.length; i++) {
                    if (that.ContextMenus[i].id === id) {
                        return that.ContextMenus[i];
                    }
                }
                return null;
            }
        },
        findTopAnchor : function () {
            let int = module.Interactor;
            let anchors = this.Anchors.map(a => {
                return {v : a.interface.passes_check, an : a}
            });
            anchors = anchors.filter(e => e.v);
            if (int.mouse.pressed && int.mouse.button === 0) {
                return (anchors[anchors.length - 1] || {an:undefined}).an;
            } else return undefined;
        },
        findTopElement : function () {
            let int = module.Interactor;
            let elements = this.Elements.map(e => {
                return {v : e.interface.passes_check, el : e}
            });
            elements = elements.filter(e => e.v);
            if (int.mouse.pressed && int.mouse.button === 0) {
                return (elements[elements.length - 1] || {el:undefined}).el;
            } else return undefined;
        },
        remove : {
            element : function (uuid) {
                let elements = module.Flats.Elements;
                
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].uuid === uuid) {
                        elements[i].remove();
                        elements.splice(i, 1);
                        break;
                    }
                }
            },
            snapper : function (uuid) {
                let snaps = module.Flats.Snappers;
                
                for (let i = 0; i < snaps.length; i++) {
                    if (snaps[i].uuid === uuid) {
                        snaps.splice(i, 1);
                        break;
                    }
                }
            },
            contextMenu : function (id) {
                let menus = module.Flats.ContextMenus;
                
                for (let i = 0; i < menus.length; i++) {
                    if (menus[i].id === id) {
                        menus.splice(i, 1);
                        break;
                    }
                }
            }
        }
    };
})(this);
