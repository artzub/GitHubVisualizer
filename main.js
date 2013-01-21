/**
 * User: ArtZub
 * Date: 11.01.13
 * Time: 21:41
 */

'use strict';

var timeFormat = (function() {
    var fd = d3.time.format("%b %d, %Y");
    return function(ms) {
        return fd(new Date(ms));
    }
})();

var log;

var cs, svg,
    margin = {top: 20, right: 20, bottom: 20, left: 20},
    w, h,
    psBar, runBtn, ldrTop, toolTip, showBtn, userTxt, curRep, divStat, stepsBar;

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
    log = (function () {
        var logCont = d3.select("#console")
            .append("ul");
        return function (msg) {
            logCont.append("li").text(msg instanceof Object ? JSON.stringify(msg) : msg);
        }
    })();

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

    stepsBar = d3.select(".steps");
    stepsBar.firstStep = function() {
        this.attr("class", "steps sfirst");
        return this;
    };
    stepsBar.secondStep = function() {
        this.attr("class", "steps ssecond");
        return this;
    };
    stepsBar.thirdStep = function() {
        this.attr("class", "steps");
        return this;
    };

    runBtn = d3.select("#runBtn");
    showBtn = d3.select("#showBtn");
    userTxt = d3.select("#user").on("change", function() {
        stepsBar.firstStep();
        if (!this.value)
            showBtn.disable();
        else if (this.value != ghcs.login)
            showBtn.enable();
        else
            stepsBar.secondStep();
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
        this.selectAll("*").remove();
        this.datum(r);
        if (!r)
            this.append("span")
                .text("Select Repo...");
        else {
            this.append("span")
                .style("color", d3.rgb(vis.forceRep.colors(r.nodeValue.lang)).brighter())
                .attr("class", "mega-icon mega-icon-public-repo");

            this.append("strong")
                .style("margin-right", "5px")
                .style("text-shadow", "0 0 3px rgba(0, 0, 0, 1)")
                .style("color", d3.rgb(vis.forceRep.colors(r.nodeValue.lang)).brighter())
                .text((r.nodeValue.name || ""));

            this.append("a")
                .attr("href", (r.nodeValue.html_url || "#"))
                .attr("class", "mega-icon mini-icon-link a-icon");
        }

        return this;
    }

    divStat = d3.select("#divStat");
    divStat.updateInfo = function() {
        var user;
        if (ghcs.login && (user = ghcs.users[ghcs.login]) && user.info) {
            divStat.selectAll("*").remove();
            user.info.avatar && divStat.node().appendChild(user.info.avatar);
            divStat.append("ul")
                .call(function(ul) {
                    (user.info.name || user.info.login) && ul.append("li").call(function(li) {
                        li.append("h1")
                            .text((user.info.name || user.info.login))
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
                                .text(timeFormat(Date.parse(user.info.updated_at)))
                        });
                })
        }
    }
}