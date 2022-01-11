/* globals test, expect, describe, it, beforeEach, afterEach, jest */
import React from 'react'
import Enzyme from 'enzyme' // eslint-disable-line import/no-extraneous-dependencies
import Adapter from 'enzyme-adapter-react-16' // eslint-disable-line import/no-extraneous-dependencies

import { Drawing } from '../index'

Enzyme.configure({ adapter: new Adapter() })

const { shallow } = Enzyme

test('`constructor` is ok', () => {
  expect(() => shallow(<Drawing />)).toThrowError('Absent tokenProvider')
})

const tokenProvider = () => Promise.resolve('access_token')

describe('`updateCanvasObjects` is ok', () => {
  beforeEach(() => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementationOnce(cb => cb())
  })

  afterEach(() => {})

  it('adding an empty list', () => {
    const instance = shallow((
      <Drawing
        tokenProvider={tokenProvider}
        objects={[]}
      />
    )).instance()

    const o = instance._updateCanvasObjects(instance.props.objects, [])

    expect(o.objectsToAdd).toHaveLength(0)
    expect(o.objectsToRemove).toHaveLength(0)
    expect(o.enlivenedObjects.size).toEqual(0)
    expect(o.objects).toHaveLength(0)
    expect(o.objects).toEqual([])
  })

  it('adding a new list', () => {
    const instance = shallow((
      <Drawing
        tokenProvider={tokenProvider}
        objects={[]}
      />
    )).instance()

    const o = instance._updateCanvasObjects(instance.props.objects, [{ _id: 'uuidv4_object_id' }])

    expect(o.objectsToAdd).toHaveLength(1)
    expect(o.objectsToRemove).toHaveLength(0)
    expect(o.enlivenedObjects.size).toEqual(0)
    expect(o.objects).toHaveLength(1)
    expect(o.objects).toEqual([
      {
        _id: 'uuidv4_object_id',
        _lockedbyuser: undefined,
        noScaleCache: undefined,
        strokeUniform: undefined,
      },
    ])
  })

  it('adding a new list with items intersected', () => {
    const instance = shallow((
      <Drawing
        tokenProvider={tokenProvider}
        objects={[{ _id: 'uuidv4_object_id_1' }]}
      />
    )).instance()

    const { objects: prevO } = instance.props
    const nextO = [{ _id: 'uuidv4_object_id_1', data: 1 }, { _id: 'uuidv4_object_id_2' }]
    const o = instance._updateCanvasObjects(prevO, nextO)

    expect(o.objectsToAdd).toHaveLength(1)
    expect(o.objectsToRemove).toHaveLength(0)
    expect(o.enlivenedObjects.size).toEqual(0)
    expect(o.objects).toHaveLength(2)
    expect(o.objects).toEqual([
      {
        _id: 'uuidv4_object_id_1',
        _lockedbyuser: undefined,
        noScaleCache: undefined,
        strokeUniform: undefined,
        data: 1,
      },
      {
        _id: 'uuidv4_object_id_2',
        _lockedbyuser: undefined,
        noScaleCache: undefined,
        strokeUniform: undefined,
      },

    ])
  })

  it('adding a new list with items not intersected', () => {
    const instance = shallow((
      <Drawing
        tokenProvider={tokenProvider}
        objects={[{ _id: 'uuidv4_object_id_1' }]}
      />
    )).instance()

    const { objects: prevO } = instance.props
    const nextO = [{ _id: 'uuidv4_object_id_2' }, { _id: 'uuidv4_object_id_3' }]
    const o = instance._updateCanvasObjects(prevO, nextO)

    expect(o.objectsToAdd).toHaveLength(2)
    expect(o.objectsToRemove).toHaveLength(1)
    expect(o.enlivenedObjects.size).toEqual(0)
    expect(o.objects).toHaveLength(2)
    expect(o.objects).toEqual([
      {
        _id: 'uuidv4_object_id_2',
        _lockedbyuser: undefined,
        noScaleCache: undefined,
        strokeUniform: undefined,
      },
      {
        _id: 'uuidv4_object_id_3',
        _lockedbyuser: undefined,
        noScaleCache: undefined,
        strokeUniform: undefined,
      },

    ])
  })
})
