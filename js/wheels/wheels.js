// Two wheels drawing lines

// imports
var WheelFactory = this.WheelFactory;

// globals
var wheels = null;
var updateList = [];

var WheelsFactory = function (updateList) {
	var wheels = {
		// PRIVATE VARS
		_updateList: null,
		_wheels: null,

		// PUBLIC VARS
		layer: null,

		// PUBLIC METHODS
		// creates a wheel
		createWheel: function(radius, pos) {
			var w = WheelFactory(radius, pos, this._updateList);
			this._wheels.push(w);

			return w;
		},
		// called by onFrame to update animation state
        update: function (delta) {
		},
		// wheels object initialization
		init: function (updateList) {
			// sets update list reference
			this._updateList = updateList;
			// wheels list
			this._wheels = [];

			// create a new layer for fol
			this.layer = new Layer();
			// activates wheels layer for project
			this.layer.activate();

			// adds wheels to update list
			this._updateList.push(this);
		}
	}

	wheels.init(updateList);

	return wheels;
}

function onFrame(event) {
    updateList.forEach(function (o) {
        o.update(event.delta);
    });
}

function onResize(event) {
	// Whenever the window is resized, recenter the layer:
	wheels.layer.position = view.center;
}

// Main function
function main() {
    wheels = WheelsFactory(updateList);

	var w = wheels.createWheel(90, new Point(0, 0));
	var w1 = wheels.createWheel(50, new Point(0, 0));
	var w2 = wheels.createWheel(20, new Point(0, 0));
	w.bind(w1, 'center', 90);
	w1.bind(w2, 'center', 90);
	w.run(10);
	w1.run(50);
	// w.visible = false;

	var w3 = wheels.createWheel(180, new Point(90, 0));
	var w4 = wheels.createWheel(80, new Point(0, 0));
	w3.bind(w4, 'center', 90);
	w3.run(10);
	// w3.visible = false;
}

main();
