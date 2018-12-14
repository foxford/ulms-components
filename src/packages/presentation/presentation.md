### Presentation

#### Basic example
```js
initialState = {
  collection: [
    {
      page: 1,
      image: 'https://placeimg.com/640/480/any',
      imageWidth: 640,
      imageHeight: 480,
      preview: 'https://placeimg.com/120/68/any',
      previewWidth: 120,
      previewHeight: 68
    },
    {
      page: 2,
      image: 'https://placeimg.com/640/480/any',
      imageWidth: 640,
      imageHeight: 480,
      preview: 'https://placeimg.com/120/68/any',
      previewWidth: 120,
      previewHeight: 68
    },
    {
      page: 3,
      image: 'https://placeimg.com/640/480/any',
      imageWidth: 640,
      imageHeight: 480,
      preview: 'https://placeimg.com/120/68/any',
      previewWidth: 120,
      previewHeight: 68
    },
  ]
};
<div style={ {height: '500px'} }>
  <Presentation
    index={0}
    collection={state.collection}
    onChange={() => {}}
    showPagesCount={false}
    showActions={false}
    showPreviews={false}
  />
</div>
```

#### Full example
```js
initialState = {
  collection: [
    {
      page: 1,
      image: 'https://placeimg.com/640/480/any',
      imageWidth: 640,
      imageHeight: 480,
      preview: 'https://placeimg.com/120/68/any',
      previewWidth: 120,
      previewHeight: 68
    },
    {
      page: 2,
      image: 'https://placeimg.com/640/480/any',
      imageWidth: 640,
      imageHeight: 480,
      preview: 'https://placeimg.com/120/68/any',
      previewWidth: 120,
      previewHeight: 68
    },
    {
      page: 3,
      image: 'https://placeimg.com/640/480/any',
      imageWidth: 640,
      imageHeight: 480,
      preview: 'https://placeimg.com/120/68/any',
      previewWidth: 120,
      previewHeight: 68
    },
  ]
};
<div style={ {height: '500px'} }>
  <Presentation
    index={0}
    collection={state.collection}
    onChange={() => {}}
    showPagesCount={true}
    showActions={true}
    showPreviews={true}
  />
</div>
```

