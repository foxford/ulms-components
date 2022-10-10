import React from 'react'
import cn from 'classnames-es'
import { toolEnum, penToolModeEnum, shapeToolModeEnum, lineToolModeEnum } from '@ulms/ui-drawing'

// import { StampGroup } from './components/stamp-group'
import { Divider } from './components/divider'
import { ToolbarButton } from './components/toolbar-button'

import IconSelect from './icons/children-select-tool-icon.svg'
import IconPan from './icons/children-pan-toolbar-icon.svg'
import IconPen from './icons/children-pen-toolbar-icon.svg'
import IconMarker from './icons/children-marker-toolbar-icon.svg'
import IconEraser from './icons/children-eraser-toolbar-icon.svg'
import IconText from './icons/children-text-toolbar-icon.svg'
import IconRect from './icons/children-rect-toolbar-icon.svg'
import IconCircle from './icons/children-circle-toolbar-icon.svg'
import IconStar from './icons/children-star-toolbar-icon.svg'
import IconTriangle from './icons/children-triangle-toolbar-icon.svg'
import IconArrow from './icons/children-arrow-toolbar-icon.svg'
import IconLine from './icons/children-line-toolbar-icon.svg'
import IconImage from './icons/children-image-toolbar-icon.svg'
import IconStamp from './icons/children-stamp-toolbar-icon.svg'
import IconShowMore from './icons/children-showmore-toolbar-icon.svg'

import { toCSSColor } from './utils'

