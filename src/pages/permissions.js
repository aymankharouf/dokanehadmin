import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors, permissionSections } from '../data/config'

const Permissions = props => {
  const { state } = useContext(StoreContext)
  const storeOwners = useMemo(() => state.customers.filter(c => c.storeId)
  , [state.customers])
  const newOwners = useMemo(() => state.customers.filter(c => c.storeName && !c.storeId)
  , [state.customers])
  const deliveryUsers = useMemo(() => state.customers.filter(c => c.permissionType)
  , [state.customers])
  const sections = useMemo(() => permissionSections.map(s => {
    return {
      ...s,
      count: s.id === 's' ? storeOwners.length : s.id === 'n' ? newOwners.length : deliveryUsers.length
    }
  })
  , [storeOwners, newOwners, deliveryUsers])
  let i = 0
  return(
    <Page>
      <Navbar title={labels.permissions} backLink={labels.back} />
      <Block>
        {sections.map(s => 
          <Button 
            text={`${s.name} ${s.count > 0 ? '(' + s.count + ')' : ''}`}
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={`/permission-list/${s.id}`} 
            key={s.id}
          />
        )}
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Permissions
