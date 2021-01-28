import React, {Component, useState, useEffect} from "react";
import {View} from 'react-native';
import PropTypes from 'prop-types'
import xmldom from 'xmldom';
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
    Text,
    TSpan,
    Defs,
    Stop
} from 'react-native-svg';

import * as utils from './utils';

const ACCEPTED_SVG_ELEMENTS = [
  'svg',
  'g',
  'circle',
  'path',
  'rect',
  'defs',
  'line',
  'linearGradient',
  'radialGradient',
  'stop',
  'ellipse',
  'polygon',
  'polyline',
  'text',
  'tspan'
];

// Attributes from SVG elements that are mapped directly.
const SVG_ATTS = ['viewBox', 'width', 'height'];
const G_ATTS = ['id'];

const CIRCLE_ATTS = ['cx', 'cy', 'r'];
const PATH_ATTS = ['d'];
const RECT_ATTS = ['width', 'height'];
const LINE_ATTS = ['x1', 'y1', 'x2', 'y2'];
const LINEARG_ATTS = LINE_ATTS.concat(['id', 'gradientUnits']);
const RADIALG_ATTS = CIRCLE_ATTS.concat(['id', 'gradientUnits']);
const STOP_ATTS = ['offset'];
const ELLIPSE_ATTS = ['cx', 'cy', 'rx', 'ry'];

const TEXT_ATTS = ['fontFamily', 'fontSize', 'fontWeight', 'textAnchor']

const POLYGON_ATTS = ['points'];
const POLYLINE_ATTS = ['points'];

const COMMON_ATTS = ['fill', 'fillOpacity', 'stroke', 'strokeWidth', 'strokeOpacity', 'opacity',
    'strokeLinecap', 'strokeLinejoin',
    'strokeDasharray', 'strokeDashoffset', 'x', 'y', 'rotate', 'scale', 'origin', 'originX', 'originY', 'transform', 'clipPath'];

let ind = 0;

function fixYPosition (y, node) {
  if (node.attributes) {
    const fontSizeAttr = Object.keys(node.attributes).find(a => node.attributes[a].name === 'font-size');
    if (fontSizeAttr) {
      return '' + (parseFloat(y) - parseFloat(node.attributes[fontSizeAttr].value));
    }
  }
  if (!node.parentNode) {
    return y;
  }
  return fixYPosition(y, node.parentNode)
}

