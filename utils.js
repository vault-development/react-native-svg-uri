export const camelCase = value => value.replace(/-([a-z])/g, g => g[1].toUpperCase());

export const camelCaseNodeName = ({nodeName, nodeValue}) => ({nodeName: camelCase(nodeName), nodeValue});
export const removePixelsFromNodeValue = ({nodeName, nodeValue}) => ({nodeName, nodeValue: nodeValue.replace('px', '')});
export const transformStyle = ({nodeName, nodeValue}) => {
  if (nodeName === 'style') {
    return nodeValue.split(';')
      .reduce((acc, attribute) => {
        const [property, value] = attribute.split(':');
        return {...acc, [camelCase(property)]: value};
      }, {});
  }
  return {nodeName, nodeValue};
};
export const getEnabledAttributes = enabledAttributes => ({nodeName}) => enabledAttributes.includes(nodeName);
