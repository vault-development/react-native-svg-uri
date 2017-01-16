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

// Attributes that have a transformation of value
const SVG_ATTS_TRANSFORM = ['x', 'y', 'height', 'width'];
const G_ATTS_TRANSFORM = [];
const CIRCLE_ATTS_TRANSFORM = ['style'];
const PATH_ATTS_TRANSFORM = ['style'];
const RECT_ATTS_TRANSFORM = ['style'];
const LINEARG_ATTS_TRANSFORM = [];
const RADIALG_ATTS_TRANSFORM = [];
const STOP_ATTS_TRANSFORM = ['style'];

// Attributes that only change his name
const ATTS_TRANSFORMED_NAMES={'stroke-linejoin':'strokeLinejoin',
                              'stroke-linecap':'strokeLinecap',
                              'stroke-width':'strokeWidth',
                            //  'stroke-miterlimit':'strokeMiterlimit',
                              };

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
             componentAtts = this.obtainComponentAtts(node, SVG_ATTS, SVG_ATTS_TRANSFORM);
             if (this.props.width)
                componentAtts.width = this.props.width;
             if (this.props.height)
                componentAtts.height = this.props.height;

             return <Svg key={i} {...componentAtts}>{childs}</Svg>;
        case 'g':
             componentAtts = this.obtainComponentAtts(node, G_ATTS, G_ATTS_TRANSFORM);
            return <G key={i} {...componentAtts}>{childs}</G>;
        case 'path':
             componentAtts = this.obtainComponentAtts(node, PATH_ATTS, PATH_ATTS_TRANSFORM);
            return <Path key={i} {...componentAtts}>{childs}</Path>;
        case 'circle':
             componentAtts = this.obtainComponentAtts(node, CIRCLE_ATTS, CIRCLE_ATTS_TRANSFORM);
            return <Circle key={i} {...componentAtts}>{childs}</Circle>;
        case 'rect':
             componentAtts = this.obtainComponentAtts(node, RECT_ATTS, RECT_ATTS_TRANSFORM);
            return <Rect key={i} {...componentAtts}>{childs}</Rect>;
        case 'linearGradient':
             componentAtts = this.obtainComponentAtts(node, LINEARG_ATTS, LINEARG_ATTS_TRANSFORM);
            return <Defs><LinearGradient key={i} {...componentAtts}>{childs}</LinearGradient></Defs>;
        case 'radialGradient':
             componentAtts = this.obtainComponentAtts(node, RADIALG_ATTS, RADIALG_ATTS_TRANSFORM);
            return <Defs><RadialGradient key={i} {...componentAtts}>{childs}</RadialGradient></Defs>;
        case 'stop':
             componentAtts = this.obtainComponentAtts(node, STOP_ATTS, STOP_ATTS_TRANSFORM);
            return <Stop key={i} {...componentAtts}>{childs}</Stop>;
        default:
          return null;
        }
  }

  obtainComponentAtts({attributes}, enabledAttributes, transformAttributes) {
      let validAttributes = {};

      Array.from(attributes).forEach(({nodeName, nodeValue}) => {
          if (transformAttributes.includes(nodeName)) {
            Object.assign(validAttributes, utils.transformSVGAtt(nodeName, nodeValue));
          }
          else if (nodeName in ATTS_TRANSFORMED_NAMES) {
            validAttributes[ATTS_TRANSFORMED_NAMES[nodeName]] = nodeValue;
          }
          else if (enabledAttributes.includes(nodeName)) {
            validAttributes[nodeName] = this.props.fill && nodeName === 'fill' ? this.props.fill : nodeValue;
          }
      });

      return validAttributes;
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
