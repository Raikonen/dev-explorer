/* 
  Available Async Functions
  
  Blockchain-related:
  1) getBlockchainInfo(): Promise<BlockchainInfo>

  DSBlocks-related:
  1) getNumDSBlocks(): Promise<number>
  2) getDSBlockDetails(blockNum: number): Promise<DsBlockObj>
  3) getLatest5DSBlocks(): Promise<DsBlockObj[]>
  4) getDSBlocksListing(pageNum: number): Promise<MappedDSBlockListing>

  TxBlocks-related:
  1) getNumTxBlocks(): Promise<number>
  2) getTxBlockDetails(blockNum: number): Promise<MappedTxBlock>
  3) getLatest5TxBlocks(): Promise<TxBlockObj[]>
  4) getTxBlocksListing(pageNum: number): Promise<MappedTxBlockListing>
  
  Transactions-related:
  1) getLatest5ValidatedTransactions(): Promise<TransactionObj[]>
  2) getTransactionOwner(txnHash: string): Promise<string>
  3) getTransactionDetails(txnHash: string): Promise<TransactionDetails>
  4) getTransactionsForTxBlock(blockNum: number): Promise<string[]>
  5) getTransactionsDetails(txnHashes: string[]): Promise<TransactionObj[]>
  6) getRecentTransactions(): Promise<TxList>
  7) getLatest5PendingTransactions(): Promise<PendingTxns[]>

  Account-related:
  1) getAccData(accAddr: string): Promise<AccData>
  2) getAccContracts(accAddr: string): Promise<AccContracts>

  Contract-related:
  1) getContractAddrFromTransaction(txnHash: string): Promise<string>
  2) getTxnIdFromContractData(contractData: ContractData): Promise<string>
  3) getContractData(contractAddr: string): Promise<ContractData>
    
  Util:
  1) isIsolatedServer(): Promise<boolean>
  2) isContractAddr(addr: string): Promise<boolean>

  Isolated Server-related:
  1) getISInfo(): Promise<any>

*/

// Mainnet: https://api.zilliqa.com/
// Testnet: https://dev-api.zilliqa.com/
// Isolated Server: https://zilliqa-isolated-server.zilliqa.com/
// Staging Isolated Server: https://stg-zilliqa-isolated-server.zilliqa.com/

import { Zilliqa } from '@zilliqa-js/zilliqa'
import { BlockchainInfo, DsBlockObj, TransactionObj, TxBlockObj, TxList, PendingTxns } from '@zilliqa-js/core/src/types'
// import { Transaction } from '@zilliqa-js/account/src/transaction'
import { ContractObj } from '@zilliqa-js/contract/src/types'
import {
  MappedTxBlock, MappedDSBlockListing, MappedTxBlockListing, TransactionDetails, ContractData,
  AccData, AccContracts, DsBlockObjWithHash, TxBlockObjWithTxnHashes, TransactionWithTxnHash
} from 'src/typings/api'

import { hexAddrToZilAddr } from 'src/utils/Utils'

export class DataService {
  zilliqa: Zilliqa;
  nodeUrl: string;

  constructor(nodeUrl: string | null) {
    if (nodeUrl) {
      this.nodeUrl = nodeUrl
      this.zilliqa = new Zilliqa(nodeUrl)
    }
    else {
      this.nodeUrl = 'https://api.zilliqa.com/'
      this.zilliqa = new Zilliqa('https://api.zilliqa.com/')
    }
  }

  //================================================================================
  // Blockchain-related
  //================================================================================

  async getBlockchainInfo(): Promise<BlockchainInfo | undefined> {
    try {
      const response = await this.zilliqa.blockchain.getBlockChainInfo()
      return response.result as BlockchainInfo
    } catch (e) {
      console.log(e)
    }
  }

  //================================================================================
  // DSBlocks-related
  //================================================================================

  async getNumDSBlocks(): Promise<number | undefined> {
    console.log("getting number of DS blocks")
    try {
      const response = await this.zilliqa.blockchain.getNumDSBlocks()
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      return parseInt(response.result, 10)
    } catch (e) {
      console.log(e)
    }
  }

