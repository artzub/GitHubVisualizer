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
                }
            });
        return ls;
    })([
        {name : "repo", order : 2},
        {name : "stat", order : 1},
        {name : "view", order : 0}
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
    };

    vis.resources = {
    };

    vis.inited = true;
}



