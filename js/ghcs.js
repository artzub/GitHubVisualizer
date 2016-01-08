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
    ONE_DAY = 24 * ONE_HOUR,
    TIME_ZONE = (new Date(Date.now())).getTimezoneOffset() * -ONE_MINUTE,

    PI_CIRCLE = 2 * Math.PI;

var ghcs = {
    users: {},
    states: {cur:0, max:0},
    limits: {
        commits : 100,
        stepShow : 1,
        stepType : ONE_DAY
    },
    apiUrl: "https://api.github.com/",
    version : 6,
    settings : {
        cs : {
            fileLife : 255 // number of steps of life a file
            , userLife : 255 // number of steps of life a user
            , edgeLife : 255 // number of steps of life a edge
            , showCountExt : true // show table of file's extension
            , onlyShownExt : true // show only extension which is shown
            , showHistogram : true // displaying histogram of changed files
            , showHalo : true // show a file's halo
            , padding : 25 // padding around a user
            , rateOpacity : .5 // rate of decrease of opacity
            , rateFlash : 2.5 // rate of decrease of flash
            , sizeFile : 2 // size of file
            , sizeUser : 24 // size of user
            , showPaddingCircle : false // show circle of padding
            , useAvatar : true // show user's avatar
            , showEdge : true // show a edge
            , showFile : true // show a file
            , showUser : true // show a user
            , showLabel : true // show user name
            , showFilename : true // show file name TODO: надо-ли?
            , labelPattern : "%n <%e>"  // pattern for label of user
            , showCommitMessage : false // show commit message
            , skipEmptyDate : true // skip empty date
            , blendingLighter : false
            , asPlasma : false
            , showTrack : true
            , vanishingTail : true
        },
        access : {
            client_id : "c45417c5d6249959a91d",
            client_secret : undefined,
            ncid : undefined,
            ncs : undefined,
            code : undefined,
            accessToken : undefined,
            username: undefined
        }
    },

    asyncForEach: function(items, fn, time) {
        if (!(items instanceof Array))
            return;

        var workArr = items.reverse().concat();

        function loop() {
            if (workArr.length > 0)
                fn(workArr.shift(), workArr);
            if (workArr.length > 0)
                setTimeout(loop, time || 1);
        }
        loop();
    },
    imageHash : d3.map({})
};

(function(ghcs) {
    ghcs.sessionStorage = sessionStorage;
    if (ghcs.sessionStorage) {
        Storage.prototype.set = function(key, value) {
            this.setItem(key, JSON.stringify(value));
        };

        Storage.prototype.get = function(key) {
            var res = this.getItem(key);
            return res ? JSON.parse(res) : res;
        };
        //ghcs.sessionStorage.setImageData = setImageData;
    }
    else {
        ghcs.sessionStorage = d3.map({});
        ghcs.sessionStorage.clear = function() {
            var ks = ghcs.sessionStorage.keys,
                l = ks.length;

            while(--l > -1)
                ghcs.sessionStorage.remove(ks[l]);
        };
        ghcs.sessionStorage.setImageData = setImageData;
    }

    ghcs.localStorage = localStorage;
    if (!ghcs.localStorage) {
        ghcs.localStorage = {
            set : function(key, value) {
                setCookie(key, value, {expires: 30758400, path : "/"})
            },
            get : function(key) {
                return getCookie(key);
            },
            removeItem : function(key) {
                deleteCookie(key);
            }
        }
    }

    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");

    /**
     * @param url {String}
     * @param image {Image}
     */
    function setImageData(url, image) {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        ghcs.sessionStorage.set(url, canvas.toDataURL("image/png"));
        canvas.width = 0;
        canvas.height = 0;
    }
})(ghcs);

function loadSettings() {
    if (ghcs.localStorage.get('setting.version') == ghcs.version) {
        if (ghcs.localStorage.get("ghcs.settings")) {
            ghcs.settings = ghcs.localStorage.get("ghcs.settings");
        }
    }
    else {
        ghcs.localStorage.set('setting.version', ghcs.version);
        saveSetting();
    }
}

function saveSetting() {
    ghcs.localStorage.set("ghcs.settings", ghcs.settings);
}