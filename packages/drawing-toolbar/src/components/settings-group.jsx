import React from 'react'
import Floater from 'react-floater'

import css from './settings-group.module.css'

// eslint-disable-next-line import/prefer-default-export
export function SettingsGroup({
  children,
  direction,
  target,
  isOpen,
  handleClose,
  compact,
  content,
  overlay,
  containerStyles,
  offset,
}) {
  return (
    <div>
      <Floater
        content={<div className={css.floater}>{isOpen && content}</div>}
        placement={direction}
        hideArrow
        styles={{
          floater: {
            filter: 'none',
            maxWidth: 'auto',
          },
          container: {
            backgroundColor: '#fff',
            border: '1px solid #BABCC9',
            borderRadius: 12,
            padding: compact ? 8 : 16,
            minWidth: 0,
            minHeight: 0,
            ...containerStyles,
          },
          wrapper: { cursor: 'pointer' },
          options: { zIndex: 250 },
        }}
        target={target}
        offset={offset}
        open={isOpen}
      >
        {children}
      </Floater>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */}
      {isOpen && overlay && (
        <div className={css.overlay} onClick={handleClose} />
      )}
    </div>
  )
}
