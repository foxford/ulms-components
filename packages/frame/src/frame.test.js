/* globals test, expect */
import React from 'react'
import Enzyme from 'enzyme' // eslint-disable-line import/no-extraneous-dependencies
import Adapter from 'enzyme-adapter-react-16' // eslint-disable-line import/no-extraneous-dependencies

import { Frame } from './frame'

Enzyme.configure({ adapter: new Adapter() })

const { shallow } = Enzyme

test('ok', () => {
  const instance = shallow(
    // eslint-disable-next-line react/jsx-filename-extension
    <Frame url={`${Frame.type}/path/to/page`} />,
  ).instance()

  expect(instance.props.url).toBe(`${Frame.type}/path/to/page`)
})
