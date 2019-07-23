import React, { useContext } from 'react'
import { Button, Block, Page, Navbar, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const StoreCategories = props => {
  const { state } = useContext(StoreContext)
  const categories = state.categories.filter(category => category.section === props.sectionId)
  const section = state.sections.find(section => section.id === props.sectionId)
  const store = state.stores.find(store => store.id === props.storeId)
  return(
    <Page>
      <Navbar title={`${section.name} - ${store.name}`} backLink="Back" />
      <Block>
        {categories && categories.map(category => {
          return (
            <Button large fill className="sections" color={state.randomColors[parseInt(category.id) % 13].name} href={`/storeCategory/${store.id}/category/${category.id}`} key={category.id}>
              {category.name}
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
export default StoreCategories
