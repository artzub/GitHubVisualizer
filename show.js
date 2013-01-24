/**
 * User: ArtZub
 * Date: 23.01.13
 * Time: 15:00
 */

"use strict";

(function(vis) {
    var _worker, _data, authorHash, filesHash,
        _force, dateRange, nodes,
        fileLife, userLife, groups,
        visTurn, layer, pause, stop,
        works, links, lines;

    var extColor = d3.scale.category20(),
        userColor = d3.scale.category20b();

    var typeNode = {
        author : 0,
        file : 1
    };

    function keyValue(d) {
        return d.id;
    }

    function addItems(g) {
        g.append("circle")
            .attr("class", "scsCircle")
            .attr("r", nr)
        g.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .attr("fill", "white")
            .text(function(d) { return d.type == typeNode.file ? "" : d.author; });
    }

    function fFile(d) {
        return d.type == typeNode.file;
    }

    function fUser(d) {
        return d.type == typeNode.author;
    }

    function updItems(g) {
        g.selectAll("circle.scsCircle")
            .attr("r", nr)
            .style("fill", ncb)
            .transition()
            .delay(200)
            .duration(3000)
            .style("opacity", 1)
            .style("fill", nc);

        if (fileLife)
            g.filter(fFile)
                .transition()
                .delay(fileLife)
                .duration(1500)
                .style("opacity", 0)
                .remove();

        if (userLife)
            g.filter(fUser)
                .transition()
                .delay(userLife)
                .duration(1500)
                .style("opacity", 0)
                .ease("end", function(d) {d.visible = false;})
                .remove();
    }

    function redraw(d) {
        if (stop)
            return;

        var data = [];

        //d.values.forEach(function(k, i) {
        var l = d.nodes.length,
            n, a, u;

        data.push(d.userNode);
        d.userNode.visible = true;
        d.userNode.fixed = false;
        //d.userNode.author = d.userNode.nodeValue.email;
        d.userNode.flash = true;

        if (!l)
            console.log(d);

        while(--l > -1) {
            n = d.nodes[l];
            n.size += .02;
            n.visible = true;
            n.fixed = false;

            a = d.cuserNode ? d.cuserNode : d.userNode;

            /*if (n.author && n.author != a.nodeValue.email) {
                u = authorHash.get(n.author);
                u.links = --u.links <= 0 ? 0 : u.links;
            }*/

            n.author = a.nodeValue.email;
            //a.links++;
            n.flash = 1000;
            data.push(n);

            if (d.cuserNode) {
                links.push({
                    source : n,
                    target : d.cuserNode
                });
            }

            links.push({
                source : n,
                target : d.userNode
            });
        }
        //});
        works = nodes.filter(function(d) {
            return d.visible;
        });
        _force.nodes(works).start();

        /*lines = layer.lines.selectAll(".scsLine")
            .data(links, function(l) {
                return keyValue(l.source) + keyValue(l.target)
            });

        lines.enter().append("path")
            .attr("class", "scsLine")
            .style("stroke", "#ccc")
            .style("stroke-opacity", .5)
            .style("stroke-width", 1)
        ; */

        groups = layer.selectAll(".scsGroup")
            .data(data, keyValue)
        ;

        groups.enter()
            .append("g")
            .attr("class", "scsGroup")
            .attr("transform", tr)
            .call(_force.drag)
            .call(addItems)
        ;

        groups.call(updItems);
    }

    function loop() {

        if (pause)
            return;

        var dl, dr, t;

        dl = dateRange[0];
        dr = dl + ghcs.limits.stepShow * ghcs.limits.stepType;
        dateRange[0] = dr;

        visTurn = _data.filter(function (d) {
            return d.date >= dl && d.date < dr;
        });

        ghcs.asyncForEach(visTurn, redraw, 1000 / (visTurn.length > 1 ? visTurn.length : 1000));

        updateStatus(ghcs.states.cur++, timeFormat(new Date(dr)));

        if (dl > dateRange[1]) {
            if (_worker)
                clearInterval(_worker);
        } else {
            if (!visTurn.length)
                loop();
        }
    }

    function run() {
        if (_worker)
            clearInterval(_worker);

        anim();

        _worker = setInterval(loop, ONE_SECOND);
    }

    function nr(d) {
        return d.size || 0;
    }

    function ncb(d) {
        return d3.rgb(d.color).brighter().brighter();
    }

    function nc(d) {
        return d.color;
    }

    function radius(d) {
        return d;
    }

    function tr(d) {
        return "translate(" + [d.x || 0, d.y || 0] + ")";
    }

    function node(d, type) {
        var c = type == typeNode.file ? d.name : userColor(d.email);
        type == typeNode.file &&
            (c = extColor(c && c.match(/.*(\.\w+)$/) ? c.replace(/.*(\.\w+)$/, "$1") : "Mics"));

        return {
            x : Math.random() * w,
            y : Math.random() * h,
            id : type + (type == typeNode.file ? d.name : d.email),
            size : type != typeNode.file ? 24 : 2,
            weight : type != typeNode.file ? 24 : 2,
            fixed : true,
            visible : false,
            links : 0,
            type : type,
            color : c,
            author : type != typeNode.file ? d.email : null,
            nodeValue : d
        }
    }

    function getAuthor(d) {
        if (!d || !d.author)
            return;

        var n = authorHash.get(d.author.email);

        if (!n) {
            n = node(d.author, typeNode.author);
            authorHash.set(d.author.email, n);
        }
        return n;
    }

    function getFile(d) {
        if (!d || !d.name)
            return;

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

        if (data) {
            i = data.length;
            while(--i > -1) {
                d = data[i];
                d.nodes = [];
                if (!d) continue;

                n = getAuthor(d);
                d.userNode = n;
                !n.inserted && (n.inserted = ns.push(n))
                if (d.author.login != d.committer.login) {
                    n = getAuthor(d);
                    d.cuserNode = n;
                    !n.inserted && (n.inserted = ns.push(n))
                    links.push({
                        source : d.userNode,
                        target : d.cuserNode
                    })
                }

                if (!d.files) continue;

                j = d.files.length;
                while(--j > -1) {
                    df = d.files[j];
                    if (!df) continue;

                    n = getFile(df);
                    d.nodes.push(n);
                    !n.inserted && (n.inserted = ns.push(n));
                }
            }
        }
        return ns;
    }

    var inrun = false;

    function anim() {

        var quadtree = d3.geom.quadtree(_force.nodes());
        layer.selectAll(".scsGroup")
            .each(cluster(0.05))
            .each(collide(.5, quadtree));
    }

    function tick(e) {
        anim();
        layer.selectAll(".scsGroup")
            .attr("transform", tr)
            .filter(function(d) {
                /*if (d.links === 0)
                    d.visible = false;*/
                return d.links === 0;
            })
            .transition()
            .duration(150)
            .style("opacity", 0)
            .remove();


        layer.lines.selectAll(".scsLine")
             .attr("d", function(l) {
                return "M" + [l.source.x, l.source.y] + " L" + [l.target.x, l.target.y];
            });

        _force.resume();
    }

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {

        authorHash.forEach(function(k, d) {
            d.links = 0;
        });

        return function(d) {
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
            r = radius(nr(d)) + radius(nr(node)) * 1.5;
            if (l != r) {
                l = (l - r) / (l || 1) * (alpha || 1);
                x *= l;
                y *= l;

                //if (!d.fixed) {
                if (true) {
                    d.x -= x;
                    d.y -= y;
                }
                //if (!node.fixed) {
                if (true) {
                    node.x += x;
                    node.y += y;
                }
            }
        };
    }

    // Resolves collisions between d and all other circles.
    function collide(alpha, quadtree) {
        return function(d) {
            if(!d.visible || !d.links)
                return;

            var padding = 48,
                r = radius(nr(d)) + 3 * padding,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && quad.point.visible && quad.point.links && (quad.point !== d)) {
                    var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = (radius(nr(d)) + radius(nr(quad.point))) + (d.author !== quad.point.author) * padding;
                    if (l < r) {
                        l = (l - r) / (l || 1) * (alpha || 1);

                        x *= l;
                        y *= l;

                        //if (!d.fixed) {
                        if (true) {
                            d.x -= x;
                            d.y -= y;
                        }
                        //if (!quad.point.fixed) {
                        if (true) {
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                }
                return x1 > nx2
                    || x2 < nx1
                    || y1 > ny2
                    || y2 < ny1;
            });
        };
    }

    vis.runShow = function(data, _layer) {
        if (_worker)
            clearInterval(_worker);

        if (!data || !data.commits)
            return;

        layer = _layer || vis.layers.show;

        vis.layers.repo && vis.layers.repo.hide();
        vis.layers.stat && vis.layers.stat.hide();

        dateRange = d3.extent(data.dates);
        visTurn = null;

        layer.selectAll(".lG").remove();
        layer.lines = layer.append("g").attr("class", "lG");
        layer.selectAll(".scsGroup").remove();

        psBar.show();
        ghcs.states.cur = 0;
        ghcs.states.max = Math.round((dateRange[1] - dateRange[0]) / (ghcs.limits.stepShow * ghcs.limits.stepType));


        links = [];
        nodes = initNodes(_data = data.commits.slice(0).sort(vis));

        _force = (_force || d3.layout.force())
            .stop()
            .size([w, h])
            .friction(.8)
            .theta(1)
            .gravity(.005)
            //.linkStrength(24)
            //.linkDistance(function(d) { return (Math.abs(d.source.size) + Math.abs(d.target.size)) + 32; })
            .charge(function(d) { return -d.size; })
            .on("tick", tick)
            .nodes(works = [])
            //.links(links)
            .start()
            .stop();

        groups = null;

        stop = false;
        pause = false;

        run();
        _force.start();
    }

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
