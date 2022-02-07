import Graph from "./components/Graph.js";

class EvolutionGraph {
  constructor(props) {
    const {
      target,
      className,
      data,
      labels,
      stepInterval,
      transitionTopInterval,
      gap,
      barThickness,
      barLabelWidth,
      timelineTrackThickness,
      timelineMarkerSize,
      timelineMarkerColor,
      timelineTrackColor,
      timelineTrackFillColor,
      renderValue,
      order,
      onChange,
    } = props;

    this.target = target || document.body;
    this.className = className || "";
    this.data = data || [];
    this.labels = labels || [];
    this.stepInterval = stepInterval || 1500;
    this.transitionTopInterval = transitionTopInterval || this.stepInterval / 2;
    this.barThickness = barThickness || 20;
    this.gap = gap || 20;
    this.barLabelWidth = barLabelWidth || 100;
    this.timelineTrackThickness = timelineTrackThickness || 4;
    this.timelineMarkerSize = timelineMarkerSize || 14;
    this.timelineMarkerColor = timelineMarkerColor || "rgb(206, 206, 206)";
    this.timelineTrackColor = timelineTrackColor || "rgb(206, 206, 206)";
    this.timelineTrackFillColor = timelineTrackFillColor || "rgb(9, 132, 227)";
    this.renderValue = renderValue;
    this.order = order || "desc";
    this.onChange = onChange;
    this.currentStep = 0;
    this.interval = null;
    this.isPlaying = false;
    this.graph = this.createGraph();

    this.prepare();
  }

  get cantGoBack() {
    return this.currentStep <= 0;
  }

  get cantGoForward() {
    return this.currentStep >= this.data[0]?.values?.length - 1;
  }

  getHigherValue = () => {
    let higherValue = 0;

    for (const { values } of this.data) {
      for (const value of values) {
        if (value > higherValue) higherValue = value;
      }
    }

    return higherValue;
  };

  createGraph = () => {
    try {
      const {
        data,
        labels,
        stepInterval,
        order,
        gap,
        barThickness,
        barLabelWidth,
        transitionTopInterval,
        timelineTrackThickness,
        timelineMarkerSize,
        timelineMarkerColor,
        timelineTrackColor,
        timelineTrackFillColor,
        renderValue,
        setCurrentStep,
      } = this;

      const graph = new Graph({
        data,
        labels,
        className: `evolution-graph${
          this.className?.length ? ` ${this.className}` : ""
        }`,
        stepInterval,
        higherValue: this.getHigherValue(),
        gap,
        order,
        barThickness,
        barLabelWidth,
        transitionTopInterval,
        timelineTrackThickness,
        timelineMarkerSize,
        timelineMarkerColor,
        timelineTrackColor,
        timelineTrackFillColor,
        renderValue,
        setCurrentStep,
      });

      return graph;
    } catch (error) {
      console.warn(error);
    }
  };

  prepare = () => {
    this.graph.update({ currentStep: this.currentStep });
    this.target.append(this.graph.body);
  };

  setCurrentStep = (step, stopEvolution) => {
    if (stopEvolution) this.stop();

    if (step < 0 || step > this.labels.length - 1) return;

    this.onChange(step);

    this.currentStep = step;

    this.graph.update({ currentStep: this.currentStep });
  };

  previous = ({ stopEvolution } = {}) => {
    this.setCurrentStep(this.currentStep - 1, stopEvolution);
  };

  next = ({ stopEvolution } = {}) => {
    this.setCurrentStep(this.currentStep + 1, stopEvolution);
  };

  start = () => {
    if (this.cantGoForward) return;

    this.isPlaying = true;

    this.next();

    this.interval = setInterval(() => {
      this.next();
      if (this.cantGoForward) clearInterval(this.interval);
    }, this.stepInterval);
  };

  stop = () => {
    this.isPlaying = false;
    clearInterval(this.interval);
  };
}

export default EvolutionGraph;
