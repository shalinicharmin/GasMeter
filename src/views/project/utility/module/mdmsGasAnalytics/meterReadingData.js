import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDAS'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import Error from '@src/views/Error'
import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'

import { ThinkGasMeterReadingInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/MeterReading'
import Flatpickr from 'react-flatpickr'
import { caseInsensitiveSort } from '@src/views/utils.js'

const MeterReadingData = props => {
  const dispatch = useDispatch()
  const responseData = useSelector(state => state.ThinkGasMeterReadingReducer)

  const [loadNextPage, setLoadNextPage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // const handleRowClick = (dtr_id, feeder_id, pss_id) => {
  //   // setDtrID(dtr_id)
  //   // setFeederID(feeder_id)
  //   // setPssID(pss_id)
  //   // setRowClick(dtr_id)
  //   // props.openDTRReport(false)
  // }
  // const data = [
  //   {
  //     id: '1',
  //     site_name: 'xyz',
  //     substation: 2214,
  //     dt_installed: 'Yes',
  //     start_time: ' 05:01 PM, Feb 09, 2022',
  //     update_time: ' 05:02 PM, Feb 09, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: '231d1e9b-6862-4c82-a717-6ff2fgdfga0cad1b',
  //     site_name: 'abc',
  //     substation: 2212,
  //     dt_installed: 'Yes',
  //     start_time: ' 05:01 PM, Feb 09, 2022',
  //     update_time: ' 05:02 PM, Feb 09, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: 'bd213607-03fc-413f-9b64-1dbd8gegdghgf38048cc',
  //     site_name: 'def',
  //     substation: 2212,
  //     dt_installed: 'Yes',
  //     start_time: ' 05:00 PM, Feb 09, 2022',
  //     update_time: ' 05:01 PM, Feb 09, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: 'b179664d-e7c9-4ccb-8a22-cb19454564e864216d',
  //     site_name: 'ghi',
  //     substation: 2212,
  //     dt_installed: 'Yes',
  //     start_time: '02:31 PM, Feb 09, 2022',
  //     update_time: '02:31 PM, Feb 09, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: '94d43de4-42e3-4eed-bedb-b66213ll;kc5a241',
  //     site_name: 'jkl',
  //     substation: 2212,
  //     dt_installed: 'Yes',
  //     start_time: ' 02:29 PM, Feb 09, 2022',
  //     update_time: ' 02:30 PM, Feb 09, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: 'ace88ab4-f1b0-4c46-a5f3-7185eqweew5ba748a9',
  //     site_name: 'mno',
  //     substation: 2212,
  //     dt_installed: 'Yes',
  //     start_time: ' 06:40 PM, Feb 08, 2022',
  //     update_time: ' 06:40 PM, Feb 08, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: '48b05e14-4e99-4766-be04-88276sdddgfgfb66cad',
  //     site_name: 'pqr',
  //     substation: 2212,
  //     dt_installed: 'Yes',
  //     start_time: '06:39 PM, Feb 08, 2022',
  //     update_time: '06:39 PM, Feb 08, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: 'ace88ab4-f1b0-4c46-a5f3-71855ba74gfhfhfg8a9',
  //     site_name: 'xyz',
  //     substation: 2212,
  //     dt_installed: 'Yes',
  //     start_time: '06:40 PM, Feb 08, 2022',
  //     update_time: '06:40 PM, Feb 08, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: '48b05e14-4e99-4766-be04-88276fb66gfdfgdgfcad',
  //     site_name: 'xyz',
  //     substation: 2212,
  //     dt_installed: 'Yes',
  //     start_time: ' 06:39 PM, Feb 08, 2022',
  //     update_time: ' 06:39 PM, Feb 08, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   }
  // ]

  const fetchData = async params => {
    return await useJwt
      .getThinkGasMeterReadingInfo(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        const status = 0
        return [status, err]
      })
  }

  useEffect(async () => {
    // console.log('MDMS UserFlow existing response')
    // console.log(responseData)

    if (!responseData || !responseData.responseData || loadNextPage) {
      //Call API to understand flow

      const params = {
        page: currentPage,
        page_size: 10,
        METER_SERIAL_NUMBER: props.additionalInfo.METER_SERIAL_NUMBER
      }

      const [statusCode, response] = await fetchData(params)

      if (statusCode === 200) {
        setLoadNextPage(false)
        dispatch(ThinkGasMeterReadingInfo(response.data.data.result))
      }
    } else {
      // setMdmsFlow(responseData.responseData.user_flag)
    }
  }, [responseData, loadNextPage])

  const tblColumn = () => {
    const column = []

    for (const i in responseData.responseData.results[0]) {
      const col_config = {}
      if (i !== 'id') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        // col_config.style = {
        //   width: '400px'
        // }
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold '
                // style={{ width: '18vh' }}
                // onClick={() => handleRedirection(row)}
                style={{ width: '20vh' }}
                title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 10 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 10) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 10 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }

    return column
  }

  const refresh = () => {
    setLoadNextPage(true)
  }

  const onNextPageClicked = page => {
    setCurrentPage(page + 1)
    setLoadNextPage(true)
  }

  const fun = () => {
    return (
      <Flatpickr
        placeholder='Select date ...'
        // onChange={onDateRangeSelected}
        className='form-control'
        options={{ mode: 'range', dateFormat: 'Y-m-d' }}
      />
    )
  }

  // return (
  //   <>
  //     <SimpleDataTable columns={tblColumn()} tblData={data} tableName={props.tableName} flatPicker={fun()} />
  //   </>
  // )

  if (!responseData || !responseData.responseData) {
    return <Loader hight='min-height-158' />
  } else {
    return (
      <SimpleDataTableMDAS
        columns={tblColumn()}
        tblData={responseData.responseData.results}
        rowCount={10}
        tableName={'Meter Reading Data'}
        refresh={refresh}
        // filter={handleFilter}
        status={loadNextPage}
        currentPage={currentPage}
        totalCount={responseData.responseData.count}
        onNextPageClicked={onNextPageClicked}
        // protocolSelected={protocolSelected}
        // protocol={protocol}
        // extras={generateBill}
      />

      // <>
      //   <SimpleDataTableMDAS
      //     columns={tblColumn()}
      //     tblData={responseData.responseData.results}
      //     rowCount={10}
      //     tableName={'Applicant Approved'}
      //     refresh={refresh}
      //     // filter={handleFilter}
      //     status={loadNextPage}
      //     currentPage={currentPage}
      //     totalCount={responseData.responseData.count}
      //     onNextPageClicked={onNextPageClicked}
      //     // protocolSelected={protocolSelected}
      //     // protocol={protocol}
      //     // extras={generateBill}
      //   />
      //   <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal-xl '>
      //     <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Applicant Form</ModalHeader>
      //     <ModalBody>
      //       <h1>Hlw</h1>
      //     </ModalBody>
      //   </Modal>
      // </>
    )
  }
}

export default MeterReadingData
