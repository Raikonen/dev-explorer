import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { Form, InputGroup, Button, Dropdown, DropdownButton } from 'react-bootstrap'

import './Searchbar.css'

const Searchbar = (props: any) => {
  const [input, setInput] = useState("")
  const [searchType, setSearchType] = useState('Transaction')
  const { history } = props

  const handleChange = (e: any) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: any) => {
    switch(searchType) {
      case 'Transaction':
        history.push(`/tx/${input}`)
        break
      case 'Tx Block':
          history.push(`/txbk/${input}`)
      break
      case 'DS Block':
          history.push(`/dsbk/${input}`)
      break
      case 'Address':
        break
    }
    e.preventDefault()
  }

  return <>
    <Form onSubmit={handleSubmit}>
      <InputGroup className="searchbar-ig" id="contractAddress">
        <InputGroup.Prepend>
          <DropdownButton variant="outline-secondary" id='searchbar-dropdown' title={searchType}>
            <Dropdown.Item onClick={() => setSearchType('Transaction')}>Transaction</Dropdown.Item>
            <Dropdown.Item onClick={() => setSearchType('Tx Block')}>Tx Block</Dropdown.Item>
            <Dropdown.Item onClick={() => setSearchType('DS Block')}>DS Block</Dropdown.Item>
            <Dropdown.Item onClick={() => setSearchType('Address')}>Address</Dropdown.Item>
          </DropdownButton>
        </InputGroup.Prepend>
        <Form.Control type="text" value={input} autoFocus
          placeholder="Search for a transaction, an address or a block" onChange={handleChange} />
        <InputGroup.Append>
          <Button type="submit" variant="outline-secondary">
            <div>Search</div>
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  </>
}

export default withRouter(Searchbar)
