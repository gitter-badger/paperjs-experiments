// constants
// leaf radius
var LEAF_R = 45;
// highlight radius
var LEAF_HL_R = LEAF_R * 1.25;
// default leaf style
var defaultstyle = {
    strokeWidth: 1.5,
    strokeColor: new Color('#FFFFFF', 1),
    fillColor: null,
    shadowBlur: 0
};
// initial leaf style
// var initstyle = Object.assign({}, defaultstyle);
var initstyle = Object.create(defaultstyle);
initstyle.strokeWidth = 0;
initstyle.strokeColor = new Color(defaultstyle.strokeColor);
initstyle.strokeColor.alpha = 0;

function getColor(str, alpha) {
    c = new Color(str);
    c.alpha = alpha;
    return c;
}

// highlight overlay style
var hloverlaystyle = {
    // fillColor: 'gold',
    fillColor: {
        gradient: {
            stops: [
                [getColor('gold', 1), 0.06],
                [getColor('gold', 1), 0.45],
                [getColor('GoldenRod', 1), 0.80],
                [getColor('GoldenRod', 0), 1]
            ],
            radial: true
        },
        origin: new Point(0, 0),
        destination: new Point(LEAF_HL_R, 0)
    },
    shadowColor: 'GoldenRod',
    shadowBlur: 100
};
// center point style
var centerstyle = {
    // strokeWidth: 2,
    fillColor: 'gold',
    // strokeColor: 'GoldenRod'
    shadowColor: 'GoldenRod',
    shadowBlur: 100
};

