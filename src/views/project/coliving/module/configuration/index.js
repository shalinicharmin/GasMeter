import { useEffect, useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import AssignDeassignTable from '@src/views/project/coliving/module/configuration/wrapper/assignDeassignTable'
import TariffTable from '@src/views/project/coliving/module/configuration/wrapper/tariffTable'
import DailyDeduction from '@src/views/project/coliving/module/configuration/wrapper/dailyDeduction'
import EbDgAllocation from '@src/views/project/coliving/module/configuration/wrapper/ebDgAllocation'
import TowerConfiguration from '@src/views/project/coliving/module/configuration/wrapper/towerConfiguration'
import MiscellaneousServices from '@src/views/project/coliving/module/configuration/wrapper/miscellaneousServices'
import VariableCam from '@src/views/project/coliving/module/configuration/wrapper/variableCam'
import { useLocation, useHistory } from 'react-router-dom'
import useJwt from '@src/auth/jwt/useJwt'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { useDispatch } from 'react-redux'
import authLogout from '@src/auth/jwt/logoutlogic'

const Configuration = props => {
  const location = useLocation()
  const uri = location.pathname.split('/')
  const [active, setActive] = useState('1')
  const [allSites, setAllSites] = useState('')

  // Logout User
  const [logout, setLogout] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const fetchSites = async params => {
    return await useJwt
      .getGISAssetsTillDTR(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  useEffect(async () => {
    setAllSites('')
    setActive('1')

    const params = {
      project: uri[2],
      vertical: uri[1],
      site_type: 'tower'
    }
    const [statusCode, response] = await fetchSites(params)

    if (statusCode === 200) {
      const _sites = []
      for (const i of response.data.data.result.stat.dt_list) {
        _sites.push({ label: i.site_name, value: i.site_id })
      }

      setAllSites(_sites)
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      try {
        toast.warning(<Toast msg={response.data.detail} type='warning' />, { hideProgressBar: true })
      } catch (err) {
        toast.warning(<Toast msg={`Something went wrong to get all sites for ${uri[1]} - ${uri[2]}, Please reload the page`} type='warning' />, { hideProgressBar: true })
      }
    }
  }, [location.pathname])

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }

  return <>
    <Nav tabs>
      <NavItem>
        <NavLink active={active === '1'} onClick={() => { toggle('1') }}>
          EB / DG Allocation
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink active={active === '2'} onClick={() => { toggle('2') }}>
          Tariff
        </NavLink>
      </NavItem>
      {uri[1] !== 'coliving' && <NavItem>
        <NavLink active={active === '3'} onClick={() => { toggle('3') }}>
          Tower
        </NavLink>
      </NavItem>}
      <NavItem>
        <NavLink active={active === '4'} onClick={() => { toggle('4') }}>
          Associate / Dissociate
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink active={active === '5'} onClick={() => { toggle('5') }}>
          Daily deduction
        </NavLink>
      </NavItem>
      {uri[1] === 'coliving' && <NavItem>
        <NavLink active={active === '6'} onClick={() => { toggle('6') }}>
          Variable CAM
        </NavLink>
      </NavItem>}
      {/* <NavItem>
        <NavLink active={active === '6'} onClick={() => { toggle('6') }}>
          Miscellaneous bill
        </NavLink>
      </NavItem> */}
    </Nav>
    <TabContent className='py-50' activeTab={active}>
      <TabPane tabId='1'>
        {allSites && <EbDgAllocation tableName={'EB / DG allocation'} sites={allSites} active={active} />}
      </TabPane>
      <TabPane tabId='2'>
        {allSites && <TariffTable tableName={'Tariff Config/Unconfig meters'} sites={allSites} active={active} />}
      </TabPane>
      <TabPane tabId='3'>
        {allSites && <TowerConfiguration tableName={'Tower configuration'} sites={allSites} active={active} />}
      </TabPane>
      <TabPane tabId='4'>
        {allSites && <AssignDeassignTable tableName={'Associated / Dissociated meters'} sites={allSites} active={active} />}
      </TabPane>
      <TabPane tabId='5'>
        {allSites && <DailyDeduction tableName={'Configure daily deduction'} sites={allSites} active={active} />}
      </TabPane>
      {/* <TabPane tabId='6'>
        {allSites && <MiscellaneousServices tableName={'Miscellaneous services bill'} sites={allSites} active={active} />}
      </TabPane> */}
      <TabPane tabId='6'>
        <VariableCam tableName={'Variable CAM details'} active={active} />
      </TabPane>
    </TabContent>
  </>
}

export default Configuration