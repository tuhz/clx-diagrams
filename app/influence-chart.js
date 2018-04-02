import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {select} from 'd3-selection';
import {stratify} from 'd3-hierarchy';
import {forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceCollide} from 'd3-force';
import {schemePaired} from 'd3-scale-chromatic';
import {axisRight} from 'd3-axis';

import affliationsData from '../data/influence-data/affliations.json';
import peopleData from '../data/influence-data/people.json';

// QUESTIONS
// 0. Should we try to extract numerical dates? -> UNCLEAR IF THEY ACTUALL MATTER
// 1. how to sankey-ify this data?
// 2. verification of links data -> DONE

// verifying that all people refed in links have a corresponding row
// const rowPeople = peopleData.reduce((acc, person) => {
//   acc[person.name] = true;
//   return acc;
// }, {});
// const linkPeople = peopleData.reduce((acc, person) => {
//   person.links.forEach(({from}) => {
//     acc[from] = person;
//     if (!rowPeople[from]) {
//     }
//   })
//   return acc;
// }, {});
// console.log(linkPeople)
const rowPeople = peopleData.reduce((acc, person) => {
  acc[person.name] = person;
  return acc;
}, {});
const inheritLinks = peopleData.reduce((acc, person) => {
  // person links are all to
  person.links.forEach(({from, type}) => {
    const fromPerson = rowPeople[from];
    const fromPersonLink = fromPerson.links.find(link => link.from === person.name);
    if (!fromPersonLink) {
      acc.push({from: fromPerson.name, to: person.name});
      return;
    }
    if (fromPersonLink.type.match(/-circle/g) && type.match(/-circle/g)) {
      return;
    }
    if (!fromPersonLink.type.match(/-arrow/g) && type.match(/-arrow/g)) {
      acc.push({from: fromPerson.name, to: person.name});
      return;
    }
  });
  return acc;
}, []);
// colab links is Omega / inheritLinks
// so this will be wrong
const colabLinks = peopleData.reduce((acc, person) => {
  person.links.forEach(({from, type}) => {
    const fromPerson = rowPeople[from];
    const fromPersonLink = fromPerson.links.find(link => link.from === person.name);
    if (fromPersonLink && type.match(/-circle/g) && fromPersonLink.type.match(/-circle/g)) {
      acc.push({from: fromPerson.name, to: person.name});
    }
  });
  return acc;
}, []);

// find roots
const innerNodes = inheritLinks.reduce((acc, link) => {
  acc[link.to] = true;
  return acc;
}, {});
const roots = inheritLinks.reduce((acc, link) => {
  if (!innerNodes[link.from]) {
    acc[link.from] = (acc[link.from] || []).concat(link);
  }
  return acc;
}, {});
const inheritMap = inheritLinks.reduce((acc, link) => {
  acc[link.from] = (acc[link.from] || []).concat(link);
  return acc;
}, {});

// // build trees
// const buildTree = name => ({
//   name, 
//   children: (inheritMap[name] || []).map(({to}) => buildTree(to))
// });
// const trees = Object.keys(roots).map(buildTree);
// console.log(trees)

// const preStratData = inheritLinks.concat(Object.keys(roots).map(to => ({to, from: 'root'})));
// preStratData
// console.log(preStratData)
// const treeData = stratify().id(d => d.to).parentId(d => d.from)(preStratData);
// console.log(treeData)
// console.log(roots)
// merge trees

// const currentGeneration = 


console.log(inheritLinks)
// const inheritNodes = 

// side project, just show the graph
const affils = affliationsData.reduce((acc, group, idx) => {
  group.members.forEach(member => {
    acc[member] = group['group-name'];
  });
  return acc;
}, {})

const allLinks = peopleData
  .reduce((acc, person) => {
    return acc.concat(person.links.map(({from}) => ({source: from, target: person.name})))
  }, [])
  .concat(affliationsData.reduce((acc, group) => {
    return group.members.reduce((mem, source) => {
      group.members.forEach(target => mem.push({source, target}));
      return acc;
    }, acc);
  }, []));
