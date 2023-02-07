"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var HistoricalDashboardComponent = /** @class */ (function () {
    function HistoricalDashboardComponent(sanitizer) {
        this.sanitizer = sanitizer;
        this.environmentDashboard = 'http://localhost:5601/goto/069af6d6f3294421ec163b07fef91e5d'; // Copy here the dashboard URL from your Kibana  
        this.fireDashboard = 'http://localhost:5601/goto/069af6d6f3294421ec163b07fef91e5d'; // Copy here the dashboard URL from your Kibana
        this.dashboardRef = this.sanitizer.bypassSecurityTrustResourceUrl(this.environmentDashboard);
    }
    HistoricalDashboardComponent.prototype.ngOnInit = function () {
    };
    HistoricalDashboardComponent.prototype.changeDashboard = function (dashboard) {
        switch (dashboard) {
            case 'environment':
                this.dashboardRef = this.sanitizer.bypassSecurityTrustResourceUrl(this.environmentDashboard);
                break;
            case 'fire':
                this.dashboardRef = this.sanitizer.bypassSecurityTrustResourceUrl(this.fireDashboard);
                break;
        }
    };
    HistoricalDashboardComponent = __decorate([
        core_1.Component({
            selector: 'app-historical-dashboard',
            templateUrl: './historical-dashboard.component.html',
            styleUrls: ['./historical-dashboard.component.scss']
        })
    ], HistoricalDashboardComponent);
    return HistoricalDashboardComponent;
}());
exports.HistoricalDashboardComponent = HistoricalDashboardComponent;

//# sourceMappingURL=historical-dashboard.component.js.map
