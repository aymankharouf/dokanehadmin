import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const Sections = props => {
  const { state } = useContext(StoreContext)
  const sections = useMemo(() => [...state.sections].sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  , [state.sections])

  return (
    <Page>
      <Navbar title={labels.sections} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/addSection/">
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List>
          {sections.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : sections.map(s =>
              <ListItem 
                link={`/sectionCategories/${s.id}`} 
                title={s.name} 
                key={s.id} 
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
