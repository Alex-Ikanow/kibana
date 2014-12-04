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
  ], function (angular, _) {

    'use strict';

    var module = angular.module('kibana.services');
    module.service('infinite', function (dashboard, $rootScope, querySrv, filterSrv, $timeout) {

        // Create an object to hold our service state on the dashboard
        //dashboard.current.services.filter

        // Save a reference to this
        var self = this;

        var emptyQuery = {"query":"*","alias":"","color":"#7EB26D","id":0,"pin":false,"type":"lucene","enable":true};

        var InfiniteAPI = function () {
          console.log("[InfiniteAPI] Initialized");
        };
        InfiniteAPI.prototype = {

          /**
           * Refresh the current dashboard
           */
          refresh: function () {
            //var appScope = angular.element(window.document).scope();
            console.log("[InfiniteAPI->refresh] Refreshing dashboard");
            //appScope.$apply('dashboard.refresh()');
            dashboard.refresh();
            $rootScope.$apply();
          },

          addQuery: function(){
            console.log("[InfiniteAPI->addQuery]");

            //Add an empty item
            querySrv.set({});

            //refresh and apply
            this.refresh();
          },

          getQuery: function(){
            console.log("[InfiniteAPI->getQuery]");
            return querySrv.getQueryObjs();
          },

          getQueryJson: function () {
            console.log("[InfiniteAPI->getQueryJson]");
            var queryJson = angular.toJson( this.getQuery(), false);
            console.log("[InfiniteAPI->getQueryJson] Query: ", queryJson);
            return queryJson;
          },

          setQuery: function( query ){
            console.log("[InfiniteAPI->setQuery] setting query", query);

            //Empty the query but don't $apply yet
            this.resetQuery( true /*No Refresh*/ );

            for (var index in query ) {
              console.log("[InfiniteAPI->setQuery]    Setting Item", query[index]);
              var q = query[index];
              if( q.id == 0 ) {
                querySrv.set( q, 0 );
              } else {
                querySrv.set( q );
              }
            }

            //refresh and apply
            this.refresh();
          },

          setQueryJson: function (queryJson) {
            console.log("[InfiniteAPI->setQueryJson] setting query");
            var query = angular.fromJson(queryJson);
            this.setQuery(query);
          },

          resetQuery: function( noRefresh ){
            console.log("[InfiniteAPI->resetQuery] Resetting query to single '*'");

            var queryIDs = querySrv.ids();
            for (var n in queryIDs) {
              var queryId = queryIDs[n];
              querySrv.remove(queryId);
            }

            //Reset the first item to '*'
            querySrv.set(emptyQuery);

            //refresh and apply
            if( noRefresh !== true ) {
              this.refresh();
            }
          },

          getFilters: function(){
            console.log("[InfiniteAPI->getFilters]");
            return filterSrv.list();
          },

          getFiltersJson: function () {
            console.log("[InfiniteAPI->getFiltersJson]");
            var filtersJson = angular.toJson(this.getFilters(), false);
            console.log("[InfiniteAPI->getFiltersJson] Filters: ", filtersJson);
            return filtersJson;
          },

          setFilters: function( filters, updateOnly){
            console.log("[InfiniteAPI->setFiltersJson] setting filters", filters);

            if (updateOnly !== true) {
              this.removeFilters();
            }

            _.each(filters, function (filter) {
              console.log("[InfiniteAPI->setFilters]   setting filter", filter);
              filterSrv.set(filter, filter.id );
            });

            //refresh and apply
            this.refresh();
          },

          setFiltersJson: function (filtersJson, updateOnly) {
            console.log("[InfiniteAPI->setFiltersJson] setting filters", filtersJson);
            var filters = angular.fromJson(filtersJson);
            this.setFilters(filters,updateOnly);
          },

          removeFilters: function () {
            console.log("[InfiniteAPI->removeFilters]");
            var filterIDs = filterSrv.ids();
            for (var n in filterIDs) {
              var filterId = filterIDs[n];
              filterSrv.remove(filterId);
            }
          }
        };

        // Call this whenever we need to reload the important stuff
        this.init = function () {

          console.log("[infiniteService] init");

          var infiniteAPI = new InfiniteAPI();

          window.infiniteAPI = infiniteAPI;
          //Install the infiniteAPI to kibana's container's document if it exists
          if (window.parent !== window) {
            console.log("[infiniteService] Install API to IFrame Parent");
            window.parent.infiniteAPI = infiniteAPI;
          }

          $rootScope.$on('refresh', function () {
            console.log("[infiniteService] Refresh observed");
          });

        };

        // Now init
        self.init();
      }
    );
  }
);