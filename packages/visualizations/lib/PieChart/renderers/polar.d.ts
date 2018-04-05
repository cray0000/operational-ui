import "d3-transition";
import { D3Selection, Datum, EventBus, LegendDatum, Object, Renderer, RendererAccessor, State } from "../typings";
declare class Polar implements Renderer {
    private color;
    private computed;
    private currentTranslation;
    private data;
    private drawn;
    private el;
    private events;
    private minSegmentWidth;
    private previousComputed;
    key: RendererAccessor<string>;
    state: State;
    type: "donut" | "polar" | "gauge";
    value: RendererAccessor<number>;
    constructor(state: State, events: EventBus, el: D3Selection, options: Object<any>);
    updateOptions(options: Object<any>): void;
    setData(data: Datum[]): void;
    draw(): void;
    private initialDraw();
    private updateDraw();
    private arcAttributes();
    private fitToCanvas();
    private arcTween(d, i);
    private removeArcTween(d, i);
    private centerDisplayString();
    private compute();
    private angleValue();
    private computeArcs(computed);
    private computeOuterRadius(drawingDims, scaleFactor?);
    private computeInnerRadius(data, outerRadius);
    private hoverOuterRadius(radius);
    private onMouseOver(d);
    private updateElementHover(datapoint);
    private highlightElement(key);
    private onMouseOut();
    dataForLegend(): LegendDatum[];
    remove(): void;
}
export default Polar;