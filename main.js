/**
 * User: ArtZub
 * Date: 11.01.13
 * Time: 21:41
 */

'use strict';

var ghcs = {
    users: {},
    states: {cur:0, max:0},
    limits: {commits : 1000}
};

ghcs.asyncForEach = function(items, fn, time) {
    if (!(items instanceof Array))
        return;

    var workArr = items.concat();

    setTimeout(function loop() {
        if (workArr.length > 0)
            fn(workArr.shift(), workArr);
        if (workArr.length > 0)
            setTimeout(loop, time || 1);
    }, time || 1);
}

function makeUrl(url) {
    var sec = "client_id=c45417c5d6249959a91d&client_secret=4634b3aa7549c3d6306961e819e5ec9b355a6548";
    return url ? (url + (url.indexOf('?') === -1 ? '?' : '&') + sec) : url;
}

var log = (function () {
    var logCont = d3.select("#console")
        .append("ul");
    return function (msg) {
        logCont.append("li").text(msg);
    }
})();

var w = document.width,
    h = document.height,
    svg = d3.select("#canvas")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
    ;

var psBar = d3.select("#progressBar");
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


var runBtn = d3.select("#runBtn"),
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
})

runBtn.on("click", function() {
    runBtn.disable();
    rpsSel.disable();

    ghcs.states.max = 0;
    ghcs.states.complete = function() {
        rpsSel.enable();
        runBtn.enable();
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
                JSONP(next, getAll);
        }
    });
});

var ldrTop = d3.select("#ldrTop");
ldrTop.show = function () {
    this.style("display", "inline-block");
    return this;
};
ldrTop.hide = function () {
    this.style("display", null);
    return this;
};

function chSelect(e) {
    e = d3.select(this[this.selectedIndex]).datum();
    if (e) {
        ghcs.repo = e;
        runBtn.enable();
    }
}

function getDataFromRequest(req) {
    return req && req.meta && req.meta.status == 200 && req.data ? req.data : null;
}

function parseCommit(org_commit, commit){
    if (!commit || !org_commit || commit.sha != org_commit.sha)
        return;

    commit.stats = org_commit.stats;

    commit.files = org_commit.files.map(function(f) {
        return {
            name : f.filename,
            changes : f.changes,
            additions : f.additions,
            deletions : f.deletions,
            status : f.status
        }
    });
}

function parseCommits(commits) {
    ghcs.repo.commits = ghcs.repo.commits || [];
    if (commits && commits.length) {
        psBar.setPos((ghcs.states.cur * 100 / (ghcs.states.max || 1)) + "%")
            .setLabel("Completed " + ghcs.states.cur + " from " + ghcs.states.max + " commits ...")
            .show();

        ghcs.states.max += commits.length - 1;
        ghcs.asyncForEach(commits, function(d, arr) {
            d = {
                url : d.url,
                sha : d.sha,
                author : {
                    name : d.commit.author.name,
                    email : d.commit.author.email
                },
                date : d.commit.author.date,
                avatar_url : d.author && d.author.avatar_url ? d.author.avatar_url : "",
                message : d.commit.message,
                parents : d.parents
            };
            d.index = ghcs.repo.commits.push(d) - 1;
            JSONP(makeUrl(d.url), (function(c) {
                return function(req) {
                    parseCommit(getDataFromRequest(req), c);
                    psBar.setPos((ghcs.states.cur++ * 100 / (ghcs.states.max || 1)) + "%")
                        .setLabel("Completed " + ghcs.states.cur + " from " + ghcs.states.max + " commits ...");
                    if (ghcs.states.cur >= ghcs.states.max) {
                        psBar.setPos("100%").hide();
                        if (ghcs.states.complete)
                            ghcs.states.complete();
                    }
                };
            })(d));
        });
    }
}

function parseRepos(data) {
    ldrTop.hide();
    var opts = rpsSel
            .on("change", null)
            .selectAll("option.ritem"),
        lbl = d3.selectAll("label[for='repo']");

    lbl.text("Repo:");

    opts.remove();
    if (data) {
        if (!ghcs.users.hasOwnProperty(ghcs.login) || !ghcs.users[ghcs.login].hasOwnProperty("repos")) {
            ghcs.users[ghcs.login] = ghcs.users[ghcs.login] || {};
            ghcs.users[ghcs.login].repos = data.filter(function (d) {
                return !d.private;
            }).map(function (d) {
                    return {
                        id: d.id,
                        name: d.name,
                        url: d.url,
                        commits_url : d.commits_url.replace(/{.*$/, "")
                    };
                });
        }

        if (ghcs.users[ghcs.login].repos.length) {
            opts.data(ghcs.users[ghcs.login].repos, function(d) {
                return d.id;
            })
                .enter()
                .append("option")
                .text(function (d) {
                    return d.name
                })
                .attr("class", "ritem");
            lbl.text("Repo (" + ghcs.users[ghcs.login].repos.length + "):");
            rpsSel
                .on("change", chSelect);
        }
    }
    else if (ghcs.users.hasOwnProperty(ghcs.login) && ghcs.users[ghcs.login].hasOwnProperty("repos"))
        delete ghcs.users[ghcs.login]["repos"];
}

d3.select("#user")
    .on("change", function () {
        if (ghcs.chUserTimer) {
            clearTimeout(ghcs.chUserTimer);
            delete ghcs.chUserTimer;
        }
        ghcs.chUserTimer = setTimeout((function (login) {
            return function () {
                if (login) {
                    runBtn.disable();
                    ghcs.login = login;
                    if (!ghcs.users.hasOwnProperty(login) || !ghcs.users[login].hasOwnProperty("repos")) {
                        ldrTop.show();
                        JSONP(makeUrl("https://api.github.com/users/" + login), function (req) {
                            var data = getDataFromRequest(req);
                            if (!data) {
                                parseRepos(null);
                                return;
                            }

                            ghcs.users[data.login] = {info: data};
                            ghcs.login = data.login;

                            if (data.repos_url)
                                JSONP(makeUrl(data.repos_url), function(req) {
                                    parseRepos(getDataFromRequest(req));
                                });
                            else
                                parseRepos(null);
                        });
                    }
                    else
                        parseRepos(ghcs.users[login].repos);
                }
            }
        })(this.value), 100);
    });
