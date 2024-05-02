### ActionButtonGroup

#### Example
```js
const items = [
  {
    active: true,
    children: (<Icons name="feed" size="xs" />),
    disabled: true,
    onClick: e => { console.log(e); alert('Check the console.')},
    showBullet: true,
    showUnderline: true,
    text: 'Материалы',
    title: 'К материалам'
  },
  {
    active: true,
    children: (<Icons name="video" size="xs" />),
    disabled: false,
    onClick: e => { console.log(e); alert('Check the console.')},
    showBullet: true,
    showUnderline: true,
    text: 'Видео',
    title: 'К видео'
  },
  {
    active: false,
    children: (<Icons name="edit" size="xs" width="18px" />),
    disabled: false,
    onClick: e => { console.log(e); alert('Check the console.')},
    showBullet: false,
    showUnderline: true,
    text: 'Доска',
    title: 'К доске'
  },
  {
    active: false,
    children: (<Icons name="slides" size="xs" width="18px" />),
    disabled: false,
    onClick: e => { console.log(e); alert('Check the console.')},
    showBullet: false,
    showUnderline: true,
    text: 'Презентация',
    title: 'К презентации'
  },
];

<div className="styleguidist-action-button-group">
  <style dangerouslySetInnerHTML={{__html: `
    .styleguidist-action-button-group [class^="action-button-group-root"] {
      font-size: 16px;
      --media-ui-action-button-group-button-padding-bottom: 0;
    }
    /* here we might overwrite default variables */
  `}} />
  <ActionButtonGroup items={items} />
</div>
```
