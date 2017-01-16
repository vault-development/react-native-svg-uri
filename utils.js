export function transformSVGAtt(attName, attValue) {
  if (attName === 'style') {
    let styleAtts = attValue.split(';');
    let newAtts = {};
    for (let i = 0; i < styleAtts.length; i++) {
      const [property, value] = styleAtts[i].split(':');
      if (property === 'stop-color') {
        newAtts.stopColor = value;
      }
      else if (value) {
        newAtts[property] = value;
      }
    }
    return newAtts;
  }

  if (attName === 'x' || attName === 'y' || attName === 'height' || attName === 'width') {
    return {[attName]: attValue.replace('px', '')};
  }
  if (attName === 'viewBox') {
    return {viewbox: attValue};
  }
}
