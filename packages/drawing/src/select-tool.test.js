/* globals expect, describe, it, beforeEach, afterEach, jest */
import React from 'react'
import Enzyme from 'enzyme' // eslint-disable-line import/no-extraneous-dependencies
import Adapter from 'enzyme-adapter-react-16' // eslint-disable-line import/no-extraneous-dependencies

import { Drawing, LockProvider, toolEnum } from '../index'

import SelectTool from './tools/select'

Enzyme.configure({ adapter: new Adapter() })

const { shallow } = Enzyme

const tokenProvider = () => Promise.resolve('access_token')

describe('`updateAllSelection` on onlineIds change is ok', () => {
  beforeEach(() => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementationOnce((callback) => callback())
  })

  afterEach(() => {})

  it('changing onlineIds on an empty list', () => {
    const lockProvider = LockProvider

    lockProvider.lockedIds = []

    const wrap = shallow(
      // eslint-disable-next-line react/jsx-filename-extension
      <Drawing
        _lockProvider={lockProvider}
        tokenProvider={tokenProvider}
        pageObjects={[]}
        tool={toolEnum.SELECT}
      />,
    )

    const instance = wrap.instance()

    lockProvider.lockedIds = ['uuidv4_lock_id_2']

    expect(instance.canvas._objects).toEqual([])
  })

  it('`handleTextEditStartEvent` sets style for hiddenTextarea', () => {
    const wrap = shallow(
      <Drawing
        tokenProvider={tokenProvider}
        pageObjects={[]}
        tool={toolEnum.SELECT}
      />,
    )

    const instance = wrap.instance()
    const st = new SelectTool(instance.canvas, {})
    const options = {
      target: {
        hiddenTextarea: {
          style: {},
        },
      },
    }

    st.handleTextEditStartEvent(options)

    expect(options.target.hiddenTextarea.style).toEqual({
      width: '10px',
      height: '10px',
      fontSize: '10px',
    })
  })
})
