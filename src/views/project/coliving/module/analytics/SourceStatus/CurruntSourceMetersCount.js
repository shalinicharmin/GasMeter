import React, { useState, useEffect, useRef } from 'react'
import useJwt from '@src/auth/jwt/useJwt'

function CurruntSourceMetersCount(props) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])
  const [error, setError] = useState(false)
  const [count, setCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [percentage, setPercentage] = useState(-1)
  const childRef = useRef()

  useEffect(async () => {
    setIsLoading(true)
    try {
      const res = await useJwt.getSourceStatusMeters({
        siteId: props.site.site_id
      })
      setData(res.data.data.result)
    } catch (err) {
      // console.log(err);
      setError(true)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    setCount(
      data.reduce((i, j) => {
        if (j.currentSource === props.site.running_source) {
          return i + 1
        }
        return i
      }, 0)
    )
    setTotalCount(
      data.reduce((i, j) => {
        return i + 1
      }, 0)
    )
    setPercentage(
      (
        (data.reduce((i, j) => {
          if (j.currentSource === props.site.running_source) {
            return i + 1
          }
          return i
        }, 0) /
          data.reduce((i, j) => {
            return i + 1
          }, 0)) *
        100
      ).toFixed(2)
    )
  }, [data])

  useEffect(() => {
    try {
      if (percentage < 100 && percentage !== -1) {
        // childRef.current.parentNode.parentNode.parentNode.style.backgroundColor =
        //   "#ea54551f";
        childRef.current.parentNode.parentNode.parentNode.style.color = '#ea5455'
      } else {
        // childRef.current.parentNode.parentNode.parentNode.style.backgroundColor =
        //   "#white";
        childRef.current.parentNode.parentNode.parentNode.style.color = '#black'
      }
    } catch (err) {}
    props.site.percentage = percentage
  }, [childRef, percentage, count])

  return (
    <>
      {isLoading ? (
        <div className='dot-pulse' data-tag='allowRowEvents'>
          {props.siteId}
        </div>
      ) : !error ? (
        <div className='d-flex gap-1' data-tag='allowRowEvents' ref={childRef}>
          <span style={{ display: 'block', minWidth: '40px', textAlign: 'end' }} data-tag='allowRowEvents'>
            {count} / {totalCount}
          </span>
          <span style={{ display: 'block', width: '60px', textAlign: 'end' }} data-tag='allowRowEvents'>
            {`${percentage} %`}
          </span>
        </div>
      ) : (
        <small className='text-danger' data-tag='allowRowEvents'>
          Error
        </small>
      )}
    </>
  )
}

export default CurruntSourceMetersCount
