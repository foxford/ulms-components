### LayoutSwitcher

#### Example
```js
const Icons = require('../icons/icons.jsx');
const Feed = Icons.Feed;
const Slides = Icons.Slides;
const Video = Icons.Video;

const items = [
  {
    active: true,
    children: (<Feed />),
    disabled: true,
    onClick: () => {},
    showBullet: true,
    title: 'К материалам'
  },
  {
    active: false,
    children: (<Video />),
    disabled: false,
    onClick: () => {},
    showBullet: false,
    title: 'К видео'
  },
  {
    active: false,
    children: (<Slides />),
    disabled: false,
    onClick: () => {},
    showBullet: false,
    title: 'На презентацию'
  }
];

<LayoutSwitcher items={items} />
```
