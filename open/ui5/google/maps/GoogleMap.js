/********************************************************************************************************************
 * Version   		1.0.0
 * Date		 	April,10 2014
 * Developed by 	Robert Eijpe of NL for Business
 ********************************************************************************************************************/

jQuery.sap.declare("open.ui5.google.maps.GoogleMap");
jQuery.sap.require("sap.ui.core.CSSSize");
jQuery.sap.require("open.ui5.google.maps.MapTypeId");
sap.ui.core.Control.extend("open.ui5.google.maps.GoogleMap", {
		metadata : {
			properties : { 
				latitude  : {type:"float",  defaultValue : -34.397},
				longitude : {type:"float",  defaultValue : 150.644},
				mapTypeId : {type:"open.ui5.google.maps.MapTypeId", defaultValue : open.ui5.google.maps.MapTypeId.ROADMAP},
				zoom	  : {type:"int", defaultValue : 12},
				height    : {type:"sap.ui.core.CSSSize", defaultValue : "400px"},
				width     : {type:"sap.ui.core.CSSSize", defaultValue : "400px"},
				margin    : {type:"sap.ui.core.CSSSize", defaultValue : "5px"}
			},
			events: {
				wrongAddress: {allowPreventDefault : true}  
			}
		},
		init : function() {
			this._html = new sap.ui.core.HTML({
				content : "<div style='height:100%;width:100%;' id='"
						+ this.getId() + "-map'  class='open-ui5-GoogleMaps-map'></div>"
			});
		},
		
		renderer : function(oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.writeAttributeEscaped("style", "margin:" + oControl.getMargin());
			oRm.write(" class=\"open-ui5-GoogleMaps\" ");
			oRm.write(">");
			oRm.renderControl(oControl._html);
			oRm.write("</div>");
		},
		
		onAfterRendering : function() {
			var googleControl = this;
			if (!googleControl._initialized) { 
				if (typeof google !== "undefined")
				{
				    googleControl._renderGoogleMap(googleControl);
				}
			
				else
				{
					var url = "http://www.google.com/jsapi?sensor=false&_GoogleMapId=" + this.getId(); 
					$.getScript(url)
						.done(function(s) {
							var googleMapId = "";
							var queryList = this.url.slice(this.url.indexOf('?') + 1).split('&');
							for (var i = 0; i < queryList.length; i++) {
								var queryParam = queryList[i].split('=');
								if (queryParam[0] == '_GoogleMapId') {
									googleMapId = queryParam[1];
								}
							}
							if (googleMapId != "")
							{	
								var googleControl = sap.ui.getCore().byId(googleMapId);
								googleControl._loadGoogleMaps(googleMapId);		
							}					
						}
					);
				}							
			} 
			else { 
				this._map.setCenter(new google.maps.LatLng(this.getLatitude(), this.getLongitude()));
			}
		},

		_loadGoogleMaps : function(googleMapId){
			google.load("maps", "3.6", {"other_params":"sensor=false", "callback" : function(){
				var googleControl = sap.ui.getCore().byId(googleMapId);
				googleControl._googleMapLoaded(googleMapId);
			}});
		},

		_googleMapLoaded : function(googleMapId){
			
			var googleControl = sap.ui.getCore().byId(googleMapId);
			googleControl._renderGoogleMap(googleControl);
		},
		
		
		_renderGoogleMap: function(googleControl){
		    

		        var mapTypeId = googleControl.getMapTypeId();
			switch (googleControl.getMapTypeId()) {
			case "ROADMAP":
			    	mapTypeId = google.maps.MapTypeId.ROADMAP;
				break;
			case "SATELLITE":
			    	mapTypeId = google.maps.MapTypeId.SATELLITE;
				break;
			case "HYBRID":
			    	mapTypeId = google.maps.MapTypeId.HYBRID;
				break;
			case "TERRAIN":
			    	mapTypeId = google.maps.MapTypeId.TERRAIN;
				break;
			default:
			    	mapTypeId = googleControl.getMapTypeId();
				break;
		}
			
		    googleControl._geocoder = new google.maps.Geocoder();
		    googleControl._latlng = new google.maps.LatLng(googleControl.getLatitude(), googleControl.getLongitude());
		    googleControl._mapOptions = {
			    zoom: googleControl.getZoom(),
			    center: googleControl._latlng,
			    mapTypeId: mapTypeId
		    };
		    googleControl._map = new google.maps.Map(jQuery.sap.domById(googleControl.getId() + "-map"), googleControl._mapOptions);
		    $(jQuery.sap.domById(googleControl.getId())).css("height",googleControl.getHeight());
		    $(jQuery.sap.domById(googleControl.getId())).css("width",googleControl.getWidth());	
		},
		
		
		
		
		getAddress: function(address) {
		    this._geocoder.geocode( { 'address': address}, this._getAddressResult.bind(this));
		},
		
		_getAddressResult: function(results, status) {
		    	if (status == google.maps.GeocoderStatus.OK) {
		    	    var googleControl = this;
		    	    googleControl._map.setCenter(results[0].geometry.location);
		    	    googleControl._marker = new google.maps.Marker({
		    		map: this._map,
		    		position: results[0].geometry.location
		    	    });
		    	} else {
		    	    this.fireWrongAddress({status: status});
		    	}
		}
	});