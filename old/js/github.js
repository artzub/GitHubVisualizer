/**
 * User: ArtZub
 * Date: 15.01.13
 * Time: 1:36
 */

'use strict';

var TYPE_REQUEST = {
        repos : 1,
        commits : 2
    }
    , TYPE_STATUS_FILE = {
        removed : 0,
        modified : 1,
        added : 2,
        renamed : 3
    }
    ;

function makeOAuthUrl(scope) {
    scope = scope || 'repo';
    if (Array.isArray(scope))
        scope = scope.join(',');
    return [
        'https://github.com/login/oauth/authorize?client_id=',
        ghcs.settings.access.ncid || ghcs.settings.access.client_id,
        '&scope=',
        scope,
        '&redirect_url=' + location.protocol + "://" + location.host + "/"
    ].join('');
}

function makeOAuthGetAccessTokenUrl(code) {
    return [
        '/proxy/https/',
        'github.com/login/oauth/access_token?',
        'client_id=',
        ghcs.settings.access.ncid || ghcs.settings.access.client_id,
        '&client_secret=',
        ghcs.settings.access.ncs || ghcs.settings.access.client_secret,
        '&code=',
        code || ghcs.settings.access.code
    ].join('');
}

function makeUrl(url, type, limit) {
    limit = limit || 0;
    var sec = '';
    if (TYPE_REQUEST.checkOAuth || !ghcs.settings.access.token) {
        sec = [
            "client_id=",
            ghcs.settings.access.ncid || ghcs.settings.access.client_id,
            "&client_secret=",
            ghcs.settings.access.ncs || ghcs.settings.access.client_secret
        ].join('');
    }
    else {
        sec = ['access_token=', ghcs.settings.access.token].join('');
    }

    if (type == TYPE_REQUEST.repos) {
        sec += (ghcs.rot ? "&per_page=100&type=" + ghcs.rot : "" );
    }
    else if(type == TYPE_REQUEST.commits) {
        limit = limit < 0 ? ghcs.limits.commits : limit;
        sec += "&per_page=" + (limit > 100 ? 100 : limit)
    }
    return url ? (url + (url.indexOf('?') === -1 ? '?' : '&') + sec) : url;
}

function crossUrl(url, rt) {
    return url;
}

function getDataFromRequest(req) {
    return req && req.meta && req.meta.status == 200 && req.data ? req.data : (log(req) && null);
}

function parseCommit(org_commit, commit){
    if (!commit || !org_commit || commit.sha != org_commit.sha)
        return;

    try {
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

        commit.files = !org_commit.files ? [] : org_commit.files.map(function(f) {
            if (TYPE_STATUS_FILE[f.status] == undefined)
                console.log(f.status);

            f.status = TYPE_STATUS_FILE[f.status];

            if (f.changes > 0) {
                s.changes += f.changes;
                s.additions += f.additions;
                s.deletions += f.deletions;
            }
            else if(f.status) {
                commit.stats.changes++;
                commit.stats.additions++;
            }
            else if(!f.status) {
                commit.stats.changes -= commit.stats.changes ? 1 : 0;
                commit.stats.additions -= commit.stats.additions ? 1 : 0;
            }

            (f.status == TYPE_STATUS_FILE.modified || f.status == TYPE_STATUS_FILE.renamed) && s.f.m++;
            f.status == TYPE_STATUS_FILE.added && s.f.a++;
            !f.status && s.f.d++;

            return {
                name : f.filename.toLowerCase(),
                changes : f.changes || 0,
                additions : f.additions || 0,
                deletions : f.deletions || 0,
                status : f.status
            }
        });

        ghcs.repo.stats = ghcs.repo.stats || {};
        ghcs.repo.stats.changes = d3.max([ghcs.repo.stats.changes || 0, commit.stats.deletions, commit.stats.additions]);
        ghcs.repo.stats.files = d3.max([ghcs.repo.stats.files || 0, s.f.a + s.f.m, s.f.d]);
    }
    catch (e) {
        log(e);
    }
}

