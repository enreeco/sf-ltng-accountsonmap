({
    //ref t the map object
    map: null,
    
    //calculates top and bottom bounds of the leafs
    checkMapBounds: function(lat, lng, topLocation, bottomLocation){
        
        if(topLocation[0] > lat){
            topLocation[0] = lat;
        }
        if(topLocation[1] > lng){
            topLocation[1] = lng;
        }
        
        if(bottomLocation[0] < lat){
            bottomLocation[0] = lat;
        }
        if(bottomLocation[1] < lng){
            bottomLocation[1] = lng;
        }
    },
    
    //handles the popup event
    handlePopupOpen: function(component, event){
		
        var popup = jQuery(event.popup._contentNode).find('div');
        
        var accountid = popup.attr('data-account-id');
        
        popup.on('click', function(){
			window.open("/"+accountid);
        });
    },
    
    //loads near by accounts on map
	loadNearbyAccounts : function(component, event) {
        
        //resets the map
        if(this.map){
            this.map.remove();
        }
        var globalId = component.getGlobalId();
		
        //creates the map
        this.map = L.map(globalId+'map', {zoomControl: true});
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
                    {
                        attribution: 'Salesforce is Awesome'
                    }).addTo(this.map);
        
		var self = this;
        var globalId = component.getGlobalId();
        var radius = parseInt(component.get('v.radius'));
        var units = component.get('v.units');
		
        //controller action
        var action = component.get("c.loadNearbyAccounts");
        action.setParams({
            'radius': radius,
            'units': units
        });

        action.setCallback(this, function(a) {
            if(a.error && a.error.length){
                console.log(a.error);
                return;
            }
            var mapData = a.getReturnValue();
            var topLocation = [1000000, 1000000];
            var bottomLocation = [-1000000,-1000000];
            
            for(var i = 0; i < mapData.accounts.length; i++){
                var account = mapData.accounts[i];
                var accountAddress = (account.BillingStreet || '')
                	+'<br/>'
                	+(account.BillingCity || '')
                	+' ('+(account.BillingState || '')+')'
                	+' <br/>'
                	+(account.BillingPostalCode || '')
                	+' <br/>'
                	+(account.BillingCountry || '');
                L.marker([account.BillingLatitude, account.BillingLongitude])
                	.addTo(self.map)
                .bindPopup('<div style="text-align:center; cursor:pointer;" data-account-id="'+account.Id+'">'
                           +'<span style="font-weight:bold;" >'
                           +account.Name+'</span><br/>'
                           +accountAddress+'</span></div>');
                self.checkMapBounds(account.BillingLatitude, account.BillingLongitude, topLocation, bottomLocation);
            }
            
            //company position
            L.marker([mapData.companyLatitude, mapData.companyLongitude], {icon: L.divIcon()})
            	.addTo(self.map).bindPopup('Company HQ');
            self.checkMapBounds(mapData.companyLatitude, mapData.companyLongitude, topLocation, bottomLocation);
            
            if(units === 'mi'){
                radius = parseFloat(radius) / 0.621371;
            }
            //radius
            var circle = L.circle([mapData.companyLatitude, mapData.companyLongitude], radius*1000.0, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.1
            }).addTo(self.map);
            
            //center on company geolocation and fits map on bounds
            self.map.setView([mapData.companyLatitude, mapData.companyLongitude], 12);
            self.map.fitBounds([
                topLocation,
                bottomLocation
            ]);
            
            //popup open event
            self.map.on('popupopen', function(evt){
                self.handlePopupOpen(component, evt)
            });
        });
        $A.enqueueAction(action);
	}
})