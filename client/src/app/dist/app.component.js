"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var AppComponent = /** @class */ (function () {
    // @ViewChild('layerPanel') private layerPanel: OverlayPanel;
    function AppComponent(router) {
        this.router = router;
        this.notificationsCount = 4;
        this.logged = false;
    }
    AppComponent.prototype.ngOnInit = function () {
        // const logged = localStorage.getItem('logged');
        // if(logged ==='true'){
        //     this.logged = true;
        // }else{
        //     this.logged = false;
        // }
        this.logged = sessionStorage.getItem('logged') === 'true';
        this.loadMenu();
    };
    AppComponent.prototype.onNotificationsClick = function (event) {
        this.router.navigate(["/notifications"]);
    };
    AppComponent.prototype.loadMenu = function () {
        this.menuItems = [
            { label: 'Mapa', icon: 'fas fa-globe-europe', routerLink: '/map' },
            { label: 'Histórico', icon: 'fas fa-chart-area', routerLink: '/dashboard' },
            { label: 'Configuración', icon: 'fas fa-cog', routerLink: '/configuration', visible: this.logged },
            { label: 'Reglas', icon: 'fas fa-database', routerLink: '/rule-engine', visible: this.logged },
        ];
    };
    AppComponent.prototype.onLoginClick = function () {
        this.router.navigate(["/signin"]);
    };
    AppComponent.prototype.onCreateUserClick = function () {
        this.router.navigate(["/signup"]);
    };
    AppComponent.prototype.onLogoutClick = function () {
        sessionStorage.setItem("logged", "false");
        sessionStorage.removeItem("userData");
        this.router.navigate(["/"]).then(function () {
            window.location.reload();
        });
    };
    __decorate([
        core_1.ViewChild('notificationsPanel')
    ], AppComponent.prototype, "notificationPanel");
    AppComponent = __decorate([
        core_1.Component({
            selector: 'app-root',
            templateUrl: './app.component.html',
            styleUrls: ['./app.component.scss']
        })
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;

//# sourceMappingURL=app.component.js.map
