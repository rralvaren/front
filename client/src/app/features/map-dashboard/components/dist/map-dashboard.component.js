"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var L = require("leaflet");
require("leaflet.markercluster");
require("leaflet/dist/images/marker-shadow.png");
require("leaflet/dist/images/marker-icon.png");
require("leaflet/dist/images/marker-icon-2x.png");
var icon_utils_1 = require("../../../shared/misc/icon-utils");
var leaflet_geosearch_1 = require("leaflet-geosearch");
var operators_1 = require("rxjs/operators");
var base_component_1 = require("src/app/shared/misc/base.component");
var utils_1 = require("../../../shared/misc/utils");
var rxjs_1 = require("rxjs");
var MapDashboardComponent = /** @class */ (function (_super) {
    __extends(MapDashboardComponent, _super);
    function MapDashboardComponent(mapDashBoardService, categoryService, layerTreeNodeService, treeNodeService, popupService, appMessageService, confirmationService, router, elem) {
        var _this = _super.call(this) || this;
        _this.mapDashBoardService = mapDashBoardService;
        _this.categoryService = categoryService;
        _this.layerTreeNodeService = layerTreeNodeService;
        _this.treeNodeService = treeNodeService;
        _this.popupService = popupService;
        _this.appMessageService = appMessageService;
        _this.confirmationService = confirmationService;
        _this.router = router;
        _this.elem = elem;
        _this.entities = [];
        _this.showButtons = false;
        _this.favChecked = true;
        _this.favAttrs = [];
        _this.colors = { low: "#28a746", moderate: "#5894f4", high: "#ffc107", very_high: "#ec7628", extreme: "#dc3546" };
        _this.intervalRefreshMilliseconds = 60000;
        _this.entityAttr = 'data';
        _this.latCenter = -34.0736;
        _this.longCenter = -64.7647;
        _this.markerClusterGroup = L.markerClusterGroup({ animate: true, showCoverageOnHover: false });
        _this.layerGroups = {};
        _this.removedLayers = [];
        _this.filters = [];
        _this.unselectedLayers = [];
        _this.currentModels = [];
        _this.markersByModelAndId = {};
        _this.firstFetch = true;
        _this.minLat = Number.POSITIVE_INFINITY;
        _this.minLon = Number.POSITIVE_INFINITY;
        _this.maxLat = Number.NEGATIVE_INFINITY;
        _this.maxLon = Number.NEGATIVE_INFINITY;
        _this.defaultZoom = 10;
        _this.firstLoad = true;
        _this.tooltipMaxChars = 25;
        _this.filteredAttrs = {};
        return _this;
    }
    MapDashboardComponent.prototype.ngAfterViewInit = function () {
        this.loadAllEntitiesForLayers();
        this.loadMap();
        this.loadSearchBar();
        this.visualizeEntities();
    };
    MapDashboardComponent.prototype.ngOnDestroy = function () {
        clearInterval(this.interval);
    };
    /*****************************************************************************
     Event functions
    *****************************************************************************/
    MapDashboardComponent.prototype.onNodeSelect = function (event) {
        var i = this.unselectedLayers.indexOf(event.node.data);
        this.unselectedLayers.splice(i, 1);
        this.markerClusterGroup.addLayer(this.layerGroups[event.node.data]);
        this.closeTooltipsIfNeeded();
        this.setFilters();
    };
    MapDashboardComponent.prototype.onNodeUnselect = function (event) {
        this.unselectedLayers.push(event.node.data);
        this.markerClusterGroup.removeLayer(this.layerGroups[event.node.data]);
    };
    MapDashboardComponent.prototype.onEventFilters = function (event) {
        this.filters = event;
        this.storeFilterAttrs(event);
        clearInterval(this.interval);
        this.startInterval();
        this.updateEntities(true);
    };
    MapDashboardComponent.prototype.onFavChange = function (event) {
        var _this = this;
        this.markerClusterGroup.getLayers().forEach(function (l) {
            event.checked && l.getTooltip() ? _this.openTooltip(l) : l.closeTooltip();
        });
    };
    MapDashboardComponent.prototype.onLayerConditionClick = function (event) {
        if (this.layerPanel.overlayVisible) {
            this.layerPanel.hide();
        }
        event.stopPropagation();
        this.layerConditionsPanel.toggle(event);
    };
    MapDashboardComponent.prototype.onLayerClick = function (event) {
        if (this.layerConditionsPanel.overlayVisible) {
            this.layerConditionsPanel.hide();
        }
        event.stopPropagation();
        this.layerPanel.toggle(event);
    };
    MapDashboardComponent.prototype.onCenterClick = function () {
        this.map.flyTo([this.latCenter, this.longCenter], this.defaultZoom);
    };
    /*****************************************************************************
     Map loading functions
    *****************************************************************************/
    MapDashboardComponent.prototype.loadMap = function () {
        this.map = L.map('map', {
            center: [this.latCenter, this.longCenter],
            zoom: this.defaultZoom,
            minZoom: 1,
            maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
            maxBoundsViscosity: 0.5,
            doubleClickZoom: true
        });
        this.setTileLayer();
        this.map.addLayer(this.markerClusterGroup);
        this.setZoomStartEvent();
        this.setAnimationEndEvent();
    };
    MapDashboardComponent.prototype.setTileLayer = function () {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxNativeZoom: 19,
            maxZoom: 19
        }).addTo(this.map);
    };
    MapDashboardComponent.prototype.setZoomStartEvent = function () {
        var _this = this;
        this.map.on('zoomstart', function (event) {
            _this.markerClusterGroup.getLayers().forEach(function (l) {
                if (l.getTooltip()) {
                    var elements = _this.elem.nativeElement.querySelectorAll('.leaflet-tooltip-pane');
                    elements.forEach(function (e) { return e.style.display = 'none'; });
                }
            });
        });
    };
    MapDashboardComponent.prototype.setAnimationEndEvent = function () {
        var _this = this;
        this.markerClusterGroup.on('animationend', function () {
            _this.markerClusterGroup.getLayers().forEach(function (l) {
                _this.openTooltip(l);
            });
        });
    };
    MapDashboardComponent.prototype.loadSearchBar = function () {
        var searchControl = new leaflet_geosearch_1.GeoSearchControl({
            provider: new leaflet_geosearch_1.OpenStreetMapProvider(),
            autoClose: true
        });
        this.map.addControl(searchControl);
    };
    MapDashboardComponent.prototype.adjustView = function () {
        this.firstLoad = false;
        if (this.minLat !== Number.POSITIVE_INFINITY && this.minLon !== Number.POSITIVE_INFINITY &&
            this.maxLat !== Number.NEGATIVE_INFINITY && this.maxLon !== Number.NEGATIVE_INFINITY) {
            var lat = (this.minLat + this.maxLat) / 2;
            var lon = (this.minLon + this.maxLon) / 2;
            if (!isNaN(lat) && !isNaN(lon)) {
                this.map.setView([lat, lon], this.defaultZoom);
            }
        }
    };
    MapDashboardComponent.prototype.loadMarkerCluster = function () {
        var _this = this;
        Object.values(this.layerGroups).forEach(function (lg) {
            _this.markerClusterGroup.addLayer(lg);
        });
    };
    /*****************************************************************************
     Filter functions
    *****************************************************************************/
    MapDashboardComponent.prototype.setFilters = function () {
        this.markerClusterGroup.addLayers(this.removedLayers);
        this.closeTooltipsIfNeeded();
        this.removedLayers = [];
        if (!this.layersBeforeFilter) {
            this.layersBeforeFilter = this.markerClusterGroup.getLayers();
        }
        this.removeLayersForFilters();
    };
    MapDashboardComponent.prototype.storeFilterAttrs = function (filters) {
        var _this = this;
        this.filteredAttrs = {};
        filters.forEach(function (f) {
            if (!_this.filteredAttrs[f.entity]) {
                _this.filteredAttrs[f.entity] = [];
            }
            _this.filteredAttrs[f.entity].push(f.attribute);
        });
    };
    MapDashboardComponent.prototype.removeLayersForFilters = function () {
        var _this = this;
        var layersToRemove = [];
        this.markerClusterGroup.getLayers().forEach(function (layer) {
            _this.filters.forEach(function (f) {
                if (f.selected && layer[_this.entityAttr][f.attribute] && layer[_this.entityAttr].type === f.entity) {
                    if (_this.applyFilter(layer, f, _this.entityAttr)) {
                        layersToRemove.push(layer);
                        _this.removedLayers.push(layer);
                    }
                }
            });
        });
        this.markerClusterGroup.removeLayers(layersToRemove);
    };
    MapDashboardComponent.prototype.applyFilter = function (layer, f, controlName) {
        var shouldBeRemoved = false;
        if (f.condition !== 'contains') {
            shouldBeRemoved = !utils_1.Utils.mathItUp[f.condition](Number(layer[controlName][f.attribute]), Number(f.value));
        }
        else {
            shouldBeRemoved = !JSON.stringify(layer[controlName][f.attribute]).includes(f.value);
        }
        return shouldBeRemoved;
    };
    MapDashboardComponent.prototype.loadAllEntitiesForLayers = function () {
        var _this = this;
        this.mapDashBoardService.getAllEntitiesForLayers().pipe(operators_1.takeUntil(this.destroy$)).subscribe(function (res) {
            _this.entities = _this.mapCategories(res);
            _this.loadLayerMenu();
        }, function (err) {
            _this.onLoadDataFail();
        });
    };
    MapDashboardComponent.prototype.mapCategories = function (entities) {
        var _this = this;
        this.categories = [];
        entities.forEach(function (entity) {
            var categoryKey = _this.categoryService.getCategoryKey(entity.name);
            var categoryExist = _this.categories.find(function (category) { return category.name === categoryKey; });
            entity.label = entity.name;
            !categoryExist ? _this.addCategory(categoryKey, entity) : categoryExist.entities.push(entity);
        });
        return entities;
    };
    MapDashboardComponent.prototype.addCategory = function (categoryKey, entity) {
        this.categories.push({
            name: categoryKey,
            label: icon_utils_1.IconUtils.categoryName[categoryKey],
            icon: icon_utils_1.IconUtils.icons[categoryKey],
            entities: [entity]
        });
    };
    MapDashboardComponent.prototype.applyFiltersAfterUpdating = function (markersWithNewLocation) {
        var _this = this;
        markersWithNewLocation.forEach(function (m) {
            var currentLocation = m[_this.entityAttr].location.coordinates;
            m.setLatLng(currentLocation.slice().reverse());
        });
        this.setFilters();
        this.unselectedLayers.forEach(function (l) { return _this.markerClusterGroup.removeLayer(_this.layerGroups[l]); });
        this.closeTooltipsIfNeeded();
    };
    /*****************************************************************************
     Layers functions
    *****************************************************************************/
    MapDashboardComponent.prototype.loadLayerMenu = function () {
        this.layers = this.layerTreeNodeService.getMainLayers(this.categories);
        this.selectedLayers = this.treeNodeService.getAllSelected(this.layers);
    };
    /*****************************************************************************
     Data loading functions
    *****************************************************************************/
    MapDashboardComponent.prototype.visualizeEntities = function () {
        this.loadEntities();
    };
    MapDashboardComponent.prototype.loadEntities = function () {
        var _this = this;
        this.mapDashBoardService.getEntitiesData(!this.firstLoad).pipe(operators_1.takeUntil(this.destroy$)).subscribe(function (models) {
            if (models.length > 0) {
                _this.showButtons = true;
                _this.onLoadEntitiesSuccess(models);
            }
            else {
                _this.showButtons = false;
                _this.onLoadEntitiesEmpty();
            }
        }, function (err) {
            _this.onLoadDataFail();
        });
    };
    MapDashboardComponent.prototype.onLoadEntitiesSuccess = function (models) {
        this.currentModels = models;
        this.storeFavAttrs(models);
        this.processModels(models);
        this.adjustView();
        this.loadMarkerCluster();
        this.setFilters();
        this.startInterval();
    };
    MapDashboardComponent.prototype.startInterval = function () {
        var _this = this;
        this.interval = setInterval(function () {
            _this.updateEntities();
        }, this.intervalRefreshMilliseconds);
    };
    MapDashboardComponent.prototype.updateEntities = function (triggeredByFilter) {
        var _this = this;
        var combinedCalls = [];
        this.currentModels.forEach(function (model, i) {
            var obs;
            obs = _this.mapDashBoardService.getEntitiesForUpdating(model, _this.filteredAttrs[model.type], !triggeredByFilter);
            combinedCalls.push(obs);
        });
        this.processUpdate(combinedCalls);
    };
    MapDashboardComponent.prototype.processUpdate = function (combinedCalls) {
        var _this = this;
        var markersWithNewLocation = [];
        rxjs_1.combineLatest(combinedCalls).pipe(operators_1.takeUntil(this.destroy$)).subscribe(function (combinedResults) {
            combinedResults.forEach(function (entities, i) {
                var model = _this.currentModels[i];
                entities.forEach(function (e) { return _this.updateEntity(e, i, model, markersWithNewLocation); });
            });
            _this.applyFiltersAfterUpdating(markersWithNewLocation);
        }, function (err) {
            _this.onLoadDataFail();
        });
    };
    MapDashboardComponent.prototype.processModels = function (models) {
        var _this = this;
        models.forEach(function (model, i) {
            var categoryKey = _this.categoryService.getCategoryKey(model.type);
            _this.markersByModelAndId[i] = {};
            _this.layerGroups[model.type] = _this.layerGroups[model.type] || L.layerGroup();
            _this.layerGroups[categoryKey] = _this.layerGroups[categoryKey] || L.layerGroup();
            model.data.forEach(function (entity) { _this.addEntity(model, entity, categoryKey, i); });
            _this.layerGroups[categoryKey].addLayer(_this.layerGroups[model.type]);
        });
    };
    MapDashboardComponent.prototype.onLoadEntitiesEmpty = function () {
        var _this = this;
        if (this.firstFetch) {
            this.firstFetch = false;
            this.confirmationService.confirm({
                icon: 'pi pi-info',
                header: 'There is no configuration yet',
                message: 'Do you want to configure the dashboard?',
                acceptLabel: 'Configure',
                rejectLabel: 'Cancel',
                accept: function () {
                    _this.router.navigate(['/configuration']);
                }
            });
        }
    };
    MapDashboardComponent.prototype.onLoadDataFail = function () {
        this.appMessageService.add({ severity: 'error', summary: 'Something went wrong getting data' });
    };
    /*****************************************************************************
     Entity functions
    *****************************************************************************/
    MapDashboardComponent.prototype.getColor = function (index) {
        var color;
        if (index < 5) {
            color = this.colors.low;
        }
        else if (index >= 5 && index < 14) {
            color = this.colors.moderate;
        }
        else if (index >= 14 && index < 21) {
            color = this.colors.high;
        }
        else if (index >= 21 && index < 33) {
            color = this.colors.very_high;
        }
        else if (index >= 33) {
            color = this.colors.extreme;
        }
        return color;
    };
    MapDashboardComponent.prototype.setGeoJSONattributes = function (model, entity) {
        var color;
        color = this.getColor(entity.fireWeatherIndex);
        var geoJSON = '{   "fillColor": "' + color + '",' +
            '"weight": 2,' +
            '"opacity": 1,' +
            '"color": "' + color + '",' + //Outline color
            '"fillOpacity": 0.7' +
            '}';
        return geoJSON;
    };
    MapDashboardComponent.prototype.addEntity = function (model, entity, categoryKey, i) {
        if (entity.location && entity.location.type === "Polygon") {
            var geoJSON = this.setGeoJSONattributes(model, entity);
            L.geoJSON(entity.location, { style: JSON.parse(geoJSON) }).addTo(this.layerGroups[model.type]);
            this.storeMinMaxLocation(entity.location.coordinates[0][0][1], entity.location.coordinates[0][0][0]);
            this.insertEntity(model, entity, categoryKey, i);
        }
        else {
            if (this.isValidCoordinates(entity)) {
                this.storeMinMaxLocation(entity.location.coordinates[1], entity.location.coordinates[0]);
                this.insertEntity(model, entity, categoryKey, i);
            }
        }
    };
    MapDashboardComponent.prototype.isValidCoordinates = function (entity) {
        return entity.location && entity.location.coordinates &&
            entity.location.coordinates[0] && entity.location.coordinates[1] &&
            !isNaN(entity.location.coordinates[0]) && !isNaN(entity.location.coordinates[1]);
    };
    MapDashboardComponent.prototype.insertEntity = function (model, entity, categoryKey, i) {
        var marker;
        if (entity.location.type === "Point") {
            marker = L.marker(entity.location.coordinates.slice().reverse(), { icon: icon_utils_1.IconUtils.leafletIcons[categoryKey] });
        }
        else if (entity.location.type === "Polygon") {
            marker = L.marker(entity.location.coordinates[0][0].slice().reverse(), { icon: icon_utils_1.IconUtils.leafletIcons[categoryKey] });
        }
        this.setEntityParams(marker, entity, model, i);
    };
    MapDashboardComponent.prototype.updateEntity = function (e, i, model, markersWithNewLocation) {
        var _this = this;
        var marker = this.markersByModelAndId[i][e.id];
        if (marker && this.isValidCoordinates(e)) {
            var currentLocation = e.location.coordinates;
            if (this.hasLocationBeenUpdated(marker, currentLocation)) {
                markersWithNewLocation.push(marker);
            }
            Object.entries(e).forEach(function (a) { return marker[_this.entityAttr][a[0]] = a[1]; });
            this.setTooltip(marker, e, model);
        }
    };
    MapDashboardComponent.prototype.setEntityParams = function (marker, entity, model, i) {
        this.setTooltip(marker, entity, model);
        this.setPopup(marker, entity, model);
        marker[this.entityAttr] = entity;
        this.markersByModelAndId[i][entity.id] = marker;
        this.layerGroups[model.type].addLayer(marker);
    };
    MapDashboardComponent.prototype.storeMinMaxLocation = function (lat, lon) {
        this.minLat = this.minLat > lat ? lat : this.minLat;
        this.minLon = this.minLon > lon ? lon : this.minLon;
        this.maxLat = this.maxLat < lat ? lat : this.maxLat;
        this.maxLon = this.maxLon < lon ? lon : this.maxLon;
    };
    MapDashboardComponent.prototype.hasLocationBeenUpdated = function (marker, currentLocation) {
        var currentLatLng = marker.getLatLng();
        var currentLat = currentLatLng.lat;
        var currentLng = currentLatLng.lng;
        var newLatLng = currentLocation.slice().reverse();
        var newLat = newLatLng[0];
        var newLng = newLatLng[1];
        return currentLat !== newLat || currentLng !== newLng;
    };
    /*****************************************************************************
     Marker event functions
    *****************************************************************************/
    MapDashboardComponent.prototype.setMarkerEvents = function (marker, p, pRef, entity, model) {
        var _this = this;
        marker.on('click', function () {
            marker.isPopupOpen() ? _this.closePopup(marker) : _this.openPopup(marker, p, pRef, entity, model);
        });
        marker.on('popupopen', function () {
            marker.closeTooltip();
        });
        marker.on('popupclose', function () {
            _this.openTooltip(marker);
            marker.unbindPopup();
        });
    };
    /*****************************************************************************
     Popup functions
    *****************************************************************************/
    MapDashboardComponent.prototype.setPopup = function (marker, entity, model) {
        var _this = this;
        var popup = L.popup();
        var popupComponentRef = this.popupService.createPopupComponent(entity, model);
        popupComponentRef.instance.clickDebug.pipe(operators_1.takeUntil(this.destroy$)).subscribe(function () { return _this.onClickDebug(model, entity, marker); });
        popup.setContent(popupComponentRef.location.nativeElement);
        this.setMarkerEvents(marker, popup, popupComponentRef, entity, model);
    };
    MapDashboardComponent.prototype.openPopup = function (marker, p, pRef, entity, model) {
        var _this = this;
        this.mapDashBoardService.getEntityForPopup(model, entity).pipe(operators_1.takeUntil(this.destroy$)).subscribe(function (data) {
            var updatedEntity = data[0];
            pRef.instance.updatePopup(updatedEntity, model);
            pRef.changeDetectorRef.detectChanges();
            pRef.instance.refreshScroll();
            _this.setTooltip(marker, updatedEntity, model);
            marker.bindPopup(p);
            marker.openPopup();
        }, function (err) {
            _this.onLoadDataFail();
        });
    };
    MapDashboardComponent.prototype.closePopup = function (marker) {
        marker.closePopup();
        marker.unbindPopup();
    };
    /*****************************************************************************
     Tooltip functions
    *****************************************************************************/
    MapDashboardComponent.prototype.setTooltip = function (marker, entity, model, fromDebug) {
        var tooltipContent = this.getTooltipContent(entity, model, fromDebug);
        if (tooltipContent) {
            if (!marker.getTooltip()) {
                marker.bindTooltip(tooltipContent, {
                    offset: new L.Point(0, 5),
                    direction: 'top',
                    permanent: true,
                    opacity: 0.9
                });
            }
            else {
                marker.setTooltipContent(tooltipContent);
            }
        }
    };
    MapDashboardComponent.prototype.openTooltip = function (marker) {
        if (this.favChecked) {
            if (marker.getTooltip()) {
                var elements = this.elem.nativeElement.querySelectorAll('.leaflet-tooltip-pane');
                elements.forEach(function (e) { return e.style.display = 'block'; });
                marker.openTooltip();
            }
        }
    };
    MapDashboardComponent.prototype.getTooltipContent = function (entity, model, fromDebug) {
        return model.favAttr && entity[model.favAttr] && (!fromDebug || (fromDebug && entity[model.favAttr].value)) ?
            ('<span>' + this.truncateTooltipContent(fromDebug ? entity[model.favAttr].value : entity[model.favAttr]) + '</span>') :
            undefined;
    };
    MapDashboardComponent.prototype.truncateTooltipContent = function (content) {
        var str = typeof content === 'string' ? content : JSON.stringify(content);
        return utils_1.Utils.truncateString(str, this.tooltipMaxChars);
    };
    MapDashboardComponent.prototype.closeTooltipsIfNeeded = function () {
        var _this = this;
        var markers = this.markerClusterGroup.getLayers();
        markers.forEach(function (m) {
            if (!_this.favChecked) {
                m.closeTooltip();
            }
        });
    };
    /*****************************************************************************
     Main/favourite attributes functions
    *****************************************************************************/
    MapDashboardComponent.prototype.storeFavAttrs = function (models) {
        this.favAttrs = models.filter(function (m) { return m.favAttr; }).map(function (m) { return ({ entity: m.type, favAttr: m.favAttr }); });
    };
    /*****************************************************************************
     Debug entity functions
    *****************************************************************************/
    MapDashboardComponent.prototype.onClickDebug = function (model, entity, marker) {
        var _this = this;
        this.mapDashBoardService.getEntity(model, entity).pipe(operators_1.takeUntil(this.destroy$)).subscribe(function (data) {
            if (data.length > 0) {
                _this.onClickDebugSuccess(data[0], marker, model);
            }
            else {
                _this.onLoadDataFail();
            }
        }, function (err) {
            _this.onLoadDataFail();
        });
    };
    MapDashboardComponent.prototype.onClickDebugSuccess = function (data, marker, model) {
        marker.closePopup();
        this.displayDebugHeader = data.id;
        this.displayDebugContent = data;
        this.displayDebug = true;
        this.setTooltip(marker, data, model, true);
    };
    __decorate([
        core_1.ViewChild('layerConditionsPanel')
    ], MapDashboardComponent.prototype, "layerConditionsPanel");
    __decorate([
        core_1.ViewChild('layerPanel')
    ], MapDashboardComponent.prototype, "layerPanel");
    MapDashboardComponent = __decorate([
        core_1.Component({
            selector: 'app-map-dashboard',
            templateUrl: './map-dashboard.component.html',
            styleUrls: ['./map-dashboard.component.scss']
        })
    ], MapDashboardComponent);
    return MapDashboardComponent;
}(base_component_1.BaseComponent));
exports.MapDashboardComponent = MapDashboardComponent;

//# sourceMappingURL=map-dashboard.component.js.map
