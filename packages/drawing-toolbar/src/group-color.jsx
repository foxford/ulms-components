import React from 'react'
import Floater from 'react-floater'
import { TwitterPicker } from 'react-color'

const PICKER_COLORS = [
  '#000000', // black
  '#FF6900', // blaze-orange
  '#FCB900', // selective-yellow
  '#7BDCB5', // bermuda
  '#00D084', // caribbean-green
  '#8ED1FC', // malibu
  '#0693E3', // cerulean
  '#ABB8C3', // cadet-blue
  '#EB144C', // crimson
  '#9900EF', // electric-violet
]

export const GroupColor = ({
  brushColor,
  css,
  handleChange,
  opened,
}) => (
  <Floater
    component={() => (
      <div className={css.floater}>
        <TwitterPicker
          color={brushColor}
          colors={PICKER_COLORS}
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
          onChangeComplete={color => handleChange({ brushColor: color.rgb })}
        />
      </div>
    )}
    placement='right-start'
    hideArrow
    styles={{
      floater: {
        filter: 'none',
      },
    }}
    open={opened === 'group-color'}
    target={`.${css.root} .group-color`}
  />
)
