import React, { useState, useEffect } from 'react';
import DataTabled from '../../../../ui-elements/dataTableUpdated';
import { caseInsensitiveSort } from '@src/views/utils.js';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import authLogout from '../../../../../auth/jwt/logoutlogic';
import useJwt from '@src/auth/jwt/useJwt';
import Loader from '@src/views/project/misc/loader';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';

const TestConfigSampleMeters = (props) => {
  const [page, setpage] = useState(0);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logout, setLogout] = useState(false);
  const [retry, setRetry] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const retryAgain = () => {
    setRetry(!retry);
  };

  const fetchDataById = async (params) => {
    return await useJwt
      .getTestsbyId(params)
      .then((res) => {
        const status = res.status;
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

  const shuffleArray = (array) => {
    if (!array) {
      return;
    }
    if (!Array.isArray(array)) return;
    // Fisher-Yates (aka Knuth) Shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(async () => {
    if (props.id || retry) {
      setLoading(true);
      const params = {
        id: props.id,
      };
      const [statusCode, response] = await fetchDataById(params);
      if (statusCode === 200) {
        try {
          setData(
            shuffleArray(
              response.data.sampleMeters.map((e) => {
                return { meterSerial: e.meterSerial };
              })
            )
          );
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
    const custom_width = ['create_time'];
    for (const i in data[0]) {
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
          tblData={data}
          tableName={'Meters List'}
          // handleRowClick={onCellClick}
          pointerOnHover
        />
      )}
    </>
  );
};

export default TestConfigSampleMeters;
