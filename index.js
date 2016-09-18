'use strict';
import React, {Component, PropTypes} from "react";
import {View} from 'react-native';
import xmldom from 'xmldom'; // Dependencie

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

const ACEPTED_SVG_ELEMENTS = {'svg':true, 'g':true, 'circle':true, 'path':true,
                              'rect':true, 'linearGradient':true, 'radialGradient':true, 'stop':true};


// Atributos que se mapean de forma directa al componente SVG
const SVG_ATTS = {'viewBox':true};
const G_ATTS = {'id':true};
const CIRCLE_ATTS = {'cx':true, 'cy':true, 'r':true};
const PATH_ATTS = {'d':true, 'fill':true, 'stroke':true};
const RECT_ATTS = {'width':true, 'height':true};
const LINEARG_ATTS = {'id':true, 'x1':true, 'y1':true, 'x2':true, 'y2':true};
const RADIALG_ATTS = {'id':true, 'cx':true, 'cy':true, 'r':true};
const STOP_ATTS = {'offset':true};

// Atributos que tienen una transformacion de formato.
const SVG_ATTS_TRANSFORM = {'x':true, 'y':true, 'height':true, 'width':true }; //'viewBox':true
const G_ATTS_TRANSFORM = {};
const CIRCLE_ATTS_TRANSFORM = {'style':true};
const PATH_ATTS_TRANSFORM = {'style':true};
const RECT_ATTS_TRANSFORM = {'style':true};
const LINEARG_ATTS_TRANSFORM = {};
const RADIALG_ATTS_TRANSFORM = {}; // Its not working
const STOP_ATTS_TRANSFORM = {'style':true};

//
const ATTS_TRANSFORMED_NAMES={'stroke-linejoin':'strokeLinejoin',
                              'stroke-linecap':'strokeLinecap',
                              'stroke-width':'strokeWidth',
                            //  'stroke-miterlimit':'strokeMiterlimit',
                              };


class SvgUri extends Component{

	constructor(props){
		super(props);

    this.state = {svgXmlData:null};

    this.createSVGElement     = this.createSVGElement.bind(this);
    this.transformSVGAtt      = this.transformSVGAtt.bind(this);
    this.obtainComponentAtts  = this.obtainComponentAtts.bind(this);
    this.inspectNode          = this.inspectNode.bind(this);
    this.fecthSVGData         = this.fecthSVGData.bind(this);
    // Gets the image data from an URL.
    if (props.source && props.source.uri)
      this.fecthSVGData(props.source.uri);
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

        switch (node.nodeName) {
        case 'svg':
             componentAtts = this.obtainComponentAtts(node, SVG_ATTS, SVG_ATTS_TRANSFORM);
             if (this.props.width)
                componentAtts.width = this.props.width;
             if (this.props.height)
                componentAtts.height = this.props.height;

             return <Svg {...componentAtts}>{childs}</Svg>;
        case 'g':
             componentAtts = this.obtainComponentAtts(node, G_ATTS, G_ATTS_TRANSFORM);
            return <G {...componentAtts}>{childs}</G>;
        case 'path':
             componentAtts = this.obtainComponentAtts(node, PATH_ATTS, PATH_ATTS_TRANSFORM);
            return <Path {...componentAtts}>{childs}</Path>;
        case 'circle':
             componentAtts = this.obtainComponentAtts(node, CIRCLE_ATTS, CIRCLE_ATTS_TRANSFORM);
            return <Circle {...componentAtts}>{childs}</Circle>;
        case 'rect':
             componentAtts = this.obtainComponentAtts(node, RECT_ATTS, RECT_ATTS_TRANSFORM);
            return <Rect {...componentAtts}>{childs}</Rect>;
        case 'linearGradient':
             componentAtts = this.obtainComponentAtts(node, RADIALG_ATTS, RADIALG_ATTS_TRANSFORM);
            return <Defs><LinearGradient {...componentAtts}>{childs}</LinearGradient></Defs>;
        case 'radialGradient':
             componentAtts = this.obtainComponentAtts(node, RADIALG_ATTS, RADIALG_ATTS_TRANSFORM);
            return <Defs><RadialGradient {...componentAtts}>{childs}</RadialGradient></Defs>;
        case 'stop':
             componentAtts = this.obtainComponentAtts(node, STOP_ATTS, STOP_ATTS_TRANSFORM);
            return <Stop {...componentAtts}>{childs}</Stop>;
        default:
          return null;
          break;
        }
  }

  obtainComponentAtts(node, ATTS_ENABLED, ATTS_TRANSFORM){
      let componentAtts = {};
      for (let i = 0; i < node.attributes.length; i++){
          let att = node.attributes[i];
          if (att.nodeName in ATTS_TRANSFORM){
              att = this.transformSVGAtt(node.nodeName, att.nodeName, att.nodeValue);
              componentAtts = Object.assign({}, componentAtts, att);
          }else{

              if (att.nodeName in ATTS_TRANSFORMED_NAMES){
                componentAtts[ATTS_TRANSFORMED_NAMES[att.nodeName]] = att.nodeValue;
              }else{
                  if (att.nodeName in ATTS_ENABLED){ // Valida que el atributo sea mapeable
                      componentAtts[att.nodeName] = att.nodeValue;
                  }else{
                      ;
                  }
              }
          }
      }
      return componentAtts;
  }

  transformSVGAtt(component, attName, attValue){
      if (attName == 'style'){
          let styleAtts = attValue.split(';');
          let newAtts = {};
          for (let i = 0; i < styleAtts.length; i++){
              let styleAtt = styleAtts[i].split(':');
              if (!styleAtt[1] || styleAtt[1] == '')
                  continue;
              if (styleAtt[0] == 'stop-color')
                  newAtts['stopColor'] = styleAtt[1];
              else
                  newAtts[styleAtt[0]] = styleAtt[1];
          }
          return newAtts;
      }

      if (attName == 'x' || attName == 'y' || attName == 'height' || attName == 'width'){
          let newAtts = {};
          newAtts[attName] = attValue.replace('px', ''); // Remove the px
          return newAtts;
      }
      if (attName == 'viewBox'){
        let newAtts = {};
        newAtts['viewbox'] = attValue; // El atributo va en minuscula
        return newAtts;
      }
  }

  inspectNode(node){
      //Process the xml node
      let arrayElements = [];

      if(!(node.nodeName in ACEPTED_SVG_ELEMENTS))
          return null;
      // Si tiene hijos procesa los hijos.

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

module.exports = SvgUri;
