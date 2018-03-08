function fixYPosition(y, node) {
  if (node.attributes) {
    const attribute = node.attributes.find(({ name, value }) => name === 'font-size');
    if (attribute) {
      return '' + (parseFloat(y) - parseFloat(attribute.value));
    }
  }
  if (!node.parentNode) {
    return y;
  }
  return fixYPosition(y, node.parentNode)
}

export const fixTextAttributes = (attributes, node) => {
  if (attributes.y != undefined) {
    attributes.y = fixYPosition(attributes.y, node)
  }
  return attributes;
}

export const camelCase = value => value.replace(/-([a-z])/g, g => g[1].toUpperCase());

export const camelCaseNodeName = ({ nodeName, nodeValue }) => ({ nodeName: camelCase(nodeName), nodeValue });

export const removePixelsFromNodeValue = ({ nodeName, nodeValue }) => ({ nodeName, nodeValue: nodeValue.replace('px', '') });

export const transformStyle = ({ nodeName, nodeValue }, fillProp) => {
  if (nodeName === 'style') {
    return extractStyle(nodeValue, fillProp);
  }
  return null;
};

export const getEnabledAttributes = enabledAttributes => ({ nodeName }) => enabledAttributes.includes(camelCase(nodeName));

export const extractStyleClasses = (node) => {
  if (node.nodeName === 'style') {
    let classArray = node.firstChild.nodeValue.split('}');

    return classArray.reduce((acc, classObj) => {
      let [className, style] = classObj.split('{');
      if (className && className !== '') {
        acc[className] = extractStyle(style)
      }
      return acc;
    }, {})
  } else if (node.childNodes) {
    return Array.from(node.childNodes).reduce((aggr, val) => aggr || extractStyleClasses(val), null)
  }
};

export const extractStyle = (style, fillProp) => {
  return style.split(';').reduce((acc, attribute) => {
    const [property, value] = attribute.split(':');
    if (property !== '') {
      acc[camelCase(property)] = fillProp && property === 'fill' && value !== 'none' ? fillProp : value;
    }
    return acc;
  }, {});
};

export const getRegExpForClassName = className => RegExp('\\.\\b' + className + '\\b');
