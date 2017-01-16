export const camelCase = value => value.replace(/-([a-z])/g, g => g[1].toUpperCase());

export function transformSVGAtt(attName, attValue) {
  if (attName === 'style') {
    return attValue.split(';')
      .reduce((acc, attribute) => {
        const [property, value] = attribute.split(':');
        return {...acc, [camelCase(property)]: value};
      }, {});
  }

  if (attName === 'x' || attName === 'y' || attName === 'height' || attName === 'width') {
    return {[attName]: attValue.replace('px', '')};
  }
}
