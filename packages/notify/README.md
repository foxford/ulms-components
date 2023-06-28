# Notify

Based on a [react-toastify](https://fkhadra.github.io/react-toastify/introduction).

### How to use 

```jsx
// notify.js
import { createNotify } from '@ulms/notify'
import { Alert } from 'PATH_TO_ANY_ALERT_COMPONENT' // any ui component 

// Set the default alert component and override the default settings if required
export const notify = createNotify(
  Alert,
  {
    size: 'l' // 's'|'l' ('s' - default value )
  }
)

// app.jsx
import { NotificationContainer } from '@ulms/notify'
import '@ulms/notify/es/index.css'

function App(){
  return (
    <div>
      <NotificationContainer
        isCompact={isMobileLayout} // it will change the position of the notification component
        {...containerProps} // pass any props from this page https://fkhadra.github.io/react-toastify/api/toast-container
      />
    </div>
  );
}
```

**The positioning of the alert depends on the specified size.**  
The alert size 's' position has the value 'top-center'.  
The alert size 'l' position has the value 'bottom-left'.

### Examples
```jsx
notify.error('Wrong file format')
notify.info('Wrong file format')
notify.success('Wrong file format')
notify.warn('Wrong file format')
notify.custom(<h1 style={{ background: 'black', color: 'white' }}>Wrong file format !</h1>)
```

#### If it is necessary to change the size of the alert and its positioning
```jsx
notify.error(
  'Wrong file format',
  {
    size: 'l',
    position: 'top-center',
    // pass any props from this page https://fkhadra.github.io/react-toastify/api/toast/
  }
)
```

#### You can override the properties for the alert component

1 way
```jsx
notify.error(
  'Wrong file format',
  { alertProps: { clear: true } }
)
```

2 way
```jsx
notify.custom(
  <AlertComponent clear type='error'>
    Wrong file format
  </AlertComponent>
)
```


