import React from 'react'
import ThinkgasTabs from '@src/views/project/thinkGasDistribution/module/hes/index.js'

const ThinkGasProject = props => {
  return <>{props.module === 'hes' ? <ThinkgasTabs /> : ''}</>
}

export default ThinkGasProject
