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
	getCIds: function(){
		this.getCommunityIds();
		return this._communityIds;
	},
	/** Sets cids **/
	setCIds:function(cidsString){
		this._communityIds = cidsString;
		return this._communityIds;
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
	* Asks actionscript for communityIds. If results are found, they are set
	* inside of the infiniteJsConnector object and returned
	*/
	getCommunityIds: function()
	{
		var me = this;
		try {
			var cIdsStr = me.getFlashMovie().getCommunityIds();
			if (null != cIdsStr) {
				me._communityIds = cIdsStr;
			}
		}
		catch (e) {
		}
		return cIdsStr;
	},
	/**
	*	grabs community ids and current search state
	*	returns string ex: ?cids=1,2,3&mode=live
	**/
	getExtraUrlParams:function()
	{
		try{
			var cids = this.getCIds();
			var mode = this.getMode();
			return '?cids='+cids+'&mode='+mode;
		}catch(error){
			return 'error';
		}
	}

}