function upCommits() {
    redrawStats();

    updateStatus(ghcs.states.cur++);
    ldrTop.show();
    psBar.show();
    checkCompleted();
}

function makeGravatar(email) {
    return email ? "https://secure.gravatar.com/avatar/" + md5(email) + "?d=identicon&f=y&s=96" : email;
}

function preloadImage(url) {
    var image;
    image = ghcs.imageHash.get(url);
    if (!image) {
        image = new Image();
        image.onerror = function () {

            return log({error : "Image isn't loaded", url : this.src});
        };
        image.src = crossUrl((url || (url = "https://secure.gravatar.com/avatar/" + Date.now() + Date.now() + "?d=identicon&f=y&s=96")), "image");

        ghcs.imageHash.set(url, image);
    }
    return image;
}

function parseCommits(commits) {
    ghcs.repo.commits = ghcs.repo.commits || d3.map({});
    if (commits && commits.length) {
        updateStatus(ghcs.states.cur);
        psBar.show();
        ldrTop.show();

        commits.forEach(function(d, i) {
            var obj = ghcs.repo.commits.get(d.sha);

            if (!obj) {
                obj = {
                    url : d.url,
                    sha : d.sha,
                    author : {
                        name :
                            !d.commit.author.name || d.commit.author.name == "unknown"
                                ? d.commit.author.email.replace(/@.*/, "")
                                : d.commit.author.name,
                        email : d.commit.author.email,
                        avatar_url : (d.author && d.author.avatar_url ? d.author.avatar_url : null),
                        login : d.author && d.author.login ? d.author.login : d.commit.author.email
                    },
                    committer : {
                        name :
                            !d.commit.committer.name || d.commit.committer.name == "unknown"
                                ? d.commit.committer.email.replace(/@.*/, "")
                                : d.commit.committer.name,
                        email : d.commit.committer.email,
                        avatar_url : (d.committer && d.committer.avatar_url ? d.committer.avatar_url : null),
                        login : d.committer && d.committer.login ? d.committer.login : d.commit.committer.email
                    },
                    date : Date.parse(d.commit.author.date),
                    message : d.commit.message,
                    parents : d.parents
                };
                ghcs.repo.commits.set(obj.sha, obj);

                obj.committer.avatar = preloadImage(obj.committer.avatar_url || (obj.committer.avatar_url = makeGravatar(obj.committer.email)));
                obj.author.avatar = preloadImage(obj.author.avatar_url || (obj.author.avatar_url = makeGravatar(obj.author.email)));
            }

            if (!obj.files && !criticalError.visible) {
                JSONP(makeUrl(obj.url), (function(c) {
                    return function(req) {
                        parseCommit(getDataFromRequest(req), ghcs.repo.commits.get(c.sha));
                        upCommits();
                    };
                })(obj), {
                    onerror : function(err) {
                        log(err);
                        upCommits();
                    }
                });
            }
            else {
                upCommits();
            }

            if (ghcs.repo.dates.indexOf(obj.date) < 0) {
                ghcs.repo.dates.push(obj.date);
                ghcs.repo.dates.sort(d3.ascending);
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
                return !d.hasOwnProperty("nodeValue");
            }).map(function (d) {
                d = {
                    x : (Math.random() * w) || 1,
                    y : (Math.random() * h) || 1,
                    visible : true,
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
                        lang : d.language || "Multi",
                        forks : d.forks,
                        watchers : d.watchers,
                        forked : d.fork
                    }
                };
                return d;
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
    repoList.selectAll("li").classed("selected", function(d) {
        return d == e;
    });
}

function chUser(typeUser) {
    typeUser = typeUser || "users";

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
                    if (!criticalError.visible)
                        ldrTop.hide();
                    setTimeout(nextStepApplyParams, 500);
                };

                cbDlr.check();

                if (!ghcs.users.hasOwnProperty(login) || !ghcs.users[login].hasOwnProperty("repos")) {

                    ldrTop.show();
                    JSONP(makeUrl(ghcs.apiUrl + typeUser + "/" + login), function (req) {
                        var data = getDataFromRequest(req);
                        if (!data) {
                            parseRepos(null);
                            return;
                        }

                        if (data.type === "Organization" && typeUser !== "orgs")
                            return chUser("orgs");

                        var u = ghcs.users[data.login] = {info: data};
                        u.info.avatar = new Image();//preloadeImage(u.info.avatar_url);
                        u.info.avatar.src = u.info.avatar_url;

                        ghcs.login = data.login;

                        ghcs.states.max = +u.info.public_repos;
                        ghcs.states.cur = 0;

                        updateStatus(ghcs.states.cur, "loading ...");
                        psBar.show();

                        var url = data.repos_url;
                        if (ghcs.settings.access.token && ghcs.settings.access.username == login) {
                            url = ghcs.apiUrl + "user/repos";
                        }

                        if (url)
                            JSONP(makeUrl(url, TYPE_REQUEST.repos), function getAll(req) {
                                parseRepos(getDataFromRequest(req));
                                getNext(req, function(next) {
                                    if (next) {
                                        ldrTop.show();
                                        JSONP(next, getAll);
                                    }
                                });
                            }, {
                                onerror : function(err) {
                                    log(err);
                                }
                            });
                        else
                            parseRepos(null);
                        divStat.updateInfo();
                    }, {
                        onerror : function(err) {
                            log(err);
                        }
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
    var next;
    if (req && req.meta && req.meta.Link && !criticalError.visible) {
        next = req.meta.Link.reduce(function (a, b) {
            if (!a && b[1].rel == "next")
                return b[0];
            return a;
        }, null);
    }
    fn && fn(next);
}
function analyseCommits() {
    runBtn.disable();
    ldrTop.show();
    visBtn.disable().show();
    visBtnPause.hide();
    visBtnRestart.hide();
    visBtnStop.hide();
    vis.stopShow();

    ghcs.states.max = ghcs.limits.commits;
    ghcs.states.cur = 0;
    ghcs.states.loaded = 0;
    ghcs.states.complete = function() {
        stepsBar.thirdStep();
        runBtn.enable();
        if (!criticalError.visible)
            ldrTop.hide();
        visBtn.enable().show();

        if (ghcs.repo && ghcs.repo.commits)
            ghcs.repo.commitsCount = ghcs.repo.commits.values().filter(function(d) {
                return !!d.files;
            }).length;
        vis.redrawStat(ghcs.repo);
        setTimeout(nextStepApplyParams, 500);
    };
    vis.layers.stat.toFront();

    cbDlsr.check();

    if (!ghcs.repo || !ghcs.repo.commits_url || ghcs.repo.loadedAll) {
        updateStatus(ghcs.states.cur = ghcs.states.max);
        checkCompleted();
        return;
    }

    GAEvent.Repos.Analyse(getUserRepo());
    JSONP(makeUrl(ghcs.repo.commits_url, TYPE_REQUEST.commits, ghcs.limits.commits), function getAll(req) {
        getNext(req, function(next) {
            var l = req && req.data && req.data instanceof Array ? req.data.length : 0;
            ghcs.states.loaded += l;
            l = ghcs.states.max - ghcs.states.loaded;

            if (next && l > 0) {
                updateStatus(ghcs.states.cur);
                psBar.show();
                ldrTop.show();
                JSONP(next.replace("per_page=100", "per_page=" + (l > 100 ? 100 : l)),
                    getAll, {
                        onerror : (function(len) {
                            return function(err) {
                                ghcs.states.max -= len;
                                log(err);
                            };
                        })(l)
                    });
            }
            else {
                if (!next && !criticalError.visible)
                    ghcs.repo.loadedAll = true;

                ghcs.states.max =
                    ghcs.states.loaded;
            }
        });
        parseCommits(getDataFromRequest(req));
    });
}
