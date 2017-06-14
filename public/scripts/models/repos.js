'use strict';
var app = app || {};

(function(module) {
  const repos = {};

  repos.all = [];

  repos.requestRepos = function (callback) {
    $.ajax({
      url: 'https://api.github.com/user/repos',
      type: 'GET',
      headers: {
        'Authorization': `token ${githubToken}`
      }
    })
        .then(data => repos.all = data, err => console.error(err))
        .then(callback);
    };

  module.repos = repos;
})(app);
