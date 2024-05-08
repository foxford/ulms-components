/* eslint-disable react/jsx-props-no-spreading */
import merge from 'lodash/merge'
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
    padding: '8px 12px',
    minWidth: 'auto',
    borderRadius: '4px',
    backgroundColor: '#fff',
  },
  content: {
    fontSize: '14px',
    lineHeight: '130%',
    color: '#333',
    textAlign: 'start',
    whiteSpace: 'pre-line',
  },
  arrow: {
    spread: 16,
    length: 8,
    color: '#fff',
  },
  options: {
    zIndex: 10_000,
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

function _Tooltip({
  children,
  className,
  customStyles = {},
  disabled,
  hideTooltip,
  dark,
  ...tooltipProps
}) {
  const computedStyles = useMemo(
    () => merge({}, dark ? darkStyles : styles, customStyles),
    [dark, customStyles],
  )

  return disabled || hideTooltip ? (
    <Root className={className} disabled={disabled}>
      {children}
    </Root>
  ) : (
    <TooltipComponent
      event="hover"
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

// eslint-disable-next-line import/prefer-default-export
export { Tooltip }
