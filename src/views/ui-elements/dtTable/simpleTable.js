// ** React Imports
import { Fragment, useEffect, useState, forwardRef } from 'react';

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
  Label,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';

// To dowload table data in different format
import { DownloadCSV, DownloadExcel, DownloadPDF } from './downloadTableData';

const SimpleDataTable = (props) => {
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
  const [totalPages, setTotalPages] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(
    props.rowCount ? props.rowCount : 10
  );

  // console.log(currentPage)
  // * Function to handle Modal toggle
  const handleModal = () => setModal(!modal);

  // ** Bootstrap Checkbox Component
  const BootstrapCheckbox = forwardRef(({ onClick, ...rest }, ref) => (
    <div className="custom-control custom-checkbox">
      <input
        type="checkbox"
        className="custom-control-input"
        ref={ref}
        {...rest}
      />
      <label className="custom-control-label" onClick={onClick} />
    </div>
  ));

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

  useEffect(() => {
    setSearchValue('');
  }, [data]);

  // * Function to handle filter
  const handleFilter = (e) => {
    const value = e.target.value.toLowerCase().trim();
    let updatedData = [];

    setSearchValue(value);
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

  // function to handle row per page
  const handlePerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value));
  };

  // * Function to handle Pagination
  const handlePagination = (page) => {
    if (props?.ispagination) {
      props.selectedPage(page.selected);
    }
    setCurrentPage(page.selected);
  };

  //  function to render data
  // const dataRender = () => {
  //   const temp = currentPage * rowsPerPage

  //   if (temp > data.length) {
  //     setCurrentPage(0)
  //     return data.slice(0, rowsPerPage)
  //   }
  //   if (searchValue.length > 0) {
  //     return filteredData.slice(temp, temp + rowsPerPage)
  //     // return filteredData.slice(0, rowsPerPage)
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
  //   }
  //   return items
  // }

  // * Custom Pagination
  const CustomPagination = () => (
    <>
      <Row>
        {/* {data.length <= 5 ? ( */}

        {/* ) : ( */}
        {/* // <Col className='mt_7'>
          //   <div className='d-flex align-items-center'>
          //     <Label for='sort-select'>show</Label>
          //     <Input className='dataTable-select' type='select' id='sort-select' value={rowsPerPage} onChange={handlePerPage}>
          //       {/* <option value={5}>5</option> */}
        {/* //       <option value={10}>10</option>
          //       <option value={15}>15</option>
          //       <option value={30}>30</option> */}
        {/* //       {createSelectItems()}
          //     </Input  >
          //     <Label for='sort-select'>entries</Label>
          //   </div>
          // </Col>
        // )} */}
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
      style: {
        maxHeight: '40px',
        minHeight: '40px',

        '&:hover': {
          cursor: 'pointer',
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

  const customSort = (rows, selector, direction) => {
    return rows.sort((rowA, rowB) => {
      // console.log(direction)
      // use the selector function to resolve your field names by passing the sort comparitors
      const aField = selector(rowA);
      const bField = selector(rowB);

      let comparison = 0;

      if (aField > bField) {
        comparison = 1;
      } else if (aField < bField) {
        comparison = -1;
      }

      return direction === 'desc' ? comparison * -1 : comparison;
    });
  };

  if (!props.tblData && props.tblData.length <= 0) {
    alert('Hello');
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
            {props.flatPicker ? (
              <>
                <Col className="p-0">
                  {props.smHeading ? (
                    <h5 className="table_header">{props.tableName}</h5>
                  ) : (
                    <h4 className="table_header">{props.tableName}</h4>
                  )}
                </Col>
                <Col>{props.flatPicker}</Col>
              </>
            ) : (
              <Col className="p-0">
                {props.smHeading ? (
                  <h5 className="table_header">{props.tableName}</h5>
                ) : (
                  <h4 className="table_header">{props.tableName}</h4>
                )}
              </Col>
            )}
            <Col className="p-0 ">
              <span className="float-right">
                {props.refresh && (
                  <Fragment>
                    {props.status ? (
                      <Spinner
                        onClick={() => props.refresh()}
                        id="refresh_table"
                        size="sm"
                        className="ml-1 cursor-pointer float-right mt_14"
                      />
                    ) : (
                      <RefreshCw
                        onClick={() => props.refresh()}
                        id="refresh_table"
                        size="14"
                        className="ml-1 cursor-pointer float-right mt_14"
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
                    <UncontrolledButtonDropdown>
                      <DropdownToggle color="flat pl_5">
                        <Download
                          id="csv_download"
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
                      target="csv_download"
                      toggle={() =>
                        setDownloadTooltipOpen(!downloadTooltipOpen)
                      }
                    >
                      Download
                    </Tooltip>
                  </>
                )}
              </span>

              {props.extras}

              {props.scheduler ? (
                props.scheduler
              ) : (
                <Input
                  className="form-control secondary float-right mr-1"
                  type="text"
                  id="search-input"
                  placeholder="Search . . ."
                  value={searchValue}
                  onChange={handleFilter}
                  style={{ display: 'inline-block', width: '63%' }}
                />
              )}
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
                  onClick={() => setCurrentPage(0)}
                >
                  <ChevronDown className="float-right" size={10} />
                </div>
              )
            }
            paginationPerPage={rowsPerPage}
            selectableRows={props.selectable ? props.selectable : false}
            onSelectedRowsChange={props.onSelectedRowsChange}
            selectableRowsComponent={BootstrapCheckbox}
            selectableRowDisabled={props.rowDisabled && props.rowDisabled}
            clearSelectedRows={props.toggledClearRows}
            // paginationPerPage={props.rowCount}
            paginationComponent={CustomPagination}
            paginationDefaultPage={currentPage + 1}
            conditionalRowStyles={conditionalRowStyles}
            customStyles={customStyles}
            defaultSortAsc={false}
            defaultSortFieldId={props.defaultSortFieldId}
            pointerOnHover={props.pointerOnHover}
            onRowClicked={props.handleRowClick}
            sortFunction={customSort}
          />
        </Card>
      </Fragment>
    );
  }
};

export default SimpleDataTable;
