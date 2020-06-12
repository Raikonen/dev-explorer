import React from 'react'
import { useTable, HeaderGroup, Column, Row, Cell } from 'react-table'

import { DsBlockObj, TxBlockObj, TransactionObj, TransactionStatus } from '@zilliqa-js/core/src/types'

import './DisplayTable.css'

interface IDisplayTableParams<T extends object> {
  columns: Array<Column<T>>;
  data: T[];
  processMap?: Map<string, <T>(original: T) => T>
}

// React Table for DSBlocks, TxBlocks and TransactionObj on Dashboard 
const DisplayTable: React.FC<IDisplayTableParams<DsBlockObj | TxBlockObj | TransactionObj | TransactionStatus>> =
  ({ columns, data, processMap }) => {
    const { getTableProps, headerGroups, rows, prepareRow } = useTable<DsBlockObj | TxBlockObj | TransactionObj | TransactionStatus>({
      columns,
      data,
    })

    return (
      <div className='display-table'>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup: HeaderGroup<DsBlockObj | TxBlockObj | TransactionObj | TransactionStatus>) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()} id={column.id}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row: Row<DsBlockObj | TxBlockObj | TransactionObj | TransactionStatus>) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell: Cell<DsBlockObj | TxBlockObj | TransactionObj | TransactionStatus>) => {
                    if (processMap) {
                      const procFunc = processMap.get(cell.column.id)
                      if (procFunc != null)
                        cell.value = procFunc(cell.value)
                    }
                    return (
                      <td {...cell.getCellProps()}>
                        {cell.value}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

export default DisplayTable
