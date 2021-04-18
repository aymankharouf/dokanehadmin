import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Fab, Icon, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'


const Countries = () => {
  const { state } = useContext(StateContext)
  const [countries, setCountries] = useState(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  useEffect(() => {
    setCountries(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  }, [state.countries])
  let i = 0
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
                key={i++}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-country/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Countries
