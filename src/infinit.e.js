/*******************************************************************************
 * Copyright 2012 The Infinit.e Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

// INITIALIZATION

var infiniteJsConnector = infiniteJsConnector || {

	_flashMovie: null,
	_jsConnectorParent: null,
	_mode: 'stashed',

	getFlashMovie: function(){
		return this._flashMovie;
	},
	/**
	*	possible values:
	*	- live 			... append: &mode=live
	*	- stashed 		... append: &mode=stashed
	*   ignore for now   - all records 	... append: &mode=all_records
	**/
	getMode: function(){
		return this._mode;
	},
	/**
	* Grabs the infinit.e.parent js connector object;
	*/
	getJsConnectorParent: function(){
		this._jsConnectorParent = parent.infiniteJsConnectorParent;
		return parent.infiniteJsConnectorParent;
	},
	/** returns set cids **/
	getCIds: function(url){
		return this.getCommunityIds(url);
	},
	/** sets mode **/
	setMode:function(modeString){
		this._mode = modeString;
		return this._mode;
	},
	getParentId: function() {
        var parentDoc = window;
        while(parentDoc !== parentDoc.parent)
        {
            parentDoc = parentDoc.parent;
        }
        parentDoc = parentDoc.document;
        var iFrames = parentDoc.getElementsByTagName('iframe');
        return iFrames[0].getAttribute("id");
	},
	/**
	* Initialization consists of defining flashMove in order to communicate
	* with the actionscript
	*/
	init: function () {
		var me = this;
			if (null == me._flashMovie) {
				if (document.getElementById) {
					me._flashMovie = parent.document.getElementById("Index");
				}else{}
			}
	},
	/**
	* Asks actionscript for communityIds. 
	*/
	getCommunityIds: function(url)
	{
		var me = this;
		try {
			var cIdsStr = me.getFlashMovie().getCommunityIds(url);
		}
		catch (e) {
		}
		return cIdsStr;
	},
	/**
	* Asks actionscript for data set flags (docs vs custom vs map/reduce). 
	*/
	getDatasetFlags: function()
	{
		var me = this;
		try {
			var datasetFlags = me.getFlashMovie().getDatasetFlags();
		}
		catch (e) {
		}
		return datasetFlags;
	},
	/**
	*	grabs community ids and current search state
	*	returns string ex: ?cids=1,2,3&mode=live
	**/
	getExtraUrlParams:function(url)
	{
		try{
			var params =  { 'cids': this.getCIds(url), 'mode': this.getMode() };
			var datasetFlags = this.getDatasetFlags();
			if (datasetFlags && (datasetFlags.length > 0)) {
				var datasetFlagsObj = datasetFlags.split('&');
				for (var x in datasetFlagsObj) {
					var paramPair = datasetFlagsObj[x].split("=", 2);
					if ((2 == paramPair.length) && (paramPair[0].length > 0)) {
						params[paramPair[0]] = paramPair[1];
					}
				}
			}
			return params;
		}catch(error){
			console.log("getExtraUrlParams: " + error.message)
			return null;
		}
	},
	/**
	* Generally called from actionscript with a true if live, false if stashed. 
	* This function will set the mode within the infiniteJsConnector object
	* to be grabbed whenever an httpservice call is made and "mode" is required.
	**/
	setLive:function(isLive){
		if(isLive==true){
			//development location
			//window.location = "kibanaBin/dist/index.html#Kibana_LiveTemplate.json";
			//production location
			window.location = "/infinit.e.records/static/kibana/index.html#/dashboard/file/Kibana_LiveTemplate.json";
			infiniteJsConnector.setMode('live');
			
		}else if(isLive==false){
			//development location
			//window.location = "kibanaBin/dist/index.html#Kibana_StashedTemplate.json";
			//production location
			window.location = "/infinit.e.records/static/kibana/index.html#/dashboard/file/Kibana_StashedTemplate.json";
			infiniteJsConnector.setMode('stashed');
		}
	},
	/**
	* Called when url parameters are provided. 
	* URL parameters are only ever supplied when the widget is run outside 
	* of an actionscript iframe.
	*
	* Takes the provided parameter string and grabs the cids and mode.
	* With this information, cids and mode are stored in the infiniteJsConnector
	* object to be used in anything kibana would need.
	*
	* (param) paramString:String example: "?cids=1,2,3&mode=live
	*/
	onWidgetLoadWithParameters:function(paramString){
		var str = paramString;
		var params = str.split("&");
		if (params.length > 0) {
			for (var x in params) {
				var keyval = params[x].split('=');
				if (keyval.length > 1) {
					var key = keyval[0];
					if ((key == '?cids') || (key == 'cids')) {
						infiniteJsConnector.setCIds(keyval[1]);
					}
					if ((key == '?mode') || (key == 'mode')) {
						infiniteJsConnector.setMode(keyval[1]);
					}
				}
			}
		}
	}

}
