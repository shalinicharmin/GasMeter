import React, { useState } from 'react'
import IssuesCard from './issuesCard'
import IssuesTable from './issuesTable'

const Coliving_issues = () => {
  const [render, setRender] = useState(false)
  const [id, setID] = useState(undefined)
  return <div>{render ? <IssuesTable back={setRender} categoryId={id} /> : <IssuesCard click={setRender} issueId={setID} />}</div>
}

export default Coliving_issues
