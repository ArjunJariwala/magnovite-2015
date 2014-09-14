var anim = anim || {};
var app = app || {};

/**
 * Depends on
 * {anim.Letter}
 * {anim.Atom}
 */
(function() {
    'use strict';

    var canvas, context;

    var text = 'VTTTV';

    // timing delays
    var ATOM_MIN_DELAY = 1000;
    var ATOM_VAR_DELAY = 1000;
    var ENERGY_DELAY = 2000;
    var energyDelay;

    // the particles moving around
    var atoms;
    var nAtoms = 30;

    // the letters
    var letters;

    // array of {Line}s of all external facing edges
    var externalLetterEdges;

    /**
     * Entry point for the logo
     */
    function main(_canvas, _context) {
        var i;

        atoms = [];
        externalLetterEdges = [];
        energyDelay = ENERGY_DELAY;

        canvas = _canvas;
        context = _context;

        if (anim.mobile) {
            nAtoms = 10;
            text = 'T';
        }

        // init atoms
        for (i = 0; i < nAtoms; i++) {
            atoms.push(new anim.Atom(canvas, ATOM_MIN_DELAY +
                Math.random() * ATOM_VAR_DELAY));
        }

        // init Letters
        letters = anim.common.createLetters(canvas, text);
        letters.forEach(function(letter) {
            Array.prototype.push.apply(externalLetterEdges, letter.external);
        });

        return draw;
    }



    function drawAtoms(context) {
        var buffer = 20;
        var isMouseGravityOn = false;

        var m = anim.getPointer();
        if (m && m.x > 20 && m.x < canvas.width - buffer &&
            m.y > 20 && m.y < canvas.height - buffer) {
            isMouseGravityOn = true;
        }

        var drawEnergy = true;
        var energyAlpha;

        // used for the fade in effect on load
        if (energyDelay > 0) {
            energyDelay -= 15;
            drawEnergy = false;

        } else if (energyDelay > -500) {
            energyAlpha = energyDelay / -500;
            energyDelay -= 15;
        }

        // draw energy lines
        atoms.forEach(function(atom) {
            if (isMouseGravityOn && drawEnergy && m) {
                if (energyAlpha) {
                    anim.common.handleMouse(m, atom, context, {alpha: energyAlpha * 0.8});
                } else {
                    anim.common.handleMouse(m, atom, context);
                }

            }

            atoms.forEach(function(atomB) {
                var alpha;
                if (energyAlpha) {
                    alpha = energyAlpha * 0.2;
                }

                if(drawEnergy) {
                    anim.common.energyLine(context, atom, atomB, alpha);
                }

                // collide atoms with themselves
                atom.collide(atomB);
            });
        });

        // draw atoms
        atoms.forEach(function(atom) {
            // collide atom with letters
            externalLetterEdges.forEach(function(line) {
                atom.collideLine(line);
            });

            atom.update(context);
        });
    }

    /**
     * The main draw loop
     */
    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        drawAtoms(context);

        // draw letters
        letters.forEach(function(letter) {
            letter.draw(context);
        });

        // draw external edges seperately : // TODO: DEBUG
        // externalLetterEdges.forEach(function(line) {
        //     line.draw(context);
        // });
    }

    // set external interface
    anim.logo = {
        main: main
    };

})();
