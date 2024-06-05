// ** React Imports
import { Fragment, useState, forwardRef } from 'react'

// ** Third Party Components
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { ChevronDown, Download, RefreshCw } from 'react-feather'
import { Card, Tooltip, Input, Row, Col, Spinner, CardBody } from 'reactstrap'
import { DownloadCSV } from './downloadTableData'
import CardInfo from '@src/views/ui-elements/cards/actions/NoDataCardInfo'

const TableWithoutSearch = props => {
  const data = props.tblData
  // console.log(props.tblData)
  // ** States
  const [modal, setModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [downloadTooltipOpen, setDownloadTooltipOpen] = useState(false)
  const [refreshTooltipOpen, setRefreshTooltipOpen] = useState(false)

  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)

  const handleColumnFilter = (item, value) => {
    let getStartsWith = false,
      gteIncludes = false

    for (const i of props.columns) {
      try {
        const key = item[i.serch].toString().toLowerCase()

        if (key.startsWith(value)) {
          getStartsWith = true
        }

        if (key.includes(value)) {
          gteIncludes = true
        }
      } catch (err) { }
    }

    return [getStartsWith, gteIncludes]
  }

  // ** Function to handle filter
  const handleFilter = e => {
    const value = e.target.value.toLowerCase().trim()
    let updatedData = []
    setSearchValue(value)

    if (value.length) {
      updatedData = data.filter(item => {
        const [startsWith, includes] = handleColumnFilter(item, value)

        if (startsWith) {
          return startsWith
        } else if (!startsWith && includes) {
          return includes
        } else return null
      })

      setFilteredData(updatedData)
      setSearchValue(value)
    }
  }

  // ** Function to handle Pagination
  const handlePagination = page => setCurrentPage(page.selected)

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=''
      nextLabel=''
      forcePage={currentPage}
      onPageChange={page => handlePagination(page)}
      pageCount={searchValue.length ? filteredData.length / props.rowCount : data.length / props.rowCount || 1}
      breakLabel='...'
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName='active'
      pageClassName='page-item'
      nextClassName='page-item next'
      nextLinkClassName='page-link'
      previousClassName='page-item prev'
      previousLinkClassName='page-link'
      pageLinkClassName='page-link'
      breakClassName='page-item'
      breakLinkClassName='page-link'
      containerClassName='pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
    />
  )

  // Row height
  const conditionalRowStyles = [
    {
      when: row => true,
      style: {
        maxHeight: '40px',
        minHeight: '40px',
        '&:hover': {
          // cursor: 'pointer'
        }
      }
    }
  ]

  const customStyles = {
    headCells: {
      style: {
        textTransform: 'inherit',
        paddingLeft: '0 8px'
      }
    }
  }

  if (!props.tblData && props.tblData.length <= 0) {
    return (
      <Fragment>
        <Card className='min-height-475 px-1'>
          <CardInfo />
        </Card>
      </Fragment>
    )
  } else {
    return (
      <Fragment>
        <Card className='height-300 pr-1 mb-0 webi_scroller'>
          <CardBody className='p-0'>
            <DataTable
              noHeader
              data={searchValue.length ? filteredData : data}
              columns={props.columns}
              className='react-dataTable'
              sortIcon={<Download onClick={() => DownloadCSV(data, props.tableName)} size='17' style={{ transform: 'rotate(0deg)' }} />}
            />
          </CardBody>
        </Card>
      </Fragment>
    )
  }
}

export default TableWithoutSearch
