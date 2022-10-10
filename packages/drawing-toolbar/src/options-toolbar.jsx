/* eslint-disable no-fallthrough */
import React from 'react'
import { shapeToolModeEnum, toolEnum, penToolModeEnum, defaultToolSettings } from '@ulms/ui-drawing'

import { ColorSettings } from './components/color-settings'
import { Divider } from './components/divider'

import { RGBtoHEX, fromCSSColor, toCSSColor, HEXtoRGB } from './utils'
import { ObjectTypes, ShapeTypes, LineTypes } from './constants'

import css from './options-toolbar.module.css'

import IconLine2 from './icons/children-line2-tool-icon.svg'
import IconLine8 from './icons/children-line8-tool-icon.svg'
import IconText32 from './icons/children-text32-tool-icon.svg'
import IconText64 from './icons/children-text64-tool-icon.svg'
import IconRect from './icons/children-rect-tool-icon.svg'
import IconRectSolid from './icons/children-rect-solid-tool-icon.svg'
import IconCircle from './icons/children-circle-tool-icon.svg'
import IconCircleSolid from './icons/children-circle-solid-tool-icon.svg'
import IconStar from './icons/children-star-tool-icon.svg'
import IconStarSolid from './icons/children-star-solid-tool-icon.svg'
import IconTriangle from './icons/children-triangle-tool-icon.svg'
import IconTriangleSolid from './icons/children-triangle-solid-tool-icon.svg'
import { IconGroupSettings } from './components/icon-group-settings'

const lineToMarkerMap = {
  1: 5,
  2: 10,
  4: 15,
  8: 20,
}
const markerToLineMap = {
  5: 1,
  10: 2,
  15: 4,
  20: 8,
}

const lineIconsSet = [
  {
    key: 2,
    icon: (<IconLine2 />),
  },
  {
    key: 8,
    icon: (<IconLine8 />),
  },
]

const textIconsSet = [
  {
    key: 32,
    icon: (<IconText32 />),
  },
  {
    key: 64,
    icon: (<IconText64 />),
  },
]

const shapeIconsSet = {
  [shapeToolModeEnum.RECT]: [
    {
      key: false,
      icon: (<IconRect />),
    },
    {
      key: true,
      icon: (<IconRectSolid />),
    },
  ],
  [shapeToolModeEnum.CIRCLE]: [
    {
      key: false,
      icon: (<IconCircle />),
    },
    {
      key: true,
      icon: (<IconCircleSolid />),
    },
  ],
  [shapeToolModeEnum.STAR]: [
    {
      key: false,
      icon: (<IconStar />),
    },
    {
      key: true,
      icon: (<IconStarSolid />),
    },
  ],
  [shapeToolModeEnum.TRIANGLE]: [
    {
      key: false,
      icon: (<IconTriangle />),
    },
    {
      key: true,
      icon: (<IconTriangleSolid />),
    },
  ],
}

export class OptionsToolbar extends React.Component {
  constructor (props) {
    super(props)

    this.lineSettingsRef = React.createRef()
    this.colorSettingsRef = React.createRef()
    this.fontSettingsRef = React.createRef()

    this.toolOptions = {
      color: defaultToolSettings.color,
      lineWidth: defaultToolSettings.size,
      fontSize: defaultToolSettings.childrenFontSize,
      solidShape: false,
    }

    // Пусть пока тут полежит
    // this.toolOptionsSet = {
    //   [toolEnum.LINE]: {
    //     [lineToolModeEnum.LINE]: {
    //       color: defaultToolSettings.color,
    //       param: defaultToolSettings.size,
    //     },
    //     [lineToolModeEnum.ARROW]: {
    //       color: defaultToolSettings.color,
    //       param: defaultToolSettings.size,
    //     },
    //   },
    //   [toolEnum.PEN]: {
    //     [penToolModeEnum.PENCIL]: {
    //       color: defaultToolSettings.color,
    //       param: defaultToolSettings.size,
    //     },
    //     [penToolModeEnum.MARKER]: {
    //       color: defaultToolSettings.markerColor,
    //       param: markerToLineMap[defaultToolSettings.markerSize],
    //     },
    //   },
    //   [toolEnum.TEXT]: {
    //     color: defaultToolSettings.color,
    //     param: defaultToolSettings.size,
    //   },
    //   [toolEnum.SHAPE]: {
    //     [shapeToolModeEnum.RECT]: {
    //       color: defaultToolSettings.color,
    //       param: false,
    //     },
    //     [shapeToolModeEnum.CIRCLE]: {
    //       color: defaultToolSettings.color,
    //       param: false,
    //     },
    //     [shapeToolModeEnum.STAR]: {
    //       color: defaultToolSettings.color,
    //       param: false,
    //     },
    //     [shapeToolModeEnum.TRIANGLE]: {
    //       color: defaultToolSettings.color,
    //       param: false,
    //     },
    //   },
    // }

    this.state = {
      color: this.toolOptions.color,
      param: null,
      iconsSet: lineIconsSet,
    }
  }

