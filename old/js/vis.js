/**
 * User: ArtZub
 * Date: 15.01.13
 * Time: 1:34
 */

'use strict';

var PIdiv2 = Math.PI / 2,
    smallRad = PIdiv2 * (1 / 15),
    TT_PAD = 8
    ;

var colors = {
    additions : "#ddffdd",
    deletions : "#ffdddd",
    changes : "#FFF1DD",
    center : "#FF6600",
    stroked : "#f9f9f9",
    addedFile : "#A5EC6E",
    modifiedFile : "#FFB877",
    deletedFile : "#FF77B5",
    decolor : "#888888"
};

function toRgba(color, a) {
    color = d3.rgb(color);
    return "rgba(" + [color.r, color.g, color.b, a || 1] + ")";
}

var vis = {
    sC : function(a, b) {
        return d3.ascending(b.date, a.date);
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
    visualLenght : function(txt) {
        return txt.clientWidth || txt.getComputedTextLength();
    }
};

function initGraphics(svg) {

    vis.layers = (function(data) {
        var ls = { _data : data };

        svg.selectAll("g.layer")
            .data(data, function(d) {return d.name})
            .enter()
            .append("g")
            .each(function(d) {
                ls[d.name] = d3.select(this).attr("class", "layer").attr("width", w).attr("height", h);
                ls[d.name].getOrder = function() {
                    return d.order;
                };
                ls[d.name].toFront = function() {
                    d.order &&
                        vis.layers.ordering(this, 0);
                    return ls[d.name];
                };
                ls[d.name].hide = function() {
                    ls[d.name].visible = false;
                    if (ls[d.name].datum().name == "repo" && vis.forceRep)
                        vis.forceRep.stop();
                    ls[d.name].style("display", "none");
                    return ls[d.name];
                };
                ls[d.name].show = function() {
                    ls[d.name].visible = true;
                    if (ls[d.name].datum().name == "repo" && vis.forceRep)
                        vis.forceRep.resume();
                    ls[d.name].style("display", null);
                    return ls[d.name];
                };
                ls[d.name].visible = true;
            });
        return ls;
    })([
        {name : "repo", order : 2},
        {name : "stat", order : 1},
        {name : "show", order : 0}
    ]);

    vis.layers.ordering = function(layer, order) {
        function s(a, b) {
            return d3.ascending(b.order, a.order);
        }
        var _d = (layer instanceof Array || layer instanceof Object ? layer : this[layer]);
        _d = _d ? (_d instanceof Array ? _d.datum() : _d) : null;
        if (_d) {
            this._data.forEach(function(d) {
                _d != d && d.order >= order && d.order++;
            });
            _d.order = order;
            svg.selectAll("g.layer").sort(s);
        }
        return this;
    };

    vis.resources = {
    };

    vis.switch = function(layer) {
    };

    vis.inited = true;
}



