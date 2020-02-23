/**
 * User: ArtZub
 * Date: 13.02.13
 * Time: 16:39
 */

"use strict";

(function(vis) {
    var _data
        , _pack
        , _w
        , _h
        , direction = d3.ascending
        , _uColor = d3.scale.category10()
        , _curValue
        , _curSort
        , _colorsGray = ["#999999", "#9C9C9C", "#9F9F9F", "#A2A2A2", "#A5A5A5", "#A8A8A8", "#AAAAAA", "#ADADAD", "#B0B0B0", "#B3B3B3", "#B6B6B6", "#B9B9B9", "#BCBCBC", "#BFBFBF", "#C2C2C2", "#C5C5C5", "#C8C8C8", "#CACACA", "#CDCDCD", "#D0D0D0", "#D3D3D3", "#D6D6D6", "#D9D9D9", "#DCDCDC", "#DFDFDF", "#E2E2E2", "#E5E5E5", "#E8E8E8", "#EAEAEA", "#EDEDED", "#F0F0F0", "#F3F3F3", "#F6F6F6", "#F9F9F9"]
        , _colorsBlue = ["#474766", "#4C4C6A", "#52526F", "#575773", "#5D5D78", "#62627C", "#676781", "#6D6D85", "#72728A", "#78788E", "#7D7D93", "#828297", "#88889B", "#8D8DA0", "#9393A4", "#9898A9", "#9D9DAD", "#A3A3B2", "#A8A8B6", "#ADADBB", "#B3B3BF", "#B8B8C4", "#BEBEC8", "#C3C3CC", "#C8C8D1", "#CECED5", "#D3D3DA", "#D9D9DE", "#DEDEE3", "#E3E3E7", "#E9E9EC", "#EEEEF0", "#F4F4F5", "#F9F9F9"]
        , _colorsWhite = ["none"]
        , _bubbles
        , _layer
        , clipNum = 0
        ;

    var prefixes = {
        empty : "   ",
        abs : "▲  ",
        desc : "▼  ",
        vc : "●",
        vuc : "○"
    };

    var env = {};

    ["Com", "Add", "Del", "FileAdd", "FileDel", "FileMod"].forEach(function(key) {
        env["c" + key] = function(d) {
            return d[key];
        };
        env["s" + key] = function(a, b) {
            return direction(env["c" + key](a), env["c" + key](b));
        };
    });

    function root(fnfl) {
        return {
            key : "",
            type : 0,
            children : _data.filter(fnfl || function(d) { return true; })
        };
    }

    function position(item) {
        item
            .transition()
            .delay(200)
            .duration(1500)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }

    function r_2(d) {
        return r(d)/2;
    }

    function r2(d) {
        return r(d)*2;
    }

    function r(d) {
       return (d.r || 0);
    }

    function radius(item) {
        item.transition()
            .duration(500)
            .attr("r", r);
    }

    function clipRadius(item) {
        item.transition()
            .duration(500)
            .attr("transform", function(d) {
                return "translate(" + [ r(d), r(d) ] + ")";
            })
            .attr("r", r);
    }


    function wh(item) {
        item.transition()
            .duration(500)
            .attr("transform", function(d) {
                return "translate(" + [ -r(d), -r(d) ] + ")";
            })
            .attr("height", r2)
            .attr("width", r2);
    }

    function mover(d) {
        toolTip.selectAll("*").remove();

        toolTip.append("div").attr("class", "row userInfo open").call(function(div) {
            div = div.append("div").attr("class", "statInfo");

            div.node().appendChild(d.nodeValues[0].author.avatar);
            div.append("ul").call(function(ul) {
                (d.nodeValues[0].author.name || d.nodeValues[0].author.login) && ul.append("li").call(function(li) {
                    li.append("h1")
                        .text((d.nodeValues[0].author.name || d.nodeValues[0].author.login))
                    ;
                    li.append("hr");
                });
                ul.append("li").call(function(li) {
                    li.append("span")
                        .attr("class", "mini-icon mini-icon-history");
                    li.append("strong")
                        .text(d.Com + " commits")
                });
                ul.append("li").append("hr");
                ul.append("li")
                    .call(function(li) {
                        var key;
                        li = li.append("ul")
                            .attr("class", "setting");
                        li = li.append("li").attr("class", "field");
                        li.append("h1")
                            .text("Changed files:");
                        var stat = {added : "FileAdd", removed : "FileDel", modified : "FileMod"};
                        for(key in stat) {
                            if (stat.hasOwnProperty(key))
                                li.append("ul")
                                    .attr("class", "group")
                                    .append("li")
                                    .attr("class", "field")
                                    .append("span")
                                    .text(key + ": ")
                                    .append("strong")
                                    .text(d[stat[key]]);
                        }
                    });
                ul.append("li")
                    .call(function(li) {
                        li = li.append("ul")
                            .attr("class", "setting");
                        li = li.append("li").attr("class", "field");
                        li.append("h1")
                            .text("Changed lines:");
                        var stat = {additions : [" + ", "Add"], deletions : [" - ", "Del"]};
                        for(var key in stat) {
                            if (stat.hasOwnProperty(key))
                                li.append("ul")
                                    .attr("class", "group")
                                    .append("li")
                                    .attr("class", "field")
                                    .append("span")
                                    .text(key + ": ")
                                    .append("strong")
                                    .style("color", d3.rgb(colors[key]).darker(.2))
                                    .text(stat[key][0] + textFormat(d[stat[key][1]]));
                        }
                    });

            });
        });

        toolTip.show();
    }

    function mout(d) {
        toolTip.hide();
    }

    function clearSort(selector, classes) {
       _layer.selectAll(selector).classed(classes, false);
    }

    function applySort(item, d) {
        item = d3.select(this);
        d = item.datum();
        if (!item.classed("sort") || (item.classed("sort") && item.classed("desc"))) {
            clearSort("text.sitem","abs");
            clearSort("text.sitem","desc");
            clearSort("text.sitem","sort");
            item.classed("sort abs", true);
            _layer.selectAll("text.sitem").text(function(n) { return prefixes.empty + n[0]; });
            item.text(prefixes.abs + d[0]);
            direction = d3.ascending;
            _pack.value(_curValue).sort(_curSort = env["s" + d[1]]);
        }
        else if (item.classed("sort") && item.classed("abs")) {
            item.classed("sort abs", false);
            item.classed("sort desc", true);
            item.text(prefixes.desc + d[0]);
            direction = d3.descending;
        }
        _pack.nodes(root());
        updateBubbles(_bubbles);
    }

    function applySize(item, d) {
        item = d3.select(this);
        if (item.classed("checked"))
            item = _layer.selectAll("text#uc_cCom");
        d = item.datum();

        clearSort("text.citem", "checked");
        _layer.selectAll("text.citem").text(prefixes.vuc);

        item.classed("checked", true);
        item.text(prefixes.vc);
        _pack.value(_curValue = env["c" + d[1]]).sort(_curSort).nodes(root());
        updateBubbles(_bubbles);
    }

    vis.clearUserCommitDg = function() {
        if(vis.layers && vis.layers.stat && vis.layers.stat.ucDg) {
            vis.layers.stat.ucDg.selectAll("*").remove();
            vis.layers.stat.ucDg = null;
            delete vis.layers.stat.ucDg;
        }
    };

    function updateBubbles(bubbles) {
        bubbles.call(position);
        bubbles.selectAll(".baseCircle").call(radius);
        bubbles.selectAll(".clipCircle").call(clipRadius);
        bubbles.selectAll(".imgCircle").call(wh);
    }

    function getId(key) {
        return key.replace(/[@\[\]\(\)#]/, "_").replace("(", "_").replace(")", "_");
    }

    vis.redrawUserCommitDg = function(data, layer) {
        layer = layer || vis.layers.stat;

        data = data ? data.sort(vis.sC) : null;
        if (!data) {
            vis.clearUserCommitDg();
            return;
        }

        _data = d3.nest()
            .key(function(d) { return d.author.email; })
            .entries(data)
            .map(function(d) {
                var res = {
                    type : 1,
                    key : d.key,
                    Com : d.values.length,
                    Add : 0,
                    Del : 0,
                    FileAdd : 0,
                    FileDel : 0,
                    FileMod : 0,
                    nodeValues : d.values
                };

                d.values.forEach(function(k) {
                    if (!k.stats)
                        return;

                    res.Add += k.stats.additions;
                    res.Del += k.stats.deletions;

                    res.FileAdd += k.stats.f.a;
                    res.FileDel += k.stats.f.d;
                    res.FileMod += k.stats.f.m;
                });

                return res;
            });

        _w = layer.attr("width") * 0.15 + 100;
        _h = layer.attr("height") * 0.15;

        _layer = layer.ucDg = layer.ucDg || layer.append("g").attr("id", "ucDg");
        _layer.attr("transform", "translate(" + [w - _w - margin.right, h - _h - margin.bottom] + ")");

        _layer.resize = resize;

        (_pack || (_pack = d3.layout.pack().value(_curValue = env.cCom).sort(_curSort = env.sCom)))
            .value(_curValue)
            .padding(.5)
            .sort(_curSort)
            .size([_w - 96, _h - 4]);

        _uColor = d3.scale.ordinal().range(_colorsWhite);

        _layer.selectAll(".ucbase").empty()
        && _layer.append("rect")
            .attr("class", "ucbase")
            .attr("x", -margin.right/2)
            .attr("y", -margin.bottom/2)
            .attr("width", _w + margin.right/2)
            .attr("height", _h + margin.bottom/2)
            .style({
                "stroke-dasharray": "5,3",
                stroke : "rgba(77, 132, 224, 0.6)",
                fill : "rgba(77, 132, 224, 0.2)"
            });

        _bubbles = _layer.selectAll(".ucBubbles");
        if (_bubbles.empty())
            _bubbles = _layer.append("g")
                .attr("class", "ucBubbles")
                .attr("transform", "translate(120, 0)");

        _bubbles = _bubbles.selectAll("g.ucStats")
            .data(_pack.nodes(root()).filter(function(d) { return d.type; }), function(d) { return d.key; });

        _bubbles
            .enter()
            .append("g")
            .attr("class", "ucStats")
            .attr("transform", "translate(" + [_w - 10, _h - 20]  + ")")
            .on("mousemove", vis.mtt)
            .on("mouseover", mover)
            .on("mouseout", mout)
            .call(function(g) {
                g.append("defs")
                    .append("clipPath")
                    .attr("id", function(d) { return getId(d.key); })
                    .append("circle")
                    .style("stroke-width", 1)
                    .attr("class", "clipCircle")
                    .style({fill: "none", stroke: "rgba(77, 132, 224, 1)"})
                    .call(radius);

                g.append("circle")
                    .attr("class", "baseCircle")
                    .style("stroke-width", 1)
                    .style("stroke", function (d) {
                        return d.type == 1 ? "rgba(77, 132, 224, 1)" : "none";
                    })
                    .style("fill", function (d) {
                        return d.type == 1 ? _uColor(d.key) : "none";
                    })
                    .style("fill-opacity", 1);

                g.append("image")
                    .attr("class", "imgCircle")
                    .attr("clip-path", function(d) { return "url(#" + getId(d.key) + ")";})
                    .attr("xlink:href", function(d) {
                        return d.nodeValues[0].author.avatar_url;
                    })
                    .call(wh);
            });

        _bubbles.exit().remove();

        _bubbles.each(function(k) {
            d3.select(this).selectAll("*")
                .datum(k);
        });

        updateBubbles(_bubbles);

        _layer.selectAll(".sorttype").empty()
        && _layer.append("g")
            .attr("class", "sorttype")
            .attr("transform", "translate(" + [0, 10] + ")")
            .call(function(menu) {
                menu.append("text").text("size sort");

                var arr = [
                    ["Commits", "Com"],
                    ["Lines Added", "Add"],
                    ["Lines Deleted", "Del"],
                    ["File Added", "FileAdd"],
                    ["File Modified", "FileMod"],
                    ["File Removed", "FileDel"]
                ];

                var ig = menu.append("g")
                    .attr("transform", "translate(30, 18)")
                    .selectAll("text.sitem")
                    .data(arr)
                    .enter()
                    .append("g")
                    .attr("transform", function(n, i) { return "translate(0, " + i * 18 + ")"; })
                    .call(function(g) {
                        g.append("text")
                            .on("click", applySort)
                            .attr("class", function(n, i) { return "sitem" + (!i ? " sort abs" : "") })
                            .text(function(n, i) {return (!i ? prefixes.abs : prefixes.empty) + n[0]; } );
                        g.append("title").text(function(n) { return "sort by " + n[0]; });
                    });

                menu.append("g")
                    .attr("transform", "translate(8, 18)")
                    .selectAll("text.citem")
                    .data(arr)
                    .enter()
                    .append("g")
                    .attr("transform", function(n, i) { return "translate(0, " + i * 18 + ")"; })
                    .call(function(g) {
                        g.append("text")
                            .on("click", applySize)
                            .attr("id", function(n) { return "uc_c" + n[1]; })
                            .attr("class", function(n, i) { return "citem" + (!i ? " checked" : "") })
                            .text(function(n, i) {return !i ? prefixes.vc : prefixes.vuc; } );
                        g.append("title").text(function(n) { return "size by " + n[0]; });
                    });
            });
    };

    function resize(w, h) {
        _w = w * 0.15 + 100;
        _h = h * 0.15;

        _layer.attr("transform", "translate(" + [w - _w - margin.right, h - _h - margin.bottom] + ")");
        _pack.size([_w - 96, _h - 4]);

        _layer.selectAll(".ucbase")
            .attr("width", _w + margin.right/2)
            .attr("height", _h + margin.bottom/2)
        ;

        updateBubbles(_bubbles);
    }
})(vis || (vis = {}));


