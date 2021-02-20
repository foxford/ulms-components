/* globals test, expect, describe, it, beforeEach, afterEach, jest */
import React from 'react'
import Enzyme from 'enzyme' // eslint-disable-line import/no-extraneous-dependencies
import Adapter from 'enzyme-adapter-react-16' // eslint-disable-line import/no-extraneous-dependencies

import { Drawing, toolEnum } from './drawing'

Enzyme.configure({ adapter: new Adapter() })

const { shallow } = Enzyme

const tokenProvider = () => Promise.resolve('access_token')

describe('`updateAllSelection` on onlineIds change is ok', () => {
  let instance

  beforeEach(() => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementationOnce(cb => cb())
  })

  afterEach(() => {})

  it('changing onlineIds on an empty list', () => {
    const wrap = shallow((
      <Drawing
        tokenProvider={tokenProvider}
        objects={[]}
        onlineIds={[]}
        tool={toolEnum.SELECT}
      />
    ))

    instance = wrap.instance()

    wrap.setProps({ onlineIds: ['uuidv4_lock_id_2'] })

    expect(instance.canvas._objects).toEqual([])
  })

  it('update selection on changing onlineIds and make objects non-interactive', () => {
    const wrap = shallow((
      <Drawing
        tokenProvider={tokenProvider}
        objects={[{ _id: 'uuidv4_object_id_1', _lockedselection: 'uuidv4_lock_id_2' }]}
        onlineIds={['uuidv4_lock_id_2', 'uuidv4_lock_id_1']}
        tool={toolEnum.SELECT}
      />
    ))

    instance = wrap.instance()
    instance.canvas._objects = instance.props.objects
    wrap.setProps({ onlineIds: ['uuidv4_lock_id_2'] })
    // update agents. one agent leave

    // expect locked object become non-interactive
    expect(instance.canvas._objects).toEqual([
      {
        _id: 'uuidv4_object_id_1',
        _lockedbyuser: undefined,
        _lockedselection: 'uuidv4_lock_id_2',
        noScaleCache: undefined,
        strokeUniform: undefined,
        selectable: false,
        evented: false,
        hoverCursor: 'crosshair',
      },
    ])
  })

  it('update selection on changing onlineIds and make objects interactive', () => {
    const wrap = shallow((
      <Drawing
        tokenProvider={tokenProvider}
        objects={[{ _id: 'uuidv4_object_id_1', _lockedselection: 'uuidv4_lock_id_1' }]}
        onlineIds={['uuidv4_lock_id_2', 'uuidv4_lock_id_1']}
        tool={toolEnum.SELECT}
      />
    ))

    instance = wrap.instance()
    instance.canvas._id = 'uuidv4_lock_id_1'
    instance.canvas._objects = [...instance.props.objects]

    wrap.setProps({ onlineIds: ['uuidv4_lock_id_2'] })
    // update agents. one agent leave

    // expect locked object become interactive but save lock info
    expect(instance.canvas._objects).toEqual([
      {
        _id: 'uuidv4_object_id_1',
        _lockedbyuser: undefined,
        _lockedselection: 'uuidv4_lock_id_1',
        noScaleCache: undefined,
        strokeUniform: undefined,
        selectable: true,
        evented: true,
        hoverCursor: 'move',
      },
    ])
  })
})
