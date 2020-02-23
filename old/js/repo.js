/**
 * User: ArtZub
 * Date: 23.01.13
 * Time: 13:29
 */

'use strict';

(function(vis) {

    vis.mdRepo = function(d) {
    };
    vis.meRepo = function(d) {

        vis.layers.repo.langHg
        && vis.layers.repo.langHg.style("pointer-events", "none");

        vis.layers.repo.toFront();

        d._tg = (d._g || (d._g = d3.select(this)));
        d._tg.selectAll("circle")
            .style("fill", d3.rgb(vis.forceRep.colors(d.nodeValue.lang)).brighter());
        d._tg.selectAll("text")
            .style("fill", d3.rgb(vis.forceRep.colors(d.nodeValue.lang)).darker())
            .style("visibility",  "visible");

        toolTip.selectAll("*").remove();

        toolTip.append("span")
            .style({
                "float": "left",
                "margin-top": "5px",
                "margin-bottom": "-5px",
                "margin-right": "10px"
            })
            .attr("class", "mega-icon mega-icon-" +  (!d.nodeValue.forked ? "public-repo" : "repo-forked"));
        toolTip.append("h1")
            .text(d.nodeValue.name);
        toolTip.append("hr");

        d.nodeValue.desc
            && toolTip.append("blockquote")
                .text(d.nodeValue.desc)
            && toolTip.append("br")
        ;

        toolTip.append("span")
            .attr("class", "mini-icon mini-icon-time");
        toolTip.append("strong")
            .style("margin-left", "5px")
            .text(timeFormat(d.nodeValue.date) + " (" + shortTimeFormat(d.nodeValue.cdate) + ")");
        toolTip.append("br");

        toolTip.append("span")
            .style("color", "#ccc")
            .attr("class", "mini-icon mini-icon-star");
        toolTip.append("strong")
            .style({
                "margin-left" : "5px",
                "padding-right": "3px",
                "border-right" : "1px dotted #f9f9f9"
            })
            .text(d.nodeValue.watchers);

        toolTip.append("strong")
            .style("margin-left", "3px")
            .text(d.nodeValue.forks);
        toolTip.append("span")
            .style("color", "#ccc")
            .style("margin-left", "4px")
            .attr("class", "mini-icon mini-icon-public-fork");
        toolTip.append("br");

        toolTip.append("span")
            .text("Primary language: ")
            .append("strong")
            .style("color", vis.forceRep.colors(d.nodeValue.lang))
            .style("text-shadow", "0 0 3px rgba(0, 0, 0, 0.8)")
            .text(d.nodeValue.lang);

        toolTip.show();
    };
    vis.mlRepo = function(d, i) {

        if (vis.forceRep.selected && vis.forceRep.selected == d && i !== "deselect") {
            vis.muRepo(d);
        }
        else {
            var g = d._tg || d._g;

            if (!g)
                return;

            g.selectAll("circle")
                .style("fill", toRgba(vis.forceRep.colors(d.nodeValue.lang), vis.forceRep.opt(vis.forceRep.radO(d))));
            g.selectAll("text")
                .style("fill", d3.rgb(vis.forceRep.colors(d.nodeValue.lang)).brighter())
                .style("visibility",  vis.forceRep.visible);
            d._tg = null;
        }

        vis.layers.repo.langHg
        && vis.layers.repo.langHg.style("pointer-events", "all");

        toolTip.hide();
    };
    vis.clRepo = function(d) {
        if (d3.event && d3.event.defaultPrevented)
            return;

        if (vis.forceRep.selected && vis.forceRep.selected == d) {
            GAEvent.Repos.Deselect(ghcs.login + "/" + d.nodeValue.name);
            vis.forceRep.selected = null;
            d && (d.fixed = 4);
        }
        else {
            if (vis.forceRep.selected) {
                vis.forceRep.selected.fixed = 0;
                vis.mlRepo(vis.forceRep.selected, "deselect");
                toolTip.show();
                vis.layers.repo.langHg
                && vis.layers.repo.langHg.style("pointer-events", "none");
            }

            GAEvent.Repos.Select(ghcs.login + "/" + d.nodeValue.name);
            vis.forceRep.selected = d;
            d && (d.fixed = true);
        }
        chSelect(vis.forceRep.selected);
    };
    vis.muRepo = function(d){
    };

    vis.meForDragFix = function (d) {
        d.fixed |= 4;
        d.px = d.x;
        d.py = d.y;
    };

    vis.moForDragFix = function (d) {
        d.fixed &= ~4;
    };


    function hideShowRepos(type, hidden) {
        vis.forceRep.circle
            .filter(type)
            .transition()
            .duration(750)
            .style("opacity", hidden ? 0 : 1)
            .each(function(d) {
                d.visible = !hidden;
            });
    }

    vis.hideShowSourceRepos = function(hidden) {
        hideShowRepos(fSource, hidden);
    };

    vis.hideShowForkRepos = function(hidden) {
        hideShowRepos(fFork, hidden);
    };


    vis.clearRepos = function() {
        if (vis.forceRep) {
            vis.forceRep.stop().nodes([]);
            delete vis.forceRep;
        }

        delete vis.reposGroup;

        vis.layers && vis.layers.repo && vis.layers.repo.selectAll("*")
            .transition()
            .duration(750)
            .ease("elastic")
            .remove();
        vis.layers.repo.langHg = null;
    };

    function tr(d) {
        return "translate(" + [d.x, d.y] + ")";
    }

    var zoom = d3.behavior.zoom()
        .scaleExtent([.5, 1])
        ;

    function zoomed() {
        this.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    vis.redrawRepos = function(data, layout) {

        layout = layout || vis.layers.repo;

        if (!data) {
            vis.clearRepos();
            return;
        }

        vis.forceRep = vis.forceRep || d3.layout.force()
            .size([w, h])
            .friction(.99)
            .gravity(.005)
            .charge(function(d) { return -vis.forceRep.radius(vis.forceRep.rad(d)) / 2; })
            .on("tick", tick)
        ;

        vis.forceRep.dateNow = Date.now();
        vis.forceRep.rad = vis.forceRep.rad || function (d) {
            return d.nodeValue.cdate;
        };

        vis.forceRep.radO = vis.forceRep.radO || function (d) {
            return d.nodeValue.date - vis.forceRep.dateNow;
        };

        data = data.sort(function(a, b) { return a.nodeValue.date - b.nodeValue.date; });

        var kof = (h > w ? h : w) / (4 * ((Math.log(data.length || 1) / Math.log(1.5)) || 1));

        var r = [kof / 5, kof];

        (vis.forceRep.radius || (vis.forceRep.radius = d3.scale.linear()))
            .range(r)
            .domain(d3.extent(data, vis.forceRep.rad));

        data.length == 1 && vis.forceRep.radius.domain([vis.forceRep.radius.domain()[0] - 1, vis.forceRep.radius.domain()[1]]);

        (vis.forceRep.opt || (vis.forceRep.opt = d3.scale.log().range([.01,.9])))
            .domain(
                d3.extent(data, vis.forceRep.radO)
//                    [d3.min(data, vis.forceRep.radO), vis.forceRep.dateNow]
            );
        vis.forceRep.colors = vis.reposColors || (vis.reposColors = d3.scale.category20());

        vis.forceRep.visible = vis.forceRep.visible || function(d) {
            return vis.visualLenght(this) < vis.forceRep.radius(vis.forceRep.rad(d)) * 2.1 ? null : "hidden";
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
                .text(function(d) { return d.nodeValue.name; });

            g.append("line")
                .attr("class", "lA")
                .attr("x", 0)
                .attr("y", 0)
                .style("stroke-width", 1)
                .style("stroke", "white");

            g.append("line")
                .attr("class", "lB")
                .attr("x", 0)
                .attr("y", 0)
                .style("stroke-width", 1)
                .style("stroke", "red");
        };

        vis.forceRep.upCT = vis.forceRep.upCT || function(g) {
            g.selectAll("circle")
                .style("stroke-width", 1)
                .style("stroke", function(d) { return d3.rgb(vis.forceRep.colors(d.nodeValue.lang)); })
                .style("fill", function(d) {  return toRgba(d3.rgb(vis.forceRep.colors(d.nodeValue.lang)), vis.forceRep.opt(vis.forceRep.radO(d)));  })
                .transition()
                .duration(2500)
                .ease("elastic")
                .attr("r", function(d) { return vis.forceRep.radius(vis.forceRep.rad(d)); });
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

        if (!vis.reposGroup) {
            layout.append("rect")
                .attr("width", w)
                .attr("height", h)
                .style("fill", "none")
                .style("pointer-events", "all");
            vis.reposGroup = layout.append("g");
            zoom.center([w *.5, h * .5])
                .on("zoom", zoomed.bind(vis.reposGroup));
            layout.call(zoom)
                .on("mousedown.zoom", null)
                .on("touchstart.zoom", null)
                .on("touchmove.zoom", null)
                .on("touchend.zoom", null);
        }

        vis.forceRep.circle = vis.reposGroup.selectAll(".cRepo")
            .data(data, function(d) { return d.nodeValue.id })
        ;

        vis.forceRep.dragFix = vis.forceRep.dragFix
            || vis.forceRep.drag()
                .on("drag.force",function (d) {
                    d.moving = true;
                    d.px = d3.event.x; d.py = d3.event.y;
                    vis.forceRep.resume();
                })
        ;

        vis.forceRep.circle.enter()
            .append("g")
            .attr("class", "cRepo")
            .attr("transform", tr)

            .on("mousedown.select", vis.mdRepo)
            .on("mouseup.select", vis.muRepo)

            .on("mouseover.select", vis.meRepo)
            .on("mouseout.select", vis.mlRepo)

            .on("mousemove.mtt", vis.mtt)

            .on("click.select", vis.clRepo)

            .call(vis.forceRep.drag)

            .call(vis.forceRep.appCT);

        vis.forceRep.circle.call(vis.forceRep.upCT);

        vis.forceRep.circle.exit().remove();

        function tick(e) {
            var quadtree = d3.geom.quadtree(vis.forceRep.nodes());
            vis.forceRep.circle
                .each(cluster(.025/*10 * e.alpha * e.alpha*/))
                .each(collide(.4, quadtree))
                .attr("transform", tr);
            if (e.alpha < .5)
                vis.forceRep.resume();
        }

        // Move d to be adjacent to the cluster node.
        function cluster(alpha) {
            vis.forceRep.cenralNodes = vis.forceRep.cenralNodes || {};

            // Find the largest node for each cluster.
            vis.forceRep.nodes().forEach(function(d, n) {
                n = vis.forceRep.cenralNodes[d.nodeValue.lang];
                (!n || !n.visible || vis.forceRep.radO(d) > vis.forceRep.radO(n)) && d.visible &&
                (vis.forceRep.cenralNodes[d.nodeValue.lang] = d);
            });

            return function(d) {
                var node = vis.forceRep.cenralNodes[d.nodeValue.lang],
                    l,
                    r,
                    x,
                    y;

                if (node == d || !d.visible) return;

                x = d.x - node.x;
                y = d.y - node.y;
                l = Math.sqrt(x * x + y * y);
                r = vis.forceRep.radius(vis.forceRep.rad(d)) + vis.forceRep.radius(vis.forceRep.rad(node)) * 1.5;
                if (l != r) {
                    l = (l - r) / (l || 1) * (alpha || 1);
                    x *= l;
                    y *= l;

                    d.x -= x;
                    d.y -= y;

                    node.x += x;
                    node.y += y;
                }
            };
        }

        // Resolves collisions between d and all other circles.
        function collide(alpha, quadtree) {
            return function(d) {
                var padding = vis.forceRep.radius.range()[1] * 1.5,
                    r = vis.forceRep.radius(vis.forceRep.rad(d)) + padding,
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d) && d.visible && quad.point.visible) {
                        var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            /*+ (d.nodeValue.lang !== quad.point.nodeValue.lang) * padding*/
                            r = vis.forceRep.radius(vis.forceRep.rad(d)) +
                                vis.forceRep.radius(vis.forceRep.rad(quad.point)) * 1.02;
                        if (l < r) {
                            l = (l - r) / (l || 1) * (alpha || 1);

                            x *= l;
                            y *= l;

                            d.x -= x;
                            d.y -= y;

                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2
                        || x2 < nx1
                        || y1 > ny2
                        || y2 < ny1;
                });
            };
        }
    };
})(vis || (vis = {}));
