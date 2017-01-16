import {expect} from 'chai';

import {transformSVGAtt} from '../utils';

describe('transformSVGAtt', () => {
  it('transforms style attribute', () => {
    expect(transformSVGAtt('style', 'fill:rgb(0,0,255);stroke:rgb(0,0,0)')).to.deep.equal({
      fill: 'rgb(0,0,255)',
      stroke: 'rgb(0,0,0)',
    });
  });

  it('removes pixels from x, y, height and width attributes', () => {
    expect(transformSVGAtt('x', '2px')).to.deep.equal({x: '2'});
    expect(transformSVGAtt('y', '4px')).to.deep.equal({y: '4'});
    expect(transformSVGAtt('height', '65px')).to.deep.equal({height: '65'});
    expect(transformSVGAtt('width', '999px')).to.deep.equal({width: '999'});
  });
});
