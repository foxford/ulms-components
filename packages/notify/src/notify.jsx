/* eslint-disable react/prop-types,react/jsx-props-no-spreading */
import React from 'react'
import cn from 'classnames-es'
import { cssTransition, toast, ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.min.css'
import css from './notify.module.css'

const smallAlertTransition = cssTransition({
  enter: `${css.animate__animated} ${css.fadeInDown}`,
  exit: `${css.animate__animated} ${css.fadeOutUp}`,
})

const largeAlertTransition = cssTransition({
  enter: `${css.animate__animated} ${css.fadeInUp}`,
  exit: `${css.animate__animated} ${css.fadeOutDown}`,
})

const ALERT_SIZE = {
  LARGE: 'l',
  SMALL: 's',
}

function NotificationContainer ({
  className, containerProps = {}, isCompact,
}) {
  return (
    <ToastContainer
      autoClose={4000}
      bodyClassName={css.body}
      className={cn(css.container, isCompact && css.isCompact, className)}
      closeButton={false}
      closeOnClick={false}
      draggable={!!isCompact}
      draggableDirection='y'
      draggablePercent={90}
      hideProgressBar
      isCompact={isCompact}
      newestOnTop
      pauseOnFocusLoss={false}
      toastClassName={css.toast}
      {...containerProps}
    />
  )
}

/**
 * @param {React.ReactElement} AlertComponent
 * @param {{ size: 's' | 'l' }} config
 */
function createNotify (AlertComponent, config) {
  const defaultParameters = {
    size: ALERT_SIZE.SMALL,
    ...config,
  }

  const calculateAlertSize = params => params?.alertProps?.size || params?.size || defaultParameters.size

  const getAlertProps = params => ({
    size: calculateAlertSize(params),
    ...params?.alertProps,
  })

  const getConfig = (params) => {
    const size = calculateAlertSize(params)

    return {
      position: size === ALERT_SIZE.SMALL ? toast.POSITION.TOP_CENTER : toast.POSITION.BOTTOM_LEFT,
      transition: size === ALERT_SIZE.SMALL ? smallAlertTransition : largeAlertTransition,
      ...params,
    }
  }

  return {
    error (children, params = {}) {
      return toast(
        <AlertComponent type='error' {...getAlertProps(params)}>{children}</AlertComponent>,
        getConfig(params)
      )
    },
    info (children, params = {}) {
      return toast(
        <AlertComponent type='info' {...getAlertProps(params)}>{children}</AlertComponent>,
        getConfig(params)
      )
    },
    success (children, params = {}) {
      return toast(
        <AlertComponent type='success' {...getAlertProps(params)}>{children}</AlertComponent>,
        getConfig(params)
      )
    },
    warn (children, params = {}) {
      return toast(
        <AlertComponent type='warning' {...getAlertProps(params)}>{children}</AlertComponent>,
        getConfig(params)
      )
    },
    custom (children, params = {}) {
      return toast(children, getConfig(params))
    },
    toast,
  }
}

export { NotificationContainer, createNotify, toast }