// const allPeople = Object.keys(allLinks.reduce((acc, link) => {
//   if (!acc[link.source]) {
//     acc[link.source] = true;
//   }
//   if (!acc[link.target]) {
//     acc[link.target] = true;
//   }
//   return acc;
// }, {})).map(id => ({id}));
// const acceptablePeople = allLinks.reduce((acc, link) => {
//   if (link.source.length && !acc[link.source]) {
//     acc[link.source] = true;
//   }
//   if (link.target.length && !acc[link.target]) {
//     acc[link.target] = true;
//   }
//   console.log(link.target, link.source)
//   return acc;
// }, {});
let allPeople = peopleData.map((person) => ({
  id: person.name,
  birth: Number(person.active.split('-')[0]),
  affils: affils[person.name]
}));
console.log(allLinks)

const ydomain = allPeople.reduce((acc, row) => ({
  min: Math.min(acc.min, row.birth),
  max: Math.max(acc.max, row.birth),
}), {min: Infinity, max: -Infinity});
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
    const yScale = scaleLinear().domain([ydomain.max, ydomain.min]).range([0, plotHeight]);
    const xScale = scaleLinear().domain([0, 20]).range([0, plotWidth]);
    const afilList = affliationsData.map(group => group['group-name']);
    const colorScale = scaleOrdinal(schemePaired).domain(afilList);
    const finalPeople = allPeople.map(row => ({...row, fy: yScale(row.birth)}));
    const xCenter = affliationsData.reduce((acc, group, idx) => {
      acc[group['group-name']] = (idx + 10) * 150;
      return acc;
    }, {});
    
    const yAxis = axisRight(yScale)
      .tickSize(plotWidth)
      .tickFormat(function(d) {
        return d;
      });
      

    
    const simulation = forceSimulation()
        .force('link', forceLink().id(d => {
          console.log(d)
          return d.id;
        }).strength(1))
        .force('charge', forceManyBody().strength(-150))
        .force('center', forceCenter(plotWidth / 2, plotHeight / 2))
        .force('collision', forceCollide().radius(50));
        // .force('x', forceX().x(d => xCenter[d.affils] || 0));
    
    
    const g = select(ReactDOM.findDOMNode(this.refs.plotContainer));
    
    g.append("g")
      .call(function customYAxis(g) {
        g.call(yAxis);
        g.select(".domain").remove();
        g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
        g.selectAll(".tick text")
          .attr("x", 4).attr("dy", -4).attr('font-size', 100)
          .attr('fill', 'white');
      });  
    
    const link = g.append("g")
        .attr("class", "links")
      .selectAll("line")
      .data(allLinks)
      .enter().append("line")
        .attr("stroke-width", 2)
        .attr("stroke", d => affils[d.source] === affils[d.target] ? 
          colorScale(affils[d.target]) : '#aaa')
        .attr('opacity', 0.8);
    
    const node = g.append("g")
        .attr("class", "nodes")
      .selectAll("circle")
      .data(finalPeople)
      .enter()
        .append("g")
          .attr("transform", 'translate(0, 0)')
          .attr('class', 'node');
    g.selectAll('.node')            
          .append('circle')
          .attr("r", 2)
          .attr("fill", 'white');
    g.selectAll('.node')            
          .append("text").text(d => d.id)
          .attr('fill', 'white');
    
    // node;
    simulation.nodes(finalPeople).on('tick', ticked);
    simulation.force('link').links(allLinks);
    
    
    function ticked() {
      link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
    
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    }  
  }
  
  
  render() {
    const {width, height, margin} = this.props;
    const {left, top} = margin;
    return (
      <div className="influence-chart-wrapper">
        <svg className='influence-chart'
          width={width}
          height={height}>
          <rect width={width} height={height} fill="black"/>
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
  width: 2500,
  height: 2000,
  margin: {
    left: 10,
    right: 10,
    top: 50,
    bottom: 50
  }
}

export default InfluenceChart;
