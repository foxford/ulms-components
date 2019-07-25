### BasicButton as Button

#### Example
```js
<div className="styleguidist-button">
  <style dangerouslySetInnerHTML={{__html: `
    .styleguidist-button [class^="button-root"] {
      --media-ui-button-padding-left: 14px;
      --media-ui-button-padding-right: 14px;
      --media-ui-button-padding-bottom: 14px;
      --media-ui-button-padding-top: 14px;
      /* here we might overwrite default variables */
    }
  `}} />
  <Button
    active
    onClick={() => {alert('click')}}
    title='Active button'
  >Active</Button>
  <Button
    disabled
    onClick={() => {alert('click?! hmmmm...')}}
    title='Disabled button'
  >Disabled</Button>
</div>
```
