### Icons

```js
<div className="styleguidist-icons-1">
  <style dangerouslySetInnerHTML={{__html: `
    .styleguidist-icons-1 {
      color: #000;
      --media-ui-icons-color-hover: #333;
      --media-ui-icons-color-active: #888;
    }
    /* here we might overwrite default variables */
  `}} />
  <Icons name="arrow" />
  <br/>
  <Icons name="bullet" />
  <br/>
  <Icons name="feed" />
  <br/>
  <Icons name="slides" />
  <br/>
  <Icons name="video" />
  <br/>
</div>
```

#### Sizeable icons
```js
<div className="styleguidist-icons-2">
  <style dangerouslySetInnerHTML={{__html: `
    .styleguidist-icons-2 { }
    /* here we might overwrite default variables */
  `}} />
  <Icons name="arrow" size="xxxs" />
  <br/>
  <Icons name="arrow" size="xxs" />
  <br/>
  <Icons name="arrow" size="s" />
  <br/>
  <Icons name="arrow" size="m" />
  <br/>
  <Icons name="arrow" size="l" />
  <br/>
  <Icons name="arrow" size="lm" />
  <br/>
  <Icons name="arrow" size="xl" />
  <br/>
  <Icons name="arrow" size="xxl" />
  <br/>
  <Icons name="arrow" size="xxxl" />
  <br/>
</div>
```

#### Custom icons
```js
<div className="styleguidist-icons-3">
  <style dangerouslySetInnerHTML={{__html: `
    .styleguidist-icons-3 { }
    /* here we might overwrite default variables */
  `}} />
  <Icons>
    <Icons.Arrow />
  </Icons>
</div>
```

#### Raw icons
```js
<div style={{width: '20px'}}>
  <Icons.Arrow />
  <Icons.Bullet />
  <Icons.Feed />
  <Icons.Slides />
  <Icons.Video />
</div>
```

#### Nullable icons
```js
<Icons></Icons>
```
