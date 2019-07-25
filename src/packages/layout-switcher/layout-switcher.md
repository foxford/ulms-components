### LayoutSwitcher

#### Example
```js
const items = [
  {
    active: true,
    children: (<Icons name="feed" size="xs" />),
    disabled: true,
    onClick: e => { console.log(e); alert('Check the console.')},
    showBullet: true,
    title: 'К материалам'
  },
  {
    active: false,
    children: (<Icons name="video" size="xs" />),
    disabled: false,
    onClick: e => { console.log(e); alert('Check the console.')},
    showBullet: false,
    title: 'К видео'
  },
  {
    active: false,
    children: (<Icons name="slides" size="xs" width="18px" />),
    disabled: false,
    onClick: e => { console.log(e); alert('Check the console.')},
    showBullet: false,
    title: 'К презентации'
  },
  {
    active: false,
    children: (<Icons name="edit" size="xs" width="18px" />),
    disabled: false,
    onClick: e => { console.log(e); alert('Check the console.')},
    showBullet: false,
    title: 'К доске'
  }
];

<LayoutSwitcher items={items} />
```
