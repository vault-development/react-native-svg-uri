# react-native-svg-uri
Render SVG images in React Native from an URL

Install library from `npm`

  ```bash
  npm install react-native-svg-uri --save
  ```
  
### <a name="Usage">Usage</a>

Here's a simple example:

```javascript
import SvgUri from 'react-native-svg-uri';

class TestSvgUri extends Component {
  render() {
    return (
      <View style={styles.container}>
         <SvgUri width="200" height="200"
                 source={{uri:'http://thenewcode.com/assets/images/thumbnails/homer-simpson.svg'}} > </SvgUri>
      </View>
    );
  }
}
```

This will render:


![Component example](./screenshoots/sample.png)

