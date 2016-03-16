// constants
// default rope style
var rope_sty = {
    strokeWidth: 1,
    strokeColor: 'gold' //new Color('#FFFFFF', 1)
};

// creates rope objects
var RopeFactory = function (updateList, raster, renderline) {
	var rope = {
		// PRIVATE VARS
		_updateList: null,
		_center: null,
		_ropepath: null,
		_renderline: 0,
		_ropestate: '',

		// PUBLIC VARS

		// PRIVATE METHODS

		// PUBLIC METHODS
		// sets this wheels position depending on target
		setTargetPos: function (target, pos) {
			switch (target) {
				case 'segment0':
					this._ropepath.segments[0].point = pos;
					break;
				case 'segment1':
					this._ropepath.segments[1].point = pos;
					break;
				default:
			}
		},
		// called by onFrame to update animation state
		_delta: 0,
		update: function (delta) {
			switch (this._ropestate) {
				case 'idle':
					break;

				case 'render':
					if (this._renderline <= 0) {
						return;
					}
					this._delta += delta;
					if (this._delta > 1 / this._renderline) {
						var r = this._ropepath.rasterize();
						this._raster.drawImage(r.canvas, this._ropepath.position - r.bounds.size / 2);
						r.remove();
						this._delta = 0;
					}
					break;
			}
		},
		// rope object initialization
        init: function (updateList, raster, renderline) {
			// sets update list reference
            this._updateList = updateList;
			// raster to draw lines
			this._raster = raster;
			// line path for rope
			this._ropepath = new Path.Line(new Point(), new Point(1, 0));
			// sets if line should be rendered to raster
			this._renderline = renderline;
			// rope animation state
			this._ropestate = 'render';

			// sets rope path style
			this._ropepath.style = rope_sty;
			// adds rope to update list
			this._updateList.push(this);
		}
	}

	rope.init(updateList, raster, renderline);

	return rope;
}

// exports
this.RopeFactory = RopeFactory;
