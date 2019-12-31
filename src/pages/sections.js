import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const Sections = props => {
  const { state } = useContext(StoreContext)
  const sections = useMemo(() => [...state.sections].sort((s1, s2) => s1.ordering - s2.ordering)
  , [state.sections])

  return (
    <Page>
      <Navbar title={labels.sections} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-section/">
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List>
          {sections.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : sections.map(s =>
              <ListItem 
                link={`/section-categories/${s.id}`} 
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
