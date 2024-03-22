import React from 'react'
import Floater from 'react-floater'

import css from './settings-group.module.css'

export const SettingsGroup = ({
  children, direction, target, isOpen, handleClose, content, overlay, containerStyles,
}) => (
  <div>
    <Floater
      content={(
        <div className={css.floater}>
          {isOpen && content}
        </div>
      )}
      placement={direction}
      hideArrow
      styles={{
        floater: {
          filter: 'none', maxWidth: 'auto',
        },
        container: {
          backgroundColor: '#fff',
          border: '1px solid #BABCC9',
          borderRadius: 12,
          padding: '16px',
          minWidth: 0,
          minHeight: 0,
          ...containerStyles,
        },
        wrapper: { cursor: 'pointer' },
        options: { zIndex: 250 },

      }}
      target={target}
      open={isOpen}
    >
      {children}
    </Floater>
    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */}
    {isOpen && overlay && (<div className={css.overlay} onClick={handleClose} />)}
  </div>
)
