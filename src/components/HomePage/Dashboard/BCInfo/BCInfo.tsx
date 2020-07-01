import React, { useState, useEffect, useContext } from 'react'
import { Container, Row, Col, Card, Spinner, Tooltip, OverlayTrigger } from 'react-bootstrap'

import { QueryPreservingLink } from 'src'
import { NetworkContext } from 'src/services/networkProvider'
import { BlockchainInfo } from '@zilliqa-js/core/src/types'
import { refreshRate } from 'src/constants'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

import './BCInfo.css'

interface BCInfoState {
  startTxBlock: number | null,
  maxTPS: number | null,
  maxTPSTxBlockNum: number | null,
  maxTxnCount: number | null,
  maxTxnCountTxBlockNum: number | null
}

const defaultBCInfoState = {
  startTxBlock: null,
  maxTPS: null,
  maxTPSTxBlockNum: null,
  maxTxnCount: null,
  maxTxnCountTxBlockNum: null
}

const BCInfo: React.FC = () => {

  const networkContext = useContext(NetworkContext)
  const { dataService, nodeUrl } = networkContext!

  const [data, setData] = useState<BlockchainInfo | null>(null)
  const [state, setState] = useState<BCInfoState>(defaultBCInfoState)

  useEffect(() => { setData(null); setState(defaultBCInfoState) }, [nodeUrl]) // Unset data on url change

  useEffect(() => {
    if (!data) return

    setState((prevState: BCInfoState) => {
      const newState: BCInfoState = { ...prevState }
      if (!prevState.startTxBlock)
        newState.startTxBlock = parseInt(data.NumTxBlocks, 10) - 1
      if (!prevState.maxTPS || prevState.maxTPS <= data.TransactionRate) {
        newState.maxTPS = data.TransactionRate
        newState.maxTPSTxBlockNum = parseInt(data.NumTxBlocks, 10) - 1
      }
      if (!prevState.maxTxnCount || prevState.maxTxnCount <= parseInt(data.NumTxnsTxEpoch, 10)) {
        newState.maxTxnCount = parseInt(data.NumTxnsTxEpoch, 10)
        newState.maxTxnCountTxBlockNum = parseInt(data.NumTxBlocks, 10) - 1
      }
      return newState
    })
  }, [data])

  // Fetch data
  useEffect(() => {
    let isCancelled = false
    if (!dataService) return

    let receivedData: BlockchainInfo
    const getData = async () => {
      try {
        receivedData = await dataService.getBlockchainInfo()
        if (!isCancelled && receivedData)
          setData(receivedData)
      } catch (e) {
        if (!isCancelled)
          console.log(e)
      }
    }
    getData()
    const getDataTimer = setInterval(async () => {
      await getData()
    }, refreshRate)
    return () => {
      isCancelled = true
      clearInterval(getDataTimer)
    }
  }, [dataService])

  return <>
    <Card className='bcstats-card'>
      <Card.Body>
        {data
          ? <Container>
            <Row className='mb-3'>
              <Col>
                <span className='bcstats-header'>Current Tx Block:</span>
                <br />
                <span>{parseInt(data.NumTxBlocks).toLocaleString('en')}</span>
              </Col>
              <Col>
                <span className='bcstats-header'>Number of Transactions:</span>
                <br />
                <span>{parseInt(data.NumTransactions).toLocaleString('en')}</span>
              </Col>
              <Col>
                <span className='bcstats-header'>Peers:</span>
                <br />
                <span>{data.NumPeers.toLocaleString('en')}</span>
              </Col>
              <Col>
                <span className='bcstats-header'>Sharding Structure:</span>
                <br />
                <span>[{data.ShardingStructure.NumPeers.toString()}]</span>
              </Col>
            </Row>
            <Row className='mb-3'>
              <Col>
                <span className='bcstats-header'>Current DS Epoch:</span>
                <br />
                <span>{parseInt(data.CurrentDSEpoch).toLocaleString('en')}</span>
              </Col>
              <Col>
                <span className='bcstats-header'>DS Block Rate:</span>
                <br />
                <span>{data.DSBlockRate.toFixed(5)}</span>
              </Col>
              <Col>
                <span className='bcstats-header'>Tx Block Rate:</span>
                <br />
                <span>{data.TxBlockRate.toFixed(5)}</span>
              </Col>
              <Col>
                <span className='bcstats-header'>TPS:</span>
                <br />
                <span>{data.TransactionRate.toFixed(5)}</span>
              </Col>
            </Row>
            <Row>
              <Col>
                <span className='bcstats-header'>Number of Txns in DS Epoch:</span>
                <br />
                <span>{parseInt(data.NumTxnsDSEpoch).toLocaleString('en')}</span>
              </Col>
              <Col>
                <span className='bcstats-header'>Number of Txns in Txn Epoch:</span>
                <br />
                <span>{parseInt(data.NumTxnsTxEpoch).toLocaleString('en')}</span>
              </Col>
              <Col>
                <OverlayTrigger placement='left'
                  overlay={<Tooltip id={'tt'}>This statistic is accurate from TxBlock {state.startTxBlock}. Requires user to stay on the Home Page</Tooltip>}>
                  <FontAwesomeIcon className='info-icon' icon={faInfoCircle} />
                </OverlayTrigger>
                {' '}
                <span className='bcstats-header'>Recent Max Observed TPS:</span>
                <br />
                <span>{state.maxTPS && state.maxTPS.toFixed(5)}</span>
                <span>
                  {' '}
                  <small className='txblock-subtext'>
                    (on TxBlock <QueryPreservingLink to={`/txbk/${state.maxTPSTxBlockNum}`}>{state.maxTPSTxBlockNum}</QueryPreservingLink>)
                  </small>
                </span>
              </Col>
              <Col>
                <OverlayTrigger placement='left'
                  overlay={<Tooltip id={'tt'}>This statistic is accurate from TxBlock {state.startTxBlock}. Requires user to stay on the Home Page</Tooltip>}>
                  <FontAwesomeIcon className='info-icon' icon={faInfoCircle} />
                </OverlayTrigger>
                {' '}
                <span className='bcstats-header'>Recent Max Observed Txn Count:</span>
                <br />
                <span>{state.maxTxnCount}
                  {' '}
                  <small className='txblock-subtext'>
                    (on TxBlock <QueryPreservingLink to={`/txbk/${state.maxTxnCountTxBlockNum}`}>{state.maxTxnCountTxBlockNum}</QueryPreservingLink>)
                  </small>
                </span>
              </Col>
            </Row>
          </Container>
          : <Spinner animation="border" role="status" />
        }
      </Card.Body>
    </Card>
  </>
}

export default BCInfo
