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
    psBar, runBtn, ldrTop, toolTip, showBtn, userTxt, curRep, divStat;

function updateStatus(pos, label) {
    psBar.setPos((pos * 100 / (ghcs.states.max || 1)) + "%")
        .setLabel(label || "Completed " + pos + " of " + ghcs.states.max + " commits ...");
}

function checkCompleted() {
    if (ghcs.states.cur >= ghcs.states.max) {
        psBar.setPos("100%").hide();
        if (ghcs.states.complete)
            ghcs.states.complete();
        return true;
    }
    return false;
}

function redrawStats() {
    if (ghcs.redrawStatsTimer) {
        clearTimeout(ghcs.redrawStatsTimer);
        ghcs.redrawTimer = null;
    }
    ghcs.redrawStatsTimer = setTimeout(function () {
        vis.redrawStat(ghcs.repo);
        ghcs.redrawTimer = null;
    }, 100);
}

function redrawRepos() {
    if (ghcs.redrawReposTimer) {
        clearTimeout(ghcs.redrawReposTimer);
        ghcs.redrawTimer = null;
    }
    ghcs.redrawReposTimer = setTimeout(function () {
        vis.redrawRepos(ghcs.users
            && ghcs.users[ghcs.login]
            && ghcs.users[ghcs.login].repos
            ? ghcs.users[ghcs.login].repos
            : null
        );
        ghcs.redrawReposTimer = null;
    }, 100);
}

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
    showBtn = d3.select("#showBtn");
    userTxt = d3.select("#user").on("change", function() {
        if (this.value && this.value != ghcs.login)
            showBtn.enable();
        else
            showBtn.disable();
    });

    [runBtn, showBtn, userTxt].forEach(function(item) {
        item.enable = function () {
            this.attr("disabled", null);
            return this;
        };
        item.disable = function () {
            this.attr("disabled", "disabled");
            return this;
        };
    });

    runBtn.on("click", analyseCommits);
    showBtn.on("click", chUser);

    ldrTop = d3.select("#ldrTop");
    ldrTop.pntNode = d3.select(ldrTop.node().parentNode);
    ldrTop.show = function () {
        this.pntNode.style("display", null);
        return this;
    };
    ldrTop.hide = function () {
        this.pntNode.style("display", "none");
        return this;
    };

    toolTip = d3.select("#tooltip");
    toolTip.show = function () {
        this.style("display", "block");
        return this;
    };
    toolTip.hide = function () {
        this.style("display", null);
        return this;
    };

    initGraphics(svg);

    curRep = d3.select("#curRep")
        .on("mouseover", function(d) {
            if (d) {
                vis.meRepo(d);
                vis.mtt(d, null, null, {pageX : d.x, pageY : d.y});
            }
        })
        .on("mouseout", function(d) {
            if (d)
                vis.mlRepo(d);
        });

    curRep.setName = function(r) {
        this.datum(r).html(
            !r ? "" :
            "<span class='mega-icon mega-icon-public-repo' style='color:" + d3.rgb(vis.forceRep.colors(r.nodeValue.lang)).brighter() + "'></span>" +
            "<strong style='text-shadow: 0 0 3px rgba(0, 0, 0, 1);color:" + d3.rgb(vis.forceRep.colors(r.nodeValue.lang)).brighter() + "'>" + (r.nodeValue.name || "") + "</strong>"
        );
        return this;
    }

    divStat = d3.select("#divStat");
    divStat.updateInfo = function() {
        var user;
        if (ghcs.login && (user = ghcs.users[ghcs.login]) && user.info) {
            divStat.selectAll("*").remove();
            user.info.avatar && d3.select(divStat.node().appendChild(user.info.avatar)).style({
                width : "96px",
                height : "auto"
            });
            divStat.append("ul")
                .call(function(ul) {
                    user.info.name && ul.append("li").call(function(li) {
                        li.append("h1")
                            .text(user.info.name)
                            .append("a")
                            .attr("class", "a-icon")
                            .attr("target", "_blank")
                            .attr("title", "Go to GitHub")
                            .attr("href", user.info.html_url)
                            .append("span")
                            .attr("class", "mini-icon mini-icon-octocat")
                        ;
                        li.append("hr");
                    });
                    user.info.location && ul.append("li")
                        .html("<span class='mini-icon mini-icon-location'></span><strong>" + user.info.location + "</strong>")
                    user.info.blog && ul.append("li")
                        .call(function(li) {
                            li.append("span")
                                .attr("class", "mini-icon mini-icon-link")
                            li.append("a")
                                .attr("target", "_blank")
                                .attr("href", user.info.blog)
                                .text(user.info.blog)
                        });
                    ul.append("li")
                        .call(function(li) {
                            li.append("span")
                                .attr("class", "mini-icon mini-icon-public-repo")
                            li.append("strong")
                                .text(user.info.public_repos)
                        });
                    user.info.updated_at && ul.append("li")
                        .call(function(li) {
                            li.append("span")
                                .attr("class", "mini-icon mini-icon-time")
                            li.append("strong")
                                .text(d3.time.format("%b %d, %Y")(new Date(Date.parse(user.info.updated_at))))
                        });
                })
        }
    }
}