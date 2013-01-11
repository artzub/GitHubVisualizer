var ghcs = {users:{}};


var log = (function() {
  var logCont = d3.select("#console")
      .append("ul");  
  return function(msg) {
    logCont.append("li").text(msg);
  }
})();

var w = document.width,
    h = document.height,
    svg = d3.select("#canvas")
      .append("svg")
      .attr("width", w)
      .attr("height", h),
    gitData;

function loadGitData() {
  d3.json("", function(data) {
  })
}

function parseRepos(data) {
  var opts = d3.select("#repo").selectAll("option.ritem"),
      lbl = d3.selectAll("label[for='repo']");
  
  lbl.text("Repo:");
  
  opts.remove();
  if (data) {
    if (!ghcs.users.hasOwnProperty(ghcs.login))
      ghcs.users[ghcs.login].repos = data.filter(function(d) { return !d.private; }).map(function(d) { return { 
        id: d.id, 
        name : d.name, 
        url : d.url
      }; });
    
    opts.data(ghcs.users[ghcs.login].repos)
      .enter()
      .append("option")
      .attr("class", "ritem");      
    lbl.text("Repo (" + ghcs.users[ghcs.login].repos.lenght + "):");
  }
  else
    delete ghcs.users[ghcs.login]["repos"];
}

d3.select("#user")
  .on("change", function(e) {    
    if (ghcs.chUserTimer) {
      clearTimeout(ghcs.chUserTimer);
      delete ghcs.chUserTimer;
    }
    ghcs.chUserTimer = setTimeout((function(login) {
      return function() {
        if (login) {
          ghcs.login = login;          
          if (!ghcs.users.hasOwnProperty(login) || !ghcs.users[login].hasOwnProperty("repos")) {
            d3.json("https://api.github.com/users/" + login, function(data) {
              
              ghcs.users[data.login].info = data;
              ghcs.login = data.login;
              
              if (data && data.repos_url)
                d3.json(data.repos_url, parseRepos);
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