import React, { useContext } from 'react'
import { Button, Block } from 'framework7-react'
import { StoreContext } from '../data/Store';

const Sections = props => {
  const { state } = useContext(StoreContext)
  const sections = [
    {id: '1', name: 'الطلبات', path: 'orders'},
    {id: '2', name: 'المنتجات واﻻسعار', path: 'stores'},
    {id: '3', name: 'العملاء', path: 'customers'},
    {id: '4', name: 'المستودع', path: 'inventory'}
  ]

  let i = 0
  return (
    <Block>
      {sections.map(section => {
        return (
          <Button large fill className="sections" color={state.randomColors[i++ % 13].name} href={`/${section.path}/`} key={section.id}>
            {section.name}
          </Button>
        )
      })}
    </Block>
  )

}
export default Sections
