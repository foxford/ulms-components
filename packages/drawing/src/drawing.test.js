/* globals test, expect */
import React from 'react'
import Enzyme from 'enzyme' // eslint-disable-line import/no-extraneous-dependencies
import Adapter from 'enzyme-adapter-react-16' // eslint-disable-line import/no-extraneous-dependencies

import { Drawing } from './drawing'

Enzyme.configure({ adapter: new Adapter() })

const { shallow } = Enzyme

test('ok', () => {
  expect(() => shallow(<Drawing />)).toThrowError('Absent tokenProvider')
})
