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
    module.service('kibanaJsApiSrv', function ($rootScope, dashboard, querySrv, filterSrv) {

      // Save a reference to this
      var self = this;

      /**
       * Attach event listeners to some internal kibana events so we can expose them.
       */
      self.init = function () {
        console.log("[kibanaJsApi] init");

        //Monitor Kibana events so we can expose them
        $rootScope.$on('refresh', function () {
          console.log("[kibanaJsApi] Refresh observed");
          //TODO expose refresh event
        });
      };

      /**
       * Add the kibanaJsApi instance to this window and optionally a parent container.
       * @param installToParent
       */
      self.install = function( installToParent ){
        window.kibanaJsApi = this;
        //Install the KibanaJsApi to kibana's container's document if it exists
        if (installToParent && window.parent !== window) {
          console.log("[kibanaJsApi] Install API to IFrame Parent");
          window.parent.kibanaJsApi = this;
        }
      };


      /**
       * Refresh the current dashboard
       */
      self.refreshDashboard = function () {
        //var appScope = angular.element(window.document).scope();
        console.log("[KibanaJsApi->refreshDashboard] Refreshing dashboard");
        //appScope.$apply('dashboard.refresh()');
        dashboard.refresh();
        $rootScope.$apply();
      };

      /**
       * Add a new query item to the queryList
       */
      self.addQuery = function() {
        console.log("[KibanaJsApi->addQuery]");

        //Add an empty item
        querySrv.set({});

        //refresh and apply
        this.refreshDashboard();
      };

      /**
       * Get the dashboards current queryList
       * @returns {Array<Object>} An array of query items
       */
      self.getQueryList = function(){
        console.log("[KibanaJsApi->getQueryList]");
        return querySrv.getQueryObjs();
      };

      /**
       * Get the dashboards current queryList as a JSON String
       * @returns {string} A JSON String representing the current array of query items
       */
      self.getQueryListJson = function () {
        console.log("[KibanaJsApi->getQueryListJson]");
        var queryListJson = angular.toJson( this.getQueryList(), false);
        console.log("[KibanaJsApi->getQueryListJson] Query: ", queryListJson);
        return queryListJson;
      };

      /**
       * Replace the current queryList with a new one
       * @param queryList an array of query items
       */
      self.setQueryList = function( queryList ){

        console.log("[KibanaJsApi->setQueryList] Clearing query before setting items");

        //Empty the query but don't $apply yet
        this.resetQueryList( true /*No Refresh*/ );

        console.log("[KibanaJsApi->setQueryList] Setting query", queryList);

        _.each( queryList, function(q){
          if( q.id == 0 ) {
            querySrv.set( q, 0 );
          } else {
            querySrv.set( q );
          }
        });

        //refresh and apply
        this.refreshDashboard();
      };

      /**
       * Replace the current queryList with a new one using a json string
       * @param queryListJson A JSON String representing an array of query items.
       */
      self.setQueryListJson = function (queryListJson) {
        console.log("[KibanaJsApi->setQueryListJson] setting query list from json text");
        var queryList = angular.fromJson(queryListJson);
        this.setQueryList(queryList);
      };

      /**
       * Replace the current query list with a single '*'
       * @param noRefresh When boolean true, the dashboard will not be refreshed
       */
      self.resetQueryList = function( noRefresh ){
        console.log("[KibanaJsApi->resetQueryList] Resetting query to single '*'");

        _.each(querySrv.ids(), function(qId){
          querySrv.remove(qId);
        });

        //Reset the first item to '*'
        querySrv.set({
          "query":"*",
          "alias":"",
          "color":"#7EB26D",
          "pin":false,
          "type":"lucene",
          "enable":true
        });

        //refresh and apply
        if( noRefresh !== true ) {
          this.refreshDashboard();
        }
      };

      /**
       * Get the dashboards current filters as an array of Filters
       * @returns Array<Filter>
       */
      self.getFilters = function() {
        console.log("[KibanaJsApi->getFilters]");
        return filterSrv.list();
      };

      /**
       * Get the dashboards current filters as a JSON string representing array of filters
       * @returns {string}
       */
      self.getFiltersJson = function () {
        console.log("[KibanaJsApi->getFiltersJson]");
        var filtersJson = angular.toJson(this.getFilters(), false);
        console.log("[KibanaJsApi->getFiltersJson] Filters: ", filtersJson);
        return filtersJson;
      };

      /**
       * Replace the dashboards current filters with a new set. UpdateOnly will not
       * remove any items before setting the new ones in place.
       * @param filters An array of filters
       * @param updateOnly Set to boolean true to skip the removal process before setting filters.
       */
      self.setFilters = function( filters, updateOnly){
        console.log("[KibanaJsApi->setFiltersJson] setting filters", filters);

        if (updateOnly !== true) {
          this.removeFilters();
        }

        _.each(filters, function (filter) {
          console.log("[KibanaJsApi->setFilters]   setting filter", filter);
          filterSrv.set(filter, undefined, true); // true for no refresh
        });

        //refresh and apply
        this.refreshDashboard();
      };

      /**
       * See setFilters above. Accepts a JSON String representing an array of filters.
       * @param filtersJson
       * @param updateOnly
       */
      self.setFiltersJson = function (filtersJson, updateOnly) {
        console.log("[KibanaJsApi->setFiltersJson] setting filters", filtersJson);
        var filters = angular.fromJson(filtersJson);
        this.setFilters(filters,updateOnly);
      };

      /**
       * Remove all the filters from the dashboard
       */
      self.removeFilters = function () {
        console.log("[KibanaJsApi->removeFilters]");
        _.each( filterSrv.ids(), function(fId){
          filterSrv.remove(fId);
        });
      };

      /**
       * Get an object representing the current state of the dashboard.
       * This object can be used for the import functionality.
       * @returns {{queryList: Array.<Object>, filters: Array.<Filter>}}
       */
      self.exportConfig = function(){
        return {
          queryList: this.getQueryList(),
          filters: this.getFilters()
        };
      };

      /**
       * Get a JSON String representing the current config. See exportConfig above.
       * @returns {string} JSON String of current dashboard config
       */
      self.exportConfigJson = function(){
        return angular.toJson(this.exportConfig(), true);
      };

      /**
       * Import a previously exported dashboard state.
       * @param config
       */
      self.importConfig = function( config ){
        this.setFilters( config.filters );
        this.setQueryList( config.queryList );
        this.refreshDashboard();
      };

      /**
       * Import a previously exported dashboard state from a JSON String.
       * @param configJson
       */
      self.importConfigJson = function( configJson ){
        this.importConfig( angular.fromJson(configJson) );
      };

      // Now init
      self.init();

    });
  }
);