  componentDidMount () {
    const {
      selectedObject, tool, brushMode,
    } = this.props

    if (selectedObject) {
      this.processSelectedObject(selectedObject)
    } else {
      this.processTool(tool, brushMode)
    }
  }

  componentDidUpdate (prevProps) {
    const {
      selectedObject, tool, brushMode,
    } = this.props

    if (selectedObject && selectedObject !== prevProps.selectedObject) {
      this.processSelectedObject(selectedObject)
    } else if (tool !== prevProps.tool || brushMode !== prevProps.brushMode) {
      this.processTool(tool, brushMode)
    }
  }

  getOptions (tool, brushMode) {
    const {
      color, fontSize, lineWidth, solidShape,
    } = this.toolOptions

    if (tool === toolEnum.TEXT) {
      return { brushColor: { ...HEXtoRGB(color), a: 1 }, fontSize }
    } if (tool === toolEnum.SHAPE) {
      return { brushColor: { ...HEXtoRGB(color), a: 1 }, brushMode: solidShape ? `${brushMode.split('-')[0]}-solid` : brushMode.split('-')[0] }
    } if (tool === toolEnum.LINE || tool === toolEnum.PEN) {
      return {
        brushWidth: brushMode === penToolModeEnum.MARKER ? lineToMarkerMap[lineWidth] : lineWidth,
        brushColor: {
          ...HEXtoRGB(color),
          a: (tool === toolEnum.PEN && brushMode === penToolModeEnum.MARKER) ? defaultToolSettings.markerAlpha : 1,
        },
      }
    }

    return null
  }

  handleChanged = (param) => {
    const {
      tool, brushMode, selectedObject, onDrawUpdate, handleChange,
    } = this.props

    if (!selectedObject) {
      this.setState({ param })
      if (tool === toolEnum.TEXT) {
        this.toolOptions.fontSize = param
        handleChange({ tool, fontSize: param })
      } else if (tool === toolEnum.SHAPE) {
        this.toolOptions.solidShape = param
        handleChange({ brushMode: param ? `${brushMode.split('-')[0]}-solid` : brushMode.split('-')[0] })
      } else if (tool === toolEnum.LINE || tool === toolEnum.PEN) {
        this.toolOptions.lineWidth = param
        handleChange({ brushWidth: brushMode === penToolModeEnum.MARKER ? lineToMarkerMap[param] : param })
      }
    } else {
      const {
        type, fill, stroke,
      } = selectedObject

      if (type === ObjectTypes.TEXT) {
        selectedObject.set({ fontSize: param })
      } else if (LineTypes.includes(type) || type === ObjectTypes.PATH) {
        const { a } = fromCSSColor(stroke)
        const isMarker = a < 0.9

        selectedObject.set({ strokeWidth: isMarker ? lineToMarkerMap[param] : param })
      } else if (ShapeTypes.includes(type)) {
        if (fill) {
          selectedObject.set({
            fill: param ? stroke : 'rgba(0,0,0,0.009)',
          })
        }
      }

      onDrawUpdate(selectedObject)
      this.setState({ param })
    }
  }

