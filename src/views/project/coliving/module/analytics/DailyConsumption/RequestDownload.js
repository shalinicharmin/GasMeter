import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form, Input, Badge } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import moment from 'moment';
import DataTableV1 from '@src/views/ui-elements/datatable/DataTableV1';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import useJwt from '@src/auth/jwt/useJwt';
import { formatDateTime, caseInsensitiveSort } from '@src/views/utils.js';
import authLogout from '@src/auth/jwt/logoutlogic';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import { Download } from 'react-feather';

function FiltersForm({
  siteList,
  formData,
  setFormData,
  callApi,
  refresh,
  setRefresh,
  loadingSites
}) {
  const [isSiteSelectorDisabled, setIsSiteSelectorDisabled] = useState(false);
  const [isScNoDisabled, setIsScNoDisabled] = useState(false);

  function onDateRangeChange(dateRange) {
    if (dateRange[0] && dateRange[1]) {
      formData.startDate = formatDateTime(dateRange[0], 'DATE');
      formData.endDate = formatDateTime(dateRange[1], 'DATE');
      setFormData(formData);
    } else {
      formData.startDate = '';
      formData.endDate = '';
    }
  }

  function onSiteChange(site) {
    if (site) {
      formData.siteId = [site.value];
      formData.siteName = [site.label];
    } else {
      formData.siteId = [];
      formData.siteName = [];
    }
    setFormData(formData);
    if (Array.isArray(formData.siteId) && formData.siteId.length > 0) {
      setIsScNoDisabled(true);
    } else {
      setIsScNoDisabled(false);
    }
  }
  function onScNoChange(event) {
    formData.scNo = event.target.value;
    setFormData(formData);
    if (formData.scNo && formData.scNo !== '') {
      setIsSiteSelectorDisabled(true);
    } else {
      setIsSiteSelectorDisabled(false);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (Array.isArray(formData.siteId) && formData.siteId.length < 1) {
      formData.siteId = siteList.map((site) => {
        return site.value;
      });
    }
    if (Array.isArray(formData.siteName) && formData.siteName.length < 1) {
      formData.siteName = siteList.map((site) => {
        return site.label;
      });
    }
    formData.page = 1;
    setFormData(formData);
    await callApi(formData);
  }

  return (
    <Form onSubmit={onSubmit}>
      <Row className="justify-content-start">
        <Col lg="3" sm="6" className="mb-1">
          <Select
            isClearable
            isSearchable
            onChange={onSiteChange}
            options={siteList}
            isDisabled={isSiteSelectorDisabled || loadingSites}
            className="react-select rounded"
            classNamePrefix="select"
            placeholder={loadingSites ? 'Loading sites...' : 'Select site...'}
          />
        </Col>
        <Col lg="3" sm="6" className="mb-1">
          <Input
            type="text"
            onChange={onScNoChange}
            disabled={isScNoDisabled}
            placeholder="Sc No"
          />
        </Col>
        <Col lg="3" sm="6" className="mb-1">
          <Flatpickr
            placeholder="Select date ..."
            onChange={onDateRangeChange}
            value={[formData.startDate, formData.endDate]}
            className="form-control"
            options={{ mode: 'range', enableTime: false }}
          />
        </Col>
        <Col lg="3" sm="6" className="mb-1">
          <div className="d-flex">
            <Button
              type="submit"
              color="primary"
              className="w-100"
              disabled={loadingSites}
              onClick={() => {}}
            >
              Request
            </Button>
            <Button
              type="submit"
              color="primary"
              className="w-100 ml-1"
              onClick={(event) => {
                event.preventDefault();
                setRefresh(!refresh);
              }}
            >
              Search
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
}

function RequestDownload({ siteList, loadingSites }) {
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    reportId: '4005',
    siteId: [],
    siteName: [],
    scNo: '',
    startDate: null,
    endDate: null,
    page: 1
  });
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const [selectedRow, setSetSelectedRow] = useState({});

  function validateFormData(formData) {
    if (!formData.startDate || !formData.endDate) {
      throw 'Please select date range';
    }
    return true;
  }

  async function submitRequest(formData) {
    setError(false);
    try {
      validateFormData(formData);
    } catch (error) {
      toast.error(<Toast msg={error} type="warning" />, {
        hideProgressBar: true
      });
      setIsLoading(false);
      return;
    }
    try {
      const res = await useJwt.postAnalyticsRequestReport(formData);
      toast.success(
        <Toast msg={'Report Requested Successfully'} type="success" />,
        {
          hideProgressBar: true
        }
      );
    } catch (err) {
      if (err.response) {
        if (err.response.status && [401, 403].includes(err.response.status)) {
          authLogout(history, dispatch);
        } else if (err.response.status && [400].includes(err.response.status)) {
          toast.error(
            <Toast
              msg={JSON.stringify(err.response.data.data.error)}
              type="danger"
            />,
            { hideProgressBar: true }
          );
        } else {
          toast.error(<Toast msg={'Something went wrong!'} type="danger" />, {
            hideProgressBar: true
          });
        }
      } else {
        setError('Something went wrong!');
      }
    }
    setRefresh(!refresh);
  }

  async function getHistory(formData) {
    setError(false);
    setIsLoading(true);
    try {
      const res = await useJwt.getAnalyticsRequestReportHistory(formData);
      setData(res.data.data.result);
    } catch (err) {
      if (err.response) {
        if (err.response.status && [401, 403].includes(err.response.status)) {
          authLogout(history, dispatch);
        } else if (err.response.status && [400].includes(err.response.status)) {
          toast.error(
            <Toast
              msg={JSON.stringify(err.response.data.data.error)}
              type="danger"
            />,
            { hideProgressBar: true }
          );
        } else {
          toast.error(<Toast msg={'Something went wrong!'} type="danger" />, {
            hideProgressBar: true
          });
        }
      } else {
        setError('Something went wrong!');
      }
    }
    setIsLoading(false);
  }

  useEffect(async () => {
    if (Array.isArray(formData.siteId) && formData.siteId.length < 1) {
      formData.siteId = siteList.map((site) => {
        if (site && site.value) {
          return site.value;
        }
      });
    }

    if (siteList && Array.isArray(siteList) && siteList.length > 0) {
      if (formData.siteId.length > 1 || formData.siteName.length > 1) {
        const newFormData = { ...formData };
        newFormData.siteId = '';
        newFormData.siteName = '';
        delete newFormData.page;
        await getHistory({
          ...newFormData
        });
      } else {
        const newFormData = { ...formData };
        newFormData.siteId = formData.siteId[0];
        newFormData.siteName = formData.siteName[0];
        delete newFormData.page;
        await getHistory({ ...newFormData });
      }
    }
  }, [refresh, siteList]);

  function createColumns() {
    const columns = [];
    const ignoreColumns = [
      '_id',
      'reportId',
      'username',
      'intervalDays',
      'subDivId',
      'feederId',
      'feederName',
      'pssId',
      'pssName',
      'sectionId',
      'updatedAt',
      'meterSerial',
      'meterIp',
      '__v'
    ];
    const customWidths = {
      siteId: '240px',
      scNo: '240px',
      siteName: '240px',
      fileLink: '100px',
      createdAt: '240px',
      startDate: '120px',
      endDate: '120px'
    };
    const customPositions = {
      siteId: 1,
      siteName: 2,
      scNo: 3,
      startDate: 4,
      endDate: 5,
      createdAt: 6,
      status: 7,
      fileLink: 8
    };
    const renameColumns = {
      fileLink: 'Download',
      createdAt: 'RequestedAt'
    };
    const disableSortings = ['fileLink'];

    if (data.length > 0) {
      for (const i in data[0]) {
        const column = {};
        if (!ignoreColumns.includes(i)) {
          column.name =
            renameColumns[i] ||
            `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ');
          column.sortable = !disableSortings.includes(i);
          column.sortFunction = !disableSortings.includes(i)
            ? (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
            : null;
          column.selector = (row) => row[i];
          column.reorder = true;
          column.position = customPositions[i] || 1000;
          column.width = customWidths[i];
          column.minWidth = customWidths[i] || '100px';
          column.cell = (row) => {
            if (i === 'status') {
              if (row.status === 'success') {
                return (
                  <Badge
                    pill
                    data-tag="allowRowEvents"
                    color="light-success"
                    className=""
                  >
                    {row.status}
                  </Badge>
                );
              } else if (row.status === 'processing') {
                return (
                  <Badge
                    pill
                    color="light-warning"
                    data-tag="allowRowEvents"
                    className=""
                  >
                    {row.status}
                  </Badge>
                );
              } else if (row.status === 'failed') {
                return (
                  <Badge
                    pill
                    color="light-danger"
                    data-tag="allowRowEvents"
                    className=""
                  >
                    {row.status}
                  </Badge>
                );
              }
            }

            if (i === 'fileLink') {
              if (row.status === 'success') {
                return (
                  <a
                    href={row.fileLink}
                    className="d-flex w-100 pr-1 justify-content-center"
                  >
                    <Download size={20} className="text-primary" />
                  </a>
                );
              } else {
                return (
                  <div className="d-flex w-100 pr-1 justify-content-center">
                    <Download size={20} className="text-secondary" />
                  </div>
                );
              }
            }

            if (row[i] || [0, '0'].includes(row[i])) {
              if (Array.isArray(row[i])) {
                row[i] = row[i].join(' , ');
              }
              if (row[i].toString().length > 25) {
                return (
                  <span
                    onClick={(event) => {
                      if (event.target.textContent.toString().length <= 29) {
                        event.target.textContent = row[i];
                        event.target.style.overflowY = 'scroll';
                      } else {
                        event.target.textContent = `${row[i]
                          .toString()
                          .substring(0, 25)}...`;
                        event.target.style.overflowY = 'visible';
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      maxHeight: '200px'
                    }}
                    className="webi_scroller"
                    title={'click to expand text'}
                  >
                    {row[i].toString().substring(0, 25)}...
                  </span>
                );
              }
            } else {
              return '-';
            }
            return row[i];
          };
          columns.push(column);
        }
      }
    }
    const sortedColumns = columns.sort((a, b) => {
      if (a.position < b.position) {
        return -1;
      } else if (a.position > b.position) {
        return 1;
      }
      return 0;
    });
    sortedColumns.unshift({
      name: 'Sr No',
      width: '70px',
      cell: (row, i) => {
        return (
          <div className="d-flex w-100 justify-content-center">
            {i + 1 + 10 * (formData.page - 1)}
          </div>
        );
      }
    });
    return sortedColumns;
  }

  const customStyles = {
    headCells: {
      style: {
        paddingLeft: '12px !important',
        backgroundColor: 'inherit',
        '&:nth-child(1)': {
          position: 'sticky',
          left: 0,
          zIndex: 1,
          borderRight: '1px solid rgba(0, 0, 0, 0.11)'
        }
      }
    },
    cells: {
      style: {
        paddingLeft: '12px !important',
        backgroundColor: 'inherit',
        '&:nth-child(1)': {
          position: 'sticky',
          left: 0,
          zIndex: 1,
          borderRight: '1px solid rgba(0, 0, 0, 0.11)'
        }
      }
    }
  };

  function changePage(page) {
    formData.page = page + 1;
    setFormData(formData);
    setData([...data]);
  }

  return (
    <>
      <FiltersForm
        siteList={siteList}
        formData={formData}
        setFormData={setFormData}
        callApi={submitRequest}
        refresh={refresh}
        setRefresh={setRefresh}
        loadingSites={loadingSites}
      />
      {error ? (
        <CardInfo
          props={{
            message: { errorMessage: error },
            retryFun: {
              retryAgain: () => {
                setRefresh(!refresh);
              }
            },
            retry: {
              retry: false
            }
          }}
        />
      ) : (
        <DataTableV1
          columns={createColumns()}
          data={data}
          rowCount={10}
          tableName={'Request History'}
          showDownloadButton={true}
          showRefreshButton={true}
          refreshFn={() => {
            setRefresh(!refresh);
          }}
          currentPage={formData.page}
          totalRowsCount={data.length}
          onPageChange={changePage}
          isLoading={isLoading}
          pointerOnHover={true}
          onRowClicked={(row) => {
            setSetSelectedRow(row);
          }}
          customStyles={customStyles}
        />
      )}
    </>
  );
}

export default RequestDownload;
