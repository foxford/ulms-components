/* globals expect, describe, it, beforeEach, afterEach, jest */
import React from 'react'
import Enzyme from 'enzyme' // eslint-disable-line import/no-extraneous-dependencies
import Adapter from 'enzyme-adapter-react-16' // eslint-disable-line import/no-extraneous-dependencies

import { Drawing, toolEnum } from '../index'

import { TextboxTool } from './tools/textbox'

Enzyme.configure({ adapter: new Adapter() })

const { shallow } = Enzyme

const tokenProvider = () => Promise.resolve('access_token')

describe('TextboxTool tool', () => {
  beforeEach(() => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementationOnce(cb => cb())
  })

  afterEach(() => {})

  it('`handleTextEditStartEvent` sets style for hiddenTextarea', () => {
    const wrap = shallow((
      <Drawing
        tokenProvider={tokenProvider}
        pageObjects={[]}
        tool={toolEnum.TEXT}
      />
    ))

    const instance = wrap.instance()
    const tt = new TextboxTool(instance.canvas, undefined, {})

    tt.__object = tt.__objectFn()

    tt.__object.hiddenTextarea = { style: {} }

    tt.handleTextEditStartEvent()

    expect(tt.__object.hiddenTextarea.style).toEqual({
      width: '10px', height: '10px', fontSize: '10px',
    })
  })
})
