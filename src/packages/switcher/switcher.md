### Switcher

#### Inactive
```js
<Switcher />
```

#### Active
```js
<Switcher on />
```

#### With handler
```js
initialState = { on: false };

<Switcher on={state.on} changeHandler={(e) => {setState({on: !state.on})}} />
```
