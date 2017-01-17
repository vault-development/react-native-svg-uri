'use strict';
import React, {Component, PropTypes} from "react";
import {View} from 'react-native';
import xmldom from 'xmldom'; // Dependencie
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import Svg,{
    Circle,
    Ellipse,
    G ,
    LinearGradient,
    RadialGradient,
    Line,
    Path,
    Polygon,
    Polyline,
    Rect,
    Symbol,
    Use,
    Defs,
    Stop
} from 'react-native-svg';

import * as utils from './utils';

const ACEPTED_SVG_ELEMENTS = [
  'svg',
  'g',
  'circle',
  'path',
  'rect',
  'linearGradient',
  'radialGradient',
  'stop',
  'ellipse',
];

// Attributes from SVG elements that are mapped directly.
const SVG_ATTS = ['viewBox'];
const G_ATTS = ['id'];
const CIRCLE_ATTS = ['cx', 'cy', 'r', 'fill', 'stroke'];
const PATH_ATTS = ['d', 'fill', 'stroke'];
const RECT_ATTS = ['width', 'height', 'fill', 'stroke'];
const LINEARG_ATTS = ['id', 'x1', 'y1', 'x2', 'y2'];
const RADIALG_ATTS = ['id', 'cx', 'cy', 'r'];
const STOP_ATTS = ['offset'];
const ELLIPSE_ATTS = ['fill', 'cx', 'cy', 'rx', 'ry'];

let ind = 0;

class SvgUri extends Component{

	constructor(props){
		super(props);

    this.state = {svgXmlData: props.svgXmlData};

    this.createSVGElement     = this.createSVGElement.bind(this);
    this.obtainComponentAtts  = this.obtainComponentAtts.bind(this);
    this.inspectNode          = this.inspectNode.bind(this);
    this.fecthSVGData         = this.fecthSVGData.bind(this);

    // Gets the image data from an URL or a static file
    if (props.source) {
        const source = resolveAssetSource(props.source) || {};
        this.fecthSVGData(source.uri);
    }
	}

  componentWillReceiveProps (nextProps){
    if (nextProps.source) {
        const source = resolveAssetSource(nextProps.source) || {};
        const oldSource = resolveAssetSource(this.props.source) || {};
        if(source.uri !== oldSource.uri){
            this.fecthSVGData(source.uri);
        }
    }
  }

  async fecthSVGData(uri){
     try {
         let response = await fetch(uri);
         let responseXML = await response.text();
         this.setState({svgXmlData:responseXML});
         return responseXML;
     } catch(error) {
        console.error(error);
     }
  }


  createSVGElement(node, childs){
        let componentAtts = {};
        let i = ind++;
        switch (node.nodeName) {
        case 'svg':
             componentAtts = this.obtainComponentAtts(node, SVG_ATTS);
             if (this.props.width)
                componentAtts.width = this.props.width;
             if (this.props.height)
                componentAtts.height = this.props.height;

             return <Svg key={i} {...componentAtts}>{childs}</Svg>;
        case 'g':
             componentAtts = this.obtainComponentAtts(node, G_ATTS);
            return <G key={i} {...componentAtts}>{childs}</G>;
        case 'path':
             componentAtts = this.obtainComponentAtts(node, PATH_ATTS);
            return <Path key={i} {...componentAtts}>{childs}</Path>;
        case 'circle':
             componentAtts = this.obtainComponentAtts(node, CIRCLE_ATTS);
            return <Circle key={i} {...componentAtts}>{childs}</Circle>;
        case 'rect':
             componentAtts = this.obtainComponentAtts(node, RECT_ATTS);
            return <Rect key={i} {...componentAtts}>{childs}</Rect>;
        case 'linearGradient':
             componentAtts = this.obtainComponentAtts(node, LINEARG_ATTS);
            return <Defs><LinearGradient key={i} {...componentAtts}>{childs}</LinearGradient></Defs>;
        case 'radialGradient':
             componentAtts = this.obtainComponentAtts(node, RADIALG_ATTS);
            return <Defs><RadialGradient key={i} {...componentAtts}>{childs}</RadialGradient></Defs>;
        case 'stop':
             componentAtts = this.obtainComponentAtts(node, STOP_ATTS);
            return <Stop key={i} {...componentAtts}>{childs}</Stop>;
        case 'ellipse':
             componentAtts = this.obtainComponentAtts(node, ELLIPSE_ATTS);
            return <Ellipse key={i} {...componentAtts}>{childs}</Ellipse>;
        default:
          return null;
        }
  }

  obtainComponentAtts({attributes}, enabledAttributes) {
    return Array.from(attributes)
      .map(utils.camelCaseNodeName)
      .map(utils.removePixelsFromNodeValue)
      .map(utils.transformStyle)
      .filter(utils.getEnabledAttributes(enabledAttributes))
      .reduce((acc, {nodeName, nodeValue}) => ({
        ...acc,
        [nodeName]: this.props.fill && nodeName === 'fill' ? this.props.fill : nodeValue,
      }), {});
  }

  inspectNode(node){
      //Process the xml node
      let arrayElements = [];

      // Only process accepted elements
      if (!ACEPTED_SVG_ELEMENTS.includes(node.nodeName))
          return null;
      // if have children process them.

      // Recursive function.
      if (node.childNodes && node.childNodes.length > 0){
          for (let i = 0; i < node.childNodes.length; i++){
              let nodo = this.inspectNode(node.childNodes[i]);
              if (nodo != null)
                  arrayElements.push(nodo);
          }
      }
      let element = this.createSVGElement(node, arrayElements);
      return element;
  }

	render(){
    try{
        if (this.state.svgXmlData == null)
            return null;

        let inputSVG = this.state.svgXmlData.substring(this.state.svgXmlData.indexOf("<svg "), (this.state.svgXmlData.indexOf("</svg>") + 6));

        let doc = new xmldom.DOMParser().parseFromString(inputSVG);

        let rootSVG = this.inspectNode(doc.childNodes[0]);

        return(
            <View style={this.props.style}>
              {rootSVG}
            </View>
        );
    }catch(e){
      console.error("ERROR SVG", e);
      return null;
    }
	}
}

SvgUri.propTypes = {
  fill: PropTypes.string,
}

module.exports = SvgUri;
