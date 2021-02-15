/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames-es'

import css from './spinner.css'

function Spinner () {
  return (
    <div className={css.root}>
      <div className={css.child} />
      <div className={cx(css.circle2, css.child)} />
      <div className={cx(css.circle3, css.child)} />
      <div className={cx(css.circle4, css.child)} />
      <div className={cx(css.circle5, css.child)} />
      <div className={cx(css.circle6, css.child)} />
      <div className={cx(css.circle7, css.child)} />
      <div className={cx(css.circle8, css.child)} />
      <div className={cx(css.circle9, css.child)} />
      <div className={cx(css.circle10, css.child)} />
      <div className={cx(css.circle11, css.child)} />
      <div className={cx(css.circle12, css.child)} />
    </div>
  )
}

export { Spinner }
