import ReactDOM from 'react-dom';
import React, {Component} from 'react';

import InfluenceChart from './influence-chart';
export default class VisApp extends Component {
  render() {
    return (
      <div>
       <InfluenceChart />
      </div>
    );
  }
}

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(React.createElement(VisApp), el);
