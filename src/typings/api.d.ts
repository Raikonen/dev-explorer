import { DsBlockObj, TxBlockObj, TransactionObj, TxList } from '@zilliqa-js/core/src/types'
import { Transaction } from '@zilliqa-js/account/src/transaction'
import { Value } from '@zilliqa-js/blockchain/src/chain'

export interface DsBlockObjWithHash extends DsBlockObj {
  Hash: string
}

export interface MappedDSBlockListing {
  data: DsBlockObjWithHash[],
  maxPages: number,
}

export interface TxBlockObjWithTxnHashes extends TxBlockObj {
  txnHashes: string[]
}

export interface MappedTxBlockListing {
  data: TxBlockObj[],
  maxPages: number,
}

export interface MappedTxBlock extends TxBlockObj {
  txnHashes: string[]
}

export interface TransactionWithTxnHash extends Transaction {
  hash: string
}

export interface TransactionDetails extends TransactionObj {
  hash: string,
  contractAddr?: string,
}

export interface InitParam {
  type: string,
  value: string,
  vname: string,
}

export interface ContractData {
  code: string,
  initParams: Value[],
  state: any,
}

export interface MappedTxList extends TxList {
  txnBodies: TransactionObj[],
}

export interface AccData {
  balance: number,
  nonce: number,
}

export interface AccContract {
  address: string,
  state: any,
}

type AccContracts = AccContract[]