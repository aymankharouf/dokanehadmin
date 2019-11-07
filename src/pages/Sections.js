import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Sections = props => {
  const { state } = useContext(StoreContext)
  const sections = useMemo(() => [...state.sections].sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1), [state.sections])

  return (
    <Page>
      <Navbar title={state.labels.sections} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addSection/')}>
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List>
          {sections && sections.map(rec =>
            <ListItem 
              link={`/section/${rec.id}`} 
              title={rec.name} 
              key={rec.id} 
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
