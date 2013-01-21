/**
 * User: ArtZub
 * Date: 15.01.13
 * Time: 1:36
 */

'use strict';

function makeUrl(url) {
    var sec = "client_id=c45417c5d6249959a91d&client_secret=4634b3aa7549c3d6306961e819e5ec9b355a6548&per_page=" + ghcs.limits.commits;
    return url ? (url + (url.indexOf('?') === -1 ? '?' : '&') + sec) : url;
}

function randTrue() {
    return Math.round((Math.random() * 2) % 2);
}


function getDataFromRequest(req) {
    return req && req.meta && req.meta.status == 200 && req.data ? req.data : (log(req), null);
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
        else if(f.status == "removed") {
            commit.stats.changes -= commit.stats.changes ? 1 : 0;
            commit.stats.additions -= commit.stats.additions ? 1 : 0;
        }

        f.status == "modified" && s.f.m++;
        f.status == "added" && s.f.a++;
        f.status == "removed" && s.f.d++;

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

function upCommits() {
    redrawStats();
    updateStatus(ghcs.states.cur++);
    ldrTop.show();
    psBar.show();
    checkCompleted();
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
                    upCommits();
                };
            })(d), {
                onerror : function() {
                    upCommits();
                }
            });

            if (d.avatar_url) {
                d.author.avatar = new Image();
                d.author.avatar.src = d.avatar_url;
            }
        });
    }
    else {
        upCommits();
    }
}

function clearUserRepos() {
    if (ghcs.users.hasOwnProperty(ghcs.login) && ghcs.users[ghcs.login].hasOwnProperty("repos"))
        delete ghcs.users[ghcs.login]["repos"]
}

function parseRepos(data) {
    if (data) {
        ghcs.users[ghcs.login] = ghcs.users[ghcs.login] || {};
        ghcs.users[ghcs.login].repos = (ghcs.users[ghcs.login].repos || []).concat(
            data.filter(function (d) {
                return !d.private && !d.hasOwnProperty("nodeValue");
            }).map(function (d) {
                return {
                    x : (Math.random() * w) || 1,
                    y : (Math.random() * h) || 1,
                    nodeValue : {
                        id: d.id,
                        name: d.name,
                        url: d.url,
                        html_url: d.html_url,
                        commits_url : d.commits_url.replace(/{.*$/, ""),
                        size : d.size,
                        date : Date.parse(d.pushed_at || d.updated_at),
                        cdate : Date.parse(d.created_at),
                        desc : d.description,
                        lang : d.language || "None"
                    }
                };
            })
        );
        ghcs.states.cur = ghcs.users[ghcs.login].repos.length;
    }

    updateStatus(ghcs.states.cur, "loading ...");
    ldrTop.show();
    psBar.show();
    checkCompleted();

    redrawRepos();
}

function chSelect(e) {
    if (e) {
        ghcs.repo = e.nodeValue;
        ghcs.repo.dates = [];
        ghcs.repo.changes = [];
        runBtn.enable();
        curRep.setName(e);
    }
    else {
        ghcs.repo = null;
        runBtn.disable();
        curRep.setName(null);
        stepsBar.secondStep();
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
                stepsBar.firstStep();
                curRep.setName(null);
                vis.clearRepos();
                userTxt.disable();
                showBtn.disable();
                runBtn.disable();
                ghcs.login = login;
                ghcs.repo = null;
                redrawStats();

                ghcs.states.complete = function() {
                    stepsBar.secondStep();
                    ldrTop.hide();
                };

                if (!ghcs.users.hasOwnProperty(login) || !ghcs.users[login].hasOwnProperty("repos")) {

                    ldrTop.show();
                    JSONP(makeUrl("https://api.github.com/users/" + login), function (req) {
                        var data = getDataFromRequest(req);
                        if (!data) {
                            parseRepos(null);
                            return;
                        }

                        var u = ghcs.users[data.login] = {info: data};
                        u.info.avatar =  new Image();
                        u.info.avatar.src = u.info.avatar_url;

                        ghcs.login = data.login;

                        ghcs.states.max = +u.info.public_repos;
                        ghcs.states.cur = 0;

                        updateStatus(ghcs.states.cur, "loading ...");
                        psBar.show();

                        if (data.repos_url)
                            JSONP(makeUrl(data.repos_url), function getAll(req) {
                                parseRepos(getDataFromRequest(req));
                                getNext(req, function(next) {
                                    ldrTop.show();
                                    JSONP(next, getAll);
                                });
                                divStat.updateInfo();
                            });
                        else
                            parseRepos(null);
                        divStat.updateInfo();
                    });
                }
                else {
                    ghcs.states.max = ghcs.users[login].repos ? ghcs.users[login].repos.length : 0;
                    parseRepos(ghcs.users[login].repos);
                }
                divStat.updateInfo();
                userTxt.enable();
            }
        }
    })(userTxt.property("value")), 300);
}

function getNext(req, fn) {
    if (req && req.meta && req.meta.Link) {
        var next = req.meta.Link.reduce(function (a, b) {
            if (!a && b[1].rel == "next")
                return b[0];
            return a;
        }, null);
        next && fn && fn(next);
    }
}
function analyseCommits() {
    runBtn.disable();
    ldrTop.show();

    ghcs.states.max = 0;
    ghcs.states.cur = 0;
    ghcs.states.complete = function() {
        stepsBar.thirdStep();
        runBtn.enable();
        ldrTop.hide();
        vis.redrawStat(ghcs.repo);
    };
    vis.layers.ordering("stat", 0);

    JSONP(makeUrl(ghcs.repo.commits_url), function getAll(req) {
        ghcs.states.max++;
        parseCommits(getDataFromRequest(req));
        ghcs.limits.commits > ghcs.states.max && getNext(req, function(next) {
            updateStatus(ghcs.states.cur);
            psBar.show();
            ldrTop.show();
            JSONP(next, getAll);
        });
    });
}
