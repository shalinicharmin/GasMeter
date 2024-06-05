import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import useJwt from '@src/auth/jwt/useJwt';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import DataTableV1 from '@src/views/ui-elements/datatable/DataTableV1';
import { Badge, Modal, ModalBody, ModalHeader } from 'reactstrap';
import authLogout from '@src/auth/jwt/logoutlogic';
import { formatDateTime, caseInsensitiveSort } from '@src/views/utils.js';
import Meters from './Meters';
import CurruntSourceMetersCount from './CurruntSourceMetersCount';

function SourceStatus() {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSetSelectedRow] = useState({});
  const [centeredModal, setCenteredModal] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const [siteList, setSiteList] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const vertical = location.pathname.split('/')[1];
  const project = location.pathname.split('/')[2];

  useEffect(async () => {
    setLoadingSites(true);
    try {
      const res = await useJwt.getGISAssetsTillDTR({
        vertical,
        project,
        site_type: 'tower',
      });
      const sites = await res.data.data.result.stat.live_dt_list.map((site) => {
        return {
          value: site.site_id,
          label: site.site_name,
        };
      });
      setSiteList(sites);
    } catch (err) {
      if (err.response) {
        if (err.response.status && [401, 403].includes(err.response.status)) {
          toast.error(
            <Toast
              msg={'User access updated. Please login again.'}
              type="warning"
            />,
            {
              hideProgressBar: true,
            }
          );
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
              hideProgressBar: true,
            }
          );
          setData([]);
        } else {
          toast.error(
            <Toast
              msg={'Cannot fetch site list. Please try again.'}
              type="danger"
            />,
            {
              hideProgressBar: true,
            }
          );
        }
      } else {
        toast.error(
          <Toast
            msg={'Cannot fetch site list. Please try again.'}
            type="danger"
          />,
          {
            hideProgressBar: true,
          }
        );
      }
    }
    setLoadingSites(false);
  }, []);

  useEffect(async () => {
    setIsLoading(true);
    try {
      if (siteList.length > 0) {
        const res = await useJwt.getSourceStatusSites({
          siteId: siteList.map((site) => {
            if (site && site.value) {
              return site.value;
            }
          }),
        });
        setData(res.data.data.result);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status && [401, 403].includes(err.response.status)) {
          toast.error(
            <Toast
              msg={'User access updated. Please login again.'}
              type="warning"
            />,
            {
              hideProgressBar: true,
            }
          );
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
              hideProgressBar: true,
            }
          );
          setData([]);
        } else {
          toast.error(
            <Toast
              msg={'Something went wrong. Please try again.'}
              type="danger"
            />,
            {
              hideProgressBar: true,
            }
          );
        }
      } else {
        toast.error(
          <Toast
            msg={'Something went wrong. Please try again.'}
            type="danger"
          />,
          {
            hideProgressBar: true,
          }
        );
      }
    }
    setIsLoading(false);
  }, [refresh, siteList]);

  function createColumns() {
    const columns = [];
    const ignoreColumns = ['id', 'updated_at', 'eb_dg_site', 'percentage'];
    const customMinWidths = {
      site_name: '240px',
      site_id: '240px',
      eb_meters: '240px',
      eb_ldp: '200px',
      dg_meters: '240px',
      dg_ldp: '200px',
    };
    const customFixWidths = {
      running_source: '150px',
    };
    const customMaxWidths = {};
    const customPositions = {
      site_name: 1,
      site_id: 2,
      eb_meters: 3,
      eb_ldp: 4,
      dg_meters: 5,
      dg_ldp: 6,
    };
    const renameColumns = {};
    const alignCenter = ['running_source'];
    const alignRight = [];

    if (data.length > 0) {
      for (const i in data[0]) {
        const column = {};
        if (!ignoreColumns.includes(i)) {
          column.name =
            renameColumns[i] ||
            `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ');
          column.sortable = true;
          column.sortField = i;
          column.selector = (row) => row[i];
          column.reorder = true;
          column.position = customPositions[i] || 1000;
          column.minWidth = customMinWidths[i] || '140px';
          column.maxWidth = customMaxWidths[i];
          column.width = customFixWidths[i];
          column.center = alignCenter.includes(i);
          column.right = alignRight.includes(i);
          column.wrap = true;
          column.conditionalCellStyles = [
            {
              when: (row) => true,
              style: {},
            },
          ];
          column.cell = (row) => {
            if (i === 'running_source') {
              if (row.running_source === 'EB') {
                return (
                  <Badge
                    pill
                    data-tag="allowRowEvents"
                    color="light-primary"
                    className="w-50"
                  >
                    {row.running_source}
                  </Badge>
                );
              } else if (row.running_source === 'DG') {
                return (
                  <Badge
                    pill
                    color="light-warning"
                    data-tag="allowRowEvents"
                    className="w-50"
                  >
                    {row.running_source}
                  </Badge>
                );
              } else {
                return (
                  <Badge
                    pill
                    color="light-secondary"
                    data-tag="allowRowEvents"
                    className="w-50"
                  >
                    {row.running_source}
                  </Badge>
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
                      maxHeight: '200px',
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
            return row[i].toString();
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
            {i + 1 + 10 * (page - 1)}
          </div>
        );
      },
    });
    sortedColumns.push({
      name: (
        <div className="d-flex w-100 justify-content-end">Meters Switched</div>
      ),
      width: '170px',
      sortable: true,
      sortField: 'percentage',
      cell: (row, i) => {
        return (
          <div
            className="d-flex w-100 justify-content-center"
            data-tag="allowRowEvents"
            key={row.id.toString()}
          >
            <CurruntSourceMetersCount site={row} />
          </div>
        );
      },
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
        },
        '&:nth-child(2)': {
          position: 'sticky',
          left: 70,
          zIndex: 1,
          borderRight: '1px solid rgba(0, 0, 0, 0.11)',
        },
        '&:last-child': {
          position: 'sticky',
          right: 0,
          zIndex: 1,
          borderLeft: '1px solid rgba(0, 0, 0, 0.11)',
        },
      },
    },
    cells: {
      style: {
        paddingLeft: '12px !important',
        backgroundColor: 'inherit',
        '&:nth-child(1)': {
          position: 'sticky',
          left: 0,
          zIndex: 1,
        },
        '&:nth-child(2)': {
          position: 'sticky',
          left: 70,
          zIndex: 1,
          borderRight: '1px solid rgba(0, 0, 0, 0.11)',
        },
        '&:last-child': {
          position: 'sticky',
          right: 0,
          zIndex: 1,
          borderLeft: '1px solid rgba(0, 0, 0, 0.11)',
        },
      },
    },
  };

  function changePage(page) {
    setPage(page + 1);
    setRefresh(!refresh);
  }

  return (
    <>
      {data.length > 0 && (
        <>
          <h3 className="mb-2">EB DG Dashboard</h3>
          <DataTableV1
            columns={createColumns()}
            data={data}
            rowCount={10}
            tableName={'Dual Source Sites'}
            showDownloadButton={true}
            showRefreshButton={true}
            refreshFn={() => {
              setRefresh(!refresh);
            }}
            currentPage={page}
            totalRowsCount={data.length}
            onPageChange={changePage}
            isLoading={isLoading}
            pointerOnHover={true}
            onRowClicked={(row) => {
              setSetSelectedRow(row);
              setCenteredModal(true);
            }}
            customStyles={customStyles}
            onSort={(column, sortDirection) => {
              const field = column.sortField;
              const sorted = data.sort((a, b) => {
                if (!isNaN(a[field])) {
                  a[field] = parseFloat(a[field]);
                }
                if (!isNaN(b[field])) {
                  b[field] = parseFloat(b[field]);
                }
                if (a[field] < b[field]) {
                  return sortDirection === 'asc' ? -1 : 1;
                } else if (a[field] > b[field]) {
                  return sortDirection === 'desc' ? -1 : 1;
                }
                return 0;
              });
              setData([...sorted]);
            }}
            sortServer
          />
          <Modal
            isOpen={centeredModal}
            toggle={() => setCenteredModal(!centeredModal)}
            className="modal-dialog-centered modal_size"
          >
            <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
              Dual Source Meters
            </ModalHeader>
            <ModalBody>
              <Meters site={selectedRow} />
            </ModalBody>
          </Modal>
        </>
      )}
    </>
  );
}

export default SourceStatus;
