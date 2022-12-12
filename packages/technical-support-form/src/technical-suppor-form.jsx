/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
import React, { memo, useCallback } from 'react'
import { IntlProvider, useIntl } from 'react-intl'

import { Button } from '@foxford/ui/packages/Button/Button'
import { Select } from '@foxford/ui/packages/Select/Select'
import { Textarea } from '@foxford/ui/packages/Textarea/Textarea'

import { messagesIntl } from '../lang/index'
import { intlID } from '../lang/constants'

import Spacer from './atoms/spacer'
import Spinner from './atoms/spinner'
import Card from './molecules/card'

import FVSFormSuccessImage from './images/success.svg'
import FVSFormErrorImage from './images/error.svg'

import css from './technical-suppor-form.module.css'

const _TechnicalSupportFormComponent = (props) => {
  const {
    close,
    formSubmitStatus,
    initialDataLoadStatus,
    onSelectChange,
    onTextareaChange,
    reset,
    selectOptions,
    selectValue,
    submit,
    textareaValue,
    valid,
  } = props

  const intl = useIntl()

  const memoizedOnTextareaChange = useCallback(
    (event) => onTextareaChange(event.target.value),
    [onTextareaChange]
  )

  if (
    initialDataLoadStatus === 'idle' || initialDataLoadStatus === 'pending' || formSubmitStatus === 'pending'
  ) {
    return (
      <div className={css.root}>
        <div className={css.background} onClick={close} />
        <div className={css.container}>
          <div className={css.closeButton} onClick={close} />
          <Spinner fullscreen={false} />
        </div>
      </div>
    )
  }

  if (initialDataLoadStatus === 'failed' || formSubmitStatus === 'failed') {
    return (
      <div className={css.root}>
        <div className={css.background} onClick={close} />
        <div className={css.container}>
          <div className={css.closeButton} onClick={close} />

          <Card
            description={intl.formatMessage({ id: intlID.FVS__TRY_AGAIN })}
            buttonIcon='reload'
            buttonText={intl.formatMessage({ id: intlID.FVS__REFRESH })}
            image={FVSFormErrorImage}
            onButtonClick={submit}
            title={intl.formatMessage({
              id: intlID.FVS__SERVICE_IS_UNAVAILABLE,
            })}
          />
        </div>
      </div>
    )
  }

  if (formSubmitStatus === 'succeeded') {
    return (
      <div className={css.root}>
        <div className={css.background} onClick={close} />
        <div className={css.container}>
          <div className={css.closeButton} onClick={close} />
          <Card
            description={intl.formatMessage({ id: intlID.FVS__CONTACT_YOU })}
            buttonText={intl.formatMessage({
              id: intlID.FVS__SUBMIT_ANOTHER_REQUEST,
            })}
            image={FVSFormSuccessImage}
            onButtonClick={reset}
            title={intl.formatMessage({ id: intlID.FVS__RECEIVED_REQUEST })}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={css.root}>
      <div className={css.background} onClick={close} />
      <div className={css.container}>
        <div className={css.closeButton} onClick={close} />
        <div className={css.formTitle}>
          {intl.formatMessage({ id: intlID.FVS__DESCRIBE_PROBLEM })}
        </div>
        <Spacer h='20' />
        <div>
          <div className={css.formFieldTitle}>
            {intl.formatMessage({ id: intlID.FVS__PROBLEM })}
          </div>
          <Spacer h='4' />
          <Select
            className='fvs-overlay-select'
            onChange={onSelectChange}
            options={selectOptions}
            placeholder={intl.formatMessage({
              id: intlID.FVS__SOMETHING_WRONG,
            })}
            searchable={false}
            size='s'
            value={selectValue}
          />
        </div>
        <Spacer h='16' />
        <div>
          <div className={css.formFieldTitle}>
            {intl.formatMessage({ id: intlID.FVS__DETAILS })}
          </div>
          <Spacer h='4' />
          <Textarea
            className={css.sizeS}
            maxLength={500}
            onChange={memoizedOnTextareaChange}
            placeholder={intl.formatMessage({
              id: intlID.FVS__DESCRIBE_PROBLEM_MORE,
            })}
            rows='5'
            size='s'
            value={textareaValue}
          />
        </div>
        <Spacer h='20' />
        <Button
          content={intl.formatMessage({ id: intlID.FVS__SUBMIT })}
          disabled={!valid}
          fluid
          onClick={submit}
          size='s'
        />
      </div>
    </div>
  )
}

const TechnicalSupportFormComponent = memo(_TechnicalSupportFormComponent)

export const TechnicalSupportForm = (props) => {
  const {
    defaultLocale = 'ru', locale = 'ru', ...restProps
  } = props

  return (
    <IntlProvider
      defaultLocale={defaultLocale}
      key={locale}
      locale={locale}
      messages={messagesIntl[locale]}
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <TechnicalSupportFormComponent {...restProps} />
    </IntlProvider>
  )
}
