(function (module) {
    module.ExportLibraries = {
        'text' : {
            active : false,
            code : function () {
                return {
                    computeTextHeight : function (text, x, y, lineHeight, fitWidth) {
                        fitWidth = fitWidth || 0;

                        if (fitWidth <= 0)
                        {
                            return {lines : 0};
                        }
                        var words = text.split(' ');
                        var currentLine = 0;
                        var idx = 1;
                        while (words.length > 0 && idx <= words.length) {
                            var str = words.slice(0, idx).join(' ');
                            var w = textWidth(str);
                            if ( w > fitWidth ) {
                                if (idx === 1) {
                                    idx = 2;
                                }
                                currentLine++;
                                words = words.splice(idx - 1);
                                idx = 1;
                            }
                            else {idx++;}
                        }
                        return {
                            lines : currentLine
                        };
                    },
                    xAlign : function (d) {
                        //console.log(lines);
                        
                        switch (d.options.align.x) {
                            case 'center':
                                return 0;
                            case 'left':
                                return -d.options.width;
                            case 'right':
                                return d.options.width;
                        }
                    },
                    yAlign : function (d) {
                        //console.log(lines);
                        
                        switch (d.options.align.y) {
                            case 'middle':
                                return -d.lines * (d.options.lineHeight / 2);
                            case 'top':
                                return -d.options.height;
                            case 'bottom':
                                return d.options.height - (d.lines * d.options.lineHeight);
                        }
                    },
                    printAtWordWrap : function (txt, x, y, lineHeight, fitWidth) {
                        /* Credit to Gabriele Petrioli on StackOverflow for this function */

                        fitWidth = fitWidth || 0;

                        if (fitWidth <= 0)
                        {
                            text( txt, x, y );
                            return;
                        }
                        var words = txt.split(' ');
                        var currentLine = 0;
                        var idx = 1;
                        while (words.length > 0 && idx <= words.length) {
                            var str = words.slice(0, idx).join(' ');
                            var w = textWidth(str);
                            if ( w > fitWidth ) {
                                if (idx === 1) {
                                    idx = 2;
                                }
                                text( words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine) );
                                currentLine++;
                                words = words.splice(idx - 1);
                                idx = 1;
                            }
                            else {idx++;}
                        }
                        if  (idx > 0) {
                            text( words.join(' '), x, y + (lineHeight * currentLine) );
                        }
                    },
                    render : function (options) {
                        var matchAlignments = {
                            'center' : CENTER,
                            'left' : LEFT,
                            'middle' : CENTER,
                            'right' : RIGHT,
                            'top' : TOP,
                            'bottom' : BOTTOM
                        };
                        //text, outlineThickness, innerColor, outerColor, align, italics, bold, fontSize, fontFamily
                        textAlign(
                            matchAlignments[options.align.x], 
                            matchAlignments[options.align.y]
                        );
                        textFont(createFont(options.fontFamily + (options.bold ? ' Bold' : '') + (options.italics ? ' Italic' : ''), options.fontSize));
                        
                        var metrics = this.computeTextHeight(options.text, 0, 0, options.lineHeight, options.width * 2),
                            xAlign = this.xAlign({options : options}),
                            yAlign = this.yAlign({options : options, lines : metrics.lines}),
                            outThick = options.outlineThickness;
                        
                        pushMatrix();
                        translate(xAlign, yAlign);
                        fill(options.outerColor);
                        for (var y = -outThick; y < outThick; y += 0.5) {
                            for (var x = -outThick; x < outThick; x += 0.5) {
                                this.printAtWordWrap(options.text, x, y, options.lineHeight, options.width * 2);
                            }
                        }
                        fill(options.innerColor);
                        this.printAtWordWrap(options.text, 0, 0, options.lineHeight, options.width * 2);
                        popMatrix();
                    }
                };
            }
        }
    };
})(this);
