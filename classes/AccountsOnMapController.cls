public class AccountsOnMapController {
    
    public class MapData{
        @AuraEnabled
        public List<Account> accounts{get;set;}
        @AuraEnabled
        public Double companyLongitude{get;set;}
        @AuraEnabled
        public Double companyLatitude{get;set;}
    }
    
	@AuraEnabled
    public static MapData loadNearbyAccounts(Integer radius, String units){
        MapData result = new MapData();
        Organization orgDetails = [SELECT Id, Longitude, Latitude FROM Organization WHERE Id = :UserInfo.getOrganizationId()];
        
        if(units == 'mi'){
        	result.accounts = [Select Id, Name, BillingStreet, BillingCity, BillingCountry, BillingState, BillingPostalCode,
               	BillingLatitude, BillingLongitude From Account Where BillingLatitude != null
				and DISTANCE(BillingAddress, GEOLOCATION(:orgDetails.Latitude, :orgDetails.Longitude), 'mi') < :radius];
        }else{
            result.accounts = [Select Id, Name, BillingStreet, BillingCity, BillingCountry, BillingState, BillingPostalCode,
               	BillingLatitude, BillingLongitude From Account Where BillingLatitude != null
				and DISTANCE(BillingAddress, GEOLOCATION(:orgDetails.Latitude, :orgDetails.Longitude), 'km') < :radius];
        }
        
       	result.companyLongitude = orgDetails.Longitude;
        result.companyLatitude = orgDetails.Latitude;
        return result;
    }
}