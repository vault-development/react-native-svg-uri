import React, { Component } from "react";
import { View } from 'react-native';
import PropTypes from 'prop-types'
import xmldom from 'xmldom';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import Svg, {
  Circle,
  Ellipse,
  ClipPath,
  G,
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

class SvgUri extends Component {

  constructor(props) {
    super(props);

    this.state = { fill: props.fill, svgXmlData: props.svgXmlData };

    this.isComponentMounted = false;

    // Gets the image data from an URL or a static file
    if (props.source) {
      const source = resolveAssetSource(props.source) || {};
      this.fetchSVGData(source.uri);
    }
  }

  acceptedAttributes = {
    'svg': ['viewBox', 'width', 'height'],
    'g': ['id', 'clipPath'],
    'clipPath': ['id'],
    'circle': ['cx', 'cy', 'r'],
    'path': ['d', 'clipRule'],
    'rect': ['width', 'height', 'fill', 'x', 'y'],
    'line': ['x1', 'y1', 'x2', 'y2'],
    'lineArg': ['x1', 'y1', 'x2', 'y2', 'id', 'gradientUnits'],
    'radialg': ['cx', 'cy', 'r', 'id', 'gradientUnits'],
    'stop': ['offset'],
    'ellipse': ['cx', 'cy', 'rx', 'ry'],
    'text': ['fontFamily', 'fontSize', 'fontWeight'],
    'polygon': ['points'],
    'polyline': ['points'],
    'common': ['fill', 'fillOpacity', 'stroke', 'strokeWidth', 'strokeOpacity', 'opacity', 'strokeLinecap',
      'strokeLinejoin', 'strokeDasharray', 'strokeDashoffset', 'x', 'y', 'rotate', 'scale', 'origin', 'originX',
      'originY']
  }

  tagHandlers = {
    'defs': (index, node, childs) =>
      <Defs key={index++}>{childs}</Defs>,
    'g': (index, node, childs, styleClasses) =>
      <G key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['g'], styleClasses)}> {childs}</G>,
    'clipPath': (index, node, childs, styleClasses) =>
      <ClipPath key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['clipPath'], styleClasses)}>{childs}</ClipPath>,
    'path': (index, node, childs, styleClasses) =>
      <Path key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['path'], styleClasses)}>{childs}</Path>,
    'circle': (index, node, childs, styleClasses) =>
      <Circle key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['circle'], styleClasses)}>{childs}</Circle>,
    'rect': (index, node, childs, styleClasses) =>
      <Rect key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['rect'], styleClasses)}>{childs}</Rect>,
    'line': (index, node, childs, styleClasses) =>
      <Line key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['line'], styleClasses)}>{childs}</Line>,
    'linearGradient': (index, node, childs, styleClasses) =>
      <LinearGradient key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['linearGradient'], styleClasses)}>{childs}</LinearGradient>,
    'radialGradient': (index, node, childs, styleClasses) =>
      <RadialGradient key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['radialGradient'], styleClasses)}>{childs}</RadialGradient>,
    'stop': (index, node, childs, styleClasses) =>
      <Stop key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['stop'], styleClasses)}>{childs}</Stop>,
    'ellipse': (index, node, childs, styleClasses) =>
      <Ellipse key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['ellipse'], styleClasses)}>{childs}</Ellipse>,
    'polygon': (index, node, childs, styleClasses) =>
      <Polygon key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['polygon'], styleClasses)}>{childs}</Polygon>,
    'polyline': (index, node, childs, styleClasses) =>
      <Polyline key={index} {...this.obtainComponentAtts(node, this.acceptedAttributes['polyline'], styleClasses)}>{childs}</Polyline>,
    'text': (index, node, childs, styleClasses) =>
      <Text key={index} {...utils.fixTextAttributes(componentthis.obtainComponentAtts(node, this.acceptedAttributes['text'], styleClasses), node)}>{childs}</Text>,
    'tspan': (index, node, childs, styleClasses) =>
      <TSpan key={index} {...utils.fixTextAttributes(componentthis.obtainComponentAtts(node, this.acceptedAttributes['text'], styleClasses), node)}>{childs}</TSpan>,
    'svg': (index, node, childs, styleClasses) =>
      <Svg key={index} {...this.overrideRootElementAttributes(this.obtainComponentAtts(node, this.acceptedAttributes['svg'], styleClasses))}>{childs}</Svg>
  }

  componentWillMount() {
    this.isComponentMounted = true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.source) {
      const source = resolveAssetSource(nextProps.source) || {};
      const oldSource = resolveAssetSource(this.props.source) || {};
      if (source.uri !== oldSource.uri) {
        this.fetchSVGData(source.uri);
      }
    }

    if (nextProps.svgXmlData !== this.props.svgXmlData) {
      this.setState({ svgXmlData: nextProps.svgXmlData });
    }

    if (nextProps.fill !== this.props.fill) {
      this.setState({ fill: nextProps.fill });
    }
  }

  componentWillUnmount() {
    this.isComponentMounted = false
  }

  async fetchSVGData(uri) {
    let responseXML = null;
    try {
      const response = await fetch(uri);
      responseXML = await response.text();
    } catch (e) {
      console.error("ERROR SVG", e);
    } finally {
      if (this.isComponentMounted) {
        this.setState({ svgXmlData: responseXML });
      }
    }

    return responseXML;
  }

  overrideRootElementAttributes(attributes) {
    if (!attributes.viewBox) {
      attributes.viewBox = `0 0 ${attributes.width} ${attributes.height}`;
    }
    if (this.props.width) {
      attributes.width = this.props.width;
    }
    if (this.props.height) {
      attributes.height = this.props.height;
    }
    return attributes;
  }

  overrideFillAttribute(attributes) {
    if (!attributes.fill || attributes.fill !== 'none') {
      attributes.fill = this.state.fill
    }
    return attributes;
  }

  getStyleAttsForClass(attributes, enabledAttributes, styleClasses) {
    const classObj = Array.from(attributes).find(attr => attr.name === 'class');
    if (!classObj || !styleClasses || !styleClasses[classObj.nodeValue]) {
      return {};
    }
    return Object.keys(styleClasses[classObj.nodeValue]).reduce((aggr, key) => {
      if (utils.getEnabledAttributes(enabledAttributes.concat(this.acceptedAttributes.common))({ nodeName: key })) {
        aggr[key] = styleClasses[classObj.nodeValue][key];
      }
      return aggr;
    }, {});
  }

  obtainComponentAtts({ attributes }, enabledAttributes, styleClasses) {
    const styleAtts = this.getStyleAttsForClass(attributes, enabledAttributes, styleClasses)

    Array.from(attributes).forEach(({ nodeName, nodeValue }) => {
      Object.assign(styleAtts, utils.transformStyle({ nodeName, nodeValue }, this.state.fill));
    });

    const componentAtts = Array.from(attributes)
      .map(({ nodeName, nodeValue }) => utils.removePixelsFromNodeValue(utils.camelCaseNodeName({ nodeName, nodeValue })))
      .filter(utils.getEnabledAttributes(enabledAttributes.concat(this.acceptedAttributes.common)))
      .reduce((acc, { nodeName, nodeValue }) => {
        acc[nodeName] = nodeValue
        return acc
      }, {});

    Object.assign(componentAtts, styleAtts);

    return this.overrideFillAttribute(componentAtts);
  }

  // Remove empty strings from children array
  trimElementChilden = (childrens) => childrens.filter((children) => typeof children !== 'string' || children.trim.length !== 0)

  processNode(node, styleClasses) {
    // check if is text value
    if (node.nodeValue) {
      return node.nodeValue
    }

    // Only process accepted elements
    if (this.tagHandlers[node.nodeName]) {
      return null;
    }

    // Process the xml node
    let childrens = [];

    // if have children process them.
    // Recursive function.
    if (node.childNodes) {
      childrens = Array.from(node.childNodes).reduce((aggr, childNode) => {
        const node = this.processNode(childNode, styleClasses);
        if (node) {
          childrens.push(node);
        }
        return childrens
      }, childrens)
    }

    return this.tagHandlers[node.nodeName](index++, node, this.trimElementChilden(childrens), styleClasses);
  }

  index;

  render() {
    try {
      if (this.state.svgXmlData == null) {
        return null;
      }

      const doc = new xmldom.DOMParser().parseFromString(
        this.state.svgXmlData.substring(
          this.state.svgXmlData.indexOf("<svg "),
          this.state.svgXmlData.indexOf("</svg>") + 6
        )
      );

      index = 1;

      return (
        <View style={this.props.style}>
          {this.processNode(doc.childNodes[0], utils.extractStyleClasses(doc.childNodes[0]))}
        </View>
      );
    } catch (e) {
      console.error("ERROR SVG", e);
      return null;
    }
  }
}

SvgUri.propTypes = {
  style: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  svgXmlData: PropTypes.string,
  source: PropTypes.any,
  fill: PropTypes.string,
}

module.exports = SvgUri;