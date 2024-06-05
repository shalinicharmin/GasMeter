import React, { useState, useEffect } from 'react'
import '@src/views/project/userAccessPanel/ReactTagsWrapper/tags.scss'
import { Label } from 'reactstrap'

const TagsInput = props => {
  const { tags } = props
  const [isDeleted, setIsDeleted] = useState(false)
  // console.log('>>>>>>>>', tags)

  // const removeTags = indexToRemove => {
  //   console.log(indexToRemove)
  //   console.log('before', tags)

  //   tags.splice(indexToRemove, 1)
  //   console.log('after', tags)

  //   setIsDeleted(true)
  // }

  const addTags = event => {
    if (event.target.value !== '') {
      setTags([...tags, event.target.value])
      // props.selectedTags([...tags, event.target.value])
      event.target.value = ''
    }
  }
  return (
    <>
      <Label for='selectvertical'>Tags</Label>
      <div className='tags-input'>
        <ul id='tags'>
          {tags &&
            tags.length > 0 &&
            tags.map((tag, index) => (
              <li key={index} className='tag'>
                <span className='tag-title'>{tag.value}</span>
                <span className='tag-close-icon' onClick={() => removeTags(index)}>
                  x
                </span>
              </li>
            ))}
        </ul>

        {/* <input type='text' onKeyUp={event => (event.key === 'Enter' ? addTags(event) : null)} placeholder='Press enter to add tags' /> */}
      </div>
    </>
  )
}

export default TagsInput
