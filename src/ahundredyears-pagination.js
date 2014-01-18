/**
 * Angular Pagination - ripped out of https://github.com/angular/builtwith.angularjs.org
 * @version v0.0.0 - 2014-01-09
 * @author Bobby Santiago <bobby@100yea.rs>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

angular.module('ahundredyears.pagination', [])

angular.module('ahundredyears.pagination')

.directive('pagination', [ function() {
  return {
    restrict: 'E',
    template: "<div ng-click='lightbox(article)' class='block'> <img src='{{article.thumbnail_url}}'/><h2>{{article.title}}</h2> <p class='pagination-article-text'>{{article.text}}</p><p><a href='#' >Read more</a></p></div>",
    scope: {
      article: '=',
      lightbox: '=',
      addTag: '='
    }
  }
}])

.controller('PaginationController', ['$scope', '$http', '$filter', '$log', function ($scope, $http, $filter, $log) {
  $scope.$log = $log;
  $scope.sortables = [
    {
      label: 'Unsorted',
      val: 'none'
    },
    {
      label: 'Latest',
      val: 'submissionDate'
    },
    {
      label: 'Description',
      val: 'text'
    },
    {
      label: 'Submitter',
      val: 'submitter'
    }
  ];
  $scope.sortPrep = 'none';

  var lightbox = false;
  window.onpopstate = function (ev) {
    lightbox = ev.state;
    $scope.$apply();
  };
  window.onkeydown = function (ev) {
    if (ev.keyCode === 27 && lightbox) {
      $scope.lightbox(false);
      $scope.$apply();
    }
  }
  $scope.lightbox = function (arg) {
    if (typeof arg !== 'undefined') {
      // if (arg !== false) {
      //   history.pushState(arg, null, 'articles/' + arg.id);
      // } else {
      //   history.pushState(false, null, '/');
      // }
      lightbox = arg;
    }
    return lightbox;
  };

  $http.get('data/articles.json').
    success(function (data, status, headers, config) {
      $scope.articles = data.articles;
      $scope.articles.sort(function () {
        return Math.random() - 0.5;
      });

      // find the featured articles
      $scope.featured = data.featured;

      $scope.tags = [];
      $scope.activeTags = [];

      // add tags
      angular.forEach(data.articles, function (article) {
        article.id = article.title.replace(/ /g, '-');
        angular.forEach(article.tags, function (tag) {

          // ensure tags are unique
          if ($scope.tags.indexOf(tag) === -1) {
            $scope.tags.push(tag);
          }
        });
      });

      $scope.tags.sort();
      $scope.search();

    }).
    error(function (data, status, headers, config) {
      // TODO: display a nice error message?
      $scope.error = "Cannot get data from the server";
    });


  var num = 3;
  $scope.filteredArticles = [];
  $scope.groupedArticles = [];

  // search helpers
  var searchMatch = function (haystack, needle) {
    if (!needle) {
      return true;
    }
    return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
  };

  var hasAllTags = function (haystack, needles) {
    var ret = true;
    angular.forEach(needles, function (needle) {
      if (haystack.indexOf(needle) === -1) {
        ret = false;
      }
    });
    return ret;
  };

  $scope.search = function () {
    $scope.filteredArticles = $filter('filter')($scope.articles, function (article) {
      return (searchMatch(article.desc, $scope.query) || searchMatch(article.title, $scope.query)) &&
        hasAllTags(article.tags, $scope.activeTags);
    });

    if ($scope.sortPrep !== 'none') {
      $scope.filteredArticles = $filter('orderBy')($scope.filteredArticles, $scope.sortPrep);
    }

    $scope.currentPage = 0;
    $scope.group();
  };

  // re-calculate groupedArticles in place
  $scope.group = function () {
    $scope.groupedArticles.length = Math.ceil($scope.filteredArticles.length / num);

    for (var i = 0; i < $scope.filteredArticles.length; i++) {
      if (i % num === 0) {
        $scope.groupedArticles[Math.floor(i / num)] = [ $scope.filteredArticles[i] ];
      } else {
        $scope.groupedArticles[Math.floor(i / num)].push($scope.filteredArticles[i]);
      }
    }

    if ($scope.filteredArticles.length % num !== 0) {
      $scope.groupedArticles[$scope.groupedArticles.length - 1].length = num - ($scope.filteredArticles.length % num);
    }

    $scope.groupToPages();
  };

  var itemsPerPage = 3;
  $scope.pagedArticles = [];
  $scope.currentPage = 0;

  // calc pages in place
  $scope.groupToPages = function () {
    $scope.pagedArticles = [];

    for (var i = 0; i < $scope.groupedArticles.length; i++) {
      if (i % itemsPerPage === 0) {
        $scope.pagedArticles[Math.floor(i / itemsPerPage)] = [ $scope.groupedArticles[i] ];
      } else {
        $scope.pagedArticles[Math.floor(i / itemsPerPage)].push($scope.groupedArticles[i]);
      }
    }
  };

  $scope.addTag = function (tagName) {
    tagName = tagName || this.tag;

    // only allow tags to be added uniquely
    if ($scope.activeTags.indexOf(tagName) !== -1) {
      return;
    }

    angular.forEach($scope.tags, function (tag, i) {
      if (i === 0 && tag === tagName) {
        $scope.activeTags.push($scope.tags.shift());
      } else if (tag === tagName) {
        $scope.tags.splice(i, 1);
        $scope.activeTags.push(tag);
      }
    });

    $scope.activeTags.sort();
    $scope.search();
  };

  // TODO: code duplicated here
  $scope.removeTag = function () {
    var tagName = this.tag;

    angular.forEach($scope.activeTags, function (tag, i) {
      if (i === 0 && tag === tagName) {
        $scope.tags.push($scope.activeTags.shift());
      } else if (tag === tagName) {
        $scope.activeTags.splice(i, 1);
        $scope.tags.push(tag);
      }
    });

    $scope.tags.sort();
    $scope.search();
  };

  // like python's range fn
  $scope.range = function (start, end) {
    var ret = [];
    if (!end) {
      end = start;
      start = 0;
    }
    for (var i = start; i < end; i++) {
      ret.push(i);
    }
    return ret;
  };

  $scope.prevPage = function () {
    if ($scope.currentPage > 0) {
      $scope.currentPage--;
    }
  };

  $scope.nextPage = function () {
    if ($scope.currentPage < $scope.pagedArticles.length - 1) {
      $scope.currentPage++;
    }
  };

  $scope.setPage = function () {
    $scope.currentPage = this.n;
  };

}]);