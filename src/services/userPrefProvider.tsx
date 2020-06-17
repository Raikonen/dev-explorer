import React, { useState } from 'react'

type UserPrefState = {
  nodeUrlMap: Record<string, string>,
  setNodeUrlMap: (newNodeUrlMap: Record<string, string>) => void,
}

export const UserPrefContext = React.createContext<UserPrefState | null>(null)

export const UserPrefProvider: React.FC = (props) => {

  const [state, setState] = useState<UserPrefState>({
    nodeUrlMap: localStorage.getItem('nodeUrlMap')
      ? JSON.parse(localStorage.getItem('nodeUrlMap')!)
      : {},
    setNodeUrlMap: (newNodeUrlMap: { [key: string]: string }) => {
      localStorage.setItem('nodeUrlMap', JSON.stringify(newNodeUrlMap))
      setState({ ...state, nodeUrlMap: newNodeUrlMap })
    },
  })

  return <UserPrefContext.Provider value={state}>
    {props.children}
  </UserPrefContext.Provider>
}