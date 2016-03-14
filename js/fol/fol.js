// Interactive Flower of Life (FoL)

// constants
var LEAF_DELAY = 0.15;

// imports
var LEAF_R = this.LEAF_R;
var LeafFactory = this.LeafFactory;

// globals
var fol = null;
var updateList = [];

// creates FoL objects
var FoLFactory = function (updateList) {
    var fol = {
        // PRIVATE VARS
        _updateList: null,
        _set: null,
        _multileafstate: '',
        _multileaflevel: 0,
        _multileaflist: null,

        // PUBLIC VARS
        layer: null,

        // PUBLIC METHODS
        // checks if leaf already exists
        hasLeaf: function (pos) {
            return this._set.has(pos.toString());
        },
        // adds leaf to FoL
        addLeaf: function (pos, delay, root) {
            root = typeof root !== 'undefined' ? root : false;

            // set leaf as root ('pos' as center of group)
            if (root) {
                this.layer.pivot = pos;
            }
            // check if leaf already exists in FoL
            if (this.hasLeaf(pos)) {
                console.log('Leaf already exists! Skipping...');
                return null;
            }
            // creates leaf
            leaf = LeafFactory(pos, this._updateList, delay, root);

            // adds lead center to set to check later its existence later
            this._set.add(leaf.center.toString());
            // console.log('leaf.center = ' + leaf.center.toString());

            return leaf;
        },
        // gets missing leafs angle in appropriate order
        getMissingLeafsAngle: function (rootleaf, angle) {
            var numleafs = 6;
            var anglevec = new Point(LEAF_R, 0);
            var mleafs0 = [];
            var mleafs1 = [];
            // calculates generation position vector from angle
            anglevec.angle += angle;

            var found = false;
            for (var i = 0; i < numleafs; i++) {
                if (!this.hasLeaf(anglevec + rootleaf.center)) {
                    if (!found) {
                        mleafs0.push(anglevec.angle);
                    } else {
                        mleafs1.push(anglevec.angle);
                    }
                } else {
                    found = true;
                }
                anglevec.angle += 360 / numleafs;
            }
            var mleafs = mleafs1.concat(mleafs0);
            if (mleafs.length == 3) {
                var tmp = mleafs[1];
                mleafs[1] = mleafs[2];
                mleafs[2] = tmp;
            }

            return mleafs;
        },
        // grows 6 leafs from root leaf
        growLeafs: function (rootleaf, angle, delay) {
            delay = typeof delay !== 'undefined' ? delay : 0;

            var delayinc = LEAF_DELAY;
            var newleafs = [];
            // calculates generation position vector from angle
            var anglevec = new Point(LEAF_R, 0);
            // anglevec.angle += angle;

            angles = this.getMissingLeafsAngle(rootleaf, anglevec.angle + angle);
            // console.log('angles.length = ' + angles.length);
            // console.log('angles = ' + angles.toString());

            for (var i = 0; i < angles.length; i++) {
                // console.log('new leaf! angle = ' + angles[i]);
                anglevec.angle = angles[i];
                // adds new leaf
                var c = this.addLeaf(anglevec + rootleaf.center, delay, false);
                if (c) {
                    newleafs.push(c);
                    delay += delayinc;
                }

                // TODO: Remove this debug!
                if (i == 0) {
                    c.cbfajutain = function () {
                        rootleaf._path.strokeColor = 'gold';
                    };
                }
                if (i == angles.length - 1) {
                    c.cbfajutaout = function () {
                        rootleaf._path.strokeColor = 'white';
                    };
                }
            }

            return newleafs;
        },
        // grows multiple levels of leafs
        growMultiLeafs: function (rootleaf, angle, level) {
            this._multileaflevel = level;
            this._multileaflist = [[rootleaf], []];
            this._multileafdelay = 0;
            this._multileafstate = 'grow';
        },
        // called by onFrame to update animation state
        update: function (delta) {
            switch (this._multileafstate) {
                case 'idle':
                    break;

                case 'grow':
                    l = this._multileaflist[0].shift();
                    c = this.growLeafs(l, -90, this._multileafdelay);
                    if (c.length == 3) {
                        var tmp = c[1];
                        c[1] = c[2];
                        c[2] = tmp;
                    }
                    this._multileafdelay += c.length * LEAF_DELAY;
                    this._multileaflist[1] = this._multileaflist[1].concat(c);
                    if (this._multileaflist[0].length == 0) {
                        this._multileaflevel--;
                        this._multileaflist.shift();
                        this._multileaflist.push([]);
                    }
                    if (c.length == 0 || this._multileaflevel == 0) {
                        this._multileaflevel = 0;
                        this._multileafstate = 'idle';
                    }
                    break;

                default:
            }
        },
        // fol object initialization
        init: function (updateList) {
            // sets update list reference
            this._updateList = updateList;
            // create a new layer for fol
            this.layer = new Layer();
            // creates a set to store leafs center reference
            this._set = new Set();
            // activates fol layer for project
            this.layer.activate();
            // sets initial multileaf animation state
            this._multileafstate = 'idle';
            // level of multileafing
            this._multileaflevel = 0;
            // list of leafs to grown on multileafing
            this._multileaflist = [];

            // adds fol to update list
            this._updateList.push(this);
        }
    };

    fol.init(updateList);

    return fol;
}

// leaf under mouse
var mouseoverleaf = null;
// get mouse hits
function onMouseMove(event) {
    var hitOptions = {
        center: true,
    	tolerance: LEAF_R / 1.2
    };

    var hitResult = project.hitTest(event.point, hitOptions);
    if (hitResult) {
        if (mouseoverleaf && hitResult.item.leaf && (hitResult.item.leaf != mouseoverleaf)) {
            mouseoverleaf.onMouseLeave();
            mouseoverleaf = null;
        } else if (hitResult.item.leaf && hitResult.item.leaf != mouseoverleaf) {
            hitResult.item.leaf.onMouseEnter();
            mouseoverleaf = hitResult.item.leaf;
        }
    } else {
        if (mouseoverleaf) {
            mouseoverleaf.onMouseLeave();
            mouseoverleaf = null;
        }
    }
}

// var level = 15;
// LEAF_DELAY = LEAF_DELAY / level;
// LEAF_DELAY = 0.3;

// handles mouse click
function onMouseDown(event) {
    if (!mouseoverleaf) {
        return;
    }
    fol.growLeafs(mouseoverleaf, -90);
    // fol.growMultiLeafs(mouseoverleaf, -90, level);
}

function onFrame(event) {
    updateList.forEach(function (o) {
        o.update(event.delta);
    });
}

function onResize(event) {
	// Whenever the window is resized, recenter the layer:
	fol.layer.position = view.center;
}

// Main function
function main() {
    fol = FoLFactory(updateList);

    var root = fol.addLeaf(new Point(), 0, true);
}

main();
