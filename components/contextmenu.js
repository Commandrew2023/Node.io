(function (module) {
    class ContextMenu {
        constructor (id, options) {
            this.id = id;
            this.element = null;

            this.options = options;
            this.load();
        }
        load () {
            this.element = HTML_Build({
                type : 'div',
                tags : [{name:'id',value:this.id}],
                events : [{type:'contextmenu',callback:(e) => {
                    e.preventDefault();
                    Interactor.mouse.pressed = false;
                }}],
                style : {
                    left : this.options.location.x + 'px',
                    top : this.options.location.y + 'px'
                },
                classes : ['context-menu']
            });
            this.options.buttons.forEach(btn => {
                this.element.appendChild(HTML_Build({
                    type : 'button',
                    tags : [{name:'id',value:this.id}],
                    events : [{type:'click',callback:(e) => {
                        btn.click(e, this, this.options.data);
                    }}],
                    children : [
                        {
                            type : 'span',
                            classes : ['material-symbols-outlined'],
                            html : btn.symbol
                        },
                        {
                            type : 'span',
                            classes : ['label'],
                            html : btn.name
                        }
                    ]
                }));
            });
            document.querySelector('body').appendChild(this.element);
        }
        remove () {
            this.element.remove();
            module.Flats.remove.contextMenu(this.id);
        }
    }

    module.OpenContextMenu = function (id, options) {
        if (module.Flats.ContextMenus.length === 0) {
            module.Flats.ContextMenus.push(new module.ContextMenu(id, options));
        }
    };
    module.ContextMenu = ContextMenu;
})(this);
