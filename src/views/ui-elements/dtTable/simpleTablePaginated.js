// ** React Imports
import { Fragment, useState, forwardRef } from 'react';

// ** Third Party Components
import ReactPaginate from 'react-paginate';
import DataTable from 'react-data-table-component';
import {
  ChevronDown,
  Download,
  RefreshCw,
  Filter,
  FileText,
  File,
} from 'react-feather';
import {
  Card,
  Tooltip,
  Input,
  Row,
  Col,
  Spinner,
  FormGroup,
  Label,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { DownloadCSV, DownloadPDF } from './downloadTableData';
import CardInfo from '@src/views/ui-elements/cards/actions/NoDataCardInfo';

const SimpleDataTablePaginated = (props) => {
  const data = props.tblData;
  const totalCount = props.totalCount;

  // ** States
  const [modal, setModal] = useState(false);
  //   const [currentPage, setCurrentPage] = useState(0)
  const [searchValue, setSearchValue] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [downloadTooltipOpen, setDownloadTooltipOpen] = useState(false);
  const [refreshTooltipOpen, setRefreshTooltipOpen] = useState(false);
  const [filterTooltipOpen, setFilterTooltipOpen] = useState(false);

  const handleColumnFilter = (item, value) => {
    let getStartsWith = false,
      gteIncludes = false;

    for (const i of props.columns) {
      try {
        const key = item[i.serch].toString().toLowerCase();

        if (key.startsWith(value)) {
          getStartsWith = true;
        }

        if (key.includes(value)) {
          gteIncludes = true;
        }
      } catch (err) {}
    }

    return [getStartsWith, gteIncludes];
  };

  // ** Function to handle filter
  const handleFilter = (e) => {
    const value = e.target.value.toLowerCase();
    let updatedData = [];
    setSearchValue(value);

    if (value.length) {
      updatedData = data.filter((item) => {
        const [startsWith, includes] = handleColumnFilter(item, value);

        if (startsWith) {
          return startsWith;
        } else if (!startsWith && includes) {
          return includes;
        } else return null;
      });

      setFilteredData(updatedData);
      setSearchValue(value);
    }
  };

  // ** Function to handle Pagination
  const handlePagination = (page) => {
    //   setCurrentPage(page.selected)
    props.onNextPageClicked(page.selected);
  };

  // ** Custom Pagination
  // ...

  // ** Custom Pagination
  const CustomPagination = () => {
    const pageCount = searchValue.length
      ? Math.ceil(filteredData.length / props.rowCount)
      : Math.ceil(totalCount / props.rowCount) || 1;
    const disablePagination = pageCount === 1;

    return (
      <ReactPaginate
        previousLabel=""
        nextLabel=""
        forcePage={props.currentPage - 1}
        onPageChange={(page) => handlePagination(page)}
        pageCount={pageCount}
        breakLabel="..."
        pageRangeDisplayed={2}
        marginPagesDisplayed={2}
        activeClassName="active"
        pageClassName="page-item"
        nextClassName={`page-item ${
          props.currentPage === 0 ? 'next disabled' : 'next'
        }`}
        nextLinkClassName="page-link"
        previousClassName="page-item prev"
        previousLinkClassName="page-link"
        pageLinkClassName="page-link"
        breakClassName="page-item"
        breakLinkClassName="page-link"
        containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
        disableInitialCallback={disablePagination}
        disablePreviousPage={disablePagination}
        disableNextPage={disablePagination}
        disableFirstPage={disablePagination}
        disableLastPage={disablePagination}
      />
    );
  };

  // ...

  // Row height
  const conditionalRowStyles = [
    {
      when: (row) => true,
      style: {
        maxHeight: '40px',
        minHeight: '40px',
        '&:hover': {
          // cursor: 'pointer'
        },
      },
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        textTransform: 'inherit',
        paddingLeft: '0 8px',
      },
    },
  };

  //   const onProtocolSelection = value => {
  //     props.protocolSelected(value)
  //   }

  if (!props.tblData && props.tblData.length <= 0) {
    return (
      <Fragment>
        <Card className="min-height-475 px-1">
          <CardInfo />
        </Card>
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <Card
          className={
            props.height
              ? 'max-height-600 px-1 webi_scroller'
              : 'min-height-475 px-1 webi_scroller'
          }
        >
          <Row className="p-1 border-bottom">
            <Col md="4" className="p-0">
              <h4 className="table_header">{props.tableName}</h4>
            </Col>
            <Col md="5" className="p-0">
              {/* <Input
                className='form-control secondary'
                type='text'
                bsSize='sm'
                id='search-input'
                placeholder='Search . . .'
                value={searchValue}
                onChange={handleFilter}
              /> */}
            </Col>
            <Col md="3" className="p-0">
              {/* {props.filter && props.protocol === 'dlms' && (
                <Fragment>
                  <Filter onClick={() => props.filter()} id='filter_table' size='14' className='ml-1 float-right mt_9' />
                  <Tooltip placement='top' isOpen={filterTooltipOpen} target='filter_table' toggle={() => setFilterTooltipOpen(!filterTooltipOpen)}>
                    Advance filter for Command history !
                  </Tooltip>
                </Fragment>
              )} */}
              {props.refresh && (
                <Fragment>
                  {props.status ? (
                    <Spinner
                      onClick={() => props.refresh()}
                      id="refresh_table"
                      size="sm"
                      className=" float-right mt_12"
                    />
                  ) : (
                    <RefreshCw
                      onClick={() => props.refresh()}
                      id="refresh_table"
                      size="14"
                      className=" float-right mt_12"
                    />
                  )}
                  <Tooltip
                    placement="top"
                    isOpen={refreshTooltipOpen}
                    target="refresh_table"
                    toggle={() => setRefreshTooltipOpen(!refreshTooltipOpen)}
                  >
                    Refresh Table
                  </Tooltip>
                </Fragment>
              )}
              {props.refresh && props.extras && props.extras}
              {/* Input to check DLMS or TAP Command History */}
              {/* <Fragment>
                <FormGroup check inline className='mt_6'>
                  <Label check onClick={() => onProtocolSelection('dlms')}>
                    <Input type='radio' name='asset_type' defaultChecked={'dlms' === props.protocol} /> <span style={{ fontSize: '15px' }}>DLMS</span>
                  </Label>
                </FormGroup>
                <FormGroup check inline className='mt_6'>
                  <Label check onClick={() => onProtocolSelection('tap')}>
                    <Input type='radio' name='asset_type' defaultChecked={'tap' === props.protocol} /> <span style={{ fontSize: '15px' }}>TAP</span>
                  </Label>
                </FormGroup>
              </Fragment> */}
              <Fragment>
                {/* <Download onClick={() => DownloadCSV(data, props.tableName)} id='csv_download' size='17' className='float-right mt_7' /> */}
                <UncontrolledButtonDropdown className="float-right ">
                  <DropdownToggle color="flat ">
                    <Download
                      id="download"
                      size="18"
                      className="cursor-pointer"
                    />
                  </DropdownToggle>
                  <DropdownMenu positionFixed={true}>
                    <DropdownItem
                      className="w-100"
                      onClick={() =>
                        DownloadCSV(
                          data,
                          props.tableName,
                          props.columns,
                          props.additional_columns
                        )
                      }
                    >
                      <FileText size={15} className="ml_20 mx_6" />
                      <span className="align-middle ms-50"> CSV</span>
                    </DropdownItem>
                    {/* <DropdownItem className='w-100' onClick={() => DownloadExcel(props.tableName, props.columns, props.tblData)}>
                          <Grid size={15} className='ml_20 mx_6' />
                          <span className='align-middle ms-50'>Excel</span>
                        </DropdownItem> */}
                    <DropdownItem
                      className="w-100"
                      onClick={() =>
                        DownloadPDF(
                          props.tableName,
                          props.columns,
                          props.tblData
                        )
                      }
                    >
                      <File size={15} className="ml_20 mx_6" />
                      <span className="align-middle ms-50">PDF</span>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
                <Tooltip
                  placement="top"
                  isOpen={downloadTooltipOpen}
                  target="download"
                  toggle={() => setDownloadTooltipOpen(!downloadTooltipOpen)}
                >
                  Download CSV !
                </Tooltip>
              </Fragment>
            </Col>
          </Row>
          <DataTable
            noHeader
            pagination
            data={searchValue.length ? filteredData : data}
            columns={props.columns}
            className="react-dataTable"
            sortIcon={
              props.currentPage ? (
                <ChevronDown size={10} />
              ) : (
                <div
                  className="sorting_overlap"
                  onClick={() => setCurrentPage(0)}
                >
                  <ChevronDown className="float-right" size={10} />
                </div>
              )
            }
            paginationPerPage={
              props.paginationPerPage ? props.paginationPerPage : props.rowCount
            }
            paginationComponent={CustomPagination}
            paginationDefaultPage={props.currentPage}
            conditionalRowStyles={conditionalRowStyles}
            customStyles={customStyles}
            pointerOnHover={props.pointerOnHover}
            onRowClicked={props.handleRowClick}
          />
        </Card>
      </Fragment>
    );
  }
};

export default SimpleDataTablePaginated;
