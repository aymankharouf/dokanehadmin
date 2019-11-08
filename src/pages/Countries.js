import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Countries = props => {
  const { state } = useContext(StoreContext)
  const countries = useMemo(() => [...state.countries].sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1), [state.countries])

  return (
    <Page>
      <Navbar title={state.labels.countries} backLink={state.labels.back} />
      <Block>
        <List>
          {countries && countries.map(rec =>
            <ListItem
              link={`/editCountry/${rec.id}`}
              title={rec.name} 
              key={rec.id}
            />
          )}
          {countries.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addCountry/')}>
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Countries
