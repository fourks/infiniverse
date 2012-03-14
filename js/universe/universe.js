
function Universe(engine) {
	this.eng = engine;
	var viewLevelStack = [];
	viewLevelStack.push(new Galaxy());
	this.current = viewLevelStack[viewLevelStack.length-1];
	this.actors = [];

	this.postViewChange = function() {
		this.current = viewLevelStack[viewLevelStack.length-1];
		if (this.current.type == "aerial") this.eng.setWorldSize();
		else this.eng.setWorldSize(this.current.size, this.current.size);
		this.eng.setTileFunc(this.current.getTile);
		this.actors = [];
	};
	this.postViewChange();

	// actor: { x, y }
	this.enter = function(actor) {
		function neighbours(offsetx, offsety) {
			offsetx = offsetx || 0;
			offsety = offsety || 0;
			return viewLevelStack[viewLevelStack.length-1].getTile(actor.x-offsetx, actor.y-offsety);
		}
		var newPlace;
		try {
			switch (viewLevelStack.length) {
				case 1: newPlace = new Starmap(actor.x, actor.y, neighbours); break;
				case 2: newPlace = new SolarSystem(actor.x, actor.y, neighbours); break;
				case 3: newPlace = new PlanetAerial(actor.x, actor.y, neighbours); break;
				case 4: newPlace = new PlanetDetail(actor.x, actor.y, neighbours); break;
				default: return;
			}
			if (!newPlace) return;
		} catch (err) {
			addMessage(err, "error");
			return;
		}
		viewLevelStack.push(newPlace);
		this.postViewChange();
		this.current.x = actor.x;
		this.current.y = actor.y;
		actor.x = Math.floor(this.current.size / 2);
		actor.y = Math.floor(this.current.size / 2);
		var placename = this.current.getDescription();
		addMessage("Entered " + placename + ".");
	};

	// actor: { x, y }
	this.exit = function(actor) {
		if (viewLevelStack.length <= 1) return;
		var placename = this.current.getShortDescription();
		actor.x = this.current.x;
		actor.y = this.current.y;
		viewLevelStack.pop();
		this.postViewChange();
		addMessage("Exited " + placename + ".");
	};

	// actor: { x, y, update() }
	this.addActor = function(actor) {
		this.actors.push(actor);
	};

	this.updateActors = function() {
		var i = 0;
		while (i < this.actors.length) {
			if (!this.actors[i].update || this.actors[i].update()) ++i;
			else this.actors.splice(i,1); // If update returns false, remove the actor
		}
	};

	this.getState = function() {
		return clone(viewLevelStack);
	};

	this.setState = function(state) {
		viewLevelStack = state;
		this.postViewChange();
	};
}
