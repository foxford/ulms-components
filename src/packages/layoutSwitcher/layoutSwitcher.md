### LayoutSwitcher

#### Example
```js
const items = [
  {
    active: true,
    children: (<Icons name="feed" size="xs" />),
    disabled: true,
    onClick: () => {},
    showBullet: true,
    title: 'К материалам'
  },
  {
    active: false,
    children: (<Icons name="video" size="xs" />),
    disabled: false,
    onClick: () => {},
    showBullet: false,
    title: 'К видео'
  },
  {
    active: false,
    children: (<Icons name="slides" size="xs" width="18px" />),
    disabled: false,
    onClick: () => {},
    showBullet: false,
    title: 'На презентацию'
  }
];

<LayoutSwitcher items={items} />
```
