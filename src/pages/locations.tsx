import {useContext, useState, useEffect} from 'react'
import {Page, Block, Navbar, List, ListItem, Fab, Icon} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'


const Locations = () => {
  const {state} = useContext(StateContext)
  const [locations, setLocations] = useState(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
  useEffect(() => {
    setLocations(() => [...state.locations].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
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
                key={l.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-location/">
        <Icon material="add"></Icon>
      </Fab>
    </Page>
  )
}

export default Locations
