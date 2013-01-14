/**
 * User: ArtZub
 * Date: 11.01.13
 * Time: 21:41
 */

'use strict';

var log = (function () {
    var logCont = d3.select("#console")
        .append("ul");
    return function (msg) {
        logCont.append("li").text(msg);
    }
})();

var cs, svg,
    margin = {top: 20, right: 20, bottom: 20, left: 20},
    w, h,
    psBar, runBtn, rpsSel, ldrTop;


function init() {
    cs = d3.select("#canvas");
    svg = cs.append("svg");
    w = svg.property("clientWidth");
    h = svg.property("clientHeight");

    psBar = d3.select("#progressBar");
    psBar.pntNode = d3.select(psBar.node().parentNode);
    psBar.show = function() {
        this.pntNode.style("display", null);
        return this;
    };
    psBar.hide = function() {
        this.pntNode.style("display", "none");
        return this;
    };
    psBar.setLabel = function(lbl) {
        this.text(lbl);
        return this;
    };
    psBar.setPos = function(pos) {
        this.style("width", pos);
        return this;
    };

    runBtn = d3.select("#runBtn");
    rpsSel = d3.select("#repo");

    [runBtn, rpsSel].forEach(function(item) {
        item.enable = function () {
            this.attr("disabled", null);
            return this;
        };
        item.disable = function () {
            this.attr("disabled", "disabled");
            return this;
        };
    });

    runBtn.on("click", function() {
        runBtn.disable();
        rpsSel.disable();

        ghcs.states.max = 0;
        ghcs.states.complete = function() {
            rpsSel.enable();
            runBtn.enable();
            vis.redrawStat(ghcs.repo);
        }

        JSONP(makeUrl(ghcs.repo.commits_url), function getAll(req) {
            ghcs.states.max++;
            parseCommits(getDataFromRequest(req));
            if (req && req.meta && req.meta.Link && ghcs.limits.commits > ghcs.states.max) {
                var next = req.meta.Link.reduce(function(a, b) {
                    if (!a && b[1].rel == "next")
                        return b[0];
                    return a;
                }, null);
                if (next)
                    JSONP(next.toString(), getAll);
            }
        });
    });

    ldrTop = d3.select("#ldrTop");
    ldrTop.show = function () {
        this.style("display", "inline-block");
        return this;
    };
    ldrTop.hide = function () {
        this.style("display", null);
        return this;
    };

    d3.select("#user")
        .on("change", chUser);

    initGraphics(svg);
}