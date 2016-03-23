// Two wheels drawing lines

// imports
var WheelFactory = this.WheelFactory;
var RopeFactory = this.RopeFactory;

// globals
var wheels = null;
var updateList = [];

var WheelsFactory = function (updateList) {
	var wheels = {
		// PRIVATE VARS
		_updateList: null,
		_wheels: null,
		_raster: null,

		// PUBLIC VARS
		layer: null,

		// PUBLIC METHODS
		// creates a rope
		createRope: function(renderline) {
			var r = RopeFactory(this._updateList, this._raster, renderline);

			this._raster.bringToFront();
			return r;
		},
		// creates a wheel
		createWheel: function(radius, pos, showbindings) {
			var w = WheelFactory(radius, pos, this._updateList, this._raster, showbindings);
			this._wheels.push(w);

			this._raster.bringToFront();
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
			// raster for drawing
			this._raster = new Raster();

			// adds wheels to update list
			// this._updateList.push(this);

			this._raster.size = view.size;
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

function earthPlanetOrbit(a, b) {
	var multi = 1;
    wheels = WheelsFactory(updateList);

	var earthorbit = wheels.createWheel(300, new Point(0, 0), true);
	var planetorbit = wheels.createWheel(400, new Point(0, 0), true);
	var rope = wheels.createRope(30 * multi);

	var angle = 0;

	earthorbit.bind(rope, 'segment0', 90 + angle);
	planetorbit.bind(rope, 'segment1', 90 + angle);

	earthorbit.run(a * 2 * multi);
	planetorbit.run(b * 2 * multi);

	// earthorbit.visible = false;
	// planetorbit.visible = false;
}

// Main function
function main() {
	// venus
	// earthPlanetOrbit(13, 8);
	// jupiter
	// earthPlanetOrbit(12, 1);
	// mars
	// earthPlanetOrbit(2, 1);
	// saturn - neptune
	// earthPlanetOrbit(28, 5);
	earthPlanetOrbit(19, 11);
}

main();
