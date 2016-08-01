({
    jsLoaded: function(component, event, helper) {
        helper.loadNearbyAccounts(component, event);
    },
    
    reloadAccounts: function(component, event, helper) {
        helper.loadNearbyAccounts(component, event);
    },
})