const SvgUri = (props) => {

  const [fill, setFill] = useState(props.fill)
  const [source, setSource] = useState(props.source)
  const [svgXmlData, setSvgXmlData] = useState(props.svgXmlData)
  const [isComponentMounted, setIsComponentMounted] = useState(false)

  const createSVGElement = (node, childs) => {
    const children = trimElementChilden(childs);
    let componentAtts = {};
    const i = ind++;
    switch (node.nodeName) {
      case 'svg':
        componentAtts = obtainComponentAtts(node, SVG_ATTS);
        if (props.width) {
          componentAtts.width = props.width;
        }
        if (props.height) {
          componentAtts.height = props.height;
        }

        return <Svg key={i} {...componentAtts}>{childs}</Svg>;
      case 'g':
        componentAtts = obtainComponentAtts(node, G_ATTS);
        return <G key={i} {...componentAtts}>{childs}</G>;
      case 'path':
        componentAtts = obtainComponentAtts(node, PATH_ATTS);
        return <Path key={i} {...componentAtts}>{childs}</Path>;
      case 'circle':
        componentAtts = obtainComponentAtts(node, CIRCLE_ATTS);
        return <Circle key={i} {...componentAtts}>{childs}</Circle>;
      case 'rect':
        componentAtts = obtainComponentAtts(node, RECT_ATTS);
        return <Rect key={i} {...componentAtts}>{childs}</Rect>;
      case 'line':
        componentAtts = obtainComponentAtts(node, LINE_ATTS);
        return <Line key={i} {...componentAtts}>{childs}</Line>;
      case 'defs':
        return <Defs key={i}>{childs}</Defs>;
      case 'linearGradient':
        componentAtts = obtainComponentAtts(node, LINEARG_ATTS);
        return <LinearGradient key={i} {...componentAtts}>{childs}</LinearGradient>;
      case 'radialGradient':
        componentAtts = obtainComponentAtts(node, RADIALG_ATTS);
        return <RadialGradient key={i} {...componentAtts}>{childs}</RadialGradient>;
      case 'stop':
        componentAtts = obtainComponentAtts(node, STOP_ATTS);
        return <Stop key={i} {...componentAtts}>{childs}</Stop>;
      case 'ellipse':
        componentAtts = obtainComponentAtts(node, ELLIPSE_ATTS);
        return <Ellipse key={i} {...componentAtts}>{childs}</Ellipse>;
      case 'polygon':
        componentAtts = obtainComponentAtts(node, POLYGON_ATTS);
        return <Polygon key={i} {...componentAtts}>{childs}</Polygon>;
      case 'polyline':
        componentAtts = obtainComponentAtts(node, POLYLINE_ATTS);
        return <Polyline key={i} {...componentAtts}>{childs}</Polyline>;
      case 'text':
        componentAtts = obtainComponentAtts(node, TEXT_ATTS);
        return <Text key={i} {...componentAtts}>{childs}</Text>;
      case 'tspan':
        componentAtts = obtainComponentAtts(node, TEXT_ATTS);
        if (componentAtts.y) {
          componentAtts.y = fixYPosition(componentAtts.y, node)
        }
        return <TSpan key={i} {...componentAtts}>{childs}</TSpan>;
      default:
        return null;
    }
  }

  const obtainComponentAtts = ({attributes}, enabledAttributes) => {
    const styleAtts = {};

    if (fill && props.fillAll) {
      styleAtts.fill = fill;
    }

    Array.from(attributes).forEach(({nodeName, nodeValue}) => {
      Object.assign(styleAtts, utils.transformStyle({
        nodeName,
        nodeValue,
        fillProp: fill
      }));
    });

    const componentAtts =  Array.from(attributes)
      .map(utils.camelCaseNodeName)
      .map(utils.removePixelsFromNodeValue)
      .filter(utils.getEnabledAttributes(enabledAttributes.concat(COMMON_ATTS)))
      .reduce((acc, {nodeName, nodeValue}) => {
        acc[nodeName] = (fill && nodeName === 'fill' && nodeValue !== 'none') ? fill : nodeValue
        return acc
      }, {});
    Object.assign(componentAtts, styleAtts);

    return componentAtts;
  }

  const inspectNode = (node) => {
    // Only process accepted elements
    if (!ACCEPTED_SVG_ELEMENTS.includes(node.nodeName)) {
      return (<View />);
    }

    // Process the xml node
    const arrayElements = [];

    // if have children process them.
    // Recursive function.
    if (node.childNodes && node.childNodes.length > 0){
      for (let i = 0; i < node.childNodes.length; i++){
        const isTextValue = node.childNodes[i].nodeValue
        if (isTextValue) {
          arrayElements.push(node.childNodes[i].nodeValue)
        } else {
          const nodo = this.inspectNode(node.childNodes[i]);
          if (nodo != null) {
            arrayElements.push(nodo);
          }
        }
      }
    }

    return createSVGElement(node, arrayElements);
  }

  const fetchSVGData = async(uri) => {
    let responseXML = null, error = null;
    try {
      const response = await fetch(uri);
      responseXML = await response.text();
    } catch(e) {
      error = e;
      console.error("ERROR SVG", e);
    } finally {
      setSvgXmlData(responseXML)
    }
  }

  const trimElementChilden = (children) => {
    for (child of children) {
      if (typeof child === 'string') {
        if (child.trim().length === 0)
          children.splice(children.indexOf(child), 1);
      }
    }
    return children
  }

  useEffect(() => {
    if (props.source) {
      const src = resolveAssetSource(props.source) || {};
      if(src.uri){
        fetchSVGData(src.uri)
      }
    }

    if (props.fill) {
      setFill(props.fill)
    }

  }, [props.source])
  
  const renderSvgElement = () => {
    try {
      if (svgXmlData == null) {
        return null;
      }

      const inputSVG = svgXmlData.substring(
        svgXmlData.indexOf("<svg "),
        (svgXmlData.indexOf("</svg>") + 6)
      ).replace(/<!-(.*?)->/g, '');

      const doc = new xmldom.DOMParser().parseFromString(inputSVG);

      const rootSVG = inspectNode(doc.childNodes[0]);

      return(
        <View style={props.style}>
          {rootSVG}
        </View>
      );
    } catch(e){
      console.error("ERROR SVG", e);
      return null;
    }
  }

  return <>{renderSvgElement()}</>
}

SvgUri.propTypes = {
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  svgXmlData: PropTypes.string,
  source: PropTypes.any,
  fill: PropTypes.string,
  onLoad: PropTypes.func,
  fillAll: PropTypes.bool
}

module.exports = SvgUri;
