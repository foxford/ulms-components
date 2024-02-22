import styled from 'styled-components'
import { Text } from '@foxford/ui'
import { Tooltip } from '@ulms/tooltip'

const calculateColor = ({ disabled, theme }) => `${
  disabled
    ? theme.colors['content-disabled']
    : theme.colors['content-onmain-primary']
}`

export const Root = styled.div`
  ${({ isDisabled, theme }) => `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid ${theme.colors['border-onmain-default-large']};
    cursor: default;
    opacity: ${isDisabled ? 0.5 : 1};
  `}
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

export const VolumeControl = styled.div`
  height: 20px;
  width: 20px;
`

export const AnimationsItems = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const AnimationItem = styled.div`
  ${({
    isDisabled, isTouch, previewSrc, theme,
  }) => `
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 44px;
    width: 44px;
    border-radius: 8px;
    background: url(${previewSrc})};
    cursor:  ${isDisabled ? 'default' : 'pointer'};
    transition: background 300ms ease-out;

    &:not(:first-child) {
      margin-left: 8px;
    }

    ${
  !isDisabled
      && !isTouch
      && `&:hover {
        background: ${theme.colors['bg-brand-primary-100-hover']};
      }`
}
  `}
`

export const VolumeTooltip = styled(Tooltip)`
  && {
    height: 20px;
    width: 20px;
  }
`

export const DisableTooltip = styled(Tooltip)``

export const DisableTooltipContent = styled.span`
  white-space: pre-line;
  text-align: center;
`

export const Title = styled(Text)`
  ${({ disabled, theme }) => `
    color: ${calculateColor({ disabled, theme })};

    & + span {
      width: 20px !important;
    }
  `}
`
