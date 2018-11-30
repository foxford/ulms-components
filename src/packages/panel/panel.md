### Standalone panel

#### with children
```js
<MakeFullscreen wrap>
  <Panel debug>
    We gonna space?!
  </Panel>
</MakeFullscreen>
```

#### with built-in children
```js
<MakeFullscreen wrap>
  <Panel title='We gonna space?!' debug />
</MakeFullscreen>
```

#### with custom children
```js
<MakeFullscreen wrap>
  <Panel debug>
    <Panel.Header>We gonna space?!</Panel.Header>
  </Panel>
</MakeFullscreen>
```

### Adjacent panels

#### Column
```js
<MakeFullscreen>
  <Panel>
    <Panel debug>
      We
    </Panel>
    <Panel debug>
      gonna
    </Panel>
    <Panel debug>
      space?!
    </Panel>
  </Panel>
</MakeFullscreen>
```

#### Row
```js
<MakeFullscreen>
  <Panel direction='row'>
    <Panel debug>
      We
    </Panel>
    <Panel debug>
      gonna
    </Panel>
    <Panel debug>
      space?!
    </Panel>
  </Panel>
</MakeFullscreen>
```

### Nested panels
```js
<MakeFullscreen wrap>
  <Panel debug>
    <Panel.Header>
      We gonna space?!
    </Panel.Header>
    <Panel debug>
      Please space..
      <Panel debug>
        Please space..
      </Panel>
    </Panel>
  </Panel>
</MakeFullscreen>
```

### Panels inside grid
```js
<MakeFullscreen>
  <Grid debug>
    <Grid.Row>
      <Grid.Col size="auto">
        <Panel debug>
          We gonna space?!
          <Panel debug>
            Please space..
          </Panel>
        </Panel>
      </Grid.Col>
      <Grid.Col size="auto">
        <Panel debug>
          We gonna space?!
        </Panel>
      </Grid.Col>
    </Grid.Row>
  </Grid>
</MakeFullscreen>
```

### Other

#### Panels with headers inside grid
```js
<MakeFullscreen>
  <Panel direction='row'>
    <Panel debug>
      <Panel.Header>We</Panel.Header>
      <Panel.Inner>gonna space?!</Panel.Inner>
    </Panel>
    <Panel
      title='Is it'
      content='space?'
      debug
    />
    <Panel debug>
      <Panel.Header>Is it</Panel.Header>
      <Panel debug>space?</Panel>
    </Panel>
    <Panel debug>
      <Panel.Header noAdjacent>Please</Panel.Header>
      <Panel debug>
        <Panel.Inner>
          space!
        </Panel.Inner>
      </Panel>
    </Panel>
  </Panel>
</MakeFullscreen>
```

#### Multiple nested panels
```js
<MakeFullscreen wrap>
  <Panel debug>
    <Panel.Header>
      We gonna space?!
    </Panel.Header>
    <Panel debug>
      Please space..
      <Panel debug>
        Please space..
        <Panel debug>
          Please space..
        </Panel>
      </Panel>
      <Panel debug>
        Please space..
      </Panel>
    </Panel>
    <Panel debug>
      Please space..
    </Panel>
  </Panel>
</MakeFullscreen>
```
