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
    psBar, runBtn, ldrTop, toolTip, showBtn, visBtn,
    userTxt, curRep, divStat, stepsBar, cbDlr, cbDlsr;

function updateStatus(pos, label) {
    pos = pos > ghcs.states.max ? ghcs.states.max : pos;
    psBar.setPos((pos * 100 / (ghcs.states.max || 1)) + "%")
        .setLabel(label || "Completed " + pos + " of " + ghcs.states.max + " commits ...");
}

d3.select(window).on("hashchange", applyParams);

function parseParams(hash) {
    var params = {};
    hash.replace(/^#/, "").split("&").forEach(function(item) {
        var values = item.toLowerCase().split("=");
        var key = values[0];
        params[key] = values.length > 1 ? values[1] : "";
    });

    ghcs.params = ghcs.params || {};

    ghcs.params.user = params.user;
    ghcs.params.rot = params.rot;
}

function rewriteHash() {
    if (this == showBtn.node() && ghcs.params) {
        var hash = [];
        ghcs.params.user && hash.push("user=" + ghcs.params.user);
        ghcs.params.rot && hash.push("rot=" + ghcs.params.rot);
        document.location.hash = "#" + hash.join("&");
    }
}

function applyParams() {
    d3.event && d3.event.preventDefault();

    parseParams(document.location.hash);

    if (ghcs.rot != ghcs.params.rot || ghcs.login != ghcs.params.user) {
        ghcs.rot = ghcs.params.rot;
        userTxt.property("value", ghcs.params.user);
        chUser();
    }
}

function chRadio(d) {
    switch(this.name) {
        case "participation" : {
        }
    }
}

function chCheckbox(d) {
    var ln;
    d = d3.select(this);
    switch(d.attr("id")) {
        case "cb-dlr":
        case "cb-dlsr":
            ln = d.datum();
            vis.layers[ln]
            && ((d.property("checked") && vis.layers[ln].show()) || vis.layers[ln].hide());
            break;
        case "cb-dllh":
            vis.layers.repo
            && vis.layers.repo.langHg
            && vis.layers.repo.langHg.style("display", d.property("checked") ? null : "none");
            break;
    }
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
        ghcs.redrawStatsTimer = null;
    }
    ghcs.redrawStatsTimer = setTimeout(function () {
        vis.redrawStat(ghcs.repo);
        ghcs.redrawStatsTimer = null;
    }, 100);
}

function runShow() {
    if (ghcs.repo && ghcs.repo.commits) {
        visBtn.disable();
        vis.runShow(ghcs.repo);
    }
}

function redrawRepos() {
    if (ghcs.redrawReposTimer) {
        clearTimeout(ghcs.redrawReposTimer);
        ghcs.redrawReposTimer = null;
    }
    ghcs.redrawReposTimer = setTimeout(function () {
        vis.redrawRepos(ghcs.users
            && ghcs.users[ghcs.login]
            && ghcs.users[ghcs.login].repos
            ? ghcs.users[ghcs.login].repos
            : null
        );

        vis.redrawLangHg(ghcs.users
            && ghcs.users[ghcs.login]
            && ghcs.users[ghcs.login].repos
            ? d3.nest().key(function(d) { return d.nodeValue.lang; }).entries(ghcs.users[ghcs.login].repos)
            : null);

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

    cs = d3.select("#svg");
    svg = cs.append("svg");
    w = svg.property("clientWidth") || document.body.clientWidth;
    h = svg.property("clientHeight")|| document.body.clientHeight;

    svg.attr("width", w).attr("height", h);


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
    visBtn = d3.select("#visBtn");
    userTxt = d3.select("#user").on("change", function() {
        stepsBar.firstStep();
        showBtn.disable();
        if (this.value) {
            if (this.value != ghcs.login)
                showBtn.enable();
            else
                stepsBar.secondStep();
        }

        (ghcs.params || (ghcs.params = {})).user = this.value;
    });

    [runBtn, showBtn, userTxt, visBtn].forEach(function(item) {
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
    showBtn.on("click", rewriteHash);
    visBtn.on("click", runShow);

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

    d3.selectAll("input[type=checkbox]").on("change", chCheckbox);

    cbDlr = d3.select("#cb-dlr").datum("repo");
    cbDlsr = d3.select("#cb-dlsr").datum("stat");

    [cbDlr, cbDlsr].forEach(function(item) {
        item.check = function() {
            this.property("checked", true);
            chCheckbox.apply(this.node());
        };

        item.uncheck = function() {
            this.property("checked", false);
            chCheckbox.apply(this.node());
        };

        item.trigger = function() {
            this.property("checked", !this.property("checked"));
            chCheckbox.apply(this.node());
        };
    })

    d3.select("#txt-lc").on("change", function() {
        ghcs.limits.commits = +this.value;
        if (ghcs.limits.commits < 1)
            ghcs.limits.commits = 1;
    });

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
                .attr("target", "_blank")
                .attr("title", "Go to Github")
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

    applyParams();
}