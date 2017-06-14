'use strict';
var app = app || {};

(function(module) {
  const repos = {};

  repos.all = [];

  repos.requestRepos = function (callback) {
    $.get('github/user/repos')
        .then(data => repos.all = data, err => console.error(err))
        .then(callback);
    };

  module.repos = repos;
})(app);
