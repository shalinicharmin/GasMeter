import AccessControl from '@src/views/project/coliving/module/accessControl';
import BillAnalysis from '@src/views/project/coliving/module/billAnalysis';
import Coliving_issues from './module/coliving_issues';
import Error from '@src/views/Error';
import Category_issue_creation from './module/colivingissues_category_creation';
import MeterConfigDashboard from '../commonModules/meterConfigDashboard';
import MeterConfigurationColiving from './module/meterConfigurationColiving';
import HealthPortal from '@src/views/project/coliving/module/healthPortal';
import ReportSection from '@src/views/project/coliving/module/reportSection';
import Configuration from '@src/views/project/coliving/module/configuration';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Analytics from './module/analytics';
import RentDeduction from './module/rentDeduction';
import BulkCommand from './module/bulkCommand';

const ColivingProject = (props) => {
  const location = useLocation();
  const uri = location.pathname.split('/');
  const [project, setproject] = useState(uri[2]);
  // console.log('props Name')
  // console.log(project)

  useEffect(() => {
    setproject(uri[2]);
  });

  return (
    <>
      {props.module === 'owner-access-control' ? (
        <AccessControl />
      ) : props.module === 'bill-analysis' ? (
        <BillAnalysis />
      ) : props.module === 'issue-management' ? (
        <Coliving_issues />
      ) : props.module === 'issue-category-creation' ? (
        <Category_issue_creation />
      ) : props.module === 'meter-configuration' ? (
        <MeterConfigurationColiving />
      ) : props.module === 'health-portal' ? (
        <HealthPortal />
      ) : props.module === 'analytics' ? (
        <Analytics />
      ) : props.module === 'rent-collection' ? (
        <RentDeduction />
      ) : props.module === 'configuration' ? (
        <Configuration />
      ) : props.module === 'bulk-command' ? (
        <BulkCommand />
      ) : (
        <Error />
      )}
    </>
  );
};

export default ColivingProject;
