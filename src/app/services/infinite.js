/**
 * This service also exposes an interface to a parent container, given this application
 * is within an iframe.
 *
 *
 */
define([
    'angular',
    'lodash',
    'config',
    'kbn'
  ], function (angular) {

    'use strict';

    var module = angular.module('kibana.services');
    module.service('infinite', function(dashboard, $rootScope) {

        // Create an object to hold our service state on the dashboard
        //dashboard.current.services.filter

        // Save a reference to this
        var self = this;

        var InfiniteAPI = function(){
            console.log("[InfiniteAPI] Initialized");
        };
        InfiniteAPI.prototype = {
          refresh: function(){
              var appScope = angular.element(window.document).scope();
              console.log("[InfiniteAPI->refresh] Refreshing dashboard", appScope);
              appScope.$apply('dashboard.refresh()');
          },

          //setQuery: function( query ){
          //
          //},

          setFilters: function( filters ){
            dashboard.current.services.filter = filters;
          }
        };

        // Call this whenever we need to reload the important stuff
        this.init = function() {

          console.log("[infiniteService] init");
          window.infiniteAPI = new InfiniteAPI();

          $rootScope.$on('refresh', function(){
            console.log("[infiniteService] Refresh observed");
          });

        };

        // Now init
        self.init();
      }
    );
  }
);