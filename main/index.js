(function (module) {
	module.canvasWrapper = document.querySelector("#canvas");
	module.dims = canvasWrapper.getBoundingClientRect();
	
	module.canvas = document.querySelector("#draw-canvas");
	module.canvas.width = dims.width;
	module.canvas.height = dims.height;
	module.ctx = canvas.getContext('2d');
	
	// Code written by Gemini but modified to fit my needs {
	Interactor.draggedItem.element = null;
	function getDragAfterElement(container, y) {
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
	}
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
	
	let loop = setInterval(function () {
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

})(this);
