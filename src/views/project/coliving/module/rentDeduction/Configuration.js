import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalHeader
} from 'reactstrap';
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
require('flatpickr/dist/plugins/monthSelect/style.css');
import { Edit, Trash } from 'react-feather';
import ConfigurationForm from './ConfigurationForm';

function FiltersForm({
  siteList,
  formData,
  setFormData,
  callApi,
  loadingSites,
  setModalType,
  setConfigurationFormModal,
  setSelectedRow
}) {
  function onSiteChange(site) {
    if (site) {
      formData.siteId = site.value;
    } else {
      delete formData.siteId;
    }
    setFormData(formData);
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
            isDisabled={loadingSites}
            className="react-select rounded"
            classNamePrefix="select"
            placeholder={loadingSites ? 'Loading sites...' : 'Select site...'}
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
        <Col lg="3" sm="6" className="mb-1 ml-auto">
          <Button
            color="primary"
            className="w-100"
            disabled={loadingSites}
            onClick={(event) => {
              event.preventDefault();
              setModalType('NEW');
              setSelectedRow({});
              setConfigurationFormModal(true);
            }}
          >
            Add Configuration
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

function Configuration({ siteList, loadingSites }) {
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    page: 1,
    rows: 10
  });
  const [totalRowsCount, setTotalRowsCount] = useState(0);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  const [selectedRow, setSelectedRow] = useState({});

  const [configurationFormModal, setConfigurationFormModal] = useState(false);
  const [modalType, setModalType] = useState(false);

  async function deleteConfig(selectedRow) {
    setIsLoading(true);
    setError(false);

    try {
      const res = await useJwt.deleteRentDeductionConfigurations(selectedRow);
      toast.success(<Toast msg={'Deleted Succussfully'} type="success" />, {
        hideProgressBar: true
      });
      setRefresh(!refresh);
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) {
        authLogout(history, dispatch);
      } else {
        toast.error(
          <Toast
            msg={err.response?.data?.message || 'Something went wrong!'}
            type="danger"
          />,
          {
            hideProgressBar: true
          }
        );
      }
    }
    setIsLoading(false);
  }

  async function callApi(formData) {
    setIsLoading(true);
    setError(false);

    try {
      const res = await useJwt.getRentDeductionConfigurations(formData);
      setTotalRowsCount(res.data?.length);
      setData(res.data);
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) {
        authLogout(history, dispatch);
      } else {
        toast.error(
          <Toast
            msg={err.response?.data?.message || 'Something went wrong!'}
            type="danger"
          />,
          {
            hideProgressBar: true
          }
        );
      }
    }
    setIsLoading(false);
  }

  useEffect(async () => {
    await callApi(formData);
  }, [refresh]);

  function changePage(page) {
    formData.page = page + 1;
    setFormData(formData);
    setRefresh(!refresh);
  }

  function createColumns() {
    const columns = [];
    const ignoreColumns = ['id', 'siteId'];
    const customWidths = {
      siteId: '240px',
      siteName: '240px',
      createdBy: '240px',
      updatedBy: '240px',
      createdAt: '220px',
      updatedAt: '220px'
    };
    const customPositions = {};
    const renameColumns = {};
    const disableSortings = [];

    if (data.length > 0) {
      for (const i in data[0]) {
        const column = {};
        if (!ignoreColumns.includes(i)) {
          column.name = renameColumns[i] || (
            <span
              title={`${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll(
                '_',
                ' '
              )}
            >
              {i.length > 9
                ? `${i.charAt(0).toUpperCase()}${i.slice(1)}`
                    .replaceAll('_', ' ')
                    .toString()
                    .substring(0, 8)
                    .concat('...')
                : `${i.charAt(0).toUpperCase()}${i.slice(1)}`
                    .replaceAll('_', ' ')
                    .toString()}
            </span>
          );
          column.sortable = !disableSortings.includes(i);
          column.sortFunction = !disableSortings.includes(i)
            ? (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
            : null;
          column.selector = (row) => row[i];
          column.reorder = true;
          column.position = customPositions[i] || 1000;
          column.width = customWidths[i];
          column.minWidth = customWidths[i] || '120px';
          column.wrap = true;
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
    sortedColumns.push({
      name: 'Actions',
      width: '100',
      cell: (row, i) => {
        return (
          <div className="d-flex justify-content-center gap-1 ">
            <Edit
              onClick={() => {
                setModalType('EDIT');
                setSelectedRow(row);
                setConfigurationFormModal(true);
              }}
              size={18}
            />
            <Trash
              onClick={async () => {
                await deleteConfig(row);
              }}
              size={18}
            />
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
          zIndex: 1,
          borderRight: '1px solid rgba(0, 0, 0, 0.11)'
        }
      }
    }
  };

  return (
    <>
      <FiltersForm
        siteList={siteList}
        formData={formData}
        setFormData={setFormData}
        callApi={callApi}
        loadingSites={loadingSites}
        configurationFormModal={configurationFormModal}
        setConfigurationFormModal={setConfigurationFormModal}
        setSelectedRow={setSelectedRow}
        setModalType={setModalType}
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
          tableName={'Site Configurations'}
          showDownloadButton={true}
          downloadFileName={'ledgers'}
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
            setModalType('VIEW');
            setSelectedRow(row);
            setConfigurationFormModal(true);
          }}
          customStyles={customStyles}
        />
      )}
      <ConfigurationForm
        siteList={siteList}
        values={selectedRow}
        setFormData={setFormData}
        loadingSites={loadingSites}
        configurationFormModal={configurationFormModal}
        setConfigurationFormModal={setConfigurationFormModal}
        modalType={modalType}
        setModalType={setModalType}
        setRefresh={setRefresh}
        refresh={refresh}
      />
    </>
  );
}

export default Configuration;
