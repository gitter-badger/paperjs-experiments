// constants
// default wheel style
var wheel_sty = {
    strokeWidth: 1.5,
    strokeColor: new Color('#FFFFFF', 1)
};
// binding point style
var bindingpoint_sty = {
    fillColor: 'gold',
    shadowColor: 'GoldenRod',
	shadowBlur: 15
};

// creates wheel objects
var WheelFactory = function (radius, pos, updateList, showbindings) {
	var wheel = {
		// PRIVATE VARS
		_updateList: null,
		_center: null,
		_radius: 0,
		_showbindings: true,
		_wheelpath: null,
		_wheelstate: '',
		_bindings: null,
		_rpm: 0,

		// PUBLIC VARS
		// gets wheels's center position within layer
        get center() {
            return this._center;
        },
        // sets wheels's center position within layer
        set center(pos) {
            this._center = pos;
            this._wheelpath.position = pos + project.activeLayer.position;
        },

		// PRIVATE METHODS
		_setBindingPos: function (binding, offsetinc) {
			binding.offset += offsetinc;

			if (binding.offset >= 1) {
				binding.offset = binding.offset - Math.floor(binding.offset);
			}
			// console.log('binding.offset = ' + binding.offset);

			binding.path.position = this._wheelpath.getPointAt(
				binding.offset * this._wheelpath.length);
		},
		// PUBLIC METHODS
		bind: function (rope, ending, angle) {
			var anglevec = new Point(this._radius, 0);
			// gets angle relative offset
			angle = angle > 0 ? angle % 360 : (angle % 360) + 360;
			offset = (angle / 360);

			console.log('offsetabs = ' + offset);
			console.log('this._wheelpath.length = ' + this._wheelpath.length);
			console.log('this._wheelpath.position = ' + this._wheelpath.position.toString());

			var binding = {
				path: new Path.Circle(this._wheelpath.getPointAt(
					offset * this._wheelpath.length), 5),
				offset: offset,
			};
			// creates path for binding marker
			binding.path.style = bindingpoint_sty;
			binding.visible = this._showbindings;
			this._bindings.push(binding);
		},
		// starts wheel
		run: function (rpm) {
			this._rpm = typeof rpm !== 'undefined' ? rpm : this._rpm;
			this._wheelstate = 'run';
		},
		// stops wheel
		stop: function () {
			this._wheelstate = 'idle';
		},
		// called by onFrame to update animation state
		update: function (delta) {
			switch (this._wheelstate) {
				case 'idle':
					break;

				case 'run':
					// revolutions per minute
					var rpm = 10;
					// offset increment
					var offsetinc = delta / (60 / this._rpm);

					this._bindings.forEach(function (b) {
						wheel._setBindingPos(b, offsetinc);
					});

					break;

				default:
			}
		},
		// wheel object initialization
        init: function (radius, pos, updateList, showbindings) {
			showbindings = typeof showbindings !== 'undefined' ? showbindings : true;

            // sets update list reference
            this._updateList = updateList;
			// sets wheel center position
            this._center = pos;
			// wheel radius
			this._radius = radius;
			// wheels's circle path
            this._wheelpath = new Path.Circle(pos, radius);
			// wheel animation state
			this._wheelstate = 'run';
			// bindings list
			this._bindings = [];
			// shows binding points
			this._showbindings = showbindings;
			// revolutions per minute
			this._rpm = 0;

			// sets wheel style
			this._wheelpath.style = wheel_sty;

			// adds wheel to update list
			this._updateList.push(this);
		}
	}

	wheel.init(radius, pos, updateList, showbindings);

	return wheel;
}

// exports
this.WheelFactory = WheelFactory;
