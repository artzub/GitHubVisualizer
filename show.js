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

        setting,
        rd3 = d3.random.irwinHall(8);

    var extColor = d3.scale.category20(),
        userColor = d3.scale.category20b();

    var typeNode = {
        author : 0,
        file : 1
    };

    function reCalc(d) {
        if (stop)
            return;

        lCom.showCommitMessage(d.message);
        appendExtLegend(d.sha);

        var l = d.nodes.length,
            n, a, fn;

        a = d.cuserNode ? d.cuserNode : d.userNode;
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
            }

            n.size += 2;
            n.fixed = false;

            n.author =  a.nodeValue.email;

            n.visible = !!n.statuses[d.sha].status;
            fn = n.nodeValue.name.toLowerCase();

            if (n.visible) {
                n.ext.now.indexOf(fn) < 0
                    && n.ext.now.push(fn);

                n.flash = 100;
                n.alive = setting.fileLife > 0 ? setting.fileLife : 1;
                n.opacity = 100;
            }
            else {
                (fn = n.ext.now.indexOf(fn)) > -1
                    && n.ext.now.splice(fn, 1);

                n.alive = (setting.fileLife > 0 ? setting.fileLife : 1) * .2;
                n.opacity = 50;
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

        updateLegend(d.sha);

        _force.nodes(nodes.filter(function(d) {
                return d.type != typeNode.author && (d.visible || d.opacity);
            }).sort(sortBySize)
        ).start();

        _forceAuthor.nodes(nodes.filter(function(d) {
            return d.type == typeNode.author && (d.visible || d.opacity);
        })).start();
    }

    function loop() {

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

        if (dl >= dateRange[1]) {
            if (_worker)
                clearInterval(_worker);
        } else {
            if (!visTurn.length && setting.skipEmptyDate)
                loop();
        }

        updateExtHistogram();
    }

    function run() {
        if (_worker)
            clearInterval(_worker);

        anim();

        _worker = setInterval(loop, ONE_SECOND);
    }

    function nr(d) {
        return d.size > 0 ? d.size : 0;
    }

    function ncb(d) {
        return d3.rgb(d.color).brighter().brighter();
    }

    function nc(d) {
        return d.color;
    }

    function randomTrue() {
        return Math.floor(rd3() * 8) % 2;
    }

    function radius(d) {
        return Math.sqrt(d);
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
                    all : 0,
                    currents : {},
                    color : extColor(c),
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
            size : type != typeNode.file ? 24 : 2,
            weight : type != typeNode.file ? 24 : 2,
            fixed : true,
            visible : false,
            links : 0,
            type : type,
            color : c,
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
                d.nodes = [];
                if (!d) continue;

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

                j = extHash.values().reduce(function(a, b) {
                    return a += b.currents[d.sha] || 0;
                }, null);

                extMax = j > extMax ? j : extMax;
            }
        }
        return ns;
    }

    var tempCanvas, tempFileCanvas;
    function setOpacity(img, a, f) {
        if (!img || !img.width)
            img = defImg;

        return img;
    }

    function colorize(img, r, g, b, a) {
        if (!img)
            return img;

        if (!tempFileCanvas) {
            tempFileCanvas = document.createElement("canvas");
            tempFileCanvas.width = img.width;
            tempFileCanvas.height = img.height;
        }

        var imgCtx = tempFileCanvas.getContext("2d"), imgdata, i;
        imgCtx.clearRect(0, 0, img.width, img.height);
        imgCtx.save();
        imgCtx.drawImage(img, 0, 0);

        imgdata = imgCtx.getImageData(0, 0, img.width, img.height);

        i = imgdata.data.length;
        while((i -= 4) > -1) {
            imgdata.data[i + 3] = imgdata.data[i] * a;
            if (imgdata.data[i + 3]) {
                imgdata.data[i] = r;
                imgdata.data[i + 1] = g;
                imgdata.data[i + 2] = b;
            }
        }

        imgCtx.putImageData(imgdata, 0, 0);
        imgCtx.restore();
        return tempFileCanvas;
    }

    function blink(d, aliveCheck, i, l) {
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
        return d3.descending(b.size, a.size);
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

    function redrawCanvas() {

        bufCtx.save();
        bufCtx.clearRect(0, 0, w, h);

        bufCtx.translate(lastEvent.translate[0], lastEvent.translate[1]);
        bufCtx.scale(lastEvent.scale, lastEvent.scale);

        var n, l, i, j,
            img,
            d, d1, d2,
            c, x, y, s;


        if (setting.showFile) {
            n = d3.nest()
                .key(function(d) {
                    return d.opacity;
                })
                .key(function(d) {
                    return d.flash ? ncb(d) : d3.rgb(nc(d));
                })
                .entries(_force.nodes().filter(function(d) { return checkVisible(d) && (d.visible || d.alive); }));

            l = n.length;

            while(--l > -1) {
                d1 = n[l];
                i = d1.values.length;
                while(--i > -1) {
                    d2 = d1.values[i];
                    j = d2.values.length;

                    c = d3.rgb(d2.key);

                    if (!setting.showHalo) {
                        bufCtx.beginPath();
                        bufCtx.strokeStyle = "none";
                        bufCtx.fillStyle = toRgba(c, d1.key * .01);
                    }
                    else
                        img = colorize(particle, c.r, c.g, c.b, d1.key * .01);

                    while(--j > -1) {
                        d = d2.values[j];
                        if (d.visible || d.alive) {
                            //blink(d, setting.fileLife > 0);
                            x = Math.floor(d.x);
                            y = Math.floor(d.y);

                            s = radius(nr(d)) * (setting.showHalo ? 8 : 1);
                            setting.showHalo
                                ? bufCtx.drawImage(img, x - s / 2, y - s / 2, s, s)
                                : bufCtx.arc(x, y, s, 0, PI_CIRCLE, true)
                                ;
                        }
                    }

                    if (!setting.showHalo) {
                        bufCtx.fill();
                        bufCtx.stroke();
                        bufCtx.closePath();
                    }
                }
            }
        }

        if (setting.showUser || setting.showLabel) {
            n = _forceAuthor.nodes();
            l = n.length;

            while(--l > -1) {
                d = n[l];
                if (checkVisible(d) && (d.visible || d.opacity)) {
                    //blink(d, !d.links && setting.userLife > 0);

                    x = Math.floor(d.x);
                    y = Math.floor(d.y);

                    if (setting.showUser) {
                        c = d.flash ? ncb(d) : d3.rgb(nc(d));
                        bufCtx.save();

                        if (setting.showPaddingCircle) {
                            bufCtx.beginPath();
                            bufCtx.strokeStyle = "none";
                            bufCtx.fillStyle = toRgba("#ff0000", .1);
                            bufCtx.arc(x, y, nr(d) + setting.padding, 0, PI_CIRCLE, true);
                            bufCtx.fill();
                            bufCtx.stroke();
                        }

                        bufCtx.beginPath();
                        bufCtx.strokeStyle = "none";
                        bufCtx.fillStyle = setting.useAvatar ? "none" : toRgba(c, d.opacity * .01);
                        bufCtx.arc(x, y, nr(d), 0, PI_CIRCLE, true);
                        bufCtx.fill();
                        bufCtx.stroke();
                        if (setting.useAvatar && d.img) {
                            bufCtx.clip();
                            bufCtx.drawImage(setOpacity(d.img, d.opacity * .01, d.flash), x - nr(d), y - nr(d), nr(d) * 2, nr(d) * 2);
                        }
                        bufCtx.closePath();

                        bufCtx.restore();
                    }

                    if (setting.showLabel) {
                        c = d.flash ? "white" : "gray";

                        bufCtx.save();

                        bufCtx.fillStyle = toRgba(c, d.opacity * .01);
                        bufCtx.fillText(setting.labelPattern
                            .replace("%l", d.nodeValue.login)
                            .replace("%n", d.nodeValue.name != "unknown" ? d.nodeValue.name : d.nodeValue.login)
                            .replace("%e", d.nodeValue.email), x, y + nr(d) * 1.5);

                        bufCtx.restore();
                    }
                }
            }
        }

        bufCtx.restore();
    }

    function anim() {
        requestAnimationFrame(anim);

        lHis && lHis.style("display", setting.showHistogram ? null : "none");
        lLeg && lLeg.style("display", setting.showCountExt ? null : "none");

        if (valid)
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
        if (_force.nodes()) {

            _force.nodes()
                .forEach(cluster(0.025));

            _forceAuthor.nodes(
                _forceAuthor.nodes()
                    .filter(function(d, i) {
                        blink(d, !d.links && setting.userLife > 0, i, _forceAuthor.nodes().length);
                        if (d.visible && d.links === 0 && setting.userLife > 0) {
                            d.flash = 0;
                            d.alive = d.alive / 10;
                        }
                        return d.visible;
                    })
            );
        }

        _forceAuthor.resume();
        _force.resume();
    }

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {

        authorHash.forEach(function(k, d) {
            d.links = 0;
        });

        return function(d, i) {
            blink(d, setting.fileLife > 0, i, _force.nodes().length);
            if (!d.author || !d.visible)
                return;

            var node = authorHash.get(d.author),
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
            i, ny
            ;

        var y = d3.scale.linear()
            .range([0, h2])
            .domain([0, extMax]);

        lHis = (lHis || layer.append("g"))
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
                return "translate(" + [ d.x -= d.w - 1, 0] + ")";
            })
            .filter(function(d) {
                return d.x < 0;
            })
            .remove();
    }

    function initLegend() {
        if (!layer)
            return;

        var mt = 48,
            ml = w * .01,
            h2 = h / 2 - mt,
            w3 = w / 3
            ;

        lLeg = (lLeg || layer.append("g"))
            .attr("width", w3)
            .attr("height", h2)
            .attr("transform", "translate(" + [ml, mt] + ")");

        lLeg.selectAll("*").remove();

        var g = lLeg.selectAll(".gLeg")
            .data(extHash.entries(), function(d) { return d.key; });

        g.exit().remove();

        g.enter().append("g")
            .attr("class", "gLeg")
            .attr("transform", function(d, i) {
                return "translate(" + [0, i * 18] + ")";
            })
            .style("visibility", "hidden")
        ;
        g.append("rect")
            .attr("height", 16)
            .style("fill", function(d) { return d.value.color; })
        ;
        g.append("text")
            .attr("class", "gttLeg")
            .style("font-size", "13px")
            .text(function(d) { return d.key.substr(1); })
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

    function updateLegend(sha) {
        if (!lLeg || lLeg.empty())
            return;

        var g = lLeg.selectAll(".gLeg");

        function wl(d) {
            return d.value.now.length;
        }

        var wb = 9 * d3.max(g.data(), function(d) {
            return ((wl(d) || "") + "").length;
        });

        g.selectAll("rect")
            .attr("width", wb)
        ;

        g.selectAll(".gttLeg")
            .attr("transform", "translate(" + [wb + 2, 12] + ")")
        ;

        g.selectAll(".gtLeg")
            .text(wl)
        ;

        g.sort(sortLegK).sort(sortLeg)
            .style("visibility", function(d, i) {
                return !wl(d) || i * 18 > lLeg.attr("height") ? "hidden" : "visible";
            })
            .transition()
            .duration(500)
            .attr("transform", function(d, i) {
                return "translate(" + [0, i * 18] + ")";
            })
        ;

    }

    vis.runShow = function(data, svg, params) {
        if (_worker)
            clearInterval(_worker);

        _data = data && data.commits ? data.commits.values().sort(vis.sC) : null;

        if (!_data || !_data.length)
            return;

        setting = ghcs.settings.cs;

        vis.layers.repo && cbDlr.uncheck();
        vis.layers.stat && cbDlsr.uncheck();

        dateRange = d3.extent(data.dates);

        layer = d3.select("#canvas");
        layer.select("#mainCanvas").remove();

        lastEvent = {
            translate: [0, 0],
            scale : 1
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
            .on("zoom", function() {
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

        canvas = layer.append("canvas")
            .text("This browser don't support element type of Canvas.")
            .attr("id", "mainCanvas")
            .attr("width", w)
            .attr("height", h)
            .call(zoom)
            .node();

        ctx = canvas.getContext("2d");

        bufCanvas = document.createElement("canvas");
        bufCanvas.width = w;
        bufCanvas.height = h;

        bufCtx = bufCanvas.getContext("2d");

        bufCtx.font = "normal normal " + setting.sizeUser / 2 + "px Tahoma";
        bufCtx.textAlign = "center";

        layer = svg || vis.layers.show;
        layer && layer.show && layer.show();

        layer.append("g")
            .call(zoom)
            .append("rect")
            .attr("width", w)
            .attr("height", h)
            .attr("x", 0)
            .attr("y", 0)
            .style("fill", "#ffffff")
            .style("fill-opacity", 0);

        lHis && lHis.selectAll("*").remove();

        lCom = (
                lCom || layer.append("g")
                    .attr("width", 10)
                    .attr("height", 14)
            )
            .attr("transform", "translate(" + [w/2, h - 18] + ")")
            ;
        lCom.visible = !setting.showCommitMessage;

        lCom.selectAll("text").remove();
        lCom.showCommitMessage = lCom.showCommitMessage || function(text) {
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
                .attr("transform", "translate("+ [0, -lCom.node().childElementCount * 14] +")")
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
                .each("end", function() {
                    lCom.selectAll("text").each(function(d, i) {
                        d3.select(this)
                            .attr("transform", "translate("+ [0, -i * 14] +")");
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
        defImg.src = "default.png";

        particle = new Image();
        particle.src = "particle.png";

        _force = (_force || d3.layout.force()
            .stop()
            .size([w, h])
            .friction(.75)
            .gravity(0)
            .charge(function(d) {return -3 * radius(nr(d)); } )
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
            .charge(function(d) { return -(setting.padding + d.size) * 8
                * (Math.sqrt(d.links / lastEvent.scale) || 1)
                ;
            }))
            .nodes([])
            ;

        initLegend();

        stop = false;
        pause = false;

        run();
        _force.start();
        _forceAuthor.start();
    };

    vis.pauseShow = function() {
        pause = true;
    };

    vis.stopShow = function() {
        stop = true;
        if (_worker)
            clearInterval(_worker);
    };

    vis.resumeShow = function() {
        pause = false;
    };
})(vis || (vis = {}));
