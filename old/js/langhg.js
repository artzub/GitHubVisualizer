/**
 * Created with IntelliJ IDEA.
 * User: ArtZub
 * Date: 23.01.13
 * Time: 13:32
 * To change this template use File | Settings | File Templates.
 */

'use strict';

(function(vis) {
    vis.clearLangHg = function() {
        vis.layers && vis.layers.repo && vis.layers.repo.langHg && vis.layers.repo.langHg.selectAll("*")
            .transition()
            .duration(750)
            .ease("elastic")
            .remove();
    };

    vis.redrawLangHg = function(data, layout) {
        layout = layout || vis.layers.repo;

        if (!data) {
            vis.clearLangHg();
            return;
        }

        data = data.sort(function(a, b) {
            return d3.ascending(a.key, b.key);
        });

        var w_hg = w / 4,
            h_hg = h / 6,
            m = {left : 10, top : 10, right : 10, bottom : 10},
            pos = {top : h - h_hg - m.bottom - m.top, left : m.left};

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, 28 * data.length], .2)
            .domain(data.map(function(d) { return d.key; }));
        var xc = x.rangeBand() / 2;

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.values.length; })])
            .range([h_hg, 0]);

        if (layout.langHg && layout.langHg.empty())
            layout.langHg = null;

        layout.langHg = (layout.langHg || layout.insert("g", ":last-child"))
            .attr("class", "langHg")
            .attr("width", w_hg + m.left + m.right)
            .attr("height", h_hg + m.top + m.bottom)
            .attr("transform", "translate(" + [pos.left , pos.top] + ")");

        function me(d) {
            vis.forceRep.nodes().filter(function(k) {
                return k.nodeValue.lang != d.key;
            }).forEach(meiRepo);
        }

        function mo(d) {
            vis.forceRep.nodes().filter(function(k) {
                return k.nodeValue.lang != d.key;
            }).forEach(moiRepo);
        }

        function appendItems(g) {
            g.append("path")
                .attr("class", "hLine")
                .style("stroke", "rgba(255, 255, 255, .3)");

            g.append("text")
                .attr("class", "tLang")
                .style("fill", function(d) { return d3.rgb(vis.forceRep.colors(d.key)); })
                .attr("dy", ".33em")
                .attr("dx", "-6px")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "end")
                .text(function(d) { return d.key; })
                .each(function() {
                    var pr = d3.select(this.parentNode);
                    pr.insert("rect", ":first-child")
                        .attr("class", "barSelect")
                        .attr("fill", "rgba(244, 244, 244, .2)");
                });

            var gg = g.append("g")
                .attr("class", "barChain");

            gg.append("path")
                .attr("class", "vLine")
                .style("stroke", function(d) { return d3.rgb(vis.forceRep.colors(d.key)).darker().darker(); })
                .attr("transform", "translate(" + [-.5 , 0] + ")")
                .attr("d", "M0.5,0 L0.5,0");

            gg.append("circle")
                .style("fill", function(d) { return d3.rgb(vis.forceRep.colors(d.key)).darker().darker(); })
                .attr("r", 2);

            var dg = gg.append("g")
                .attr("class", "dCircle")
                .attr("transform", "translate(" + [0 , 0] + ")");

            dg.append("circle")
                .attr("class", "bSubCircle")
                .style("fill", function(d) { return d3.rgb(vis.forceRep.colors(d.key)); })
                .style("stoke", function(d) { return d3.rgb(vis.forceRep.colors(d.key)).darker(); })
            ;

            dg.append("circle")
                .style("fill", function(d) { return d3.rgb(vis.forceRep.colors(d.key)).darker().darker(); })
                .attr("r", 2)
            ;

            dg.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", ".32em")
                .style("fill", function(d) { return d3.rgb(vis.forceRep.colors(d.key)).brighter(); })
            ;
        }

        var bar = layout.langHg.selectAll(".barLang")
            .data(data, function(d) { return d.key; });

        bar.exit().remove();

        bar.enter()
            .append("g")
            .attr("transform", "translate(" + [0 , -xc * 2] + ")")
            .attr("class", "barLang")
            .on("mouseover", me)
            .on("mouseout", mo)
            .call(appendItems);

        bar.transition()
            .duration(3500)
            .ease("elastic")
            .attr("transform", function(d) { return "translate(" + [x(d.key) , -xc * 2] + ")"; });

        bar.each(function(k) {
            d3.select(this).selectAll("*")
                .datum(k);
        });
        bar.selectAll("path.hLine")
            .attr("d", "M0,0 L" + (xc * 2) + ",0");

        bar.selectAll("text.tLang")
            .attr("y", -xc)
            .each(function(d) {
                var pr = d3.select(this.parentNode);
                pr.selectAll("rect.barSelect")
                    .attr("transform", "translate(" + [-xc * .2 , -(vis.visualLenght(this) + 6 + xc * .4) ] + ")")
                    .attr("width", xc * 2.4 )
                    .attr("height", (vis.visualLenght(this) + 6 + xc * .4) + h_hg - y(d.values.length) + xc * 2.4);
            });

        var gg = bar.selectAll("g.barChain")
            .attr("transform", "translate(" + [x.rangeBand() / 2 , 0] + ")");

        var dg = gg.selectAll("g.dCircle");

        dg.selectAll("circle.bSubCircle")
            .attr("r", xc);
        dg.selectAll("text")
            .text(function(d) { return d.values.length; });

        dg.transition()
            .delay(100)
            .duration(3500)
            .ease("elastic")
            .attr("transform", function(d) {
                return "translate(" + [0 , h_hg - y(d.values.length) + xc] + ")";
            });

        gg.selectAll("path.vLine").transition()
            .duration(3500)
            .ease("elastic")
            .attr("d", function(d) { return "M0.5,0 L0.5," + (h_hg - y(d.values.length) + xc); });
    }
})(vis || (vis = {}));
