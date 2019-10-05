import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Sections = props => {
  const { state } = useContext(StoreContext)
  let sections = state.sections
  sections.sort((section1, section2) => section1.name > section2.name ? 1 : -1)

  return (
    <Page>
      <Navbar title={state.labels.sections} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addSection/')}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Block>
        <List>
          {sections && sections.map(rec =>
            <ListItem 
              link={`/section/${rec.id}`} 
              title={rec.name} 
              key={rec.id} 
              badge={rec.isActive === false ? state.labels.inActive : ''}
              badgeColor='red' 
            />
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
