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

## Props

| Prop | Type | Default | Note |
|---|---|---|---|
| `source` | `ImageSource` |  | Same kind of `source` prop that `<Image />` component has
| `svgXmlData` | `String` |  | You can pass the SVG as String directly
| `fill` | `Color` |  | Overrides all fill attributes of the svg file

## Known Bugs

- [ANDROID] There is a problem with static SVG file on Android,
  Works OK in debug mode but fails to load the file in release mode.
  At the moment the only workaround is to pass the svg content in the svgXmlData prop.

## <a name="Usage">Usage</a>

Here's a simple example:

```javascript
import SvgUri from 'react-native-svg-uri';

const TestSvgUri = () => (
  <View style={styles.container}>
    <SvgUri
      width="200"
      height="200"
      source={{uri:'http://thenewcode.com/assets/images/thumbnails/homer-simpson.svg'}}
    />
  </View>
);
```

or a static file

```javascript
<SvgUri width="200" height="200" source={require('./img/homer.svg')} />
```

This will render:

![Component example](./screenshoots/sample.png)

## Testing
1. Make sure you have installed dependencies with `npm i`
2. Run tests with `npm test`
