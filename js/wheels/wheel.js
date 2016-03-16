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
var WheelFactory = function (radius, pos, updateList, raster, showbindings) {
	var wheel = {
		// PRIVATE VARS
		_updateList: null,
		_center: null,
		_radius: 0,
		_showbindings: true,
		_wheelpath: null,
		_wheelstate: '',
		_rpm: 0,
		_pieces: null,
		_visible: true,
		_raster: null,
		_drawingpath: null,

		// PUBLIC VARS
		// gets wheels's center position within layer
        get center() {
            return this._center;
        },
        // sets wheels's center position within layer
        set center(pos) {
            this._center = pos;
            this._wheelpath.position = pos;
        },
		// gets wheel and binded pieces visibility
		get visible() {
			return this._visible;
		},
		// sets wheel and binded pieces visibility
		set visible(isvisible) {
			this._pieces.forEach(function (p) {
				p.obj.visible = isvisible;
				p.bindingpath.visible = wheel._showbindings;
			});
			this._wheelpath.visible = isvisible;
			this._visible = isvisible;
		},

		// PRIVATE METHODS
		_setPiecePos: function (piece, offsetinc) {
			piece.offset += offsetinc;

			if (piece.offset >= 1) {
				piece.offset = piece.offset - Math.floor(piece.offset);
				this._drawingpath.smooth();

				var r = this._drawingpath.rasterize();
				this._raster.drawImage(r.canvas, this._drawingpath.position - r.bounds.size / 2);
				r.remove();
				this._drawingpath.removeSegments(0, this._drawingpath.segments.length-1);
			}
			// console.log('binding.offset = ' + binding.offset);
			var pbind = this._wheelpath.getPointAt(piece.offset * this._wheelpath.length);
			// sets piece position
			piece.obj.setTargetPos(piece.target, pbind);
			// sets binding point position
			piece.bindingpath.position = pbind;

			// this._raster.setPixel(pbind, 'yellow');
			// this._raster.setImageData(piece.bindingraster.getImageData(), pbind);
			// this._raster.drawImage(piece.bindingraster.canvas, pbind - piece.bindingraster.bounds.size / 2);
			if (this._showbindings) {
				this._drawingpath.add(pbind);
			}
		},
		// PUBLIC METHODS
		// binds a piece (wheel or rope) to its target (string) at angle on this wheel
		bind: function (piece, target, angle) {
			var anglevec = new Point(this._radius, 0);
			// gets angle relative offset
			angle = angle > 0 ? angle % 360 : (angle % 360) + 360;
			offset = (angle / 360);
			var pbind = this._wheelpath.getPointAt(offset * this._wheelpath.length);

			// console.log('offsetabs = ' + offset);
			// console.log('this._wheelpath.length = ' + this._wheelpath.length);
			// console.log('this._wheelpath.position = ' + this._wheelpath.position.toString());

			var npiece = {
				obj: piece,
				target: target,
				bindingpath: new Path.Circle(pbind, 10),
				offset: offset
			};
			piece.setTargetPos(target, pbind);
			// creates path for binding marker
			npiece.bindingpath.style = bindingpoint_sty;
			npiece.bindingpath.visible = this._showbindings;
			// adds piece to binded pieces
			this._pieces.push(npiece);

			// var p = new Path.Circle(pbind, 5);
			// p.style = {
			// 	fillColor: 'yellow'
			// }
			// // npiece.bindingraster = p.rasterize();
			// npiece.bindingraster = npiece.bindingpath.rasterize();
			// npiece.bindingraster.visible = false;
			// p.remove();
		},
		// sets this wheels position depending on target
		setTargetPos: function (target, pos) {
			switch (target) {
				case 'center': default:
					this.center = pos;
			}
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
					// offset increment
					var offsetinc = delta / (60 / this._rpm);

					this._pieces.forEach(function (p) {
						wheel._setPiecePos(p, offsetinc);
						// p.bindingpath.rasterize();
					});

					break;

				default:
			}
		},
		// wheel object initialization
        init: function (radius, pos, updateList, raster, showbindings) {
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
			// shows binding points
			this._showbindings = showbindings;
			// revolutions per minute
			this._rpm = 0;
			// binded pieces
			this._pieces = [];
			// raster to draw lines
			this._raster = raster;

			this._drawingpath = new Path();
			this._drawingpath.strokeColor = 'yellow';
			this._drawingpath.strokeWidth = 1;

			// sets wheel style
			this._wheelpath.style = wheel_sty;

			// adds wheel to update list
			this._updateList.push(this);
		}
	}

	wheel.init(radius, pos, updateList, raster, showbindings);

	return wheel;
}

// exports
this.WheelFactory = WheelFactory;
