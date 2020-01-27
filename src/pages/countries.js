import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const Countries = props => {
  const { state } = useContext(StoreContext)
  const [countries, setCountries] = useState([])
  useEffect(() => {
    setCountries(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  }, [state.countries])
  return (
    <Page>
      <Navbar title={labels.countries} backLink={labels.back} />
      <Block>
        <List>
          {countries.length === 0 ? 
            <ListItem title={labels.noData} />
          : countries.map(c =>
              <ListItem
                link={`/edit-country/${c.id}`}
                title={c.name} 
                key={c.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-country/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Countries
