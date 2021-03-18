import React from 'react'
import cn from 'classnames-es'
import Floater from 'react-floater'
import { TwitterPicker } from 'react-color'
import Slider from 'rc-slider/lib/Slider'
import { cond } from 'ramda'
import { Icons } from '@ulms/ui-icons'
import { penToolModeEnum, shapeToolModeEnum, toolEnum } from '@ulms/ui-drawing'

import { GroupColor } from './group-color'
import { GroupEraser } from './group-eraser'
import { GroupPen } from './group-pen'
import { GroupShape } from './group-shape'
import { Shapes } from './shapes'

import 'rc-slider/assets/index.css'

import css from './drawing-toolbar.module.css'
import IconElementEraser from './icons/icon-tool-element-eraser.svg'
import IconFitIn from './icons/icon-tool-fit-in.svg'
import IconFitOut from './icons/icon-tool-fit-out.svg'
import IconGrid from './icons/icon-tool-grid.svg'
import IconImage from './icons/icon-tool-image.svg'
import IconLine from './icons/icon-tool-line.svg'
import IconMarker from './icons/icon-tool-marker.svg'
import IconPan from './icons/icon-tool-pan.svg'
import IconPencil from './icons/icon-tool-pencil.svg'
import IconSelect from './icons/icon-tool-select.svg'
import IconText from './icons/icon-tool-text.svg'
import IconZoomIn from './icons/icon-tool-zoom-in.svg'
import IconZoomOut from './icons/icon-tool-zoom-out.svg'
import { toCSSColor } from './utils'

function supportPointerEvent () {
  return 'PointerEvent' in window
}

const eventName = supportPointerEvent() ? 'pointerdown' : 'mousedown'

export class DrawingToolbar extends React.Component {
  constructor () {
    super()

    this.state = {
      opened: null,
    }

    this.handleDocumentClickEvent = this.handleDocumentClickEvent.bind(this)
  }

  componentDidMount () {
    document.addEventListener(eventName, this.handleDocumentClickEvent)
  }

  // FIXME: :point_down:
  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps (nextProps) {
    const toolHasChanged = nextProps.tool !== this.props.tool
    const notEraser = nextProps.tool !== toolEnum.ERASER
    const notPen = nextProps.tool !== toolEnum.PEN
    const notShape = nextProps.tool !== toolEnum.SHAPE

    if (toolHasChanged && notEraser && notPen && notShape) {
      this.setState({ opened: null })
    }
  }

  componentWillUnmount () {
    document.removeEventListener(eventName, this.handleDocumentClickEvent)
  }

  toggleOpened (val) {
    const { opened } = this.state

    this.setState({ opened: val !== opened ? val : null })
  }

  handleDocumentClickEvent (event) {
    const { opened } = this.state

    if (opened === null) return

    const closestToolbarElement = event.target.closest(`.${css.root}`)
    const closestFloaterElement = event.target.closest(`.${css.floater}`)

    if (closestToolbarElement === null && closestFloaterElement === null) {
      this.setState({ opened: null })
    }
  }

