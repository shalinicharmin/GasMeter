import Error from '@src/views/Error';
import HealthPortal from '@src/views/project/coliving/module/healthPortal';
import ReportSection from '@src/views/project/coliving/module/reportSection';
import Configuration from '@src/views/project/coliving/module/configuration';
import Analytics from '@src/views/project/coliving/module/analytics';
import BulkCommand from '../coliving/module/bulkCommand';

const RealEstateProject = (props) => {
  return (
    <>
      {props.module === 'health-portal' ? (
        <HealthPortal />
      ) : props.module === 'report-section' ? (
        <ReportSection />
      ) : props.module === 'configuration' ? (
        <Configuration />
      ) : props.module === 'analytics' ? (
        <Analytics />
      ) : props.module === 'bulk-command' ? (
        <BulkCommand />
      ) : (
        <Error />
      )}
    </>
  );
};

export default RealEstateProject;
