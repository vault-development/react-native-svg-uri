export const camelCase = value => value.replace(/-([a-z])/g, g => g[1].toUpperCase());

export const camelCaseNodeName = ({nodeName, nodeValue}) => ({nodeName: camelCase(nodeName), nodeValue});

export const removePixelsFromNodeValue = ({nodeName, nodeValue}) => ({nodeName, nodeValue: nodeValue.replace('px', '')});

export const transformStyle = ({nodeName, nodeValue, fillProp}) => {
  if (nodeName === 'style') {
    return nodeValue.split(';')
      .reduce((acc, attribute) => {
        const [property, value] = attribute.split(':');
        if (property == "")
            return acc;
        else
            return {...acc, [camelCase(property)]: fillProp && property === 'fill' ? fillProp : value};
      }, {});
  }
  return null;
};

export const getEnabledAttributes = enabledAttributes => ({nodeName}) => enabledAttributes.includes(camelCase(nodeName));
