"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var event_catalog_1 = require("../../utils/event_catalog");
var fp_1 = require("lodash/fp");
require("d3-transition");
var d3_shape_1 = require("d3-shape");
var d3_interpolate_1 = require("d3-interpolate");
var d3_utils_1 = require("../../utils/d3_utils");
var styles = require("./styles");
var Utils = require("./renderer_utils");
var ANGLE_RANGE = [0, 2 * Math.PI];
var TOTAL_Y_OFFSET = "0.35em";
var Donut = /** @class */ (function () {
    function Donut(state, events, el, options) {
        this.drawn = false;
        this.type = "donut";
        this.state = state;
        this.events = events;
        this.el = el;
        this.updateOptions(options);
        this.events.on(event_catalog_1.default.FOCUS.ELEMENT.HIGHLIGHT, this.highlightElement.bind(this));
        this.events.on(event_catalog_1.default.FOCUS.ELEMENT.MOUSEOVER, this.updateElementHover.bind(this));
        this.events.on(event_catalog_1.default.FOCUS.ELEMENT.MOUSEOUT, this.updateElementHover.bind(this));
        this.events.on(event_catalog_1.default.CHART.MOUSEOUT, this.updateElementHover.bind(this));
    }
    // Initialization and updating config or accessors
    Donut.prototype.updateOptions = function (options) {
        Utils.assignOptions(this, options);
    };
    Donut.prototype.setData = function (data) {
        this.data = data || [];
    };
    // Drawing
    Donut.prototype.draw = function () {
        this.compute();
        this.drawn ? this.updateDraw() : this.initialDraw();
    };
    Donut.prototype.initialDraw = function () {
        // groups
        this.el.append("svg:g").attr("class", "arcs");
        this.el.append("svg:g").attr("class", styles.total);
        this.updateDraw();
        this.drawn = true;
    };
    Donut.prototype.updateDraw = function () {
        var config = this.state.current.get("config");
        var duration = config.duration;
        var minTotalFontSize = config.minTotalFontSize;
        var drawingDims = this.state.current.get("computed").canvas
            .drawingContainerDims;
        // Remove focus before updating chart
        this.events.emit(event_catalog_1.default.FOCUS.ELEMENT.MOUSEOUT);
        // Center coordinate system
        this.currentTranslation = Utils.computeTranslate(drawingDims);
        this.el.attr("transform", Utils.translateString(this.currentTranslation));
        // Arcs
        var arcs = Utils.createArcGroups(this.el, this.computed.data, this.key);
        // Exit
        Utils.exitArcs(arcs, duration, this.removeArcTween.bind(this));
        // Enter
        Utils.enterArcs(arcs, this.onMouseOver.bind(this), this.onMouseOut.bind(this));
        // Update
        var updatingArcs = arcs.merge(arcs.enter().selectAll("g." + styles.arc));
        d3_utils_1.setPathAttributes(updatingArcs.select("path"), this.arcAttributes(), duration);
        d3_utils_1.setTextAttributes(updatingArcs.select("text"), Utils.textAttributes(this.computed), duration);
        // Total / center text
        var options = { minTotalFontSize: minTotalFontSize, innerRadius: this.computed.rInner, yOffset: TOTAL_Y_OFFSET };
        Utils.updateTotal(this.el, this.centerDisplayString(), duration, options);
    };
    Donut.prototype.arcAttributes = function () {
        return {
            path: this.arcTween.bind(this),
            fill: this.color.bind(this)
        };
    };
    // Interpolate the arcs in data space.
    Donut.prototype.arcTween = function (d) {
        var _this = this;
        var previousData = this.previousComputed.data || [], old = fp_1.find(function (datum) { return datum.index === d.index; })(previousData), previous = fp_1.find(function (datum) { return datum.index === d.index - 1; })(previousData), last = previousData[previousData.length - 1];
        var s0;
        var e0;
        if (old) {
            s0 = old.startAngle;
            e0 = old.endAngle;
        }
        else if (!old && previous) {
            s0 = previous.endAngle;
            e0 = previous.endAngle;
        }
        else if (!previous && previousData.length > 0) {
            s0 = last.endAngle;
            e0 = last.endAngle;
        }
        else {
            s0 = 0;
            e0 = 0;
        }
        var innerRadius = this.previousComputed.rInner || this.computed.rInner;
        var outerRadius = this.previousComputed.r || this.computed.r;
        var f = d3_interpolate_1.interpolateObject({ innerRadius: innerRadius, outerRadius: outerRadius, endAngle: e0, startAngle: s0 }, {
            innerRadius: this.computed.rInner,
            outerRadius: this.computed.r,
            endAngle: d.endAngle,
            startAngle: d.startAngle
        });
        return function (t) { return _this.computed.arc(f(t)); };
    };
    Donut.prototype.removeArcTween = function (d, i) {
        var _this = this;
        var s0;
        var e0;
        s0 = e0 = ANGLE_RANGE[1];
        var f = d3_interpolate_1.interpolateObject({ endAngle: d.endAngle, startAngle: d.startAngle }, { endAngle: e0, startAngle: s0 });
        return function (t) { return _this.computed.arc(f(t)); };
    };
    Donut.prototype.centerDisplayString = function () {
        return this.computed.rInner > 0 ? this.computed.total.toString() : "";
    };
    // Data computation / preparation
    Donut.prototype.compute = function () {
        this.previousComputed = this.computed;
        var d = {
            layout: Utils.layout(this.angleValue.bind(this), ANGLE_RANGE),
            total: Utils.computeTotal(this.data, this.value)
        };
        // data should not become part of this.previousComputed in first computation
        this.previousComputed = fp_1.defaults(d)(this.previousComputed);
        Utils.calculatePercentages(this.data, this.angleValue.bind(this), d.total);
        this.computed = __assign({}, d, this.computeArcs(d), { data: d.layout(this.data) });
    };
    Donut.prototype.angleValue = function (d) {
        return this.value(d) || d.value;
    };
    Donut.prototype.computeArcs = function (computed) {
        var drawingDims = this.state.current.get("computed").canvas
            .drawingContainerDims, r = this.computeOuterRadius(drawingDims), rInner = this.computeInnerRadius(r), rHover = r + 1, rInnerHover = Math.max(rInner - 1, 0);
        return {
            r: r,
            rInner: rInner,
            rHover: rHover,
            rInnerHover: rInnerHover,
            arc: d3_shape_1.arc(),
            arcOver: d3_shape_1.arc()
                .innerRadius(rInnerHover)
                .outerRadius(rHover)
        };
    };
    Donut.prototype.computeOuterRadius = function (drawingDims) {
        var outerBorderMargin = this.state.current.get("config").outerBorderMargin;
        return Math.min(drawingDims.width, drawingDims.height) / 2 - outerBorderMargin;
    };
    Donut.prototype.computeInnerRadius = function (outerRadius) {
        var config = this.state.current.get("config");
        var width = outerRadius - config.minInnerRadius;
        // If there isn't enough space, don't render inner circle
        return width < config.minWidth ? 0 : outerRadius - Math.min(width, config.maxWidth);
    };
    // Event listeners / handlers
    Donut.prototype.onMouseOver = function (d) {
        var datumInfo = {
            key: this.key(d),
            value: this.value(d),
            percentage: d.data.percentage
        };
        var centroid = Utils.translateBack(this.computed.arcOver.centroid(d), this.currentTranslation);
        this.events.emit(event_catalog_1.default.FOCUS.ELEMENT.MOUSEOVER, { d: datumInfo, focusPoint: { centroid: centroid } });
    };
    Donut.prototype.updateElementHover = function (datapoint) {
        var _this = this;
        if (!this.drawn) {
            return;
        }
        var arcs = this.el.select("g.arcs").selectAll("g");
        var filterFocused = function (d) { return datapoint.d && _this.key(d) === datapoint.d.key; };
        var filterUnFocused = function (d) { return (datapoint.d ? _this.key(d) !== datapoint.d.key : true); };
        var shadowDefinitionId = this.state.current.get("computed").canvas.shadowDefinitionId;
        Utils.updateFilteredPathAttributes(arcs, filterFocused, this.computed.arcOver, shadowDefinitionId);
        Utils.updateFilteredPathAttributes(arcs, filterUnFocused, this.computed.arc);
    };
    Donut.prototype.highlightElement = function (key) {
        var _this = this;
        var d = fp_1.find(function (datum) { return _this.key(datum) === key; })(this.computed.data);
        if (!d) {
            return;
        }
        this.onMouseOver(d);
    };
    Donut.prototype.onMouseOut = function () {
        this.events.emit(event_catalog_1.default.FOCUS.ELEMENT.MOUSEOUT);
    };
    // External methods
    Donut.prototype.dataForLegend = function () {
        var _this = this;
        return fp_1.map(function (datum) {
            return {
                label: _this.key(datum),
                color: _this.color(datum)
            };
        })(this.data);
    };
    // Remove & clean up
    Donut.prototype.remove = function () {
        if (this.drawn) {
            this.el.remove();
            this.drawn = false;
        }
    };
    return Donut;
}());
exports.default = Donut;
//# sourceMappingURL=donut.js.map