  handleColorChanged = (color) => {
    const newColor = HEXtoRGB(color)
    const {
      tool, brushMode, handleChange, selectedObject, onDrawUpdate, onSendEvent,
    } = this.props

    if (!selectedObject) {
      this.setState({ color })
      handleChange({
        brushColor: {
          ...newColor,
          a: (tool === toolEnum.PEN && brushMode === penToolModeEnum.MARKER) ? defaultToolSettings.markerAlpha : 1,
        },
      })
      this.toolOptions.color = color
    } else {
      const {
        type, fill, stroke,
      } = selectedObject

      if (type === ObjectTypes.TEXT) {
        selectedObject.set({ fill: toCSSColor({ ...newColor, a: 1 }) })
      } else if (LineTypes.includes(type)) {
        const { a } = fromCSSColor(stroke)

        selectedObject.set({ stroke: toCSSColor({ ...newColor, a }) })
      } else if (ShapeTypes.includes(type)) {
        if (fill) {
          const { a } = fromCSSColor(fill)

          selectedObject.set({
            stroke: toCSSColor({ ...newColor, a: 1 }),
            fill: a > 0.01 ? toCSSColor({ ...newColor, a: 1 }) : fill,
          })
        } else {
          const { a } = fromCSSColor(stroke)

          selectedObject.set({
            stroke: toCSSColor({ ...newColor, a }),
          })
        }
      }
      onDrawUpdate(selectedObject)
      onSendEvent && onSendEvent({
        object: selectedObject, diff: { fill: selectedObject.fill, stroke: selectedObject.stroke },
      })
      this.setState({ color })
    }
  }

  processTool (tool, brushMode) {
    const {
      color, fontSize, lineWidth, solidShape,
    } = this.toolOptions

    if (tool === toolEnum.TEXT) {
      this.setState({
        iconsSet: textIconsSet, color, param: fontSize,
      })
    } else if (tool === toolEnum.SHAPE) {
      this.setState({
        iconsSet: shapeIconsSet[brushMode.split('-')[0]], color, param: solidShape,
      })
    } else if (tool === toolEnum.LINE || tool === toolEnum.PEN) {
      this.setState({
        iconsSet: lineIconsSet, color, param: lineWidth,
      })
    }
  }

  processSelectedObject (selectedObject) {
    const {
      type, fill, stroke, fontSize, strokeWidth,
    } = selectedObject

    let color
    let param
    let iconsSet

    if (LineTypes.includes(type) || type === ObjectTypes.PATH) {
      const { a = 1, ...rgbColor } = fromCSSColor(stroke)

      color = RGBtoHEX(rgbColor)
      param = (a < 0.9) ? markerToLineMap[strokeWidth] : strokeWidth
      iconsSet = lineIconsSet
    } else if (type === ObjectTypes.TEXT) {
      color = RGBtoHEX(fromCSSColor(fill))
      param = fontSize
      iconsSet = textIconsSet
    } else {
      color = RGBtoHEX(fromCSSColor(stroke))
      const { a: alpha } = fromCSSColor(fill)

      param = alpha > 0.9

      switch (type) {
        case ObjectTypes.RECT:
          iconsSet = shapeIconsSet[shapeToolModeEnum.RECT]
          break

        case ObjectTypes.CIRCLE:

        case ObjectTypes.NEW_CIRCLE:
          iconsSet = shapeIconsSet[shapeToolModeEnum.CIRCLE]

          break

        case ObjectTypes.STAR:
          iconsSet = shapeIconsSet[shapeToolModeEnum.STAR]

          break

        case ObjectTypes.TRIANGLE:

        case ObjectTypes.RIGHT_TRIANGLE:
          iconsSet = shapeIconsSet[shapeToolModeEnum.TRIANGLE]

          break
        default:
          iconsSet = null
      }
    }

    this.setState({
      iconsSet, color, param,
    })
  }

  render () {
    const {
      iconsSet,
      color,
      param,
    } = this.state

    return (
      <div className={css.optionsWrapper}>
        {iconsSet && (
        <IconGroupSettings
          iconsSet={iconsSet}
          currentSelection={param}
          handleClick={this.handleChanged}
          childrenStyle
        />
        )}
        <Divider />
        <ColorSettings
          currentColor={color}
          handleClick={this.handleColorChanged}
          horizontal
          extended
        />

      </div>
    )
  }
}
