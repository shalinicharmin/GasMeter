import ProjectLevelInfo from './projectLevelInfo'
import ApplicantInfo from './applicantInfo'
import { useEffect, useState } from 'react'

import ConsumerProfile from './consumerProfile'

const MDMSGasAnalytics = () => {
  const [handleRedirection, setHandleRedirection] = useState(0)
  const [additionalInfo, setAdditionalInfo] = useState(undefined)

  // console.log('Additional Information ...')
  // console.log(additionalInfo)

  const redirection = (params, info) => {
    setHandleRedirection(params)
    setAdditionalInfo(info)
  }

  return (
    <div>
      {handleRedirection === 0 && <ProjectLevelInfo redirection={redirection} additionalInfo={additionalInfo} />}
      {handleRedirection === 1 && <ApplicantInfo redirection={redirection} additionalInfo={additionalInfo} />}
      {handleRedirection === 2 && <ConsumerProfile redirection={redirection} additionalInfo={additionalInfo} />}
    </div>
  )
}

export default MDMSGasAnalytics
