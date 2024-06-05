import React, { useState, useEffect } from 'react';
import DataTabled from '../../../../ui-elements/dataTableUpdated';
import { caseInsensitiveSort } from '@src/views/utils.js';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import authLogout from '../../../../../auth/jwt/logoutlogic';
import useJwt from '@src/auth/jwt/useJwt';
import Loader from '@src/views/project/misc/loader';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
const UploadedCsvMetersModal = (props) => {
  const [page, setpage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);
  const [logout, setLogout] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const fetchData = async (params) => {
    return await useJwt
      .getTestcycles(params)
      .then((res) => {
        const status = res.status;
        // console.log(res)
        return [status, res];
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status;
          return [status, err];
        } else {
          return [0, err];
        }
      });
  };

  const retryAgain = () => {
    setRetry(!retry);
  };

  useEffect(async () => {
    if (retry) {
      setLoading(true);
      const params = {
        id: props.rowData.id,
      };
      const [statusCode, response] = await fetchData(params);
      if (statusCode === 200) {
        try {
          setData(response.data);
          setLoading(false);
          setRetry(false);
          setError('');
        } catch (error) {
          setLoading(false);
          setRetry(false);
          setError('Something went wrong, please retry');
        }
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else {
        setError('Network error');
        setRetry(false);
        setLoading(false);
      }
    }
  }, [retry]);

  const tblColumn = () => {
    const column = [];
    if (data?.meters?.length > 0) {
      for (const i in data?.meters[0]) {
        const col_config = {};
        if (i !== 'id') {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
            1
          )}`.replaceAll('_', ' ');
          col_config.serch = i;
          col_config.sortable = true;
          col_config.reorder = true;
          // col_config.width = '150px'
          col_config.selector = (row) => row[i];
          col_config.sortFunction = (rowA, rowB) =>
            caseInsensitiveSort(rowA, rowB, i);

          col_config.cell = (row) => {
            return (
              <div className={`d-flex font-weight-bold w-100 `}>{row[i]}</div>
            );
          };
          column.push(col_config);
        }
      }
    }

    column.unshift({
      name: 'Sr No.',
      width: '90px',
      cell: (row, i) => {
        return (
          <div className="d-flex justify-content-center">
            {page * 10 + 1 + i}
          </div>
        );
      },
    });
    return column;
  };
  return (
    <>
      {loading ? (
        <Loader hight="min-height-475" />
      ) : error.length > 0 ? (
        <CardInfo
          props={{
            message: { error },
            retryFun: { retryAgain },
            retry: { retry },
          }}
        />
      ) : (
        <DataTabled
          rowCount={10}
          currentpage={page}
          ispagination
          selectedPage={setpage}
          columns={tblColumn()}
          tblData={data.meters}
          tableName={data.fileName || 'Meters'}
          // handleRowClick={onCellClick}
          pointerOnHover
          donotShowDownload={true}
        />
      )}
    </>
  );
};

export default UploadedCsvMetersModal;
