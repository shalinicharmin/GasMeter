// ** Third Party Components
import { X } from 'react-feather'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'
import FilterForm from '@src/views/project/utility/module/gis/wrapper/filterForm'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch, batch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import useJwt from '@src/auth/jwt/useJwt'
// import { useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic'
import { handleGISFilterData } from '@store/actions/UtilityProject/GIS/MapAsset'

const MdmsWithFilterSidebar = ({ open, handleModal }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer mt_5' size={15} onClick={handleModal} />

  // const dispatch = useDispatch()
  const location = useLocation()
  const projectName = location.pathname.split('/')[2] === 'sbpdcl' ? 'ipcl' : location.pathname.split('/')[2]

  const response = useSelector(state => state.UtilityGISFilterReducer)

  let responseData = null
  if (response && response.responseData) {
    responseData = response.responseData
  } else {
    responseData = []
  }

  const fetchData = async params => {
    return await useJwt
      .getGISFilterData(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  useEffect(async () => {
    if (!response || response.callAPI) {
      const params = {
        project: projectName
      }

      const [statusCode, response] = await fetchData(params)

      if (statusCode) {
        if (statusCode === 200) {
          const data = response.data.data.result.stat

          dispatch(handleGISFilterData(data))
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        }
      }
    }
  }, [response])

  return (
    <Modal isOpen={open} toggle={handleModal} className='sidebar-md' modalClassName='modal-slide-in-left' contentClassName='pt-0'>
      <ModalHeader className='mb-3' toggle={handleModal} close={CloseBtn} tag='div'>
        <h4 className='modal-title'>GIS - Filter</h4>
      </ModalHeader>
      <ModalBody className='flex-grow-1'>
        <FilterForm handleModal={handleModal} />
      </ModalBody>
    </Modal>
  )
}

export default MdmsWithFilterSidebar
