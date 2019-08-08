import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Sections = props => {
  const { state } = useContext(StoreContext)
  const handleAdd = () => {
    props.f7router.navigate('/addSection/')
  }

  return (
    <Page>
      <Navbar title="Sections" backLink="Back" />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => handleAdd()}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Block>
          <List>
            {state.sections && state.sections.map(rec =>
              <ListItem title={rec.name} link={`/section/${rec.id}`} key={rec.id} />
            )}
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Sections
