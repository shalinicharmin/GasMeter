import React, { useEffect, useState } from 'react';
import DataTable from '@src/views/ui-elements/dataTableUpdated';

import useJwt from '@src/auth/jwt/useJwt';
import jwt_decode from 'jwt-decode';
import authLogout from '../../../../../auth/jwt/logoutlogic';
import { useDispatch } from 'react-redux';
import Loader from '@src/views/project/misc/loader';
import { Badge } from 'reactstrap';
import { useLocation, useHistory } from 'react-router-dom';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import { caseInsensitiveSort } from '@src/views/utils.js';

const DcuMeterTableReport = (props) => {
  const { dcuMetreslist, downFactor, RowSiteName } = props;
  // Logout User
  const [logout, setLogout] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [retry, setRetry] = useState(true);
  const [resp, setResp] = useState('');
  const [page, setpage] = useState(0);
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const tblColumn = () => {
    const column = [];
    for (const i in dcuMetreslist[0]) {
      const col_config = {};
      if (i !== 'meters' && i !== 'status' && i !== 'siteId') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.sortable = true;
        col_config.selector = (row) => row[i];
        // col_config.width = '180px'
        col_config.sortFunction = (rowA, rowB) =>
          caseInsensitiveSort(rowA, rowB, i);
        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              <span
                className="d-block font-weight-bold "
                title={
                  row[i]
                    ? row[i]
                      ? row[i] !== ''
                        ? row[i].toString().length > 20
                          ? row[i]
                          : ''
                        : '-'
                      : '-'
                    : '-'
                }
              >
                {row[i]
                  ? row[i] && row[i] !== ''
                    ? row[i].toString().substring(0, 25)
                    : '-'
                  : '-'}
                {row[i]
                  ? row[i] && row[i] !== ''
                    ? row[i].toString().length > 25
                      ? '...'
                      : ''
                    : '-'
                  : '-'}
              </span>
            </div>
          );
        };
        column.push(col_config);
      }
    }
    column.push({
      name: 'Status',
      width: '120px',
      serch: 'status',
      sortable: true,
      selector: (row) => row.status,
      sortFunction: (rowA, rowB) => caseInsensitiveSort(rowA, rowB, 'status'),
      cell: (row) => {
        if (row.status === 'up') {
          return (
            <>
              <Badge pill color="success" className="mx_7" id="success">
                {row.status}
              </Badge>
            </>
          );
        } else if (row.status === 'down') {
          return (
            <>
              <Badge pill color="danger" className="" id="processing">
                {row.status}
              </Badge>
            </>
          );
        }
      }
    });
    // column.push({
    //   name: 'Action',
    //   width: '120px',
    //   cell: (row, index) => {
    //     return (
    //       <>
    //         <Eye size='15' className='mx-1 cursor-pointer' onClick={() => setMeterDetailModal(!meterDetailModal)} />
    //       </>
    //     )
    //   }
    // })
    column.unshift({
      name: 'Sr No',
      width: '70px',
      cell: (row, i) => {
        return (
          <div className="d-flex  justify-content-center">
            {page * 10 + 1 + i}
          </div>
        );
      }
    });
    return column;
  };
  return (
    <>
      <DataTable
        columns={tblColumn()}
        tblData={dcuMetreslist}
        tableName={`Meterwise Health Report  Downfactor:{${downFactor.label}}   SiteName:{${RowSiteName}}`}
        rowCount={10}
        currentpage={page}
        ispagination
        selectedPage={setpage}
      />
    </>
  );
};

export default DcuMeterTableReport;
