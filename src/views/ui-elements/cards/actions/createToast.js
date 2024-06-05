import { toast } from 'react-toastify'
import Avatar from '@components/avatar'
import { Check, X, AlertTriangle, Info } from 'react-feather'

const Toast = props => {
  const typedefine = props.type === 'danger' ? 'error' : props.type

  return (
    <div>
      <div className='toastify-header'>
        <div className='title-wrapper'>
          <Avatar
            size='sm'
            color={props.type}
            icon={
              props.type === 'success' ? (
                <Check size={12} />
              ) : props.type === 'danger' ? (
                <X size={12} />
              ) : props.type === 'info' ? (
                <Info size={12} />
              ) : props.type === 'warning' ? (
                <AlertTriangle size={12} />
              ) : (
                ''
              )
            }
          />
          <h6 className='toast-title'>
            {typedefine.charAt(0).toUpperCase()}
            {typedefine.slice(1)} !
          </h6>
        </div>
      </div>
      <div className='toastify-body'>
        <span role='img' aria-label='toast-text'>
          {props.msg}
        </span>
      </div>
    </div>
  )
}

export default Toast
