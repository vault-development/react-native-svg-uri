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

export const extractStyleClasses = (node) => {

    if (node.nodeName === 'style') {
        let stylesString = node.firstChild.nodeValue;
        let classArray = stylesString.split('}');

        return classArray.reduce((acc, classObj) => {
            let [className, style] = classObj.split('{');
            if (className === '') {
                return acc;
            }
            className = className.substring(1);
            return {...acc, [className]: extractStyle(style)};
        }, {})
    } else {
        if (node.childNodes) {
            let result = false;
            for (let i = 0; i < node.childNodes.length; i++) {
                result = extractStyleClasses(node.childNodes[i]);
                if (result) {
                    return result;
                }
            }
        }

        return false;
    }
};

export const extractStyle = (style, fillProp) => {
    return style.split(';')
        .reduce((acc, attribute) => {
            const [property, value] = attribute.split(':');
            if (property === '') {
                return acc;
            } else {
                return {...acc, [camelCase(property)]: fillProp && property === 'fill' ? fillProp : value};
            }
        }, {});
};