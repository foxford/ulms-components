import React from 'react'
import cn from 'classnames-es'
import { toolEnum } from '@ulms/ui-drawing'

import { PenGroup } from './components/pen-group'
import { LineGroup } from './components/line-group'
import { TextGroup } from './components/text-group'
import { StampGroup } from './components/stamp-group'
import { ShapeGroup } from './components/shape-group'
import { Divider } from './components/divider'
import { ToolbarButton } from './components/toolbar-button'

import IconEraser from './icons/eraser-tool-icon.svg'
import IconImage from './icons/image-tool-icon.svg'
import IconPan from './icons/pan-toolbar-icon.svg'
import IconSelect from './icons/select-tool-icon.svg'
import IconLib from './icons/lib-tool-icon.svg'
import { toCSSColor } from './utils'

export class AdultDrawingToolbar extends React.Component {
  constructor (props) {
    super(props)

    this.lineGroupRef = React.createRef()
    this.penGroupRef = React.createRef()
    this.shapeGroupRef = React.createRef()
    this.stampGroupRef = React.createRef()
    this.textGroupRef = React.createRef()
  }

  getOptions (tool) {
    let options = null
    if (tool === toolEnum.TEXT) options = this.textGroupRef.current.getOptions()
    if (tool === toolEnum.STAMP) options = this.stampGroupRef.current.getOptions()
    if (tool === toolEnum.SHAPE) options = this.shapeGroupRef.current.getOptions()
    if (tool === toolEnum.PEN) options = this.penGroupRef.current.getOptions()
    if (tool === toolEnum.LINE) options = this.lineGroupRef.current.getOptions()

    return options
  }

  render () {
    const {
      brushColor,
      brushMode,
      handleChange,
      sendEvent,
      intl,
      noSeparator,
      tool,
      tools,
      handleOpen,
      handleImageClick,
      handleLibClick,
      opened,
      css,
    } = this.props

    const isEraserEnabled = tools && tools.includes(toolEnum.ERASER)
    const isImageEnabled = tools && tools.includes(toolEnum.IMAGE)
    const isPanEnabled = tools && tools.includes(toolEnum.PAN)
    const isPenEnabled = tools && tools.includes(toolEnum.PEN)
    const isSelectEnabled = tools && tools.includes(toolEnum.SELECT)
    const isShapeEnabled = tools && tools.includes(toolEnum.SHAPE)
    const isLineEnabled = tools && tools.includes(toolEnum.LINE)
    const isTextEnabled = tools && tools.includes(toolEnum.TEXT)
    const isStampEnabled = tools && tools.includes(toolEnum.STAMP)
    const isLibEnabled = tools && tools.includes(toolEnum.LIB)
    const showSeparator = !noSeparator && (isImageEnabled || isStampEnabled || isLibEnabled)

    return (
      <div className={cn(css.root, css.root_vertical)}>
        <div className={css.col} style={{ color: toCSSColor(brushColor) }}>
          { isSelectEnabled && (
            <ToolbarButton
              active={tool === toolEnum.SELECT}
              onClick={() => handleOpen(toolEnum.SELECT)}
              title={intl.formatMessage({ id: 'SELECT' })}
            >
              <IconSelect />
            </ToolbarButton>
          )}

          { isPanEnabled && (
            <ToolbarButton
              active={tool === toolEnum.PAN}
              onClick={() => handleOpen(toolEnum.PAN)}
              title={intl.formatMessage({ id: 'HAND' })}
            >
              <IconPan />
            </ToolbarButton>
          )}

          { isPenEnabled && (
            <PenGroup
              opened={opened === toolEnum.PEN}
              className={css.floater}
              intl={intl}
              tool={tool}
              brushMode={brushMode}
              ref={this.penGroupRef}
              handleOpen={options => handleOpen(toolEnum.PEN, options)}
              handleChange={handleChange}
              sendEvent={sendEvent}
            />
          )}

          { isShapeEnabled && (
            <ShapeGroup
              opened={opened === toolEnum.SHAPE}
              className={css.floater}
              intl={intl}
              tool={tool}
              brushMode={brushMode}
              ref={this.shapeGroupRef}
              handleOpen={options => handleOpen(toolEnum.SHAPE, options)}
              handleChange={handleChange}
              sendEvent={sendEvent}
            />
          )}

          { isLineEnabled && (
            <LineGroup
              opened={opened === toolEnum.LINE}
              className={css.floater}
              intl={intl}
              tool={tool}
              brushMode={brushMode}
              ref={this.lineGroupRef}
              handleOpen={options => handleOpen(toolEnum.LINE, options)}
              handleChange={handleChange}
              sendEvent={sendEvent}
            />
          )}

          {isTextEnabled && (
            <TextGroup
              opened={opened === toolEnum.TEXT}
              className={css.floater}
              intl={intl}
              tool={tool}
              ref={this.textGroupRef}
              handleOpen={options => handleOpen(toolEnum.TEXT, options)}
              handleChange={handleChange}
              sendEvent={sendEvent}
            />
          )}

          { isEraserEnabled && (
            <ToolbarButton
              active={tool === toolEnum.ERASER}
              onClick={() => handleOpen(toolEnum.ERASER)}
              title={intl.formatMessage({ id: 'ERASER' })}
            >
              <IconEraser />
            </ToolbarButton>
          )}

          { showSeparator && <Divider horizontal /> }

          { isImageEnabled && (
            <ToolbarButton
              active={tool === toolEnum.IMAGE}
              onClick={handleImageClick}
              title={intl.formatMessage({ id: 'UPLOAD_IMAGE' })}
            >
              <IconImage />
            </ToolbarButton>
          )}

          { isStampEnabled && (
            <StampGroup
              opened={opened === toolEnum.STAMP}
              className={css.floater}
              intl={intl}
              tool={tool}
              ref={this.stampGroupRef}
              handleOpen={options => handleOpen(toolEnum.STAMP, options)}
              handleChange={handleChange}
            />
          )}

          { isLibEnabled && (
            <ToolbarButton
              active={tool === toolEnum.LIB}
              group
              onClick={handleLibClick}
              title={intl.formatMessage({ id: 'LIB' })}
            >
              <IconLib />
            </ToolbarButton>
          )}
        </div>
      </div>
    )
  }
}