  async getDSBlockDetails(blockNum: number): Promise<DsBlockObj | undefined> {
    console.log("getting DS block details")
    try {
      const response = await this.zilliqa.blockchain.getDSBlock(blockNum)
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      if (parseInt(response.result.header.BlockNum, 10) !== blockNum)
        throw new Error('Invalid DS Block Number')
      return response.result as DsBlockObj
    } catch (e) {
      console.log(e)
    }
  }

  async getLatest5DSBlocks(): Promise<DsBlockObj[] | undefined> {
    console.log("getting 5 ds blocks")
    try {
      const response = await this.zilliqa.blockchain.getDSBlockListing(1)
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }

      const DSBlockListing = response.result.data.slice(0, 5)
      // Map DSBlock with header info
      const output = await Promise.all(DSBlockListing.map(async block => {
        const response = await this.zilliqa.blockchain.getDSBlock(block.BlockNum)
        if (response.error !== undefined) {
          throw new Error(response.error.message)
        }
        return response.result as DsBlockObj
      }))
      return output as DsBlockObj[]
    } catch (e) {
      console.log(e)
    }
  }

  async getDSBlocksListing(pageNum: number): Promise<MappedDSBlockListing | undefined> {
    console.log("getting ds blocks")
    const response = await this.zilliqa.blockchain.getDSBlockListing(pageNum)
    if (response.error !== undefined) {
      throw new Error(response.error.message)
    }
    const blockListData = response.result.data

    // Map DSBlock with header info
    const blockData = await Promise.all(blockListData.map(async block => {
      const response = await this.zilliqa.blockchain.getDSBlock(block.BlockNum)
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      return {
        ...response.result,
        Hash: block.Hash
      } as DsBlockObjWithHash
    }))
    return {
      maxPages: response.result.maxPages,
      data: blockData
    }
  }

  //================================================================================
  // TxBlocks-related
  //================================================================================

  async getNumTxBlocks(): Promise<number | undefined> {
    console.log("getting number of tx blocks")
    try {
      const response = await this.zilliqa.blockchain.getNumTxBlocks()
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      return parseInt(response.result, 10)
    } catch (e) {
      console.log(e)
    }
  }

  async getTxBlockDetails(blockNum: number): Promise<TxBlockObjWithTxnHashes | undefined> {
    console.log("getting tx block details")
    try {
      const response = await this.zilliqa.blockchain.getTxBlock(blockNum)
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      if (parseInt(response.result.header.BlockNum, 10) !== blockNum)
        throw new Error('Invalid Tx Block Number')
      const txnHashes = await this.getTransactionsForTxBlock(blockNum)
      // return { ...response.result, txnHashes: txnHashes} as TxBlockObjWithTxnHashes
      return { ...response.result, txnHashes: txnHashes } as any
    } catch (e) {
      console.log(e)
    }
  }

  async getLatest5TxBlocks(): Promise<TxBlockObj[] | undefined> {
    console.log("getting 5 tx blocks")
    try {
      const response = await this.zilliqa.blockchain.getTxBlockListing(1)
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }

      const txBlockListing = response.result.data.slice(0, 5)
      // Map DSBlock with header info
      const output = await Promise.all(txBlockListing.map(async block => {
        const response = await this.zilliqa.blockchain.getTxBlock(block.BlockNum)
        if (response.error !== undefined) {
          throw new Error(response.error.message)
        }
        return response.result as any
      }))
      return output as TxBlockObj[]
    } catch (e) {
      console.log(e)
    }
  }

  async getTxBlocksListing(pageNum: number): Promise<MappedTxBlockListing | undefined> {
    console.log("getting tx blocks")
    try {
      const response = await this.zilliqa.blockchain.getTxBlockListing(pageNum)
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      const blockListData = response.result.data
      // Map TxBlock with header info
      const blockData = await Promise.all(blockListData.map(async block => {
        const response = await this.zilliqa.blockchain.getTxBlock(block.BlockNum)
        if (response.error !== undefined) {
          throw new Error(response.error.message)
        }
        return response.result as any
      })) as TxBlockObj[]
      return {
        maxPages: response.result.maxPages,
        data: blockData
      }
    } catch (e) {
      console.log(e)
    }
  }

  //================================================================================
  // Transactions-related
  //================================================================================

  async getLatest5ValidatedTransactions(): Promise<TransactionWithTxnHash[] | undefined> {
    console.log("getting 5 validated tx")
    try {
      const response = await this.zilliqa.blockchain.getRecentTransactions()

      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      const txnHashes: string[] = response.result.TxnHashes.slice(0, 5)
      // Map txnHash to transaction info
      const output = await Promise.all(txnHashes.map(async txnHash => {
        const txn = await this.zilliqa.blockchain.getTransaction(txnHash)
        // return { ...txn, hash: txnHash } as TransactionWithTxnHash
        return { ...txn, hash: txnHash } as any
      }))
      return output as TransactionWithTxnHash[]
    } catch (e) {
      console.log(e)
    }
  }

  async getTransactionOwner(txnHash: string): Promise<string | undefined> {
    console.log("getting transaction owner")
    try {
      const txn = await this.zilliqa.blockchain.getTransaction(txnHash.substring(2))
      return hexAddrToZilAddr(txn.senderAddress)
    } catch (e) {
      console.log(e)
    }
  }

  async getTransactionDetails(txnHash: string): Promise<TransactionDetails | undefined> {
    console.log("getting transaction details")
    try {
       // Add txn hash
      const txn = await this.zilliqa.blockchain.getTransaction(txnHash.substring(2))
      // const txnWithHash = { ...txn, hash: txnHash} as TransactionWithTxnHash
      const txnWithHash = { ...txn, hash: txnHash} as any
      // Add contract address if contract creation
      const contractAddr = await this.getContractAddrFromTransaction(txnHash.substring(2))
      if (contractAddr)
        return { ...txnWithHash, contractAddr: contractAddr } as TransactionDetails
      return txnWithHash as TransactionDetails
      } catch (e) {
        console.log(e)
      }
  }

  async getTransactionsForTxBlock(blockNum: number): Promise<string[] | undefined> {
    console.log("getting transactions for Tx block")
    try {
      const response = await this.zilliqa.blockchain.getTransactionsForTxBlock(blockNum)
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      else return response.result.flat()
    } catch (e) {
      console.log(e)
    }
  }

  async getTransactionsWithHash(txnHashes: string[]): Promise<TransactionWithTxnHash[] | undefined> {
    console.log("getting transactions with hash")
    try {
      const output = await Promise.all(txnHashes.map(async txnHash => {
        const txn = await this.zilliqa.blockchain.getTransaction(txnHash)
        // return { ...txn, hash: txnHash } as TransactionWithTxnHash
        return { ...txn, hash: txnHash } as any
      }))
      return output as TransactionWithTxnHash[]
    } catch (e) {
      console.log(e)
    }
  }

  async getRecentTransactions(): Promise<TxList | undefined> {
    console.log("getting recent transactions")
    try {
      const response = await this.zilliqa.blockchain.getRecentTransactions()
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      return response.result as TxList
    } catch (e) {
      console.log(e)
    }
  }

  async getLatest5PendingTransactions(): Promise<PendingTxns | undefined> {
    console.log("getting 5 pending tx")
    try {
      const response = await this.zilliqa.blockchain.getPendingTxns()
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      return response.result as PendingTxns
    } catch (e) {
      console.log(e)
    }
  }

  //================================================================================
  // Account-related
  //================================================================================

  async getAccData(accAddr: string): Promise<AccData | undefined> {
    console.log('getting balance')
    try {
      const response = await this.zilliqa.blockchain.getBalance(accAddr)
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      return response.result as AccData
    } catch (e) {
      console.log(e)
    }
  }

  async getAccContracts(accAddr: string): Promise<ContractObj[] | undefined> {
    console.log('getting smart contracts for addr')
    try {
      const response = await this.zilliqa.blockchain.getSmartContracts(accAddr)
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      return response.result as any
    } catch (e) {
      console.log(e)
    }
  }

  //================================================================================
  // Contract-related
  //================================================================================

  async getContractAddrFromTransaction(txnHash: string): Promise<string | undefined> {
    console.log('getting smart contracts addr')
    try {
      const response = await this.zilliqa.blockchain.getContractAddressFromTransactionID(txnHash)
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      return response.result as string 
    } catch (e) {
      console.log(e)
    }
  }

  async getTxnIdFromContractData(contractData: ContractData): Promise<string | undefined> {
    console.log('getting transaction id from contract data')
    try {
      const creationBlockData = await this.getTxBlockDetails(
        parseInt(contractData.initParams.filter(x => x.vname === '_creation_block')[0].value))
      if (creationBlockData === undefined) return
      const contractAddrs = await Promise.all(creationBlockData.txnHashes.map(async (txnHash: string) => {
        const contractAddr = await this.getContractAddrFromTransaction(txnHash)
        return '0x' + contractAddr
      }))
      return '0x' + creationBlockData.txnHashes[contractAddrs.indexOf(
        contractData.initParams.filter(x => x.vname === '_this_address')[0].value)]
    } catch (e) {
      console.log(e)
    }
  }

  async getContractData(contractAddr: string): Promise<ContractData | undefined> {
    console.log('getting contract data')
    try {
      const contractCode = async () => await this.zilliqa.blockchain.getSmartContractCode(contractAddr)
      const contractInit = async () => await this.zilliqa.blockchain.getSmartContractInit(contractAddr)
      const contractState = async () => await this.zilliqa.blockchain.getSmartContractState(contractAddr)
  
      const res = await Promise.all([contractCode(), contractInit(), contractState()])
      if (res[0].error !== undefined) {
        throw new Error(res[0].error.message)
      }
      if (res[1].error !== undefined) {
        throw new Error(res[1].error.message)
      }
      if (res[2].error !== undefined) {
        throw new Error(res[2].error.message)
      }
      return { code: res[0].result.code, initParams: res[1].result, state: res[2].result }
    } catch (e) {
      console.log(e)
    }
  }

  //================================================================================
  // Util
  //================================================================================

  /* Until we find a better way to differentiate an isolated server, we will differentiate based
    on the available API i.e. getBlockChainIfo */
  async isIsolatedServer(): Promise<boolean | undefined> {
    console.log('check whether connected to isolated server')
    try {
      const response = await this.zilliqa.blockchain.getBlockChainInfo()
      if (response.error !== undefined) {
        throw new Error(response.error.message)
      }
      if (response.result) {
        return false
      }
      return true
    } catch (e) {
      console.log(e)
    }
  }

  /* Until we find a better way to differentiate an account address from a smart contract address, we will differentiate based
    on the the response error message if any */
  async isContractAddr(addr: string): Promise<boolean | undefined> {
    console.log('check whether is smart contract')
    try {
      const response = await this.zilliqa.blockchain.getSmartContractInit(addr)
      if (!response.error)
        return true
      else if (response.error.message === 'Address not contract address')
        return false
      else
        throw new Error('Invalid Address')
    } catch (e) {
      console.log(e)
    }  }

  //================================================================================
  // Isolated Server-related
  // WIP
  //================================================================================

  async getISInfo(): Promise<any> {
    console.log('getting isolated server info')

    const getBlockNum = async () => {
      const response = await fetch(this.nodeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "id": "1",
          "jsonrpc": "2.0",
          "method": "GetBlocknum",
          "params": [""]
        })
      });
      return response.json()
    }

    const getMinGasPrice = async () => await this.zilliqa.blockchain.getMinimumGasPrice()

    const res = await Promise.all([getBlockNum(), getMinGasPrice()])
    const output = {
      minGasPrice: res[1].result
    }
    return output

  }
}
