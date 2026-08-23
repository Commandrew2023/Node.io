(function (module) {
    module.HTML_Build = function (struct) {
        const el = document.createElement(struct.type || 'div'),
              that = this;
        (struct.classes || []).forEach(c => {
            el.classList.add(c);
        });
        (struct.tags || []).forEach(t => {
            el.setAttribute(t.name, t.value);
        });
        (struct.events || []).forEach(event => {
            el.addEventListener(event.type, event.callback);
        });
        if (!!struct.id) {
            //el.setAttribute('id', struct.id);
            el.id = struct.id;
        }
        if (!!struct.html) {
            el.innerHTML += struct.html;
        }
        el.setAttribute('contenteditable', (struct.editable || false).toString());

        switch (struct.type) {
            case 'input':
                el.setAttribute('placeholder', struct.placeholder || '');
                el.setAttribute('value', struct.defaultValue || '');
            break;
        }

        if (struct.children?.length > 0) {
            (struct.children || []).forEach(child => {
                const child_El = module.HTML_Build(child);
                el.appendChild(child_El);
            });
        }
        if (struct.style !== undefined) {
            (Object.keys(struct.style) || []).forEach(style => {
                el.style[style] = struct.style[style];
            });
        }

        if (struct.extra !== undefined) {
            struct.extra();
        }

        return el;
    };
})(this);
