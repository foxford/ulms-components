### Sidebar

```js
<MakeFullscreen wrap>
  <Sidebar title="We gonna space?!" debug>
    Please space…
  </Sidebar>
</MakeFullscreen>
```

#### Minified

```js
<MakeFullscreen wrap>
  <Sidebar
    childrenMinified={<Icons.Feed/>}
    debug
    minified
    title="We gonna space?!"
  >
    Please space…
  </Sidebar>
</MakeFullscreen>
```

#### Freezed

Disabled minifier for the sidebar.

```js
<MakeFullscreen wrap>
  <Sidebar
    debug
    freezed
    title="We gonna space?!"
  >
    Please space…
  </Sidebar>
</MakeFullscreen>
```

#### Pinned

Would be positioned absolute to the container.

```js
<MakeFullscreen wrap>
  <style dangerouslySetInnerHTML={{__html: `
      :root { --sidebar-background-color: rgba(167, 152, 86, 0.925); }
    `}} />
  <Panel>
    <Sidebar
      debug
      pinned
      title="We gonna space?!"
    >
      Please space…
    </Sidebar>
    <Panel
      debug
      title="A dam drowned Glen Canyon—but drought is revealing its wonders again"
    >
      In 1963, the floodgates closed on the newly constructed Glen Canyon Dam near the Arizona-Utah border, locking the waters of the Colorado River behind its concrete face. The water pooled behind the dam, slowly filling in the vast canyon—and the maze of slot canyons and grottoes feathering around its edges. Only a few years later, Glen Canyon was transformed from the sandstone cradle of the tumbling Colorado River into the deep, still, ~250-square mile Lake Powell.
    </Panel>
  </Panel>
</MakeFullscreen>
```

