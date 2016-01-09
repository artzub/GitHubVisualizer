/**
 * User: ArtZub
 * Date: 23.01.13
 * Time: 15:00
 */

"use strict";

(function(vis) {
    var _worker,
        _data,
        nodes,
        dateRange,
        selected,
        selectedExt,

        authorHash,
        filesHash,
        extHash,
        extMax,

        _force,
        _forceAuthor,

        links,

        lCom, lLeg, lHis,

        canvas, ctx,
        bufCanvas, bufCtx,
        layer,

        valid,
        pause,
        stop,

        particle,
        defImg,

        lastEvent,
        zoomScale,
        xW,
        yH,

        dofinished,
        setting,
        rd3 = d3.random.irwinHall(8),
        colorless = d3.rgb("gray"),
        colorlessFlash = d3.rgb("lightgray"),

        particleImageCache,
        neonBallCache
        ;

    var extColor,
        userColor;

    var typeNode = {
        author : 0,
        file : 1
    };

    var sizeUser = {
        valueOf : function() {
            return setting.sizeUser;
        }
    };

    function reCalc(d) {
        if (stop)
            return;

        lCom.showCommitMessage(d.message);
        appendExtLegend(d.sha);

        var l = d.nodes.length,
            n, a, fn;

        a = /*d.cuserNode ? d.cuserNode : */ d.userNode;
        a.fixed = false;

        if (!l)
            console.log(d);
        else {
            a.alive = setting.userLife > 0 ? setting.userLife : 1;
            a.opacity = 100;
            a.flash = 100;
            a.visible = true;
        }

        while(--l > -1) {
            n = d.nodes[l];

            if (n.fixed) {
                n.x = xW(n.x);
                n.y = yH(n.y);
                /*if (n.statuses[d.sha].status == TYPE_STATUS_FILE.added) {
                    n.x = a.x;
                    n.y = a.y;
                }*/
                n.paths = [{x: n.x, y: n.y}];
            }

            n.size += 1;
            n.fixed = false;

            n.author = a;

            n.visible = !!n.statuses[d.sha].status;
            fn = n.nodeValue.name.toLowerCase();

            n.flash = 100;
            n.opacity = 100;
            n.alive = setting.fileLife > 0 ? setting.fileLife : 1;

            if (n.visible) {
                n.ext.now.indexOf(fn) < 0
                    && n.ext.now.push(fn);
            }
            else {
                (fn = n.ext.now.indexOf(fn)) > -1
                    && n.ext.now.splice(parseInt(fn), 1);

                n.flash *= .5;
                n.alive *= .2;
                n.opacity *= .5;
            }

            /*data.push(n);

            if (d.cuserNode) {
                links.push({
                    source : n,
                    target : d.cuserNode
                });
            }

            links.push({
                source : n,
                target : d.userNode
            });*/
        }

        updateLegend(/*d.sha*/);

        _force.nodes(nodes.filter(function(d) {
                return d.type != typeNode.author && (d.visible || d.opacity);
            })//.sort(sortBySize)
        ).start();

        _forceAuthor.nodes(nodes.filter(function(d) {
            return d.type == typeNode.author && (d.visible || d.opacity);
        })).start();
    }

    var tempTimeout;
    function loop() {

        if (tempTimeout) {
            clearTimeout(tempTimeout);
            tempTimeout = null;
        }

        while(true) {

            if (stop) {
                killWorker();
                return;
            }

            if (pause)
                return;

            var dl, dr;

            dl = dateRange[0];
            dr = dl + ghcs.limits.stepShow * ghcs.limits.stepType;
            dateRange[0] = dr;

            var visTurn = _data.filter(function (d) {
                return d.date >= dl && d.date < dr;
            });

            ghcs.asyncForEach(visTurn, reCalc, ONE_SECOND / (visTurn.length > 1 ? visTurn.length : ONE_SECOND));
            //visTurn.forEach(reCalc);


            updateStatus(ghcs.states.cur += ghcs.limits.stepShow * ghcs.limits.stepType, timeFormat(new Date(dr)));

            try {
                if (dl >= dateRange[1]) {
                    killWorker();
                    if (dofinished && typeof dofinished == "function")
                        dofinished();
                    throw new Error('break');
                } else {
                    if (!visTurn.length && setting.skipEmptyDate) {
                        //tempTimeout = setTimeout(loop, 1);
                    }
                    else
                        throw new Error('break');
                }
            }
            catch (e) {
                break;
            }
            finally {
                updateExtHistogram();
            }
        }
    }

    function run() {
        if (_worker)
            clearInterval(_worker);

        render();

        _worker = setInterval(loop, ONE_SECOND);
    }

    function nr(d) {
        return d.size > 0 ? d.size : 0;
    }

    function curColor(d) {
        var curExt = selectedExt;
        if (!curExt
            && selected
            && selected.type == typeNode.file
            && selected.ext)
            curExt = selected.ext;

        return curExt && curExt.color
            && curExt.color !== d.d3color
            ? (d.flash ? colorlessFlash : colorless)
            : (d.flash ? d.flashColor : d.d3color);
    }

    function randomTrue() {
        return Math.floor(rd3() * 8) % 2;
    }

    function radius(d) {
        return Math.sqrt(d);
    }

    function contain(d, pos) {
        var px = (lastEvent.translate[0] - pos[0]) / lastEvent.scale,
            py = (lastEvent.translate[1] - pos[1]) / lastEvent.scale,
            r = Math.sqrt( Math.pow( d.x + px , 2) +
                Math.pow( d.y + py , 2 ) );

        return r < (d.type == typeNode.author ? nr(d) * 1.5 : radius(nr(d)));
    }

    function getNodeFromPos(pos) {
        for (var i = nodes.length - 1; i >= 0; i--) {
            var d = nodes[i];
            if (!d.fixed && d.opacity && contain(d, pos))
                return d;
        }
        return null;
    }

    function node(d, type) {
        var c = type == typeNode.file ? d.name : userColor(d.email),
            ext, x, y,
            w2 = w/2,
            w5 = w/5,
            h2 = h/2,
            h5 = h/5;
        if (type == typeNode.file) {
            c = c && c.match(/.*(\.\w+)$/) ? c.replace(/.*(\.\w+)$/, "$1").toLowerCase() : "Mics";
            ext = extHash.get(c);
            if (!ext) {
                ext = {
                    key : c,
                    all : 0,
                    currents : {},
                    color : d3.rgb(extColor(c)),
                    now : []
                };
                extHash.set(c, ext);
            }
            ext.all++;
            c = ext.color;
        }

        x = w * Math.random();
        y = h * Math.random();

        if (type == typeNode.author) {
            if (randomTrue()) {
                x = x > w5 && x < w2
                    ? x / 5
                    : x > w2 && x < w - w5
                    ? w - x / 5
                    : x
                ;
            }
            else {
                y = y > h5 && y < h2
                    ? y / 5
                    : y > h2 && y < h - h5
                    ? h - y / 5
                    : y
                ;
            }
        }

        return {
            x : x,
            y : y,
            id : type + (type == typeNode.file ? d.name : d.email),
            size : type != typeNode.file ? sizeUser : 2,
            weight : type != typeNode.file ? sizeUser : 2,
            fixed : true,
            visible : false,
            links : 0,
            type : type,
            color : c.toString(),
            d3color : c,
            flashColor: type == typeNode.author ? c : c.brighter().brighter(),
            ext : ext,
            author : type == typeNode.author ? d.email : null,
            img : type == typeNode.author ? d.avatar : null,
            nodeValue : d
        }
    }

    function getAuthor(d) {
        if (!d || !d.author)
            return null;

        var n = authorHash.get(d.author.email);

        if (!n) {
            n = node(d.author, typeNode.author);
            authorHash.set(d.author.email, n);
        }
        return n;
    }

    function getFile(d) {
        if (!d || !d.name)
            return null;

        var n = filesHash.get(d.name);

        if (!n) {
            n = node(d, typeNode.file);
            n.links = 1;
            filesHash.set(d.name, n);
        }
        return n;
    }

    function initNodes(data) {
        var ns = [],
            i, j, n, d, df;
        authorHash = d3.map({});
        filesHash = d3.map({});
        extHash = d3.map({});
        extMax = 0;

        if (data) {
            i = data.length;
            while(--i > -1) {
                d = data[i];

                if (!d) continue;

                d.nodes = [];


                n = getAuthor(d);
                d.userNode = n;
                !n.inserted && (n.inserted = ns.push(n));

                if (d.author.login != d.committer.login) {
                    n = getAuthor(d);
                    d.cuserNode = n;

                    !n.inserted && (n.inserted = ns.push(n));

                    /*links.push({
                        source : d.userNode,
                        target : d.cuserNode
                    })*/
                }

                if (!d.files) continue;

                j = d.files.length;
                while(--j > -1) {
                    df = d.files[j];
                    if (!df) continue;

                    n = getFile(df);
                    d.nodes.push(n);
                    n.size = 2;
                    n.statuses = n.statuses || {};
                    n.statuses[d.sha] = df;
                    n.ext.currents[d.sha] = (n.ext.currents[d.sha] || 0);
                    n.ext.currents[d.sha]++;
                    !n.inserted && (n.inserted = ns.push(n));
                }

                j = extHash.values().reduce((function(sha) { return function(a, b) {
                    return (a || 0) + (b.currents[sha] || 0);
                }})(d.sha), null);

                extMax = j > extMax ? j : extMax;
            }
        }
        return ns;
    }

    var tempFileCanvas;

    function generateSprite(w, h, r, g, b, a) {

        var tempFileCanvas = document.createElement("canvas");

        tempFileCanvas.width = w;
        tempFileCanvas.height = h;

        var imgCtx = tempFileCanvas.getContext("2d");
        var gradient = imgCtx.createRadialGradient( w/2, h/2, 0, w/2, h/2, w/2 );

        gradient.addColorStop( 0, 'rgba(255,255,255,' + a + ')' );
        gradient.addColorStop( 0.3, 'rgba(' + [r, g, b, a * .5] + ')' );
        gradient.addColorStop( 1, 'rgba(' + [r, g, b, 0] + ')' ); //0,0,64

        imgCtx.fillStyle = gradient;
        imgCtx.fillRect( 0, 0, w, h);

        return tempFileCanvas;

    }

    function colorize(img, r, g, b, a) {
        if (!img || !img.width)
            return img;

        var tempFileCanvas = document.createElement("canvas");

        tempFileCanvas.width = img.width;
        tempFileCanvas.height = img.height;

        var imgCtx = tempFileCanvas.getContext("2d"),
            imgData, i;
        imgCtx.drawImage(img, 0, 0);

        imgData = imgCtx.getImageData(0, 0, img.width, img.height);

        i = imgData.data.length;
        while((i -= 4) > -1) {
            imgData.data[i + 3] = imgData.data[i] * a;
            if (imgData.data[i + 3]) {
                imgData.data[i] = r;
                imgData.data[i + 1] = g;
                imgData.data[i + 2] = b;
            }
        }

        imgCtx.putImageData(imgData, 0, 0);
        return tempFileCanvas;
    }

    function blink(d, aliveCheck) {
        if (pause)
            return;

        d.flash = (d.flash -= setting.rateFlash) > 0 ? d.flash : 0;

        !d.flash && aliveCheck
            && (d.alive = (d.alive-- > 0 ? d.alive : 0))
        ;

        d.opacity = !d.alive
            ? ((d.opacity -= setting.rateOpacity) > 0 ? d.opacity : 0)
            : d.opacity
        ;

        d.visible && !d.opacity
            && (d.visible = false);
    }

    function sortBySize(a, b) {
        return d3.ascending(a.size, b.size);
    }

    function checkVisible(d, offsetx, offsety) {
        var tx = lastEvent.translate[0]/lastEvent.scale,
            ty = lastEvent.translate[1]/lastEvent.scale
            ;

        offsetx = offsetx || 0;
        if (!(offsetx instanceof Array))
            offsetx = [offsetx, offsetx];
        offsety = offsety || 0;
        if (!(offsety instanceof Array))
            offsety = [offsety, offsety];

        return (
            d.x + d.size > -tx + offsetx[0]
                && d.x - d.size < -tx + offsetx[1] + w/lastEvent.scale
                && d.y + d.size > -ty + offsety[0]
                && d.y - d.size < -ty + offsety[1] + h/lastEvent.scale
            );
    }

    function sortByColor(a, b) {
        return d3.ascending(b.color + !b.flash, a.color + !a.flash);
    }

    function sortByOpacity(a, b) {
        return d3.ascending(b.opacity, a.opacity);
    }

    function compereColor(a, b) {
        return a.r != b.r || a.g != b.g || a.b != b.b;
    }

    function filterVisible(d) {
        return checkVisible(d) && (d.visible || d.alive);
    }

    function drawTail(c, d, x, y, vanishing) {
        if (!vanishing)
            bufCtx.beginPath();

        bufCtx.lineJoin = "round";
        bufCtx.lineWidth = 1;//(radius(nr(d)) / 4)  || 1;

        var cura = bufCtx.globalAlpha;

        var rs = d.paths.slice(0).reverse()
            , lrs = rs.length
            , p;

        if (!vanishing) {
            bufCtx.moveTo(x, y);
            for (p in rs) {
                if (!rs.hasOwnProperty(p))
                    continue;

                bufCtx.lineTo(
                    Math.floor(rs[p].x),
                    Math.floor(rs[p].y)
                );
            }
            bufCtx.stroke();
        }
        else {
            for (p in rs) {
                if (!rs.hasOwnProperty(p))
                    continue;

                bufCtx.beginPath();
                if (p < 1)
                    bufCtx.moveTo(x, y);
                else
                    bufCtx.moveTo(
                        Math.floor(rs[p - 1].x),
                        Math.floor(rs[p - 1].y)
                    );
                bufCtx.lineTo(
                    Math.floor(rs[p].x),
                    Math.floor(rs[p].y)
                );
                bufCtx.stroke();
                bufCtx.globalAlpha = ((lrs - p) / lrs) * cura;

            }
            bufCtx.globalAlpha = cura;
        }
    }

    var trackCtx, trackCanvas;
    /**
     * Draw tracks of particles
     * @param nodes
     * @param lastEvent
     * @returns {HTMLCanvasElement|null}
     */
    function drawTrack(nodes, lastEvent) {
        if (!trackCtx) {
            trackCanvas = document.createElement("canvas");
            trackCanvas.width = w;
            trackCanvas.height = h;

            trackCtx = trackCanvas.getContext('2d');
            trackCtx.lineJoin = "round";
            trackCtx.lineWidth = 1;//(radius(nr(d)) / 4)  || 1;
        }

        trackCtx.save();

        trackCtx.globalCompositeOperation = "destination-out";

        var test = setting.vanishingTail;
        trackCtx.fillStyle = test ? "rgba(0, 0, 0, .2)" : "rgba(0, 0, 0, 1)";
        trackCtx.fillRect(0, 0, w, h);

        trackCtx.globalAlpha = 1;
        trackCtx.globalCompositeOperation = 'source-over';

        trackCtx.translate(lastEvent.translate[0], lastEvent.translate[1]);
        trackCtx.scale(lastEvent.scale, lastEvent.scale);

        if (test) {
            //trackCtx.globalAlpha = .1;
            trackCtx.lineWidth = .4;
        }

        if (nodes && nodes.length) {

            var d, l = nodes.length, color, c = null;

            trackCtx.fillStyle = "none";

            while (--l > -1) {
                d = nodes[l];

                color = curColor(d);
                if (!c || compereColor(c, color)) {
                    c = color;
                    trackCtx.strokeStyle = c.toString();
                }

                if (!d.paths || !d.paths.length)
                    continue;

                var rs = d.paths.slice(0).reverse()
                    , lrs = rs.length
                    , p
                    ;

                if (test) {
                    trackCtx.beginPath();
                    p = rs.pop();
                    trackCtx.moveTo(Math.floor(p.x), Math.floor(p.y));
                    while (p = rs.pop()) {
                        trackCtx.lineTo(
                            Math.floor(p.x),
                            Math.floor(p.y)
                        );
                    }
                    trackCtx.lineTo(
                        Math.floor(d.x),
                        Math.floor(d.y)
                    );
                    trackCtx.stroke();
                }
                else {
                    while (p = rs.pop()) {
                        trackCtx.beginPath();
                        trackCtx.moveTo(Math.floor(p.x), Math.floor(p.y));

                        p = rs.length ? rs[rs.length - 1] : d;

                        trackCtx.lineTo(
                            Math.floor(p.x),
                            Math.floor(p.y)
                        );
                        trackCtx.globalAlpha = ((lrs - rs.length + 1) / lrs);
                        trackCtx.stroke();
                    }
                }


                if (d.paths) {
                    d.pathLife = (d.pathLife || 0);
                    if (d.pathLife++ > 0) {
                        d.pathLife = 0;
                        d.paths.length && d.paths.splice(0, d.flash ? 1 : 4);
                    }
                }

            }
        }

        trackCtx.restore();
        return trackCanvas;
    }

    function redrawCanvas() {

        bufCtx.save();
        bufCtx.clearRect(0, 0, w, h);

        if (setting.blendingLighter && bufCtx.globalCompositeOperation == 'source-over') {
            bufCtx.globalCompositeOperation = 'lighter';
            //darker
        }
        else if (!setting.blendingLighter && bufCtx.globalCompositeOperation == 'lighter') {
            bufCtx.globalCompositeOperation = 'source-over';
        }

        var n, l, i,
            img,
            d, beg,
            c, x, y, s,
            tracksImg,
            currentCache = setting.asPlasma ? neonBallCache : particleImageCache;


        if (setting.showTrack && setting.showFile) {
            n = _force.nodes()
                .filter(filterVisible)
                .sort(sortBySize)
                .sort(sortByOpacity)
                .sort(sortByColor)
            ;

            tracksImg = drawTrack(n, lastEvent);
            setting.showTrack && tracksImg &&
            bufCtx.drawImage(tracksImg, 0, 0, w, h);
        }

        bufCtx.translate(lastEvent.translate[0], lastEvent.translate[1]);
        bufCtx.scale(lastEvent.scale, lastEvent.scale);

        if (setting.showFile) {
            n = n || _force.nodes()
                .filter(filterVisible)
                .sort(sortBySize)
                .sort(sortByOpacity)
                .sort(sortByColor)
            ;

            l = n.length;

            /*if (!setting.showHalo && setting.showTrack) {
                c = null;
                i = 100;

                bufCtx.fillStyle = 'none';
                bufCtx.globalAlpha = i * .01;

                while(--l > -1) {
                    d = n[l];

                    if (i != d.opacity) {
                        i = d.opacity;
                        bufCtx.globalAlpha = i * .01;
                    }

                    if (!c || compereColor(c, curColor(d))) {
                        c = curColor(d);
                        bufCtx.strokeStyle = c.toString();
                    }

                    drawTail(c, d, Math.floor(d.x), Math.floor(d.y), setting.vanishingTail);
                }
            }*/

            l = n.length;

            c = null;
            i = 100;
            beg = false;

            bufCtx.strokeStyle = 'none';
            bufCtx.globalAlpha = i * .01;

            while(--l > -1) {
                d = n[l];

                if (i != d.opacity) {
                    i = d.opacity;
                    bufCtx.globalAlpha = i * .01;
                }

                if (!c || compereColor(c, curColor(d))) {
                    c = curColor(d);

                    if (!setting.showHalo) {
                        if (beg) {
                            bufCtx.stroke();
                            bufCtx.fill();
                        }

                        bufCtx.beginPath();
                        bufCtx.fillStyle = c.toString();
                        beg = true;
                    }
                    else {
                        bufCtx.strokeStyle = c.toString();
                        img = currentCache.get(bufCtx.strokeStyle);
                        if (!img) {
                            img = setting.asPlasma
                                ? generateSprite(64, 64, c.r, c.g, c.b, 1)
                                : colorize(particle, c.r, c.g, c.b, 1);
                            currentCache.set(bufCtx.strokeStyle, img);
                        }
                    }
                }

                x = Math.floor(d.x);
                y = Math.floor(d.y);

                /*if (setting.showHalo && setting.showTrack)
                    drawTail(c, d, x, y, setting.vanishingTail);
                */

                s = radius(nr(d)) * (setting.showHalo ? setting.asPlasma ? 8 : 10 : .8);
                if (!setting.showHalo) {
                    bufCtx.moveTo(x + s, y);
                    bufCtx.arc(x, y, s, 0, PI_CIRCLE, true);
                }
                else
                    bufCtx.drawImage(img, x - s / 2, y - s / 2, s, s);
            }
            if (!setting.showHalo && beg) {
                bufCtx.stroke();
                bufCtx.fill();
            }
        }

        if (setting.showUser || setting.showLabel) {
            bufCtx.globalCompositeOperation = 'source-over';

            n = _forceAuthor.nodes().filter(filterVisible).sort(sortByOpacity);
            l = n.length;

            i = 100;

            bufCtx.globalAlpha = i * .01;

            while(--l > -1) {
                d = n[l];

                if (i != d.opacity) {
                    i = d.opacity;
                    bufCtx.globalAlpha = i * .01;
                }

                x = Math.floor(d.x);
                y = Math.floor(d.y);

                if (setting.showUser) {
                    c = curColor(d);
                    bufCtx.save();

                    if (setting.showPaddingCircle) {
                        bufCtx.beginPath();
                        bufCtx.strokeStyle = "none";
                        bufCtx.fillStyle = "#ff0000";
                        bufCtx.arc(x, y, nr(d) + setting.padding, 0, PI_CIRCLE, true);
                        bufCtx.closePath();
                        bufCtx.fill();
                        bufCtx.stroke();
                    }


                    img = setting.useAvatar ?
                        (d.img && d.img.width > 0 && d.img.height > 0
                            ? d.img : defImg) : null;
                    bufCtx.beginPath();
                    bufCtx.strokeStyle = "transparent";
                    bufCtx.fillStyle = img ? "transparent" : c;
                    bufCtx.arc(x, y, nr(d), 0, PI_CIRCLE, true);
                    bufCtx.closePath();
                    bufCtx.fill();
                    bufCtx.stroke();
                    if (img && nr(d) > 0) {
                        bufCtx.clip();
                        bufCtx.drawImage(img, x - nr(d), y - nr(d), nr(d) * 2, nr(d) * 2);
                    }

                    bufCtx.restore();
                }

                if (setting.showLabel) {
                    c = d.flash ? "white" : "gray";

                    bufCtx.fillStyle = c;
                    bufCtx.fillText(setting.labelPattern
                        .replace("%l", d.nodeValue.login)
                        .replace("%n", d.nodeValue.name != "unknown" ? d.nodeValue.name : d.nodeValue.login)
                        .replace("%e", d.nodeValue.email), x, y + nr(d) * 1.5);
                }
            }
        }
        bufCtx.restore();
    }

    var reqAnim, restart, restartFunction;
    function render() {

        if (restart) {
            console.log('out');
            return restartFunction && restartFunction();
        }

        reqAnim = requestAnimationFrame(render);

        lHis && lHis.style("display", setting.showHistogram ? null : "none");
        lLeg && lLeg.style("display", setting.showCountExt ? null : "none");

        if (valid || restart)
            return;

        valid = true;

        ctx.save();
        ctx.clearRect(0, 0, w, h);

        redrawCanvas();

        ctx.drawImage(bufCanvas, 0, 0);
        ctx.restore();

        valid = false;
    }

    function tick() {
        if (restart)
            return console.log('tick finish');

        if (_force.nodes()) {

            _force.nodes()
                .forEach(cluster(0.025));

            _forceAuthor.nodes(
                _forceAuthor.nodes()
                    .filter(function(d) {
                        blink(d, !d.links && setting.userLife > 0);
                        if (d.visible && d.links === 0 && setting.userLife > 0) {
                            d.flash = 0;
                            d.alive = d.alive / 10;
                        }
                        return d.visible;
                    })
            );
        }

        if (restart)
            return console.log('tick finish');

        console.log('resume');
        _forceAuthor.resume();
        _force.resume();
    }

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {

        authorHash.forEach(function(k, d) {
            d.links = 0;
        });

        return function(d) {
            blink(d, setting.fileLife > 0);
            if (!d.author || !d.visible)
                return;

            var node = d.author,
                l,
                r,
                x,
                y;

            if (node == d) return;
            node.links++;

            x = d.x - node.x;
            y = d.y - node.y;
            l = Math.sqrt(x * x + y * y);
            r = radius(nr(d)) / 2 + (nr(node) + setting.padding);
            if (l != r) {
                l = (l - r) / (l || 1) * (alpha || 1);
                x *= l;
                y *= l;

                d.x -= x;
                d.y -= y;
            }
            d.paths && (d.flash || d.paths.length > 1) && d.paths.push({
                x : d.x,
                y : d.y
            });
        };
    }

    function appendExtLegend(sha){
        if (!layer)
            return;

        var data = [],
            w3 = w / 3,
            ml = w * .01,
            mb = 18,
            h2 = (h / 2) - mb,
            bw = 2,
            ny
            ;

        var y = d3.scale.linear()
            .range([0, h2])
            .domain([0, extMax]);

        lHis = (lHis || layer.insert("g", ":first-child"))
            .attr("width", w3)
            .attr("height", h2)
            .attr("transform", "translate(" + [ ml , h - h2 - mb ] + ")");

        if (!sha)
            return;

        ny = h2;
        extHash.forEach(function(k, d) {
            var obj = {
                key : k,
                h : y(d.currents[sha] || 0),
                color : d.color
            };
            obj.y = ny -= obj.h;
            data.push(obj);
        });

        updateExtHistogram();

        var g = lHis.append("g")
            .attr("class", "colStack")
            .datum({ x : w3, w : bw })
            .style("opacity", 0);

        g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", function(d) {  return d.y;  })
            .attr("width", bw)
            .attr("height", function(d) { return d.h; })
            .attr("fill", function(d) { return d.color; })
        ;

        g.style("opacity", 1)
            .attr("transform", function(d) {
                return "translate(" + [ d.x, 0] + ")";
            });
    }

    function updateExtHistogram() {
        if (!lHis || lHis.selectAll(".colStack").empty())
            return;

        lHis.selectAll(".colStack")
            .attr("transform", function(d) {
                return "translate(" + [ d.x -= d.w/2, 0] + ")";
            })
            .filter(function(d) {
                return d.x < 0;
            })
            .remove();
    }

    function lme(d) {
        selectedExt = d.value;
        toolTip.html("");
        toolTip.append("div").attr("class", "row userInfo open").call(function(div) {
            div = div.append("div").attr("class", "statInfo");

            div.append("ul").call(function(ul) {
                ul.append("li").call(function(li) {
                    li.append("h1")
                        .style("color", d.value.color)
                        .style("text-shadow", "1px 1px 1px #000")
                        .text(d.key)
                    ;
                    li.append("hr");
                });
                ul.append("li").call(function(li) {
                    li.text("number of file:");
                    li.append("strong")
                        .text(d.value.now.length);
                });
                ul.append("li").call(function(li) {
                    li.text("degree of change:");
                    li.append("strong")
                        .text(d3.sum(d3.values(d.value.currents)))
                });
            });
        });
        toolTip.show();
        updateLegend();
    }

    function lml() {
        selectedExt = null;
        toolTip.hide();
        updateLegend();
    }

    function legColor(d) {
        var ext = selectedExt;
        if (!ext && selected
            && selected.type == typeNode.file
            && selected.ext)
            ext = selected.ext;

        return ext
            ? ext == d.value
            ? d.value.color
            : colorless
            : d.value.color;
    }

    function initLegend() {
        if (!layer)
            return;

        var mt = 48,
            ml = w * .01,
            h2 = h / 2 - mt,
            w3 = w / 3
            ;

        lLeg && lLeg.remove();

        lLeg = layer.append("g")
            .attr("width", w3)
            .attr("height", h2)
            .attr("transform", "translate(" + [ml, mt] + ")");

        lLeg.selectAll("*").remove();

        var g = lLeg.selectAll(".gLeg")
            .data(extHash.entries(), function(d) { return d.key; });

        g.exit().remove();

        g.enter().append("g")
            .on("mouseover", lme)
            .on("mousemove", vis.mtt)
            .on("mouseout", lml)
            .attr("class", "gLeg")
            .attr("transform", function(d, i) {
                return "translate(" + [0, i * 18] + ")";
            })
            .style("visibility", "hidden")
        ;
        g.append("rect")
            .attr("height", 16)
            .style("fill", legColor)
        ;
        g.append("text")
            .attr("class", "gttLeg")
            .style("font-size", "13px")
            .text(function(d) { return d.key; })
            .style("fill", function(d) { return d3.rgb(d.value.color).brighter().brighter(); })
        ;

        g.append("text")
            .attr("class", "gtLeg")
            .style("font-size", "11px")
            .attr("transform", "translate(" + [2, 12] + ")")
        ;
    }

    function sortLeg(b, a) {
        return d3.ascending(a.value.now.length, b.value.now.length);
    }

    function sortLegK(b, a) {
        return d3.ascending(a.key, b.key);
    }

    function updateLegend() {
        if (!lLeg || lLeg.empty())
            return;

        var g = lLeg.selectAll(".gLeg");

        function wl(d) {
            return d.value.now.length;
        }

        g.selectAll(".gtLeg")
            .text(wl)
        ;

        var wb = d3.max(g.selectAll(".gtLeg"), function(d) {
            return d[0].clientWidth || d[0].getComputedTextLength();
        }) + 4;

        g.selectAll("rect")
            .style("fill", legColor)
            .attr("width", wb)
        ;

        g.selectAll(".gttLeg")
            .attr("transform", "translate(" + [wb + 2, 12] + ")")
        ;

        g.sort(sortLegK).sort(sortLeg)
            .style("visibility", function(d, i) {
                return !wl(d) || i * 18 > lLeg.attr("height") ? "hidden" : "visible";
            })
            .transition()
            .attr("transform", function(d, i) {
                return "translate(" + [0, i * 18] + ")";
            })
        ;
    }

    function getName(path) {
        return path.substr(path.lastIndexOf("/") + 1);
    }

    function getPath(path) {
        var i;
        return path && path.length && (i = path.lastIndexOf("/") + 1) > 0 ? path.substr(0, i) : "";
    }

    function showToolTip(d) {
        var res;
        if (!d) {
            toolTip.hide();
            return;
        }
        if (toolTip.style("display") == "none") {
            toolTip.selectAll("*").remove();

            if (d.type == typeNode.author) {
                toolTip.append("div").attr("class", "row userInfo open").call(function(div) {
                    div = div.append("div").attr("class", "statInfo");

                    div.node().appendChild(d.nodeValue.avatar);
                    div.append("ul").call(function(ul) {
                        (d.author.name || d.nodeValue.login) && ul.append("li").call(function(li) {
                            li.append("h1")
                                .text((d.nodeValue.name || d.nodeValue.login))
                            ;
                            li.append("hr");
                        });
                        ul.append("li").call(function(li) {
                            li.text("email:");
                            li.append("strong")
                                .text(d.nodeValue.email)
                        });
                        ul.append("li").call(function(li) {
                            li.text("login: ");
                            li.append("strong")
                                .text(d.nodeValue.login);
                        });
                    });
                });
            }
            else {
                toolTip.append("div").attr("class", "row userInfo open").call(function(div) {
                    div = div.append("div").attr("class", "statInfo");

                    div.append("ul").call(function(ul) {
                        ul.append("li").call(function(li) {
                            li.append("h1")
                                .text(getName(d.nodeValue.name))
                            ;
                            li.append("hr");
                        });
                        ul.append("li").call(function(li) {
                            li.text("extension:");
                            li.append("strong")
                                .style("color", d.d3color)
                                .text(d.ext.key)
                        });
                        ul.append("li").call(function(li) {
                            li.text("path:");
                            li.append("strong")
                                .text(getPath(d.nodeValue.name));
                            li.append("hr");
                        });

                        ul.append("li").call(function(li) {
                            li.text("degree of change: ");
                            li.append("strong")
                                .text(d3.values(d.statuses).length);
                        });
                        ul.append("li")
                            .call(function(li) {
                                var key,
                                    stat = d3.values(d.statuses).reduce(function(a, b) {
                                        for(key in b) {
                                            if (key != "status" && key != "name"
                                                && b.hasOwnProperty(key)) {
                                                a[key] = (a[key] || 0);
                                                a[key] += b[key];
                                            }
                                        }
                                        return a;
                                    }, {});
                                li = li.append("ul")
                                    .attr("class", "setting");
                                li = li.append("li").attr("class", "field");
                                li.append("h1")
                                    .text("Changed lines (all time):");
                                var statSymbol = {changes : "", additions : " + ", deletions : " - "};
                                for(key in stat) {
                                    if (stat.hasOwnProperty(key))
                                        li.append("ul")
                                            .attr("class", "group")
                                            .append("li")
                                            .attr("class", "field")
                                            .append("span")
                                            .text(key + ": ")
                                            .append("strong")
                                            .style("color", d3.rgb(colors[key]).darker(.2))
                                            .text(statSymbol[key] + textFormat(stat[key]));
                                }
                            });
                    });
                });
            }

            toolTip.show();
        }
    }

    function moveToolTip(d, event) {
        if (d)
            vis.mtt(d);
    }

    function movem(d) {
        var item = arguments.length > 1 && arguments[1] instanceof HTMLCanvasElement ? arguments[1] : this;
        d = null;
        if (selected) {
            var od = selected;
            if (contain(od, d3.mouse(item)))
                d = od;
            if (!d) {
                od && (od.fixed &= 3);
                selected = null;
                d3.select("body").style("cursor", "default");
            }
        }
        else
            d = getNodeFromPos(d3.mouse(item));

        if (d) {
            selected = d;
            d.fixed |= 4;
            d3.select("body").style("cursor", "pointer");
        }
        showToolTip(d, d3.event);
        moveToolTip(d, d3.event);
        updateLegend();
    }

    vis.runShow = function(data, svg, onfinished) {

        restart = true;
        console.log('restart');
        killWorker();

        if (reqAnim)
            restartFunction = insideRestartShow;
        else
            insideRestartShow();

        function insideRestartShow() {
            restartFunction = null;

            particleImageCache = d3.map({});
            neonBallCache = d3.map({});

            dofinished = onfinished;

            _data = data && data.commits ? data.commits.values().sort(vis.sC) : null;

            if (!_data || !_data.length)
                return;

            setting = ghcs.settings.cs;

            vis.layers.repo && cbDlr.uncheck();
            vis.layers.stat && cbDlsr.uncheck();

            extColor = d3.scale.category20();
            userColor = d3.scale.category20b();

            dateRange = d3.extent(data.dates);

            layer = d3.select("#canvas");
            layer.select("#mainCanvas").remove();

            lastEvent = {
                translate: [0, 0],
                scale: 1
            };

            xW = d3.scale.linear()
                .range([0, w])
                .domain([0, w]);

            yH = d3.scale.linear()
                .range([0, h])
                .domain([0, h]);

            var zoom = d3.behavior.zoom()
                .scaleExtent([.1, 8])
                .scale(1)
                .translate([0, 0])
                .on("zoom", function () {
                    lastEvent.translate = d3.event.translate.slice(0);
                    lastEvent.scale = d3.event.scale;

                    var tl = lastEvent.translate[0] / lastEvent.scale,
                        tt = lastEvent.translate[1] / lastEvent.scale;

                    xW.range([-tl, -tl + w / lastEvent.scale])
                        .domain([0, w]);
                    yH.range([-tt, -tt + h / lastEvent.scale])
                        .domain([0, h]);

                    valid = false;
                });

            trackCtx = trackCanvas = null;

            canvas = layer.append("canvas")
                .text("This browser don't support element type of Canvas.")
                .attr("id", "mainCanvas")
                .attr("width", w)
                .attr("height", h)
                .call(zoom)
                .node();

            d3.select(canvas).style("background", "#000");

            ctx = canvas.getContext("2d");

            bufCanvas = document.createElement("canvas");
            bufCanvas.width = w;
            bufCanvas.height = h;

            bufCtx = bufCanvas.getContext("2d");
            bufCtx.globalCompositeOperation = 'lighter';

            bufCtx.font = "normal normal " + setting.sizeUser / 2 + "px Tahoma";
            bufCtx.textAlign = "center";

            layer = svg || vis.layers.show;
            layer && layer.show && layer.show();

            layer.append("g")
                .call(zoom)
                .on('mousemove.tooltip', movem)
                .append("rect")
                .attr("width", w)
                .attr("height", h)
                .attr("x", 0)
                .attr("y", 0)
                .style("fill", "#ffffff")
                .style("fill-opacity", 0);

            lHis && lHis.remove();
            lHis = null;

            lCom && lCom.remove();
            lCom = layer.append("g")
                .attr("width", 10)
                .attr("height", 14)
                .attr("transform", "translate(" + [w / 2, h - 18] + ")")
            ;
            lCom.visible = !setting.showCommitMessage;

            lCom.selectAll("text").remove();
            lCom.showCommitMessage = lCom.showCommitMessage || function (text) {
                if (setting.showCommitMessage && !lCom.visible) {
                    lCom.visible = true;
                    lCom.style("display", null);
                }
                else if (!setting.showCommitMessage && lCom.visible) {
                    lCom.visible = false;
                    lCom.style("display", "none");
                }

                lCom.append("text")
                    .attr("text-anchor", "middle")
                    .attr("class", "com-mess")
                    .attr("transform", "translate(" + [0, -lCom.node().childElementCount * 14] + ")")
                    .text(text.split("\n")[0].substr(0, 100))
                    .transition()
                    .delay(500)
                    .duration(2000)
                    .style("fill-opacity", 1)
                    .duration(200)
                    .style("font-size", "11.2pt")
                    .transition()
                    .duration(1500)
                    .style("fill-opacity", .3)
                    .style("font-size", "11pt")
                    .each("end", function () {
                        lCom.selectAll("text").each(function (d, i) {
                            d3.select(this)
                                .attr("transform", "translate(" + [0, -i * 14] + ")");
                        });
                    })
                    .remove();
            };

            psBar.show();
            ghcs.states.cur = 0;
            ghcs.states.max = dateRange[1] - dateRange[0];
            updateStatus(ghcs.states.cur, timeFormat(new Date(dateRange[0])));

            links = [];
            nodes = initNodes(_data);

            defImg = new Image();
            defImg.src = "resource/default.png";

            particle = new Image();
            particle.src = "resource/particle.png";

            _force = (_force || d3.layout.force()
                .stop()
                .size([w, h])
                .friction(.75)
                .gravity(0)
                .charge(function (d) {
                    return -1 * radius(nr(d));
                })
                .on("tick", tick))
                .nodes([])
            ;

            zoomScale = d3.scale.linear()
                .range([5, 1])
                .domain([.1, 1]);

            _forceAuthor = (_forceAuthor || d3.layout.force()
                .stop()
                .size([w, h])
                .gravity(setting.padding * .001)
                .charge(function (d) {
                    return -(setting.padding + d.size) * 8
                        //* (Math.sqrt(d.links / lastEvent.scale) || 1)
                        ;
                }))
                .nodes([])
            ;

            initLegend();

            stop = false;
            pause = false;

            restart = false;
            run();
            _force.start();
            _forceAuthor.start();
        }
    };

    vis.pauseShow = function() {
        pause = true;
    };

    function killWorker() {
        if (_worker) {
            clearInterval(_worker);
            _worker = null;
        }
    }

    vis.stopShow = function() {
        stop = true;
        killWorker();
    };

    vis.resumeShow = function() {
        pause = false;
    };

    vis.showIsPaused = function() {
        return pause && !stop;
    };

    vis.showIsRun = function() {
        return !!_worker;
    }
})(vis || (vis = {}));
