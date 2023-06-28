/* eslint-disable react/prop-types,react/jsx-props-no-spreading */
import React from 'react'
import clsx from 'clsx'
import { cssTransition, toast, ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.min.css'
import css from './alert.module.css'

const ALERT_CONTAINER_ID = {
  BIG: 'BIG_ALERT_CONTAINER',
  SMALL: 'SMALL_ALERT_CONTAINER',
}

const transitionForSmallAlertContainer = cssTransition({
  enter: `${css.animate__animated} ${css.fadeInDown}`,
  exit: `${css.animate__animated} ${css.fadeOutUp}`,
})

const transitionForBigAlertContainer = cssTransition({
  enter: `${css.animate__animated} ${css.fadeInUp}`,
  exit: `${css.animate__animated} ${css.fadeOutDown}`,
})

const sharedOptions = {
  autoClose: 4000,
  bodyClassName: css.body,
  closeButton: false,
  closeOnClick: false,
  draggableDirection: 'y',
  draggablePercent: 90,
  enableMultiContainer: true,
  hideProgressBar: true,
  pauseOnFocusLoss: false,
  toastClassName: css.toast,
}

function ContainerForBigAlert ({
  className, containerProps = {}, isCompact,
}) {
  return (
    <ToastContainer
      className={clsx(css.container, css.isBig, isCompact && css.isCompact, className)}
      containerId={ALERT_CONTAINER_ID.BIG}
      draggable={!!isCompact}
      isCompact={isCompact}
      newestOnTop
      position={toast.POSITION.BOTTOM_LEFT}
      transition={transitionForBigAlertContainer}
      {...sharedOptions}
      {...containerProps}
    />
  )
}

function ContainerForSmallAlert ({
  className, containerProps = {}, isCompact,
}) {
  return (
    <ToastContainer
      className={clsx(css.container, css.isSmall, isCompact && css.isCompact, className)}
      containerId={ALERT_CONTAINER_ID.SMALL}
      draggable={!!isCompact}
      isCompact={isCompact}
      position={toast.POSITION.TOP_CENTER}
      transition={transitionForSmallAlertContainer}
      {...sharedOptions}
      {...containerProps}
    />
  )
}

export { ALERT_CONTAINER_ID, ContainerForBigAlert, ContainerForSmallAlert, toast }
