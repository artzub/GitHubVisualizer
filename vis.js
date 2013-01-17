/**
 * User: ArtZub
 * Date: 15.01.13
 * Time: 1:34
 */

'use strict';

var PIdiv2 = Math.PI / 2,
    smallRad = PIdiv2 * (1 / 15),
    ONE_DAY = 24 * 60 * 60 * 1000,
    TT_PAD = 8
    ;

var colors = {
    added : "#ddffdd",
    deleted : "#ffdddd",
    center : "#FF6600",
    stroked : "#f9f9f9",
    addedFile : "#A5EC6E",
    modifiedFile : "#FFB877",
    deletedFile : "#FF77B5"
};

function toRgba(color, a) {
    color = d3.rgb(color);
    return "rgba(" + [color.r, color.g, color.b, a || 1] + ")";
}



var vis = {
    sC : function(a, b) {
        return d3.ascending(b.date, a.date);
    },
    meArc : function(d) {
        if (!d._g)
            return;

        d._g.selectAll("path.bar")
            .style({
                "fill" : function(d) { return toRgba(d3.select(this).style("fill").replace("a", ""), .6); },
                "stroke-width" : 1,
                "stroke" : function(d) { return toRgba("#000000", 1); }
            });

        this.barDel && this.barDel
            .transition()
            .attr("d", this.delArc.startAngle(PIdiv2 + smallRad )
                .endAngle(PIdiv2 * 3 - smallRad)())
        ;

        this.barAdd && this.barAdd
            .transition()
            .attr("d", this.addArc.startAngle(-PIdiv2 + smallRad )
                .endAngle(PIdiv2 - smallRad)())
        ;

        d._g.selectAll("text.del, text.add")
            .style("visibility", "visible");
    },
    mlArc : function(d) {
        if (!d._g)
            return;

        d._g.selectAll("path.bar")
            .style({
                "fill" : function(d) { return toRgba(d3.select(this).style("fill").replace("a", ""), .3); },
                "stroke" : null
            });

        this.barDel && this.barDel
            .transition()
            .duration(750)
            .ease("elastic")
            .attr("d", this.delArc.startAngle(Math.PI - smallRad)
                .endAngle(Math.PI + smallRad)())
        ;

        this.barAdd && this.barAdd
            .transition()
            .duration(750)
            .ease("elastic")
            .attr("d", this.addArc.startAngle(- smallRad )
                .endAngle(smallRad)())
        ;

        d._g.selectAll("text.del")
            .style("visibility", d.stats && d.stats.delTextVis ? d.stats.delTextVis : "hidden");

        d._g.selectAll("text.add")
            .style("visibility", d.stats && d.stats.addTextVis ? d.stats.addTextVis : "hidden");
    },
    mmArc : function(d) {
        vis.mtt(d);
    },
    mdRepo : function(d) {
    },
    meRepo : function(d) {
        d._tg = d._g;
        d._tg.selectAll("circle")
            .style("fill", d3.rgb(vis.forceRep.colors(d.nodeValue.lang)).brighter());
        d._tg.selectAll("text")
            .style("fill", function(d) {
                return d3.rgb(vis.forceRep.colors(d.nodeValue.lang)).darker();
            });
            //.style("visibility",  "visible");
        toolTip.html([
            "<h1>", d.nodeValue.name, "</h1><hr>",
            "<blockquote>", d.nodeValue.desc, "</blockquote><br />",
            "<small>Primary language: <strong style='text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);color:", vis.forceRep.colors(d.nodeValue.lang) ,"'>", d.nodeValue.lang, "</strong></small>"
        ].join(""))
        toolTip.show();
    },
    mlRepo : function(d, i) {
        if (vis.forceRep.selected && vis.forceRep.selected == d && i !== "deselect") {
            vis.muRepo(d);
        }
        else {
            var g = d._tg || d._g;
            g.selectAll("circle")
                .style("fill", toRgba(vis.forceRep.colors(d.nodeValue.lang), vis.forceRep.opt(d.nodeValue.date)));
            g.selectAll("text")
                .style("fill", function(d) {
                    return d3.rgb(vis.forceRep.colors(d.nodeValue.lang)).brighter();
                })
                .style("visibility",  vis.forceRep.visible);
            d._tg = null;
        }
        toolTip.hide();
    },
    clRepo : function(d) {
        if (vis.forceRep.selected && vis.forceRep.selected == d)
            vis.forceRep.selected = null;
        else {
            if (vis.forceRep.selected) {
                vis.mlRepo(vis.forceRep.selected, "deselect");
                toolTip.show();
            }

            vis.forceRep.selected = d;
        }
        chSelect(vis.forceRep.selected);
    },
    muRepo : function(d){
    },
    mtt : function(d) {
        if (toolTip) {
            var e = d3.event;
            if (arguments.length > 3)
                e = arguments[3];
            toolTip
                .style("top", e.pageY > h / 2 ? (e.pageY - toolTip.node().clientHeight - TT_PAD) + "px" : (e.pageY + TT_PAD) + "px")
                .style("left", e.pageX > w / 2 ? (e.pageX - toolTip.node().clientWidth - TT_PAD) + "px" : (e.pageX + TT_PAD) + "px")
            ;
        }
    },
    redrawStat: function(data, layout) {

        layout = layout || vis.layouts.stat;

        var textFormat = d3.format(",");

        var bd = d3.extent(data.dates);
        var delta = (bd[1] - bd[0]) * 0.1;

        delta = delta || ONE_DAY;

        bd = [bd[0] - delta, bd[1] + delta];

        var x = d3.time.scale()
            .domain(d3.extent(bd))
            .range([0, w - margin.left - margin.right])
            ;

        var h6 = h/6;

        var y = d3.scale.linear()
            .range([2, h6 * 2])
            .domain([0, ghcs.repo.stats.changes || 1]);

        var sorted = data.commits.slice(0).concat([
            { date : bd[0] + delta / 2, f : { d : 0, a : 0, m : 0 } },
            { date : bd[1] - delta / 2, f : { d : 0, a : 0, m : 0 } }
        ]).sort(vis.sC);

        var layers =
            [
                {
                    color: colors.deletedFile,
                    values: sorted.map(function (d) {
                        return {t : 1, x: d.date, y0 : 0, y: (d.stats ? d.stats.f.d : 0)}
                })},
                {
                    color: colors.modifiedFile,
                    values: sorted.map(function (d) {
                        return {x: d.date, y0 : 0, y: (d.stats ? d.stats.f.m : 0)}
                })},
                {
                    color: colors.addedFile,
                    values: sorted.map(function (d) {
                        return {x: d.date, y0: (d.stats ? d.stats.f.m : 0), y : (d.stats ? d.stats.f.a : 0)}
                })}
            ]
        ;

        var y1 = d3.scale.linear()
                .range([h6 * 3, h6 * 1.5])
                .domain([0, ghcs.repo.stats.files]),
                //.domain([0, d3.max(layers, function(layer) { return d3.max(layer.values, function(d) { return d.y0 + d.y; }); })]),
            area = d3.svg.area()
                .interpolate(false ? "linear" : "basis")
                .x(function(d) { return x(d.x); })
                .y0(function(d) { return y1(d.y0); })
                .y1(function(d) { return !d.t ? y1(d.y0 + d.y) : y1(d.y0 + d.y) + (d.y ? y1(d.y0) : 0); })
            ;

        var xAxis = d3.svg.axis()
            .scale(x)
            ;

        layout.cont = layout.cont || layout
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        ;

        layout.cont.selectAll("path.areaFile").remove();

        layout.cont.selectAll("path.areaFile")
            .data(layers)
            .enter()
            .insert("path", ":first-child")
            .attr("class", "areaFile")
            .style("fill", function(d) { return toRgba(d.color, .1); })
            .transition()
            .duration(750)
            .attr("d", function(d) { return area(d.values); })
        ;


        layout.cont.axis = layout.cont.axis || layout.cont.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h/2 + ")")
        ;

        layout.cont.axis
            .selectAll("*").remove();

        layout.cont.axis
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start")
        ;

        layout.cont.points = layout.cont.points || layout.cont.append("g")
            .attr("transform", "translate(0," + h/2 + ")")
        ;

        var cData = layout.cont.points.selectAll("g.com")
            .data(data.commits, function(d) { return d.sha; });
        cData.enter()
            .append("g")
            .attr("class", "com")
            .on("mouseover", vis.meArc)
            .on("mouseout", vis.mlArc)
            .on("mousemove", vis.mmArc)
        ;

        cData.each(function(d, g) {
            g = d._g = d3.select(this);
            g.transition()
                .duration(1500)
                .ease("elastic")
                .attr("transform", "translate(" + [ x(d.date)/* - bandWidth/2*/, 0] + ")");

            this.center = this.center || g.append("circle")
                .attr("r", 2)
                .style("fill", colors.center)
            ;

            if (!d.stats)
                return;

            var add = this.addArc = d3.svg.arc()
                    .innerRadius(1)
                    .outerRadius(1)
                    .startAngle(- smallRad )
                    .endAngle(smallRad)
            ;
            var del = this.delArc = d3.svg.arc()
                    .innerRadius(1)
                    .outerRadius(1)
                    .startAngle(Math.PI - smallRad)
                    .endAngle(Math.PI + smallRad)
            ;

            (this.barAdd || (
                    this.barAdd = g.append("path")
                        .attr("class", "bar")
                        .style({
                            "fill" : toRgba(colors.added, .3)
                        })
                        .attr("d", add())
                    ))
                .transition()
                .duration(750)
                .ease("elastic")
                .attr("d", add.outerRadius(y(d.stats.additions))())
            ;

            (this.barDel || (
                    this.barDel = g.append("path")
                        .attr("class", "bar")
                        .style({
                            "fill" : toRgba(colors.deleted, .3)
                        })
                        .attr("d", del())
                    ))
                .transition()
                .duration(750)
                .ease("elastic")
                .attr("d", del.outerRadius(y(d.stats.deletions))())
            ;

            function sized(s, k) {
                return s * (1 + k);
            }

            var addTop = this.addArcTop = d3.svg.arc()
                    .innerRadius(sized(y(d.stats.additions), .015))
                    .outerRadius(sized(y(d.stats.additions), .025))
                    .startAngle(- smallRad )
                    .endAngle(smallRad)
                ;
            var delTop = this.delArcTop = d3.svg.arc()
                    .innerRadius(sized(y(d.stats.deletions), .015))
                    .outerRadius(sized(y(d.stats.deletions), .025))
                    .startAngle(Math.PI - smallRad)
                    .endAngle(Math.PI + smallRad)
                ;

            (this.barAddTop || (
                    this.barAddTop = g.append("path")
                        .style("fill", toRgba(colors.added))
                    ))
                .attr("d", addTop())
            ;

            (this.barDelTop || (
                    this.barDelTop = g.append("path")
                        .style("fill", toRgba(colors.deleted))
                    ))
                .attr("d", delTop())
            ;

            if (d.stats.additions) {
                d.stats.addTextVis = sized(y(d.stats.additions), .029) > h6 / 2 ? "visible" : "hidden";
                (this.labelAdd || (
                        this.labelAdd = g.append("text")
                            .attr("class", "add")
                            .attr("dy", "-.31em")
                            .attr("text-anchor", "middle")
                            .style("fill", colors.added)
                            .text(" + " + textFormat(d.stats.additions))
                        ))
                    .attr("transform", "translate(" + [0, -sized(y(d.stats.additions), .027)] + ")")
                    .attr("visibility", d.stats.addTextVis)
                ;
            }

            if (d.stats.deletions) {
                d.stats.delTextVis = sized(y(d.stats.deletions), .029) > h6 / 2 ? "visible" : "hidden";
                (this.labelDel || (
                    this.labelDel = g.append("text")
                        .attr("class", "del")
                        .attr("dy", ".93em")
                        .attr("text-anchor", "middle")
                        .style("fill", colors.deleted)
                        .text(" - " + textFormat(d.stats.deletions))
                    ))
                    .attr("transform", "translate(" + [0, sized(y(d.stats.deletions), .027)] + ")")
                    //rotate(180)
                    .attr("visibility", d.stats.delTextVis)
                ;
            }
        });

        cData.sort(function(a, b) {
            return a.stats && b.stats ? d3.ascending(b.stats.changes, a.stats.changes) : 0;
        });

        cData.exit().remove();
    },
    clearRepos : function() {
        if (vis.forceRep) {
            vis.forceRep.stop().nodes([]);
            delete vis.forceRep;
        }

        vis.layouts && vis.layouts.repo && vis.layouts.repo.selectAll(".cRepo")
            .transition()
            .duration(750)
            .ease("elastic")
            .remove();
    },
    redrawRepos : function(data, layout) {

        layout = layout || vis.layouts.repo;

        if (!data) {
            vis.clearRepos();
            return;
        }

        function tr(d) {
            return "translate(" + [d.x, d.y] + ")";
        }

        vis.forceRep = vis.forceRep || d3.layout.force()
            .size([w, h])
            .friction(.9)
            .gravity(.05)
            .charge(function(d) { return -vis.forceRep.radius(d.nodeValue.size) * 5; })
            .on("tick", tick)
        ;

        var padding = 16;

        (vis.forceRep.radius || (vis.forceRep.radius = d3.scale.linear()))
                .range([10, (h > w ? h : w) * .1])
                .domain(d3.extent(data, function(d) { return d.nodeValue.size })),
        (vis.forceRep.opt || (vis.forceRep.opt = d3.scale.linear().range([.4, .8])))
                .domain(d3.extent(data, function(d) { return d.nodeValue.date })),
        vis.forceRep.colors = vis.forceRep.colors || d3.scale.category20();

        vis.forceRep.visible = function(d) {
            return vis.forceRep.radius.range()[1] / 4 <= vis.forceRep.radius(d.nodeValue.size) ? null : "hidden";
        };

        vis.forceRep.appCT = vis.forceRep.appCT || function(g) {
            g.each(function(d) {
                d._g = d3.select(this);
            });
            g.append("circle")
                .attr("r", 0);
            g.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", ".31em")
                .text(function(d) { return d.nodeValue.name; })
        };

        vis.forceRep.upCT = vis.forceRep.upCT || function(g) {
            g.selectAll("circle")
                .style("stroke-width", 1)
                .style("stroke", function(d) { return toRgba(d3.rgb(vis.forceRep.colors(d.nodeValue.lang)), 1); })
                .style("fill", function(d) { return toRgba(vis.forceRep.colors(d.nodeValue.lang), vis.forceRep.opt(d.nodeValue.date)); })
                .transition()
                .duration(2500)
                .ease("elastic")
                .attr("r", function(d) { return vis.forceRep.radius(d.nodeValue.size); })
            g.selectAll("text")
                .style("fill", function(d) {
                    return d3.rgb(vis.forceRep.colors(d.nodeValue.lang)).brighter();
                })
                .style("visibility", vis.forceRep.visible);
        };

        vis.forceRep
            .stop()
            .nodes(data)
            .start()
        ;

        vis.forceRep.circle = layout.selectAll(".cRepo")
            .data(data, function(d) { return d.nodeValue.id })
        ;

        vis.forceRep.circle.enter()
            .append("g")
            .attr("class", "cRepo")
            .attr("transform", tr)

            .call(vis.forceRep.drag)

            /*.on("mouseover.force", vis.forceRep.meRepo)
            .on("mouseout.force", vis.forceRep.mlRepo)*/
            .on("mouseover.select", vis.meRepo)
            .on("mouseout.select", vis.mlRepo)

            .on("mousedown.select", vis.mdRepo)
            .on("mouseup.select", vis.muRepo)

            .on("mousemove.mtt", vis.mtt)
            .on("click.select", vis.clRepo)

            .call(vis.forceRep.appCT);

        vis.forceRep.circle.call(vis.forceRep.upCT);

        vis.forceRep.circle.exit().remove();

        function tick(e) {
            var quadtree = d3.geom.quadtree(vis.forceRep.nodes());
            vis.forceRep.circle
                .each(cluster(.025/*10 * e.alpha * e.alpha*/))
                .each(collide(.5, quadtree))
                .attr("transform", tr);
            vis.forceRep.resume();
        }

        // Move d to be adjacent to the cluster node.
        function cluster(alpha) {
            vis.forceRep.cenralNodes = vis.forceRep.cenralNodes || {};

            // Find the largest node for each cluster.
            vis.forceRep.nodes().forEach(function(d, n) {
                n = vis.forceRep.cenralNodes[d.nodeValue.lang];
                (!n || d.nodeValue.size > n.nodeValue.size) &&
                    (vis.forceRep.cenralNodes[d.nodeValue.lang] = d);
            });

            return function(d) {
                var node = vis.forceRep.cenralNodes[d.nodeValue.lang],
                    l,
                    r,
                    x,
                    y;

                if (node == d) return;

                x = d.x - node.x;
                y = d.y - node.y;
                l = Math.sqrt(x * x + y * y);
                r = vis.forceRep.radius(d.nodeValue.size) + vis.forceRep.radius(node.nodeValue.size);
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
                var r = vis.forceRep.radius(d.nodeValue.size) /** 1.2 + padding*/ + vis.forceRep.radius.range()[1] + padding,
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = (vis.forceRep.radius(d.nodeValue.size) + vis.forceRep.radius(quad.point.nodeValue.size)) + (d.nodeValue.lang !== quad.point.nodeValue.lang) * padding;
                            //radius(d.nodeValue.size) + radius(quad.point.nodeValue.size) + (d.lang !== quad.point.lang) * padding;
                        if (l < r) {
                            l = (l - r) / (l || 1) * (alpha || 1);

                            x *= l;
                            y *= l;

                            /*d.x -= x;
                            d.y -= y;

                            quad.point.x += x;
                            quad.point.y += y;*/

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
    }
};

function initGraphics(svg) {

    vis.layouts = {
        repo : svg.append("g").attr("width", w).attr("height", h),
        stat : svg.append("g").attr("width", w).attr("height", h),
        view : svg.append("g").attr("width", w).attr("height", h)
    };

    vis.inited = true;
}



