// ** Third Party Components
import { X } from 'react-feather'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'
import MdmsUtility from '@src/views/project/utility/module/mdms'
import { useSelector, useDispatch } from 'react-redux'

// import NewMdmsUtility from '@src/views/project/utility/module/newMdms'

const MdmsWithGisSidebar = ({ open, handleModal }) => {
  const responseData = useSelector(state => state.UtilityMdmsFlowReducer)

  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer mt_5' size={15} onClick={handleModal} />
  let className = 'sidebar-xl'
  let style = { width: '82%' }

  if (window.innerWidth < 800) {
    className = ''
    style = { width: '100%' }
  }

  return (
    <Modal isOpen={open} toggle={handleModal} style={style} modalClassName='modal-slide-in' contentClassName='pt-0'>
      <ModalHeader className='mb-3' toggle={handleModal} close={CloseBtn} tag='div'>
        <h4 className='modal-title'>GIS - MDMS</h4>
      </ModalHeader>
      <ModalBody className='flex-grow-1'>
        {/* {responseData.responseData && responseData.responseData.user_flag.toLowerCase() === 'legacy' && <MdmsUtility showBackButton={'no'} />}
        {responseData.responseData && responseData.responseData.user_flag.toLowerCase() !== 'legacy' && (
          <NewMdmsUtility
            dtr_list={responseData.responseData.dtr_list}
            dtr_count={responseData.responseData.dtr_count}
            donotShowBackButtonForUsers={true}
          />
        )} */}
        <MdmsUtility showBackButton={'no'} />
      </ModalBody>
    </Modal>
  )
}

export default MdmsWithGisSidebar
