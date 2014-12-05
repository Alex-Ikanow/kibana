/**
 * This service also exposes an interface to a parent container, given this application
 * is within an iframe.
 */
define([
    'angular',
    'lodash'
  ], function (angular, _) {

    'use strict';

    var module = angular.module('kibana.services');
    module.service('jsApiService', function ($rootScope, dashboard, querySrv, filterSrv) {

        // Save a reference to this
        var self = this;

        //Private Instance variable
        var kibanaJsApi = null;

        var KibanaJsApi = function () {
          console.log("[KibanaJsApi] Initialized");
        };
        KibanaJsApi.prototype = {

          /**
           * Refresh the current dashboard
           */
          refreshDashboard: function () {
            //var appScope = angular.element(window.document).scope();
            console.log("[KibanaJsApi->refreshDashboard] Refreshing dashboard");
            //appScope.$apply('dashboard.refresh()');
            dashboard.refresh();
            $rootScope.$apply();
          },

          addQuery: function(){
            console.log("[KibanaJsApi->addQuery]");

            //Add an empty item
            querySrv.set({});

            //refresh and apply
            this.refreshDashboard();
          },

          getQueryList: function(){
            console.log("[KibanaJsApi->getQueryList]");
            return querySrv.getQueryObjs();
          },

          getQueryListJson: function () {
            console.log("[KibanaJsApi->getQueryListJson]");
            var queryListJson = angular.toJson( this.getQueryList(), false);
            console.log("[KibanaJsApi->getQueryListJson] Query: ", queryListJson);
            return queryListJson;
          },

          setQueryList: function( queryList ){
            console.log("[KibanaJsApi->setQueryList] setting query", queryList);

            //Empty the query but don't $apply yet
            this.resetQueryList( true /*No Refresh*/ );

            for (var i in queryList ) {
              console.log("[KibanaJsApi->setQuery]    Setting Item", queryList[i]);
              var q = queryList[i];
              if( q.id == 0 ) {
                querySrv.set( q, 0 );
              } else {
                querySrv.set( q );
              }
            }

            //refresh and apply
            this.refreshDashboard();
          },

          setQueryListJson: function (queryListJson) {
            console.log("[KibanaJsApi->setQueryListJson] setting query list from json text");
            var queryList = angular.fromJson(queryListJson);
            this.setQueryList(queryList);
          },

          resetQueryList: function( noRefresh ){
            console.log("[KibanaJsApi->resetQueryList] Resetting query to single '*'");

            var queryIDs = querySrv.ids();
            for (var n in queryIDs) {
              var queryId = queryIDs[n];
              querySrv.remove(queryId);
            }

            //Reset the first item to '*'
            querySrv.set({
              "query":"*",
              "alias":"",
              "color":"#7EB26D",
              "id":0,
              "pin":false,
              "type":"lucene",
              "enable":true
            });

            //refresh and apply
            if( noRefresh !== true ) {
              this.refreshDashboard();
            }
          },

          getFilters: function(){
            console.log("[KibanaJsApi->getFilters]");
            return filterSrv.list();
          },

          getFiltersJson: function () {
            console.log("[KibanaJsApi->getFiltersJson]");
            var filtersJson = angular.toJson(this.getFilters(), false);
            console.log("[KibanaJsApi->getFiltersJson] Filters: ", filtersJson);
            return filtersJson;
          },

          setFilters: function( filters, updateOnly){
            console.log("[KibanaJsApi->setFiltersJson] setting filters", filters);

            if (updateOnly !== true) {
              this.removeFilters();
            }

            _.each(filters, function (filter) {
              console.log("[KibanaJsApi->setFilters]   setting filter", filter);
              filterSrv.set(filter);
            });

            //refresh and apply
            this.refreshDashboard();
          },

          setFiltersJson: function (filtersJson, updateOnly) {
            console.log("[KibanaJsApi->setFiltersJson] setting filters", filtersJson);
            var filters = angular.fromJson(filtersJson);
            this.setFilters(filters,updateOnly);
          },

          removeFilters: function () {
            console.log("[KibanaJsApi->removeFilters]");
            var filterIDs = filterSrv.ids();
            for (var n in filterIDs) {
              var filterId = filterIDs[n];
              filterSrv.remove(filterId);
            }
          },

          exportConfig: function(){
            return {
              queryList: this.getQueryList(),
              filters: this.getFilters()
            };
          },

          exportConfigJson: function(){
            return angular.toJson(this.exportConfig(), true);
          },

          importConfig: function( config ){
            this.setFilters( config.filters );
            this.setQueryList( config.queryList );
            this.refreshDashboard();
          },

          importConfigJson: function( configJson ){
            this.importConfig( angular.fromJson(configJson) );
          }
        };

        // Call this whenever we need to reload the important stuff
        this.init = function () {
          console.log("[jsApiService] init");
          kibanaJsApi = new KibanaJsApi();

          //Monitor Kibana events so we can expose them
          $rootScope.$on('refresh', function () {
            console.log("[jsApiService] Refresh observed");
            //TODO expose refresh event
          });
        };

        /**
         * Add the kibanaJsApi instance to this window and optionally a parent container.
         * @param installToParent
         */
        this.install = function( installToParent ){
          window.kibanaJsApi = kibanaJsApi;
          //Install the KibanaJsApi to kibana's container's document if it exists
          if (installToParent && window.parent !== window) {
            console.log("[jsApiService] Install API to IFrame Parent");
            window.parent.kibanaJsApi = kibanaJsApi;
          }
        }

        // Now init
        self.init();
      }
    );
  }
);