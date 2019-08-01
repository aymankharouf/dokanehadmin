import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const SectionCategories = props => {
  const { state } = useContext(StoreContext)
  const section = state.sections.find(rec => rec.id === props.id)
  const categories = state.categories.filter(rec => rec.sectionId === props.id)
  const handleAdd = () => {
    props.f7router.navigate(`/addCategory/${props.id}`)
  }

  return (
    <Page>
      <Navbar title={`Categories - ${section.name}`} backLink="Back" />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => handleAdd()}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Block>
          <List>
            {categories && categories.map(rec =>
              <ListItem title={rec.name} key={rec.id}>
              </ListItem>
            )}
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default SectionCategories
