// ** React Imports
import { Fragment, useState, useEffect } from 'react';

// ** Third Party Components
import ReactPaginate from 'react-paginate';
import DataTable from 'react-data-table-component';
import {
  ChevronDown,
  Download,
  RefreshCw,
  FileText,
  File,
  Grid,
} from 'react-feather';
import {
  Card,
  Tooltip,
  Input,
  Row,
  Col,
  Spinner,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';

// To dowload table data in different format
import {
  DownloadCSV,
  DownloadExcel,
  DownloadPDF,
} from './wrapper/downloadTableData';

const DataTabled = (props) => {
  const data = props.tblData;

  // ** States
  const [modal, setModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    props.currentPage ? props.currentPage : 0
  );
  const [searchValue, setSearchValue] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [downloadTooltipOpen, setDownloadTooltipOpen] = useState(false);
  const [refreshTooltipOpen, setRefreshTooltipOpen] = useState(false);
  const [autoHeight, setAutoHeight] = useState({});
  const [totalPages, setTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    props.rowCount ? props.rowCount : 10
  );

  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal);

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
    const value = e.target.value.toLowerCase().trim();
    let updatedData = [];

    setSearchValue(value.trim());
    setCurrentPage(0);

    if (value.length) {
      updatedData = props.tblData.filter((item) => {
        const [startsWith, includes] = handleColumnFilter(item, value);

        if (startsWith) {
          return startsWith;
        } else if (!startsWith && includes) {
          return includes;
        } else return null;
      });

      setFilteredData(updatedData);
      setSearchValue(value);
      setTotalPages(Math.ceil(updatedData.length / rowsPerPage)); // Calculate the total number of pages for filtered data
    } else {
      setTotalPages(Math.ceil(props.tblData.length / rowsPerPage)); // Calculate the total number of pages for original data
    }
  };

  useEffect(() => {
    let auto_height = {};
    setSearchValue('');
    if (!props.auto_height) {
      auto_height = {
        maxHeight: '40px',
        minHeight: '40px',
        // width: '500px',

        '&:hover': {
          cursor: 'pointer',
        },
      };
    }
    setAutoHeight(auto_height);
  }, [data]);
  // function to handle row per page
  const handlePerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value));
  };

  // ** Function to handle Pagination
  const handlePagination = (page) => {
    if (props?.ispagination) {
      props.selectedPage(page.selected);
    }
    setCurrentPage(page.selected);
  };

  //  function to render data
  // const dataRender = () => {
  //   console.log('Current page Number')
  //   console.log(currentPage)
  //   const temp = currentPage * rowsPerPage
  //   if (searchValue.length > 0) {
  //     return filteredData.slice(0, rowsPerPage)
  //   } else if (temp > data.length) {
  //     setCurrentPage(0)
  //     return data.slice(0, rowsPerPage)
  //   } else {
  //     return data.slice(temp, temp + rowsPerPage)
  //   }
  // }

  // const createSelectItems = () => {
  //   const items = [],
  //     num = 5
  //   for (let i = 1; i <= 6; i++) {
  //     const result = i * num
  //     items.push(
  //       <option key={i} value={result}>
  //         {result}
  //       </option>
  //     )
  //
  //   }
  //   return items
  // }

  // ** Custom Pagination
  const CustomPagination = () => (
    <>
      <Row>
        {/* <Col className='mt_7'>
            <div className='d-flex align-items-center'>
              <Label for='sort-select'>show</Label>
              <Input className='dataTable-select' type='select' id='sort-select' value={rowsPerPage} onChange={handlePerPage}>
                {/* <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option> */}
        {/* {createSelectItems()} */}
        {/* </Input>
              <Label for='sort-select'>entries</Label>
            </div>
          </Col> */}

        <Col>
          <ReactPaginate
            previousLabel=""
            nextLabel={currentPage === totalPages - 1 ? '' : ''}
            forcePage={currentPage}
            onPageChange={(page) => handlePagination(page)}
            pageCount={
              searchValue.length
                ? totalPages
                : Math.ceil(data.length / rowsPerPage) || 1
            }
            breakLabel="..."
            pageRangeDisplayed={2}
            marginPagesDisplayed={2}
            activeClassName="active"
            pageClassName="page-item"
            nextClassName={
              currentPage === totalPages - 1
                ? 'page-item next disabled'
                : 'page-item next'
            }
            nextLinkClassName="page-link"
            previousClassName="page-item prev"
            previousLinkClassName="page-link"
            pageLinkClassName="page-link"
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
          />
        </Col>
      </Row>
    </>
  );

  // Row height
  const conditionalRowStyles = [
    {
      when: (row) => true,
      style: autoHeight,
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

  useEffect(() => {
    const elements = document.getElementsByClassName('lgCMJK');

    // Create a click event handler function
    function handleClick() {
      setCurrentPage(0);
    }

    // Loop through the elements and add a click event listener to each one
    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener('click', handleClick);
    }

    // Remove the event listeners when the component unmounts (cleanup)
    return () => {
      for (let i = 0; i < elements.length; i++) {
        elements[i].removeEventListener('click', handleClick);
      }
    };
  }, []);

  return (
    <Fragment>
      <Card
        className={
          props.height
            ? 'max-height-525 px-1 webi_scroller'
            : props.scheduler
            ? 'webi_scroller py-0 px-2 m-0'
            : 'min-height-475 px-1 webi_scroller'
        }
      >
        <Row className="p-1 border-bottom">
          {props.flatPicker ? (
            <>
              <Col md="4" className="p-0">
                {props.smHeading ? (
                  <h5 className="table_header">{props.tableName}</h5>
                ) : (
                  <h4 className="table_header">{props.tableName}</h4>
                )}
              </Col>
              <Col md="3">{props.flatPicker}</Col>
            </>
          ) : (
            <Col md="7" className="p-0">
              {props.smHeading ? (
                <h5 className="table_header">{props.tableName}</h5>
              ) : (
                <h4 className="table_header">{props.tableName}</h4>
              )}
            </Col>
          )}
          <Col md="3" xs="9" className="p-0">
            {props.scheduler ? (
              props.scheduler
            ) : (
              <Input
                className="form-control secondary"
                type="text"
                id="search-input"
                placeholder="Search . . ."
                value={searchValue}
                onChange={handleFilter}
              />
            )}
          </Col>

          <Col md="2" xs="3" className="pt_10">
            {props.refresh && (
              <Fragment>
                {props.status ? (
                  <Spinner
                    onClick={() => props.refresh()}
                    id="refresh_table"
                    size="sm"
                    className="ml-1 cursor-pointer float-right mt_4"
                  />
                ) : (
                  <RefreshCw
                    onClick={() => props.refresh()}
                    id="refresh_table"
                    size="14"
                    className="ml-1 cursor-pointer float-right mt_4"
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

            {props.donotShowDownload ? (
              ''
            ) : (
              <>
                <UncontrolledButtonDropdown className="float-right">
                  <DropdownToggle className="p-0 mx_5" color="flat">
                    <Download
                      id="csv_download"
                      size="18"
                      className="cursor-pointer"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
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
                    {/* <DropdownItem
                      className='w-100'
                      onClick={() => DownloadExcel(props.tableName, props.columns, props.tblData)}
                    >
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
                  target="csv_download"
                  toggle={() => setDownloadTooltipOpen(!downloadTooltipOpen)}
                >
                  Download
                </Tooltip>
              </>
            )}
            {props.extras && props.extras}
          </Col>
        </Row>

        <DataTable
          noHeader
          pagination
          data={searchValue.length ? filteredData : data}
          // data={dataRender()}
          columns={props.columns}
          className="react-dataTable"
          sortIcon={
            props.currentPage ? (
              <ChevronDown size={10} />
            ) : (
              <div
                className="sorting_overlap"
                onClick={() => {
                  props.selectedPage(0);
                  setCurrentPage(0);
                }}
              >
                <ChevronDown className="float-right" size={10} />
              </div>
            )
          }
          // paginationPerPage={data.length}
          paginationPerPage={props.rowCount}
          paginationComponent={CustomPagination}
          paginationDefaultPage={currentPage + 1}
          conditionalRowStyles={conditionalRowStyles}
          customStyles={customStyles}
          defaultSortAsc={false}
          defaultSortFieldId={props.defaultSortFieldId}
          selectableRows={props.selectable ? props.selectable : false}
          onSelectedRowsChange={props.onSelectedRowsChange}
          clearSelectedRows={props.toggledClearRows}
          onRowClicked={props.handleRowClick}
          pointerOnHover={props.pointerOnHover}
        />
      </Card>
    </Fragment>
  );
};

export default DataTabled;
