```js
<DrawingToolbarComponent
  handleChange={(_) => {
    const notify = (_) => { new Notification(JSON.stringify(_)) }
    if(window.Notification && Notification.permission === "granted"){
      notify(_)
    } else if(window.Notification && Notification.permission !== "denied"){
      Notification.requestPermission()
        .then(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") { notify(_) }
        })
        .catch(console.error)
    } else {
      console.error('Can not get acceess to the notifications')
    }
  }}
/>
```
