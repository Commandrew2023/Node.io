(function (module) {
    class Window {
        constructor () {
            /* ID generation checked against other windows */
            this.uuid = module.AlternativeCrypto.randomUUID({
                objects : module.Flats.Windows,
                key : 'uuid'
            });

            this.name = null;

            this.DOM_Window = null;
            this.DOM_Body = null;

            this.Fullscreen = {
                old : {
                    left : null,
                    top : null,
                    width : null, 
                    height : null
                }
            };

            this.Events = {
                Unload : []
            };
        }
        build () {
            this.DOM_Window = HTML_Build({
                type : 'div',
                classes : ['window'],
                id : 'window',
                tags : [
                    {name:'element-uuid-ref',value:this.uuid}
                ],
                style : {
                    display : 'flex',
                    flexDirection : 'column',
                    resize : 'both',
                    overflow : 'auto',
                    overflowY : 'hidden',
                    position : 'fixed',
                    minWidth : '10vw',
                    minHeight : '10vw',
                    maxWidth : '100vw',
                    maxHeight : '100vh',
                    left : '0px',
                    top : '0px',
                    background : 'black',
                    zIndex : '10000000'
                },
                children : [
                    {
                        type : 'div',
                        id : 'windowheader',
                        style : {
                            display : 'inline-flex',
                            position : 'relative',
                            width : '100%',
                            height : '1.5em',
                            background : 'var(--ui-outline)'
                        },
                        children : [
                            {
                                type : 'div',
                                id : 'windowname',
                                html : this.name || 'Unnamed Window'
                            },
                            {
                                type : 'button',
                                classes : ['material-symbols-outlined'],
                                html : 'fullscreen',
                                tags : [
                                    {name:'element-uuid-ref',value:this.uuid},
                                    {name:'button-mode',value:'fullscreen'}
                                ],
                                events : [
                                    {type:'click',callback:function(e){
                                        let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                            mode = e.currentTarget.getAttribute('button-mode'),
                                            window = module.Flats.get.window(uuid);
                                        if (mode === 'fullscreen') {
                                            window.fullscreen();
                                            e.currentTarget.setAttribute('button-mode','exitfullscreen');
                                            e.currentTarget.innerHTML = 'fullscreen_exit';
                                        } else if (mode === 'exitfullscreen') {
                                            window.exitFullscreen();
                                            e.currentTarget.setAttribute('button-mode','fullscreen');
                                            e.currentTarget.innerHTML = 'fullscreen';
                                        }
                                    }}
                                ]
                            },
                            {
                                type : 'button',
                                classes : ['material-symbols-outlined'],
                                html : 'close',
                                tags : [
                                    {name:'element-uuid-ref',value:this.uuid}
                                ],
                                events : [
                                    {type:'click',callback:function(e){
                                        let uuid = e.currentTarget.getAttribute('element-uuid-ref'),
                                            window = module.Flats.get.window(uuid);
                                        window.close();
                                    }}
                                ]
                            }
                        ]
                    },
                    {
                        type : 'div',
                        id : 'windowbody',
                        style : {
                            display : 'block',
                            overflowY : 'hidden',
                            position : 'absolute',
                            top : '1.5em',
                            width : '100%',
                            height : '100%',
                            background : 'black'
                        },
                        html : '5'
                    }
                ]
            });
            this.DOM_Body = this.DOM_Window.querySelector('#windowbody');
            dragElement(this.DOM_Window);

            document.querySelector('body').appendChild(this.DOM_Window);
        }
        close () {
            const that = this;

            /* Run all unloading functions */
            this.Events.Unload.forEach(fn => fn(that));

            /* Remove DOM element */
            this.DOM_Window.remove();

            /* Remove self from Flats */
            module.Flats.Windows.splice(module.Flats.Windows.map(window => window.uuid).indexOf(this.uuid), 1);
        }
        width () {
            const elDim = this.DOM_Body.getBoundingClientRect();
            return elDim.width;
        }
        height () {
            const elDim = this.DOM_Body.getBoundingClientRect();
            return elDim.height;
        }
        resize (width, height) {
            if (width) {
                this.DOM_Window.style.width = `${width}px`;
            } 
            if (height) {
                this.DOM_Window.style.height = `${height}px`;
            }
        }
        fullscreen () {
            const bound = this.DOM_Window.getBoundingClientRect();
            this.Fullscreen.old = {
                left : bound.left,
                top : bound.top,
                width : bound.width,
                height : bound.height
            };
            this.DOM_Window.style.left = '0px';
            this.DOM_Window.style.top = '0px';
            this.DOM_Window.style.width = screen.availWidth + 'px';
            this.DOM_Window.style.height = screen.availHeight + 'px';
        }
        exitFullscreen () {
            this.DOM_Window.style.left = this.Fullscreen.old.left + 'px';
            this.DOM_Window.style.top = this.Fullscreen.old.top + 'px';
            this.DOM_Window.style.width = this.Fullscreen.old.width + 'px';
            this.DOM_Window.style.height = this.Fullscreen.old.height + 'px';
        }
    }
    module.Window = Window;
})(this);
