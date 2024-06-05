import { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import DataTable from 'react-data-table-component';
import { ChevronDown, Download, RefreshCw, PlusCircle } from 'react-feather';
import { Card, Row, Col, Input } from 'reactstrap';
import { DownloadCSV } from '../dtTable/downloadTableData';
import CardInfo from '@src/views/ui-elements/cards/actions/NoDataCardInfo';

const DataTableV1 = (props) => {
  // const data = props.data;
  const [data, setData] = useState(props.data);
  const totalRowsCount = props.totalRowsCount;
  const [currentPageData, setCurrentPageData] = useState([]);

  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=""
      nextLabel=""
      forcePage={props.currentPage - 1}
      onPageChange={(page) => props.onPageChange(page.selected)}
      pageCount={totalRowsCount / props.rowCount || 1}
      breakLabel="..."
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName="active"
      pageClassName="page-item"
      nextClassName={`page-item next ${
        Math.trunc(totalRowsCount / props.rowCount) + 1 === props.currentPage
          ? 'disabled'
          : ''
      }`}
      nextLinkClassName="page-link"
      previousClassName="page-item prev"
      previousLinkClassName="page-link"
      pageLinkClassName="page-link"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end mt-1 mb-1"
    />
  );

  const customStyles = {
    cells: {
      style: {
        paddingLeft: '12px !important',
      },
    },
    headCells: {
      style: {
        textTransform: 'inherit',
        paddingLeft: '12px !important',
      },
    },
    rows: {
      style: {
        fontWeight: '500',
      },
    },
  };

  function paginateData(data, page) {
    if (data?.length > 10) {
      if (page === 1) {
        setCurrentPageData(data.slice(0, 10));
      } else {
        setCurrentPageData(data.slice(page * 10 - 10, page * 10));
      }
    } else {
      setCurrentPageData(data);
    }
  }

  function search(search) {
    const searchData = props.data.filter((obj) => {
      const txtObj = JSON.stringify(Object.values(obj)).toLowerCase().trim();
      return txtObj.includes(search.toLowerCase().trim());
    });
    setData([...searchData]);
  }

  useEffect(() => {
    paginateData(data, props.currentPage);
  }, [props.currentPage, data]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  if (!data && data?.length < 1) {
    return (
      <Card className="">
        <CardInfo />
      </Card>
    );
  } else {
    return (
      <>
        <Card className="p-1" style={{ minHeight: '668px' }}>
          <Row className="border-bottom">
            <Col className="p-1 w-100 d-flex">
              <div className="d-flex align-items-center gap-1 h-100">
                <h4 className="m-0 ">{props.tableName}</h4>
              </div>
            </Col>

            <Col className="p-1">
              <div className="d-flex justify-content-end align-items-center gap-1 h-100">
                <Input
                  type="text"
                  placeholder="Search..."
                  onChange={(event) => {
                    search(event.target.value);
                  }}
                  style={{
                    maxWidth: 280,
                    minWidth: 90,
                  }}
                />

                {props.extraTextToShow}

                {props.showDownloadButton && (
                  <Download
                    onClick={() => {
                      if (props?.onDownload) {
                        props.onDownload();
                      } else {
                        DownloadCSV(
                          data,
                          props.downloadFileName || props.tableName
                        );
                      }
                    }}
                    size={18}
                    className=""
                    style={{ minWidth: 18 }}
                  />
                )}

                {props.showRefreshButton && (
                  <RefreshCw
                    onClick={(event) => {
                      event.target.classList.add('spin-360');
                      props.refreshFn();
                      setTimeout(() => {
                        event.target.classList.remove('spin-360');
                      }, 500);
                    }}
                    size={18}
                    className=""
                    style={{ minWidth: 18 }}
                  />
                )}

                {props.showAddButton && (
                  <PlusCircle
                    onClick={() =>
                      props.setShowForm((prevShowForm) => !prevShowForm)
                    }
                    size={18}
                    className=""
                    style={{ minWidth: 18 }}
                  />
                )}
              </div>
            </Col>
          </Row>
          {props.isLoading ? (
            <div className="d-flex w-100 p-5 justify-content-center">
              <div className="dot-pulse"></div>
            </div>
          ) : (
            <DataTable
              noHeader
              pagination
              data={currentPageData}
              columns={props.columns}
              className="react-dataTable webi_scroller"
              sortIcon={<ChevronDown size={10} />}
              paginationPerPage={props.rowCount}
              paginationComponent={CustomPagination}
              paginationDefaultPage={props.currentPage}
              customStyles={
                props.customStyles
                  ? { ...customStyles, ...props.customStyles }
                  : customStyles
              }
              conditionalRowStyles={props.conditionalRowStyles}
              pointerOnHover={props.pointerOnHover}
              highlightOnHover={false}
              onRowClicked={props.onRowClicked}
              onSort={props.onSort}
              sortServer={props.sortServer}
            />
          )}
        </Card>
      </>
    );
  }
};

export default DataTableV1;
