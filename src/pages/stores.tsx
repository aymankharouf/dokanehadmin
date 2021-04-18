import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Fab, Icon, Badge, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StateContext } from '../data/state-provider'
import { showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { Store } from '../data/interfaces'

const Stores = () => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [stores, setStores] = useState<Store[]>([])
  useEffect(() => {
    setStores(() => {
      const today = new Date()
      today.setDate(today.getDate() - 30)
      return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
    })
  }, [state.stores])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  return (
    <Page>
      <Navbar title={labels.stores} backLink={labels.back} />
      <Block>
        <List>
          {stores.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stores.map((s: any) =>
              <ListItem 
                link={`/store-details/${s.id}`} 
                title={s.name}
                after={s.discount * 100}
                key={s.id} 
              >
                {s.isActive ? '' : <Badge slot="title" color='red'>{labels.inActive}</Badge>}
              </ListItem>
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-store/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Stores
