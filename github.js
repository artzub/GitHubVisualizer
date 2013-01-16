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

    var s = commit.stats = {
        f : {
            m : 0,
            a : 0,
            d : 0
        },
        changes : 0,
        additions : 0,
        deletions : 0
    };

    commit.files = org_commit.files.map(function(f) {
        if (f.changes > 0) {
            s.changes += f.changes;
            s.additions += f.additions;
            s.deletions += f.deletions;
        }
        else if(f.status == "added" || f.status == "modified") {
            commit.stats.changes++;
            commit.stats.additions++;
        }
        else if(f.status == "deleted") {
            commit.stats.changes -= commit.stats.changes ? 1 : 0;
            commit.stats.additions -= commit.stats.additions ? 1 : 0;
        }

        f.status == "modified" && s.f.m++;
        f.status == "added" && s.f.a++;
        f.status == "deleted" && s.f.d++;

        return {
            name : f.filename,
            changes : f.changes || 0,
            additions : f.additions || 0,
            deletions : f.deletions || 0,
            status : f.status
        }
    });

    ghcs.repo.stats = ghcs.repo.stats || {};
    ghcs.repo.stats.changes = d3.max([ghcs.repo.stats.changes || 0, commit.stats.deletions, commit.stats.additions]);
    ghcs.repo.stats.files = d3.max([ghcs.repo.stats.files || 0, commit.files.length]);
}

function parseCommits(commits) {
    ghcs.repo.commits = ghcs.repo.commits || [];
    if (commits && commits.length) {
        updateStatus(ghcs.states.cur);
        psBar.show();
        ldrTop.show();

        ghcs.states.max += commits.length - 1;
        /*ghcs.asyncForEach(*/commits.forEach(function(d) {
            d = {
                url : d.url,
                sha : d.sha,
                author : {
                    name : d.commit.author.name,
                    email : d.commit.author.email
                },
                date : Date.parse(d.commit.author.date),
                avatar_url : (d.author && d.author.avatar_url ? d.author.avatar_url : null),
                message : d.commit.message,
                parents : d.parents
            };
            d.index = ghcs.repo.commits.push(d) - 1;
            JSONP(makeUrl(d.url), (function(c) {
                ghcs.repo.dates.push(c.date);
                ghcs.repo.dates.sort(d3.ascending);
                return function(req) {
                    parseCommit(getDataFromRequest(req), ghcs.repo.commits[c.index]);
                    redrawStats();
                    updateStatus(ghcs.states.cur++);
                    ldrTop.show();
                    psBar.show();
                    checkCompleted();
                };
            })(d), {
                onerror : function() {
                    redrawStats();
                    updateStatus(ghcs.states.cur++);
                    ldrTop.show();
                    psBar.show();
                    checkCompleted();
                }
            });

            if (d.avatar_url) {
                d.author.avatar = new Image();
                d.author.avatar.src = d.avatar_url;
            }
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
            rpsSel.enable();
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
        e.changes = [];
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
                rpsSel.disable();
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
