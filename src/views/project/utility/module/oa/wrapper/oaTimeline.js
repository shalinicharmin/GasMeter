// ** Third Party Components
import Proptypes from 'prop-types'
import classnames from 'classnames'

const Timeline = props => {
  // ** Props
  const { data, tag, className } = props

  // ** Custom Tagg
  const Tag = tag ? tag : 'ul'

  return (
    <Tag
      className={classnames('timeline', {
        [className]: className
      })}>
      {data.map((item, i) => {
        const ItemTag = item.tag ? item.tag : 'li'

        return (
          <ItemTag
            key={i}
            className={classnames('timeline-item pb-1', {
              [item.className]: className
            })}>
            <span
              className={classnames('timeline-point', {
                [`timeline-point-${item.color}`]: item.color,
                'timeline-point-indicator': !item.icon
              })}>
              {item.icon ? item.icon : null}
            </span>
            <div className='timeline-event'>
              <div className={classnames('d-flex justify-content-between flex-sm-row flex-column')}>
                <h6>{item.title}</h6>
                <small>{item.date_time}</small>
              </div>
              <p
                className={classnames({
                  'mb-0': i === data.length - 1 && !item.customContent
                })}>
                {item.content}
              </p>
              {item.customContent ? item.customContent : null}
            </div>
          </ItemTag>
        )
      })}
    </Tag>
  )
}

export default Timeline

// ** PropTypes
Timeline.propTypes = {
  data: Proptypes.array.isRequired,
  className: Proptypes.string,
  tag: Proptypes.string
}
