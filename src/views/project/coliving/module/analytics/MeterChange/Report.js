import { useState, useEffect } from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import ViewReport from './ViewReport';
import RequestDownload from './RequestDownload';
import useJwt from '@src/auth/jwt/useJwt';
import authLogout from '@src/auth/jwt/logoutlogic';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

const Report = (props) => {
  const [active, setActive] = useState('1');
  const location = useLocation();
  const [siteList, setSiteList] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const vertical = location.pathname.split('/')[1];
  const project = location.pathname.split('/')[2];
  const dispatch = useDispatch();
  const history = useHistory();

  const toggle = (tab) => {
    setActive(tab);
  };

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

  return (
    <>
      <Nav pills className="justify-content-start ">
        <NavItem>
          <NavLink
            active={active === '1'}
            onClick={() => {
              toggle('1');
            }}
          >
            Meter Replacements
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2');
            }}
          >
            Meter Replacements History
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent className="py-50" activeTab={active}>
        <TabPane tabId="1">
          <ViewReport siteList={siteList} loadingSites={loadingSites} />
        </TabPane>
        <TabPane tabId="2">
          <RequestDownload siteList={siteList} loadingSites={loadingSites} />
        </TabPane>
      </TabContent>
    </>
  );
};
export default Report;