// eslint-disable-next-line react/prefer-stateless-function
export class ChildrenDrawingToolbar extends React.Component {
  render () {
    const {
      brushColor,
      brushMode,
      intl,
      noSeparator,
      tool,
      tools,
      handleOpen,
      handleImageClick,
      handleShowMoreOpen,
      handleStampOpen,
      showMoreOpened,
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
    const isAnimationEnabled = tools && tools.includes(toolEnum.ANIMATION)
    const isShowMoreEnabled = isLibEnabled || isAnimationEnabled
    const showSeparator = !noSeparator && (isImageEnabled || isStampEnabled || isLibEnabled)

    return (
      <div className={cn(css.root, css.root_horizontal)}>
        <div className={css.row} style={{ color: toCSSColor(brushColor) }}>
          { isSelectEnabled && (
            <ToolbarButton
              active={tool === toolEnum.SELECT}
              onClick={() => handleOpen(toolEnum.SELECT)}
              title={intl.formatMessage({ id: 'SELECT' })}
              extended
              childrenStyle
            >
              <IconSelect />
            </ToolbarButton>
          )}

          { isPanEnabled && (
            <ToolbarButton
              active={tool === toolEnum.PAN}
              onClick={() => handleOpen(toolEnum.PAN)}
              title={intl.formatMessage({ id: 'HAND' })}
              extended
              childrenStyle
            >
              <IconPan />
            </ToolbarButton>
          )}

          { showSeparator && <Divider noBorder /> }

          { isPenEnabled && (
            <>
              <ToolbarButton
                active={tool === toolEnum.PEN && brushMode === penToolModeEnum.PENCIL}
                onClick={() => handleOpen(toolEnum.PEN, { brushMode: penToolModeEnum.PENCIL })}
                title={intl.formatMessage({ id: 'PENCIL' })}
                extended
                childrenStyle
              >
                <IconPen />
              </ToolbarButton>

              <ToolbarButton
                active={tool === toolEnum.PEN && brushMode === penToolModeEnum.MARKER}
                onClick={() => handleOpen(toolEnum.PEN, { brushMode: penToolModeEnum.MARKER })}
                title={intl.formatMessage({ id: 'HIGHLIGHTER' })}
                extended
                childrenStyle
              >
                <IconMarker />
              </ToolbarButton>
            </>
          )}

          { isEraserEnabled && (
            <ToolbarButton
              active={tool === toolEnum.ERASER}
              onClick={() => handleOpen(toolEnum.ERASER)}
              title={intl.formatMessage({ id: 'ERASER' })}
              extended
              childrenStyle
            >
              <IconEraser />
            </ToolbarButton>
          )}

          { isTextEnabled && (
            <ToolbarButton
              active={tool === toolEnum.TEXT}
              onClick={() => handleOpen(toolEnum.TEXT)}
              title={intl.formatMessage({ id: 'TEXT' })}
              extended
              childrenStyle
            >
              <IconText />
            </ToolbarButton>
          )}

          { showSeparator && <Divider noBorder /> }

          { isShapeEnabled && (
            <>
              <ToolbarButton
                active={tool === toolEnum.SHAPE && brushMode === shapeToolModeEnum.RECT}
                onClick={() => handleOpen(toolEnum.SHAPE, { brushMode: shapeToolModeEnum.RECT })}
                title={intl.formatMessage({ id: 'RECT' })}
                extended
                childrenStyle
              >
                <IconRect />
              </ToolbarButton>

              <ToolbarButton
                active={tool === toolEnum.SHAPE && brushMode === shapeToolModeEnum.CIRCLE}
                onClick={() => handleOpen(toolEnum.SHAPE, { brushMode: shapeToolModeEnum.CIRCLE })}
                title={intl.formatMessage({ id: 'CIRCLE' })}
                extended
                childrenStyle
              >
                <IconCircle />
              </ToolbarButton>
              <ToolbarButton
                active={tool === toolEnum.SHAPE && brushMode === shapeToolModeEnum.STAR}
                onClick={() => handleOpen(toolEnum.SHAPE, { brushMode: shapeToolModeEnum.STAR })}
                title={intl.formatMessage({ id: 'STAR' })}
                extended
                childrenStyle
              >
                <IconStar />
              </ToolbarButton>
              <ToolbarButton
                active={tool === toolEnum.SHAPE && brushMode === shapeToolModeEnum.TRIANGLE}
                onClick={() => handleOpen(toolEnum.SHAPE, { brushMode: shapeToolModeEnum.TRIANGLE })}
                title={intl.formatMessage({ id: 'TRIANGLE' })}
                extended
                childrenStyle
              >
                <IconTriangle />
              </ToolbarButton>
            </>
          )}

          { isLineEnabled && (
            <>
              <ToolbarButton
                active={tool === toolEnum.LINE && brushMode === lineToolModeEnum.ARROW}
                onClick={() => handleOpen(toolEnum.LINE, { brushMode: lineToolModeEnum.ARROW })}
                title={intl.formatMessage({ id: 'ARROW' })}
                extended
                childrenStyle
              >
                <IconArrow />
              </ToolbarButton>

              <ToolbarButton
                active={tool === toolEnum.LINE && brushMode === lineToolModeEnum.LINE}
                onClick={() => handleOpen(toolEnum.LINE, { brushMode: lineToolModeEnum.LINE })}
                title={intl.formatMessage({ id: 'LINE' })}
                extended
                childrenStyle
              >
                <IconLine />
              </ToolbarButton>
            </>
          )}

          { isImageEnabled && (
            <ToolbarButton
              active={tool === toolEnum.IMAGE}
              onClick={handleImageClick}
              title={intl.formatMessage({ id: 'UPLOAD_IMAGE' })}
              extended
              childrenStyle
            >
              <IconImage />
            </ToolbarButton>
          )}

          {isStampEnabled && (
          <ToolbarButton
            active={tool === toolEnum.STAMP}
            onClick={handleStampOpen}
            title={intl.formatMessage({ id: 'STAMP' })}
            extended
            childrenStyle
          >
            <IconStamp />
          </ToolbarButton>
          )}

          {/* Заглушки для анимации - в другой задаче будет реализовано */}
          {/* { showSeparator && <Divider noBorder /> } */}

          {/* { isShowMoreEnabled && ( */}
          {/* <ToolbarButton */}
          {/*  active={showMoreOpened} */}
          {/*  onClick={handleShowMoreOpen} */}
          {/*  title={intl.formatMessage({ id: 'SHOW_MORE' })} */}
          {/*  extended */}
          {/*  childrenStyle */}
          {/* > */}
          {/*  <IconShowMore /> */}
          {/* </ToolbarButton> */}
          {/* )} */}
        </div>
      </div>
    )
  }
}
