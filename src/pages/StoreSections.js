import React, {useContext } from 'react'
import { Button, Block, Page, Navbar, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const StoreSections = props => {
  const { state } = useContext(StoreContext)
  const store = state.stores.find(store => store.id === props.id)
  return (
    <Page>
      <Navbar title={`sections - ${store.name}`} backLink="Back" />
      <Block>
        {state.sections.map(section => {
          return (
            <Button large fill className="sections" color={state.randomColors[parseInt(section.id) % 13].name} href={`/storeSection/${store.id}/section/${section.id}`} key={section.id}>
              {section.name}
            </Button>
          )
        })}
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default StoreSections
