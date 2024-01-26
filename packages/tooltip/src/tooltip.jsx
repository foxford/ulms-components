/* eslint-disable react/jsx-props-no-spreading */
import React, { memo, useMemo } from 'react'
import styled from 'styled-components'
import { Tooltip as TooltipComponent } from '@foxford/ui'

const styles = {
  wrapper: {
    height: '100%',
    width: '100%',
    cursor: 'pointer',
  },
  floater: {
    maxWidth: 'auto',
    width: 'fit-content',
    WebkitFilter: 'drop-shadow(rgba(0, 0, 0, 0.1) 0px 6px 20px)',
    filter: 'drop-shadow(rgba(0, 0, 0, 0.1) 0px 6px 20px)',
  },
  container: {
    padding: '12px 16px',
    minWidth: 'auto',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  content: {
    fontSize: '14px',
    lineHeight: '130%',
    color: '#333',
  },
  arrow: {
    spread: 16,
    length: 8,
    color: '#fff',
  },
}

const darkStyles = {
  ...styles,
  container: {
    ...styles.container,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    ...styles.content,
    color: '#fff',
  },
  arrow: {
    ...styles.arrow,
    color: 'rgba(0, 0, 0, 0.8)',
  },
}

const Root = styled.div`
  ${({ disabled }) => `
    height: 100%;
    width: 100%;
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
  `}}
`

function _Tooltip ({
  children,
  className,
  customStyles = {},
  disabled,
  hideTooltip,
  dark,
  ...tooltipProps
}) {
  const computedStyles = useMemo(() => dark ? darkStyles : styles, [dark, customStyles])

  return disabled || hideTooltip
    ? (
      <Root className={className} disabled={disabled}>
        {children}
      </Root>
    )
    : (
      <TooltipComponent
        event='hover'
        eventDelay={0}
        offset={5}
        styles={computedStyles}
        {...tooltipProps}
      >
        {children}
      </TooltipComponent>
    )
}

const Tooltip = memo(_Tooltip)

export { Tooltip }
