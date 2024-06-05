// ** Third Party Components
import PropTypes from 'prop-types'
import { Card, CardBody } from 'reactstrap'

const StatsVerticalWithFooter = ({ icon, color, stats, noBg, issubstring, avatar, statTitle, className, clas, click, ...rest }) => {
  return (
    <Card onClick={click} className={click ? 'cursor-pointer text-center' : 'text-center'}>
      <CardBody className={className}>
        {noBg ? (
          avatar ? (
            icon
          ) : (
            <div className={`avatar-content text-${color}`}>{icon}</div>
          )
        ) : (
          <div className={`avatar avatar-stats p-50 m-0 ${color ? `bg-light-${color}` : 'bg-light-primary'}`}>
            {avatar ? icon : <div className='avatar-content'>{icon}</div>}
          </div>
        )}
        <h2 className={`font-weight-bolder mb-0 ${clas}`} title={stats.length > 25 && stats}>
          {issubstring && stats.length > 25 ? `${stats.substring(0, 25)}... ` : stats}
        </h2>
        <p className='card-text line-ellipsis'>{statTitle}</p>
      </CardBody>
    </Card>
  )
}

export default StatsVerticalWithFooter

// ** PropTypes
StatsVerticalWithFooter.propTypes = {
  icon: PropTypes.element.isRequired,
  color: PropTypes.string.isRequired,
  stats: PropTypes.string.isRequired,
  statTitle: PropTypes.string.isRequired,
  className: PropTypes.string
}
