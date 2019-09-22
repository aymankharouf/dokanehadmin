import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Countries = props => {
  const { state } = useContext(StoreContext)
  let countries = state.countries
  countries.sort((country1, country2) => country1.name > country2.name ? 1 : -1)
  const handleAdd = () => {
    props.f7router.navigate('/addCountry/')
  }

  return (
    <Page>
      <Navbar title={state.labels.countries} backLink="Back" />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => handleAdd()}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Block>
        <List>
          {countries && countries.map(rec =>
            <ListItem
              link={`/editCountry/${rec.id}`}
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

export default Countries
