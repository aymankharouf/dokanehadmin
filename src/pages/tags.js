import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const Tags = props => {
  const { state } = useContext(StoreContext)
  const [tags, setTags] = useState([])
  useEffect(() => {
    setTags(() => {
      const tags = state.lookups.find(l => l.id === 't')?.values || []
      return tags.sort((t1, t2) => t1 > t2 ? 1 : -1)
    })
    }, [state.lookups])
    let i = 0
  return (
    <Page>
      <Navbar title={labels.tags} backLink={labels.back} />
      <Block>
        <List>
          {tags.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : tags.map(t =>
              <ListItem
                link={`/edit-tag/${t}`}
                title={t} 
                key={i++}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-tag/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Tags
