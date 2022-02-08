import Element from "./Element.js";
import Bar from "./Bar.js";
import ordernate from "../utils/ordenate.js";
import Timeline from "./Timeline.js";

class Graph extends Element {
  constructor(props) {
    super(props);

    const {
      data,
      labels,
      barThickness,
      barLabelWidth,
      gap,
      higherValue,
      order,
      trackThickness,
      stepInterval,
      transitionTopInterval,
      timelineTrackThickness,
      timelineTrackColor,
      timelineMarkerSize,
      timelineMarkerColor,
      timelineTrackFillColor,
      renderValue,
      setCurrentStep,
    } = props;

    this.data = data;
    this.labels = labels;
    this.stepInterval = stepInterval;
    this.order = order;
    this.gap = gap;
    this.higherValue = higherValue;
    this.barThickness = barThickness;
    this.barLabelWidth = barLabelWidth;
    this.trackThickness = trackThickness;
    this.transitionTopInterval = transitionTopInterval;
    this.timelineTrackThickness = timelineTrackThickness;
    this.timelineTrackColor = timelineTrackColor;
    this.timelineMarkerColor = timelineMarkerColor;
    this.timelineMarkerSize = timelineMarkerSize;
    this.timelineTrackFillColor = timelineTrackFillColor;
    this.renderValue = renderValue;
    this.setCurrentStep = setCurrentStep;

    this.prepare();
  }

  prepare = () => {
    const title = new Element({ className: "evolution-graph__title" });

    const barsContainer = new Element({
      className: "evolution-graph__bars-container",
    });
    barsContainer.setStyle(
      "height",
      `${(this.barThickness + this.gap) * this.data.length - this.gap}px`
    );

    const bars = this.data.map(
      (bar) =>
        new Bar({
          ...bar,
          thickness: this.barThickness,
          className: `evolution-graph__bar${
            bar?.className?.length ? ` ${bar.className}` : ""
          }`,
          labelWidth: this.barLabelWidth,
          graph: this,
          renderValue: this.renderValue,
        })
    );

    const timeline = new Timeline({
      className: "evolution-graph__timeline",
      graph: this,
      markerSize: this.timelineMarkerSize,
      markerColor: this.timelineMarkerColor,
      trackThickness: this.timelineTrackThickness,
      trackColor: this.timelineTrackColor,
      trackFillColor: this.timelineTrackFillColor,
      setCurrentStep: this.setCurrentStep,
    });

    this.elements = {
      title,
      barsContainer,
      bars,
      timeline,
    };

    bars.forEach((bar) => barsContainer.body.append(bar.body));
    this.body.append(title.body);
    this.body.append(barsContainer.body);
    this.body.append(timeline.body);
  };

  update = ({ currentStep }) => {
    this.elements.title.body.innerHTML = this.labels[currentStep];

    const sortedData = [...this.data].sort((a, b) =>
      ordernate(a.values[currentStep], b.values[currentStep], this.order)
    );

    let higherBarDataWidth = 0;

    this.elements.bars.forEach((bar, index) => {
      const barDataWidth = Number(
        window.getComputedStyle(bar.elements.data.body).width.replace("px", "")
      );

      const foundBar = sortedData.find(
        ({ label }) => label === this.data[index]?.label
      );

      bar.update({
        graph: this,
        newValue: this.data[index].values[currentStep],
        position: sortedData.indexOf(foundBar),
      });

      if (barDataWidth > higherBarDataWidth) {
        higherBarDataWidth = barDataWidth + 10;
      }
    });

    this.elements.barsContainer.setStyle(
      "margin-right",
      `${Math.ceil(higherBarDataWidth)}px`
    );

    this.elements.barsContainer.setStyle(
      "transition",
      `all ${this.stepInterval}ms linear`
    );
    
    this.elements.timeline.update({
      graph: this,
      currentStep,
    });
  };
}

export default Graph;
