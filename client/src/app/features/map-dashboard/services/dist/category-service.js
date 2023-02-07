"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var CategoryService = /** @class */ (function () {
    function CategoryService() {
    }
    CategoryService.prototype.getCategoryKey = function (type) {
        switch (type) {
            case 'Alert':
            case 'FireForestStatus':
                return 'alerts';
            case 'Park':
            case 'Garden':
            case 'FlowerBed':
            case 'GreenspaceRecord':
                return 'smartEnvironment';
            case 'AeroAllergenObserved':
            case 'AirQualityObserved':
            case 'WaterQualityObserved':
            case 'NoiseLevelObserved':
                return 'environment';
            case 'PointOfInterest':
            case 'Beach':
            case 'Museum':
            case 'TouristInformationCenter':
                return 'pointOfInterest';
            case 'Open311:ServiceType':
            case 'Open311:ServiceRequest':
                return 'civicIssuesTracking';
            case 'Streetlight':
            case 'StreetlightGroup':
            case 'StreetlightModel':
            case 'StreetlightControlCabinet':
                return 'streetLighting';
            case 'Device':
            case 'DeviceModel':
                return 'device';
            case 'TrafficFlowObserved':
            case 'CrowdFlowObserved':
            case 'BikeHireDockingStation':
            case 'EVChargingStation':
            case 'Road':
            case 'RoadSegment':
            case 'Vehicle':
            case 'VehicleModel':
                return 'transport';
            case 'KeyPerformanceIndicator':
                return 'indicators';
            case 'WasteContainerIsle':
            case 'WasteContainerModel':
            case 'WasteContainer':
                return 'wasteManagement';
            case 'OffStreetParking':
            case 'ParkingAccess':
            case 'OnStreetParking':
            case 'ParkingGroup':
            case 'ParkingSpot':
                return 'parking';
            case 'WeatherAlert':
            case 'WeatherObserved':
            case 'WeatherForecast':
                return 'weather';
            default:
                return 'generic';
        }
    };
    CategoryService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], CategoryService);
    return CategoryService;
}());
exports.CategoryService = CategoryService;

//# sourceMappingURL=category-service.js.map