// creates Leaf objects in position 'pos' and adds it object 'fol'
// only creates if no other leaf exists in that position
var LeafFactory = function(pos, updateList, delay, hidecenter) {
    delay = typeof delay !== 'undefined' ? delay : 0;
    hidecenter = typeof hidecenter !== 'undefined' ? hidecenter : false;

    var leaf = {
        // PRIVATE VARS
        _updateList: null,
        _delay: 0,
        _hidecenter: false,
        _leafstate: '',
        _hlstate: '',
        _center: null,
        _path: null,
        _centershape: null,
        _hlshape: null,

        // PUBLIC VARS
        // gets leaf's center position within group
        get center() {
            return this._center;
        },
        // sets leaf's center position within group
        set center(pos) {
            this._center = pos;
            this._path.position = pos + project.activeLayer.position;
        },

        // PRIVATE METHODS
        _updateLeaf: function (delta) {
            switch (this._leafstate) {
                case 'idle':
                    break;

                case 'centerfadein':
                    if (this._delay > 0) {
                        this._delay -= delta;
                        return;
                    }
                    this._delay = 0;

                    // TODO: Remove this debug!
                    // if (this.cbfajutain) {
                    //     // console.log('fajutagem!');
                    //     this.cbfajutain();
                    // }

                    // this._centershape.bringToFront();
                    this._centershape.visible = true;

                    var seconds = 0.1;
                    var ratio = delta / seconds;

                    if (!this._hidecenter) {
                        this._centershape.radius += ratio * 5;
                    } else {
                        this._centershape.radius = 0;
                        this._leafstate = 'leaffadein';
                        return;
                    }
                    if (this._centershape.radius > 5) {
                        this._centershape.radius = 5;
                        this._leafstate = 'leaffadein';
                    }
                    break;

                case 'leaffadein':
                    if (this._delay > 0) {
                        this._delay -= delta;
                        return;
                    }
                    this._delay = 0;
                    // this.path.bringToFront();
                    this._path.visible = true;

                    // var seconds = 0.35;
                    var seconds = 0.2;
                    // seconds = 2;
                    var ratio = delta / seconds;
                    // this.centerpath.radius += ratio * 5;
                    this._path.strokeWidth += ratio * defaultstyle.strokeWidth;
                    this._path.strokeColor.alpha += ratio;
                    if (this._path.strokeWidth > defaultstyle.strokeWidth) {
                        this._path.strokeWidth = defaultstyle.strokeWidth;
                        this._leafstate = 'centerfadeout';

                        // // TODO: Remove this debug!
                        // if (this.cbfajutaout) {
                        //     // console.log('fajutagem!');
                        //     this.cbfajutaout();
                        // }

                    }
                    break;

                case 'centerfadeout':
                    if (this._hidecenter) {
                        this._leafstate = 'idle';
                        return;
                    }

                    var seconds = 0.5;
                    var ratio = delta / seconds;

                    this._centershape.radius -= ratio * 5;
                    if (this._centershape.radius <= 0) {
                        this._centershape.radius = 0;
                        this._centershape.visible = false;
                        this._leafstate = 'idle';
                    }
                    break;
                default:
            }
        },

        _updateHl: function (delta) {
            switch (this._hlstate) {
                case 'idle':
                    break;

                case 'hlfadein':
                    if (!this._path.visible) {
                        return;
                    }
                    this._hlshape.visible = true;

                    var seconds = 0.15;
                    var ratio = delta / seconds;
                    var maxr = LEAF_HL_R;

                    this._hlshape.radius += ratio * maxr;
                    if (this._hlshape.radius > maxr) {
                        this._hlshape.radius = maxr;
                        this._hlstate = 'idle';
                    }
                    break;

                case 'hlfadeout':
                    var seconds = 0.15;
                    var ratio = delta / seconds;
                    var maxr = LEAF_HL_R;
                    this._hlshape.radius -= ratio * maxr;
                    if (this._hlshape.radius <= 0) {
                        this._hlshape.radius = 0;
                        this._hlshape.visible = false;
                        this._hlstate = 'idle';
                    }
                    break;
            }
        },

        // PUBLIC METHODS
        // initializes highlight animation on mouse enter
        onMouseEnter: function () {
            // console.log('mouse entered!');
            this._hlshape.bringToFront();
            this._hlshape.visible = true;
            this._hlstate = 'hlfadein';
        },
        // initializes highlight animation on mouse enter
        onMouseLeave: function () {
            // console.log('mouse leaved!');
            this._hlstate = 'hlfadeout';
        },
        // called by onFrame to update animation state
        update: function (delta) {
            this._updateLeaf(delta);
            this._updateHl(delta);
        },
        // leaf object initialization
        init: function (pos, updateList, delay, hidecenter) {
            // setting initial values
            // sets update list reference
            this._updateList = updateList;
            // sets delay for animation
            this._delay = delay;
            // sets if center point should be shown
            this._hidecenter = hidecenter;
            // sets initial leaf animation state
            this._leafstate = 'centerfadein';
            // sets initial highlight animation state
            this._hlstate = 'idle';
            // sets leaf center position
            this._center = pos;
            // leaf's circle path
            this._path = new Path.Circle(pos + project.activeLayer.position, LEAF_R);
            // leaf's center vertex shape
            this._centershape = Shape.Circle(pos + project.activeLayer.position, 0);
            // highlight shape
            this._hlshape = Shape.Circle(pos + project.activeLayer.position, LEAF_HL_R),

            // adds leaf to update list
            this._updateList.push(this);
            // adds reference in path to parent object (used in hit detection)
            this._path.leaf = leaf;
            // initial leaf path style
            this._path.style = initstyle;
            // send path backwards
            this._path.sendToBack();
            this._path.visible = false;

            // sets center vertex attributes
            this._centershape.style = centerstyle;
            this._centershape.leaf = this;
            this._centershape.visible = false;

            // sets highlight shape vertex attributes
            this._hlshape.radius = 0;
            this._hlshape.style = hloverlaystyle;
            this._hlshape.blendMode = 'source-atop';
            this._hlshape.leaf = this;
            this._hlshape.visible = false;
        }
    };

    leaf.init(pos, updateList, delay, hidecenter);

    return leaf;
}

// exports
this.LEAF_R = LEAF_R;
this.LeafFactory = LeafFactory;
