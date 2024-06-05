import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form, Input } from 'reactstrap';
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

function FiltersForm({
  siteList,
  formData,
  setFormData,
  callApi,
  loadingSites
}) {
  const [isSiteSelectorDisabled, setIsSiteSelectorDisabled] = useState(false);
  const [isScNoDisabled, setIsScNoDisabled] = useState(false);
  const [refresh, setRefresh] = useState(false);
  function onDateRangeChange(dateRange) {
    if (dateRange[0] && dateRange[1]) {
      const date1 = moment(dateRange[0]);
      const date2 = moment(dateRange[1]);
      const diff = moment.duration(date2.diff(date1), 'millisecond').asDays();
      const daysInMonth = moment(dateRange[0]).daysInMonth();

      if (diff + 1 > daysInMonth) {
        toast.error(
          <Toast
            msg={
              'Date range cannot be greater than a month OR Request a Download'
            }
            type="warning"
          />,
          {
            hideProgressBar: true
          }
        );
        formData.startDate = formatDateTime(dateRange[0], 'DATE');
        formData.endDate = formatDateTime(
          moment(dateRange[0]).add(1, 'M').subtract(1, 'day'),
          'DATE'
        );
        setFormData(formData);
        setRefresh(!refresh);
      } else {
        formData.startDate = formatDateTime(dateRange[0], 'DATE');
        formData.endDate = formatDateTime(dateRange[1], 'DATE');
        setFormData(formData);
        setRefresh(!refresh);
      }
    } else {
      formData.startDate = '';
      formData.endDate = '';
    }
  }

  function onSiteChange(site) {
    if (site) {
      formData.siteId = [site.value];
    } else {
      formData.siteId = [];
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
        <Col lg="2" sm="6" className="mb-1">
          <Button
            type="submit"
            color="primary"
            className="w-100"
            disabled={loadingSites}
            onClick={() => {}}
          >
            Submit
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

function ViewReport({ siteList, loadingSites }) {
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    reportId: '4005',
    siteId: [],
    scNo: '',
    startDate: formatDateTime(moment().format('YYYY-MM-01'), 'DATE'),
    endDate: formatDateTime(moment(), 'DATE'),
    page: 1,
    rows: 10
  });
  const [totalRowsCount, setTotalRowsCount] = useState(0);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const [selectedRow, setSetSelectedRow] = useState({});

  function validateFormData(formData) {
    if (!formData.startDate || !formData.endDate) {
      throw 'Please select date range';
    }

    const date1 = moment(formData.startDate);
    const date2 = moment(formData.endDate);
    const diff = moment.duration(date2.diff(date1), 'millisecond').asDays();
    const daysInMonth = moment(formData.startDate).daysInMonth();

    if (diff + 1 > daysInMonth) {
      throw 'Date range cannot be greater than a month OR Request a Download';
    }

    return true;
  }

  async function callApi(formData) {
    setIsLoading(true);
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
      const res = await useJwt.getAnalyticsReportPostRequest(formData);
      if (formData.page === 1) {
        setTotalRowsCount(res.data.data.result.totalRowsCount);
      }
      setData(res.data.data.result.data);
    } catch (err) {
      if (err.response) {
        if (err.response.status && [401, 403].includes(err.response.status)) {
          authLogout(history, dispatch);
        } else if (err.response.status && [400].includes(err.response.status)) {
          toast.error(
            <Toast
              msg={JSON.stringify(err.response.data.data.error)
                .toString()
                .substring(0, 100)
                .concat('...')}
              type="danger"
            />,
            {
              hideProgressBar: true
            }
          );
          setData([]);
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
    if (Array.isArray(formData.siteId) && formData.siteId.length > 0) {
      await callApi(formData);
    }
  }, [refresh, siteList]);

  function createColumns() {
    const columns = [];
    const ignoreColumns = ['id', 'createdAt', 'updatedAt'];
    const customWidths = {
      site_id: '240px',
      site_name: '240px',
      sc_no: '200px',
      date: '120px'
    };
    const customPositions = {
      date: 1,
      sc_no: 2,
      site_id: 3,
      site_name: 4
    };
    const renameColumns = {};

    if (data.length > 0) {
      for (const i in data[0]) {
        const column = {};
        if (!ignoreColumns.includes(i)) {
          column.name =
            renameColumns[i] ||
            `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ');
          column.sortable = true;
          column.selector = (row) => row[i];
          column.reorder = true;
          column.position = customPositions[i] || 1000;
          column.width = customWidths[i];
          column.minWidth = customWidths[i] || '100px';
          column.wrap = true;
          column.sortFunction = (rowA, rowB) =>
            caseInsensitiveSort(rowA, rowB, i);
          column.conditionalCellStyles = [
            {
              when: (row) => true,
              style: {
                '&:hover': {}
              }
            }
          ];
          column.cell = (row) => {
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
          zIndex: 1
        },
        '&:nth-child(2)': {
          position: 'sticky',
          left: 70,
          zIndex: 1
        },
        '&:nth-child(3)': {
          position: 'sticky',
          left: 70 + 120,
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
          zIndex: 1
        },
        '&:nth-child(2)': {
          position: 'sticky',
          left: 70,
          zIndex: 1
        },
        '&:nth-child(3)': {
          position: 'sticky',
          left: 70 + 120,
          zIndex: 1,
          borderRight: '1px solid rgba(0, 0, 0, 0.11)'
        }
      }
    }
  };

  function changePage(page) {
    formData.page = page + 1;
    setFormData(formData);
    setRefresh(!refresh);
  }

  return (
    <>
      <FiltersForm
        siteList={siteList}
        formData={formData}
        setFormData={setFormData}
        callApi={callApi}
        loadingSites={loadingSites}
      />
      {error ? (
        <CardInfo
          props={{
            message: {
              errorMessage: error.toString().substring(0, 100).concat('...')
            },
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
          tableName={'Daily Consumption'}
          showDownloadButton={true}
          showRefreshButton={true}
          refreshFn={() => {
            setRefresh(!refresh);
          }}
          currentPage={formData.page}
          totalRowsCount={totalRowsCount}
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

export default ViewReport;
