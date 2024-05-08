import { WhiteboardArrowLine } from './_primitives'
import { LineTool } from './line'

// eslint-disable-next-line import/prefer-default-export
export class ArrowTool extends LineTool {
  _createObject() {
    this.__object = new WhiteboardArrowLine([], {
      fill: this.__color,
      stroke: this.__color,
      strokeDashArray: this.__dash,
      strokeWidth: this.__width,
      hasControls: false,
      hasBorders: false,
      selectable: false,
      _noHistory: true, // Не сохраняем в undo/redo history
    })
  }
}
