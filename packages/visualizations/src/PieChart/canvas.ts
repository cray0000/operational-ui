import Events from "../utils/event_catalog"
import * as d3 from "d3-selection"
import { Canvas, D3Selection, EventBus, Object, PieChartConfig, SeriesEl, State, StateWriter } from "./typings"
import * as styles from "../utils/styles"

class PieChartCanvas implements Canvas {
  private drawingContainer: D3Selection
  private elements: Object<D3Selection> = {}
  private chartContainer: D3Selection
  private el: SeriesEl
  private events: EventBus
  private state: State
  private elMap: Object<D3Selection> = {}
  private stateWriter: StateWriter

  constructor(state: State, stateWriter: StateWriter, events: EventBus, context: Element) {
    this.state = state
    this.stateWriter = stateWriter
    this.events = events
    this.chartContainer = this.renderChartContainer(context)
    this.renderLegend()
    this.drawingContainer = this.renderDrawingContainer()
    this.el = this.renderEl()
    this.renderShadows()
    this.renderDrawingGroup()
    this.renderFocusElements()
    this.stateWriter("elements", this.elements)
  }

  // Chart container
  private renderChartContainer(context: Element): D3Selection {
    const container = document.createElementNS(d3.namespaces["xhtml"], "div")
    context.appendChild(container)
    container.addEventListener("mouseenter", this.onMouseEnter.bind(this))
    container.addEventListener("mouseleave", this.onMouseLeave.bind(this))
    container.addEventListener("click", this.onClick.bind(this))
    return d3.select(container).attr("class", styles.chartContainer)
  }

  private onMouseEnter(): void {
    this.events.emit(Events.CHART.MOUSEOVER)
  }

  private onMouseLeave(): void {
    this.events.emit(Events.CHART.MOUSEOUT)
  }

  private onClick(): void {
    this.events.emit(Events.CHART.CLICK)
  }

  // Legend
  private renderLegend(): void {
    const legendNode: Element = document.createElementNS(d3.namespaces["xhtml"], "div")
    this.chartContainer.node().appendChild(legendNode)

    const legend: D3Selection = d3
      .select(legendNode)
      .attr("class", `${styles.legend} ${styles.legendTopBottom} left`)
      .style("float", "left")

    this.elMap.legend = legend
    this.stateWriter("legend", legend)
  }

  // Drawing container
  private renderDrawingContainer(): D3Selection {
    const drawingContainer = document.createElementNS(d3.namespaces["xhtml"], "div")
    this.chartContainer.node().appendChild(drawingContainer)
    return d3.select(drawingContainer).attr("class", styles.drawingContainer)
  }

  // El
  private renderEl(): SeriesEl {
    const el: Element = document.createElementNS(d3.namespaces["svg"], "svg")
    this.drawingContainer.node().appendChild(el)
    this.elMap.series = d3.select(el)
    return this.elMap.series
  }

  // Defs
  private renderShadows(): void {
    this.elements.defs = this.el.append("defs")
    const shadow: D3Selection = this.elements.defs
      .append("filter")
      .attr("id", this.shadowDefinitionId())
      .attr("height", "130%")
    shadow
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", "3")
    shadow
      .append("feOffset")
      .attr("dx", "2")
      .attr("dy", "2")
      .attr("result", "offsetblur")
    shadow
      .append("feComponentTransfer")
      .append("feFuncA")
      .attr("type", "linear")
      .attr("slope", "0.5")

    const shadowFeMerge: D3Selection = shadow.append("feMerge")
    shadowFeMerge.append("feMergeNode")
    shadowFeMerge.append("feMergeNode").attr("in", "SourceGraphic")
    this.stateWriter("shadowDefinitionId", this.shadowDefinitionId())
  }

  private prefixedId(id: string): string {
    return this.state.current.get("config").uid + id
  }

  private shadowDefinitionId(): string {
    return this.prefixedId("_shadow")
  }

  // Drawing group
  private renderDrawingGroup(): void {
    this.elements.drawing = this.el.append("svg:g").attr("class", "drawing")
  }

  // Focus elements
  private renderFocusElements(): void {
    this.elMap.focus = this.renderFocusLabel()
    this.elMap.componentFocus = this.renderComponentFocus()
  }

  private renderFocusLabel(): D3Selection {
    const focusEl = d3
      .select(document.createElementNS(d3.namespaces["xhtml"], "div"))
      .attr("class", `${styles.focusLegend}`)
      .style("visibility", "hidden")
    this.chartContainer.node().appendChild(focusEl.node())
    return focusEl
  }

  private renderComponentFocus(): D3Selection {
    const focusEl = d3.select(document.createElementNS(d3.namespaces["xhtml"], "div")).attr("class", "component-focus")
    const ref: Node = this.chartContainer.node()
    ref.insertBefore(focusEl.node(), ref.nextSibling)
    return focusEl
  }

  private drawingContainerDims(): { height: number; width: number } {
    const config = this.state.current.get("config")
    const dims = {
      height: config.height - this.elMap.legend.node().offsetHeight,
      width: config.width
    }
    this.stateWriter("drawingContainerDims", dims)
    return dims
  }

  // Lifecycle
  draw(): void {
    this.chartContainer.classed("hidden", this.state.current.get("config").hidden)
    this.stateWriter(["containerRect"], this.chartContainer.node().getBoundingClientRect())

    const config: PieChartConfig = this.state.current.get("config")
    const dims: { width: number; height: number } = this.drawingContainerDims()

    this.chartContainer.style("width", `${config.width}px`).style("height", `${config.height}px`)
    this.drawingContainer.style("width", `${dims.width}px`).style("height", `${dims.height}px`)
    this.el.style("width", `${dims.width}px`).style("height", `${dims.height}px`)
    this.stateWriter("drawingContainerRect", this.drawingContainer.node().getBoundingClientRect())
  }

  remove(): void {
    this.chartContainer.node().removeEventListener("mouseenter", this.onMouseEnter.bind(this))
    this.chartContainer.node().removeEventListener("mouseleave", this.onMouseLeave.bind(this))
    this.chartContainer.node().removeEventListener("click", this.onClick.bind(this))
    this.elements = {}
    this.chartContainer.remove()
    this.chartContainer = undefined
    this.el = undefined
    this.elements = {}
    this.drawingContainer.remove()
    this.drawingContainer = undefined
  }

  // Helper method
  elementFor(component: string): D3Selection {
    return this.elMap[component]
  }
}

export default PieChartCanvas