import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {scaleLinear} from 'd3-scale';
import {select} from 'd3-selection';

class InfluenceChart extends Component {
  componentDidMount() {
    this.updateChart(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateChart(nextProps);
  }
  
  updateChart(props) {
    const plotWidth = props.width - props.margin.left - props.margin.right;
    const plotHeight = props.height - props.margin.top - props.margin.bottom;
    const x = scaleLinear().domain([0, 5]).range([0, plotWidth]);
    const y = scaleLinear().domain([0, 5]).range([0, plotHeight]);
    // using d3 to do DOM manipulation
    const points = [...new Array(25)].map((x, idx) => ({
      x: idx % 5,
      y: Math.floor(idx / 5)
    }));
    const g = select(ReactDOM.findDOMNode(this.refs.plotContainer));
    // filler example stuff
    g.selectAll('.circle')
        .data(points)
      .enter()
        .append('circle')
        .attr('class', 'circle')
        .attr('cx', el => x(el.x))
        .attr('cy', el => y(el.y))
        .attr('r', 10)
        .attr('fill', 'red');
  }
  
  
  render() {
    const {width, height, margin} = this.props;
    const {left, top} = margin;
    return (
      <div className="influence-chart-wrapper">
        <svg className='influence-chart'
          width={width}
          height={height}>
          <g className='plot-container'
            ref='plotContainer'
            transform={`translate(${left},${top})`}>
          </g>
        </svg>
      </div>
    );
  }
}

InfluenceChart.defaultProps = {
  width: 1000,
  height: 1000,
  margin: {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  }
}

export default InfluenceChart;
