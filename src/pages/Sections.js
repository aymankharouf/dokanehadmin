import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Sections = props => {
  const { state } = useContext(StoreContext)
  const sections = useMemo(() => [...state.sections].sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  , [state.sections])

  return (
    <Page>
      <Navbar title={state.labels.sections} backLink={state.labels.back} className="page-title" />
      <Fab position="left-top" slot="fixed" color="green" href="/addSection/">
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List>
          {sections.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : sections.map(s =>
              <ListItem 
                link={`/section/${s.id}`} 
                title={s.name} 
                key={s.id} 
                className= "list-title"
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Sections