  render () {
    const {
      brushColor,
      brushMode,
      brushWidth,
      eraserWidth,
      fit,
      grid,
      handleChange,
      hasLockSelection,
      onImageToolClick,
      shapeMode,
      tool,
      tools,
      zoom,
    } = this.props
    const { opened } = this.state

    const isColorEnabled = tools && tools.includes('color')
    const isEraserEnabled = tools && tools.includes(toolEnum.ERASER)
    const isFitEnabled = tools && tools.includes('fit')
    const isGridEnabled = tools && tools.includes('grid')
    const isImageEnabled = tools && tools.includes('image')
    const isLockEnabled = tools && tools.includes('lock')
    const isPanEnabled = tools && tools.includes(toolEnum.PAN)
    const isPenEnabled = tools && tools.includes(toolEnum.PEN)
    const isSelectEnabled = tools && tools.includes(toolEnum.SELECT)
    const isShapeEnabled = tools && tools.includes(toolEnum.SHAPE)
    const isTextEnabled =  tools && tools.includes(toolEnum.TEXT)
    const isZoomEnabled = tools && tools.includes('zoom')

    return (
      <div className={css.root}>
        <div className={css.col} style={{ color: toCSSColor(brushColor) }}>
          { isSelectEnabled && (
            <div
              className={cn(css.button, { [css.active]: tool === toolEnum.SELECT })}
              onClick={() => handleChange({ tool: toolEnum.SELECT })}
              title='Выбрать (V)'
            >
              <IconSelect />
            </div>
          )}

          { isPenEnabled && (
              <div
                className={cn(css.button, css.group, 'group-pen', { [css.active]: tool === toolEnum.PEN || opened === 'group-pen' })}
                onClick={() => {
                  tool !== toolEnum.PEN && handleChange({ tool: toolEnum.PEN })
                  this.toggleOpened('group-pen')
                }}
                title={brushMode === penToolModeEnum.MARKER ? 'Маркер' : brushMode === penToolModeEnum.LINE ? 'Линия (L)' : 'Карандаш (P)'}
              >
                {
                  cond([
                    [_ => _ === penToolModeEnum.PENCIL, () => <IconPencil />],
                    [_ => _ === penToolModeEnum.MARKER, () => <IconMarker />],
                    [_ => _ === penToolModeEnum.LINE, () => <IconLine />],
                    [() => true, () => <IconPencil />],
                  ])(brushMode)
                }
              </div>
          )}

          { isEraserEnabled && (
            <div
              className={cn(css.button, css.group, 'group-eraser', { [css.active]: tool === toolEnum.ERASER || opened === 'eraser' })}
              onClick={() => {
                handleChange({ tool: toolEnum.ERASER })
                this.toggleOpened('group-eraser')
              }}
              title='Ластик (E)'
            >
              <IconElementEraser />
            </div>
          )}

          { isColorEnabled && (
            <div
              className={cn(css.button, 'group-color', { [css.active]: opened === 'group-color' })}
              onClick={() => this.toggleOpened('group-color')}
              title='Цвет'
            >
              <div
                className={css.colorButtonInner}
                style={{ background: brushColor ? toCSSColor(brushColor) : '#000' }}
              />
            </div>
          )}

          { isImageEnabled && (
            <div
              className={css.button}
              onClick={() => {
                handleChange({ tool: toolEnum.SELECT })
                onImageToolClick()
              }}
              title='Загрузить изображение'
            >
              <IconImage />
            </div>
          )}

          { isShapeEnabled && (
            <div
              className={cn(css.button, css.group, 'group-shape', { [css.active]: tool === toolEnum.SHAPE || opened === 'group-shape' })}
              onClick={() => {
                tool !== toolEnum.SHAPE && handleChange({ tool: toolEnum.SHAPE })
                this.toggleOpened('group-shape')
              }}
              title='Фигура'
            >
              {
                cond([
                  [_ => _ === shapeToolModeEnum.CIRCLE, () => <Shapes shape='circle' />],
                  [_ => _ === shapeToolModeEnum.CIRCLE_SOLID, () => <Shapes shape='circle' solid />],
                  [_ => _ === shapeToolModeEnum.RECT, () => <Shapes shape='square' />],
                  [_ => _ === shapeToolModeEnum.RECT_SOLID, () => <Shapes shape='square' solid />],
                  [_ => _ === shapeToolModeEnum.TRIANGLE, () => <Shapes shape='triangle' />],
                  [_ => _ === shapeToolModeEnum.TRIANGLE_SOLID, () => <Shapes shape='triangle' solid />],
                  [() => true, () => <Shapes shape='square' />],
                ])(shapeMode)
              }
            </div>
          )}

          { isTextEnabled && (
            <div
              className={cn(css.button, { [css.active]: tool === toolEnum.TEXT })}
              onClick={() => handleChange({ tool: toolEnum.TEXT })}
              title='Текст (T)'
            >
              <div className={css.buttonInner}>
                <IconText />
              </div>
            </div>
          )}

          { isLockEnabled && (
            <button
              className={css.button}
              disabled={!hasLockSelection}
              onClick={() => {
                handleChange({ tool: toolEnum.SELECT })
                this.props.onLock()
              }}
              type='button'
            >
              <div className={css.buttonInner} title='Изменить блокировку'>
                <Icons name='lock-outline' />
              </div>
            </button>
          )}

          { isZoomEnabled && (
            <>
              <div className={css.separator} />
              <div className={css.button} onClick={() => handleChange({ zoom: (zoom + 0.2) >= 2 ? 2 : zoom + 0.2 })} title='Увеличить'>
                <IconZoomIn />
              </div>
              <div className={css.text}>{`${parseFloat((zoom * 100).toFixed(1))}%`}</div>
              <div className={css.button} onClick={() => handleChange({ zoom: (zoom - 0.2) <= 0.2 ? 0.2 : zoom - 0.2 })} title='Уменьшить'>
                <IconZoomOut />
              </div>
            </>
          )}

          { isFitEnabled && (
            <div
              className={css.button}
              onClick={() => handleChange({ fit: !fit })}
            >
              {fit ? <IconFitOut /> : <IconFitIn />}
            </div>
          )}

          { isPanEnabled && (
            <div
              className={cn(css.button, { [css.active]: tool === toolEnum.PAN })}
              onClick={() => handleChange({ tool: toolEnum.PAN })}
              title='Перемещение доски'
            >
              <IconPan />
            </div>
          )}

          { isGridEnabled && (
            <div
              className={cn(css.button, { [css.active]: grid })}
              onClick={() => handleChange({ grid: !grid })}
              title='Фоновая сетка'
            >
              <IconGrid />
            </div>
          )}

          { isPenEnabled && (
            <GroupPen
              brushMode={brushMode}
              brushWidth={brushWidth}
              css={css}
              handleChange={handleChange}
              opened={opened}
              tool={tool}
            />
          )}

          { isEraserEnabled && (
            <GroupEraser
              eraserWidth={eraserWidth}
              css={css}
              handleChange={handleChange}
              opened={opened}
            />
          )}

          { isColorEnabled && (
            <GroupColor
              brushColor={brushColor}
              css={css}
              handleChange={handleChange}
              opened={opened}
              tool={tool}
            />
          )}

          { isShapeEnabled && (
            <GroupShape
              brushColor={brushColor}
              css={css}
              handleChange={handleChange}
              opened={opened}
              shapeMode={shapeMode}
              tool={tool}
            />
          )}
        </div>
      </div>
    )
  }
}
