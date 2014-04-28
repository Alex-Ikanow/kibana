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
	_communityIds: '',
	
	getFlashMovie: function(){
		return this._flashMovie;
	},
	/**
	* Grabs the infinit.e.parent js connector object;
	*/
	getCIds: function(){
		this.getCommunityIds();
		return this._communityIds;
	},
	getJsConnectorParent: function(){
		this._jsConnectorParent = parent.infiniteJsConnectorParent;
		return parent.infiniteJsConnectorParent;
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

	init: function () {
	var me = this;
	//console.log('kibana infinite.js init');
		if (null == me._flashMovie) {
		    // OK for some reason, Chrome puts scroll bars up so we'll remove them...
		    // the sizes all look fine, so no idea why..
		    //var id = '#' + infiniteJsConnector.getParentId().substring(7);
		    //$(window.parent.document).find(id).css("overflow", "hidden");
		
		    if (document.getElementById) {
		    	me._flashMovie = parent.document.getElementById("Index");
				//console.log('_flashmovie set')
				//console.log(me._flashMovie);
				//var widgetId = window.frameElement.id; //get widget id for parent to communicate
				//infiniteJsConnector.getJsConnectorParent().subscribe('getAssociations','onGetAssociations',widgetId);
		    }else{
				//console.log('document.getElementById is not defined');
			}
		}
	},
	
	// CALLBACKS
	onNewDocumentSet: function() {},	
	onGetAssociations:function(inData){
		onDataCatch(inData);
	},
	pingTool: function(){
		//console.log('pingTool from infinit.e.jsconnector');
	},
	//ACCESSORS
	getCommunityIds: function()
	{
		var me = this;
		var associations = [];
		try {
			var cIdsStr = me.getFlashMovie().getCommunityIds();
			if (null != cIdsStr) {
				//cIds = JSON.parse(cIdsStr);
				console.log('getCommunityIds client: '+cIdsStr);
				me._communityIds = cIdsStr;
			}
		}
		catch (e) {
			//console.log('error in infiniteJsConnector.getCommunityIds()');
			//console.log(e);
			//alert("getAssociationsJS: " + e);
		}
		return cIdsStr;
	},
	getAssociations: function(maxAssociations)
	{
		var associations = [];
		try {
			var associationsStr = infiniteJsConnector._flashMovie.getAssociations(maxAssociations);
			if (null != associationsStr) {
				associations = JSON.parse(associationsStr);
			}
		}
		catch (e) {
			//alert("getAssociationsJS: " + e);
		}
		return associations;
	}
	
}

