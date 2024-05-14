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

function NotificationContainer({ className, containerProps = {}, isCompact }) {
  return (
    <ToastContainer
      autoClose={4000}
      bodyClassName={css.body}
      className={cn(css.container, isCompact && css.isCompact, className)}
      closeButton={false}
      closeOnClick={false}
      draggable={!!isCompact}
      draggableDirection="y"
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
function createNotify(AlertComponent, config) {
  const defaultParameters = {
    size: ALERT_SIZE.SMALL,
    ...config,
  }

  const calculateAlertSize = (parameters) =>
    // eslint-disable-next-line unicorn/explicit-length-check
    parameters?.alertProps?.size || parameters?.size || defaultParameters.size

  const getAlertProps = (parameters) => ({
    size: calculateAlertSize(parameters),
    ...parameters?.alertProps,
  })

  const getConfig = (parameters) => {
    const size = calculateAlertSize(parameters)

    return {
      position:
        size === ALERT_SIZE.SMALL
          ? toast.POSITION.TOP_CENTER
          : toast.POSITION.BOTTOM_LEFT,
      transition:
        size === ALERT_SIZE.SMALL ? smallAlertTransition : largeAlertTransition,
      ...parameters,
    }
  }

  return {
    error(children, parameters = {}) {
      return toast(
        <AlertComponent type="error" {...getAlertProps(parameters)}>
          {children}
        </AlertComponent>,
        getConfig(parameters),
      )
    },
    info(children, parameters = {}) {
      return toast(
        <AlertComponent type="info" {...getAlertProps(parameters)}>
          {children}
        </AlertComponent>,
        getConfig(parameters),
      )
    },
    success(children, parameters = {}) {
      return toast(
        <AlertComponent type="success" {...getAlertProps(parameters)}>
          {children}
        </AlertComponent>,
        getConfig(parameters),
      )
    },
    warn(children, parameters = {}) {
      return toast(
        <AlertComponent type="warning" {...getAlertProps(parameters)}>
          {children}
        </AlertComponent>,
        getConfig(parameters),
      )
    },
    custom(children, parameters = {}) {
      return toast(children, getConfig(parameters))
    },
    toast,
  }
}

export { NotificationContainer, createNotify }

export { toast } from 'react-toastify'
