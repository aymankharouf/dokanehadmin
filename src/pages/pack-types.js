import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Fab, Icon, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const PackTypes = () => {
  const { state } = useContext(StoreContext)
  const [packTypes, setPackTypes] = useState(() => [...state.packTypes].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  useEffect(() => {
    setPackTypes(() => [...state.packTypes].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  }, [state.packTypes])
  return (
    <Page>
      <Navbar title={labels.packTypes} backLink={labels.back} />
      <Block>
        <List>
          {packTypes.length === 0 ? 
            <ListItem title={labels.noData} />
          : packTypes.map(t =>
              <ListItem
                link={`/edit-pack-type/${t.id}`}
                title={t.name} 
                key={t.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-pack-type/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Countries
