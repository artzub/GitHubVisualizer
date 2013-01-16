/**
 * User: ArtZub
 * Date: 15.01.13
 * Time: 2:13
 */

'use strict';

var ghcs = {
    users: {},
    states: {cur:0, max:0},
    limits: {commits : 100},
    asyncForEach: function(items, fn, time) {
        if (!(items instanceof Array))
            return;

        var workArr = items.concat();

        setTimeout(function loop() {
            if (workArr.length > 0)
                fn(workArr.shift(), workArr);
            if (workArr.length > 0)
                setTimeout(loop, time || 1);
        }, time || 1);
    }
};
