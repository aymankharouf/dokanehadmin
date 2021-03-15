import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Fab, Icon } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const Locations = () => {
  const { state } = useContext(StoreContext)
  const [locations, setLocations] = useState(() => [...state.locations].sort((l1, l2) => l1.ordering - l2.ordering))
  useEffect(() => {
    setLocations(() => [...state.locations].sort((l1, l2) => l1.ordering - l2.ordering))
  }, [state.locations])
  return (
    <Page>
      <Navbar title={labels.locations} backLink={labels.back} />
      <Block>
        <List>
          {locations.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : locations.map(l =>
              <ListItem
                link={`/edit-location/${l.id}`}
                title={l.name}
                after={(l.fees / 100).toFixed(2)}
                key={l.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-location/">
        <Icon material="add"></Icon>
      </Fab>
      <Footer/>
    </Page>
  )
}

export default Locations
