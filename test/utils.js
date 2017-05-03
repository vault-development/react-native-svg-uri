import {expect} from 'chai';

import {transformStyle, camelCase, removePixelsFromNodeValue, getEnabledAttributes} from '../utils';

describe('transformStyle', () => {
  it('transforms style attribute', () => {
    expect(
      transformStyle({nodeName: 'style', nodeValue: 'fill:rgb(0,0,255);stroke:rgb(0,0,0)'})
    ).to.deep.equal({
      fill: 'rgb(0,0,255)',
      stroke: 'rgb(0,0,0)',
    });
  });

  it('transforms style attribute with dash-case attribute', () => {
    expect(
      transformStyle({nodeName: 'style', nodeValue: 'stop-color:#ffffff'})
    ).to.deep.equal({
      stopColor: '#ffffff',
    });
  });
});

describe('removePixelsFromNodeValue', () => {
  it('removes pixels from x, y, height and width attributes', () => {
    expect(removePixelsFromNodeValue({nodeName: 'x', nodeValue: '2px'})).to.deep.equal({nodeName: 'x', nodeValue: '2'});
    expect(removePixelsFromNodeValue({nodeName: 'y', nodeValue: '4px'})).to.deep.equal({nodeName: 'y', nodeValue: '4'});
    expect(removePixelsFromNodeValue({nodeName: 'height', nodeValue: '65px'})).to.deep.equal({nodeName: 'height', nodeValue: '65'});
    expect(removePixelsFromNodeValue({nodeName: 'width', nodeValue: '999px'})).to.deep.equal({nodeName: 'width', nodeValue: '999'});
  });
})

describe('camelCase', () => {
  it('transforms two word attribute with dash', () => {
    expect(camelCase('stop-color')).to.deep.equal('stopColor');
  });

  it('does not do anything to string that is already camel cased', () => {
    expect(camelCase('stopColor')).to.deep.equal('stopColor');
  });
});

describe('getEnabledAttributes', () => {
  it('return true when nodeName is found', () => {
    const enabledAttributes = ['x', 'y', 'strokeOpacity'];
    const hasEnabledAttribute = getEnabledAttributes(enabledAttributes);

    expect(hasEnabledAttribute({nodeName: 'x'})).to.deep.equal(true);
    expect(hasEnabledAttribute({nodeName: 'stroke-opacity'})).to.deep.equal(true);
  });

  it('return false when nodeName is not found', () => {
    const enabledAttributes = ['width', 'height'];
    const hasEnabledAttribute = getEnabledAttributes(enabledAttributes);

    expect(hasEnabledAttribute({nodeName: 'depth'})).to.deep.equal(false);
  });
});
