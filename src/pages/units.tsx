import {useContext, useState, useEffect} from 'react'
import {Page, Block, Navbar, List, ListItem, Fab, Icon} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'


const Units = () => {
  const {state} = useContext(StateContext)
  const [units, setUnits] = useState(() => [...state.units].sort((u1, u2) => u1.name > u2.name ? 1 : -1))
  useEffect(() => {
    setUnits(() => [...state.units].sort((u1, u2) => u1.name > u2.name ? 1 : -1))
  }, [state.units])
  return (
    <Page>
      <Navbar title={labels.units} backLink={labels.back} />
      <Block>
        <List>
          {units.length === 0 ? 
            <ListItem title={labels.noData} />
          : units.map(u =>
              <ListItem
                link={`/edit-unit/${u.id}`}
                title={u.name} 
                key={u.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-unit/">
        <Icon material="add"></Icon>
      </Fab>
    </Page>
  )
}

export default Units
