# react-native-svg-uri
Render SVG images in React Native from an URL or a static file

This was tested with RN 0.33 and react-native-svg 4.3.1 (depends on this library)
[react-native-svg](https://github.com/react-native-community/react-native-svg)


Not all the svgs can be rendered, if you find problems fill an issue or a PR in 
order to contemplate all the cases

Install library from `npm`

  ```bash
  npm install react-native-svg-uri --save
  ```
  
Link library react-native-svg

  ```bash
  react-native link react-native-svg # not react-native-svg-uri !!!
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
                 source={{uri:'http://thenewcode.com/assets/images/thumbnails/homer-simpson.svg'}} /> 
      </View>
    );
  }
}
```

or a static file

```javascript
 
         <SvgUri width="200" height="200"
                 source={require('./images/homer.svg')} /> 
     
```

This will render:


![Component example](./screenshoots/sample.png)

