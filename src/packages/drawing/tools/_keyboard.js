const POSITION_INCREMENT = 10

const DEL_KEYCODE = 46;
const BACKSPACE_KEYCODE = 8;

const UP_KEYCODE = 38;
const DOWN_KEYCODE = 40;
const LEFT_KEYCODE = 37;
const RIGHT_KEYCODE = 39;

const directions = {
  left: 'left',
  right: 'right',
  up: 'up',
  down: 'down'
}

export class Keyboard {
  constructor (canvas) {
    this._canvas = canvas
    this._shiftPressed = false
  }

  _deleteObject = (object) => {
    this._canvas.remove(object)
  }

  _move = (direction, object) => {
    const increment = this._shiftPressed? 10 : 1
    switch(direction) {
      case directions.left:
        object.set({left: object.get('left') - POSITION_INCREMENT * increment})
        break
      case directions.right:
        object.set({left: object.get('left') + POSITION_INCREMENT * increment})
        break
      case directions.up:
        object.set({top: object.get('top') - POSITION_INCREMENT * increment})
        break
      case directions.down:
        object.set({top: object.get('top') + POSITION_INCREMENT * increment})
        break
    }
    object.setCoords()
    this._canvas.trigger('object:modified', {target: object})
  }

  _moveLeft = (object) => this._move(directions.left, object)
  _moveRight = (object) => this._move(directions.right, object)
  _moveUp = (object) => this._move(directions.up, object)
  _moveDown = (object) => this._move(directions.down, object)

  handler = (e) => {
    let actionFunc
    const {keyCode} = e

    this._shiftPressed = e.shiftKey

    switch(keyCode) {
      case DEL_KEYCODE:
      case BACKSPACE_KEYCODE:
        actionFunc = this._deleteObject
        break
      case UP_KEYCODE:
        actionFunc = this._moveUp
        break
      case DOWN_KEYCODE:
        actionFunc = this._moveDown
        break
      case LEFT_KEYCODE:
        actionFunc = this._moveLeft
        break
      case RIGHT_KEYCODE:
        actionFunc = this._moveRight
        break
    }

    if (actionFunc) {
      let activeObjects = this._canvas.getActiveObjects();
      if (activeObjects.length > 0) {
        activeObjects.forEach(object => actionFunc (object))
        this._canvas.renderAll()
      }
    }
  }

}

