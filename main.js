/**
 * User: ArtZub
 * Date: 11.01.13
 * Time: 21:41
 */

'use strict';

var ghcs = {users: {}};


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


var runBtn = d3.select("#runBtn");
runBtn.enable = function () {
    this.attr("disabled", null);
    return this;
};
runBtn.disable = function () {
    this.attr("disabled", "disabled");
    return this;
};

runBtn.on("click", function() {
    if (!ghcs.repo)
        runBtn.disable();
    JSONP(ghcs.repo.commits_url, function(req) {
        parseCommits(getDataFromRequest(req))
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
    if (commits && commits.length != ghcs.repo.commits.length) {
        var cc = commits.length;
        psBar.setPos("0%")
            .setLabel("parsing commits...")
            .show();
        commits.forEach(function(d, i) {
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
            JSONP(d.url, (function(c) {
                return function(req) {
                    parseCommit(getDataFromRequest(req), c);
                };
            })(d));
            psBar.setPos((i * 100 / cc) + "%")
        });
        psBar.setPos("100%").hide();
    }
}

function parseRepos(data) {
    ldrTop.hide();
    var opts = d3.select("#repo")
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
            d3.select("#repo")
                .on("change", chSelect);
        }
    }
    else if (ghcs.users.hasOwnProperty(ghcs.login) && ghcs.users[ghcs.login].hasOwnProperty("repos"))
        delete ghcs.users[ghcs.login]["repos"];
}

d3.select("#user")
    .on("change", function (e) {
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
                        JSONP("https://api.github.com/users/" + login, function (req) {
                            var data = getDataFromRequest(req);
                            if (!data) {
                                parseRepos(null);
                                return;
                            }

                            ghcs.users[data.login] = {info: data};
                            ghcs.login = data.login;

                            if (data.repos_url)
                                JSONP(data.repos_url, function(req) {
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
