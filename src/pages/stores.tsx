import {useContext, useState, useEffect} from 'react'
import {Page, Block, Navbar, List, ListItem, Fab, Icon, Badge} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import {showError} from '../data/actions'
import labels from '../data/labels'
import {Store} from '../data/types'
import { storeTypes } from '../data/config'

const Stores = () => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [stores, setStores] = useState<Store[]>([])
  useEffect(() => {
    setStores(() => {
      const stores = state.stores.filter(s => s.type !== 'd')
      return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
    })
  }, [state.stores])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return (
    <Page>
      <Navbar title={labels.stores} backLink={labels.back} />
      <Block>
        <List>
          {stores.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stores.map(s =>
              <ListItem 
                link={`/store-details/${s.id}`} 
                title={s.name}
                subtitle={storeTypes.find(t => t.id === s.type)!.name}
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
    </Page>
  )
}

export default Stores
