/**
 * User: ArtZub
 * Date: 15.01.13
 * Time: 1:34
 */

'use strict';

var vis = {
    redrawStat: function(data, layout) {

        layout = layout || vis.layouts.stat;
        //layout.selectAll("*").remove();

        var x = d3.time.scale()
            .domain(d3.extent(data.dates))
            .range([0, w - margin.left - margin.right])
            ;

        var y = d3.scale.linear()
            .range([0, h/3])
            .domain([0, ghcs.repo.changes || 1]);

        var bandWidth = x.range()[1] * .05 / (data.dates.length || 1);
            bandWidth = bandWidth < 2 ? 2 : bandWidth;

        var xAxis = d3.svg.axis()
            .scale(x)
            ;

        layout.cont = layout.cont || layout
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        ;

        layout.cont.axis = layout.cont.axis || layout.cont.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h/2 + ")")
        ;

        layout.cont.axis.selectAll("*").remove();

        layout.cont.axis.call(xAxis)
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
        ;

        cData.each(function(d, g) {
            g = d3.select(this);
            g.attr("transform", "translate(" + [ x(d.date) - bandWidth/2, 0] + ")");

            if (!d.stats)
                return;

            var b = !g.barAdd;

            g.barAdd = g.barAdd || g.append("rect")
                .attr("width", bandWidth)
                .style("fill", "#00dd77")
            ;

            if (b)
                g.barAdd
                    .attr("y", 0)
                    .attr("height", 0)
                    .transition()
                    .duration(750)
                    .ease("cubic-in-out")
                    .attr("y", -y(d.stats.additions))
                    .attr("height", y(d.stats.additions))
                ;
            else
                g.barAdd
                    .attr("y", -y(d.stats.additions))
                    .attr("height", y(d.stats.additions))
                ;

            g.barDel = g.barDel || g.append("rect")
                .attr("width", bandWidth)
                .style("fill", "#dd2200")
            ;

            if (b)
                g.barDel
                    .attr("y", 0)
                    .attr("height", 0)
                    .transition()
                    .duration(750)
                    .ease("elastic")
                    .attr("height", y(d.stats.deletions))
                ;
            else
                g.barDel
                    .attr("y", 0)
                    .attr("height", y(d.stats.deletions))
                ;
        });

        cData.exit().remove();
    }
};

function initGraphics(svg) {

    vis.layouts = {
        stat : svg.append("g").attr("width", w).attr("height", h),
        view : svg.append("g").attr("width", w).attr("height", h)
    };

    vis.inited = true;
}



