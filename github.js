/**
 * User: ArtZub
 * Date: 15.01.13
 * Time: 1:36
 */

'use strict';

function makeUrl(url) {
    var sec = "client_id=c45417c5d6249959a91d&client_secret=4634b3aa7549c3d6306961e819e5ec9b355a6548";
    return url ? (url + (url.indexOf('?') === -1 ? '?' : '&') + sec) : url;
}


function getDataFromRequest(req) {
    return req && req.meta && req.meta.status == 200 && req.data ? req.data : null;
}

function parseCommit(org_commit, commit){
    if (!commit || !org_commit || commit.sha != org_commit.sha)
        return;

    var _changes = 0,
        _additions = 0,
        _deletions = 0;

    commit.files = org_commit.files.map(function(f) {
        _changes += f.changes;
        _additions += f.additions;
        _deletions += f.deletions;
        return {
            name : f.filename,
            changes : f.changes,
            additions : f.additions,
            deletions : f.deletions,
            status : f.status
        }
    });

    commit.stats = {
        changes : _changes,
        additions : _additions,
        deletions : _deletions
    };

    _deletions = d3.max([_deletions, _additions]);

    var max = ghcs.repo.changes || 0;
    ghcs.repo.changes = _deletions > max ? _deletions : max;
}

function parseCommits(commits) {
    ghcs.repo.commits = ghcs.repo.commits || [];
    if (commits && commits.length) {
        psBar.setPos((ghcs.states.cur * 100 / (ghcs.states.max || 1)) + "%")
            .setLabel("Completed " + ghcs.states.cur + " of " + ghcs.states.max + " commits ...")
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
                date : Date.parse(d.commit.author.date),
                avatar_url : d.author && d.author.avatar_url ? d.author.avatar_url : "",
                message : d.commit.message,
                parents : d.parents
            };
            d.index = ghcs.repo.commits.push(d) - 1;
            JSONP(makeUrl(d.url), (function(c) {
                ghcs.repo.dates.push(c.date)
                ghcs.repo.dates.sort(d3.ascending);
                return function(req) {
                    parseCommit(getDataFromRequest(req), ghcs.repo.commits[c.index]);
                    if (ghcs.redrawTimer) {
                        clearTimeout(ghcs.redrawTimer);
                        ghcs.redrawTimer = null;
                    }
                    ghcs.redrawTimer = setTimeout(function() {
                        vis.redrawStat(ghcs.repo);
                        ghcs.redrawTimer = null;
                    }, 100);
                    psBar.setPos((ghcs.states.cur++ * 100 / (ghcs.states.max || 1)) + "%")
                        .setLabel("Completed " + ghcs.states.cur + " of " + ghcs.states.max + " commits ...");
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

function chSelect(e) {
    e = d3.select(this[this.selectedIndex]).datum();
    if (e) {
        ghcs.repo = e;
        e.dates = [];
        runBtn.enable();
    }
}

function chUser() {
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
}
