/**
 * User: ArtZub
 * Date: 15.01.13
 * Time: 2:13
 */

'use strict';

(function(window) {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
})(window);

var ONE_SECOND = 1000,
    ONE_MINUTE = 60 * ONE_SECOND,
    ONE_HOUR = 60 * ONE_MINUTE,
    ONE_DAY = 24 * ONE_HOUR;

var ghcs = {
    users: {},
    states: {cur:0, max:0},
    limits: {
        commits : 100,
        stepShow : 1,
        stepType : ONE_DAY
    },
    asyncForEach: function(items, fn, time) {
        if (!(items instanceof Array))
            return;

        var workArr = items.concat();

        function loop() {
            if (workArr.length > 0)
                fn(workArr.shift(), workArr);
            if (workArr.length > 0)
                setTimeout(loop, time || 1);
        }
        loop();
    }
};
