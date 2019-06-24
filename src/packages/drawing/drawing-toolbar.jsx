/* eslint-disable react/prop-types */
import React from 'react'
import cn from 'classnames'

import { TwitterPicker } from 'react-color'
import Slider from 'rc-slider/lib/Slider'

import { toCSSColor } from '../../util/helpers'

import 'rc-slider/assets/index.css'

import css from './drawing-toolbar.css'

export class DrawingToolbarComponent extends React.Component {
  constructor () {
    super()

    this.state = {
      colorPickerOpened: false,
    }

    this.handleColorChange = this.handleColorChange.bind(this)
    this.handleModeChange = this.handleModeChange.bind(this)
    this.handleSliderChange = this.handleSliderChange.bind(this)
    this.toggleColorPicker = this.toggleColorPicker.bind(this)
  }

  handleColorChange (color) {
    const { handleChange } = this.props

    handleChange({ brushColor: color.rgb })
    this.setState({ colorPickerOpened: false })
  }

  handleModeChange (mode) {
    const { handleChange } = this.props

    handleChange({ brushMode: mode })
  }

  handleSliderChange (value) {
    const { handleChange } = this.props

    handleChange({ brushWidth: value })
  }

  toggleColorPicker () {
    const { colorPickerOpened } = this.state

    this.setState({ colorPickerOpened: !colorPickerOpened })
  }

  render () {
    const {
      brushColor, brushMode, brushWidth, colors,
    } = this.props
    const { colorPickerOpened } = this.state

    return (
      <div className={css.root}>
        <div className={cn(css.item, css.toolButton, { [css.active]: brushMode === 'pencil' })} onClick={() => this.handleModeChange('pencil')}>Карандаш</div>
        <div className={cn(css.item, css.toolButton, { [css.active]: brushMode === 'marker' })} onClick={() => this.handleModeChange('marker')}>Маркер</div>
        <div className={cn(css.item, css.colorButton)} onClick={this.toggleColorPicker} title='Цвет кисти'>
          <div className={css.colorButtonInner} style={{ background: brushColor ? toCSSColor(brushColor) : '#000', transform: `scale(${brushWidth / 30})` }} />
        </div>
        <div className={css.rangeSlider} title='Размер кисти'>
          <Slider
            min={2}
            max={30}
            value={brushWidth}
            onChange={this.handleSliderChange}
          />
        </div>
        {
          colorPickerOpened
            ? (
              <div className={css.popover}>
                <TwitterPicker
                  color={brushColor}
                  colors={colors}
                  styles={{
                    'default': {
                      hash: {
                        display: 'none',
                      },
                      input: {
                        display: 'none',
                      },
                    },
                  }}
                  triangle='hide'
                  width={204}
                  onChangeComplete={this.handleColorChange}
                />
              </div>
            )
            : null
        }
      </div>
    )
  }
}
