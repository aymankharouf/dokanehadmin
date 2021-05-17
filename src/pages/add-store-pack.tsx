import {useState, useContext} from 'react'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {addPackStore, getMessage} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonToast } from '@ionic/react'

type Params = {
  storeId: string,
  requestId: string
}
const AddStorePack = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [packId, setPackId] = useState('')
  const [packRequest] = useState(() => state.packRequests.find(r => r.id === params.requestId))
  const [store] = useState(() => state.stores.find(s => s.id === params.storeId)!)
  const [price, setPrice] = useState(packRequest?.price.toFixed(2) || '')
  const [packs] = useState(() => {
    let packs
    if (params.requestId) {
      const siblingPack = state.packs.find(p => p.id === packRequest?.siblingPackId)
      packs = state.packs.filter(p => p.product.id === siblingPack?.product.id)
    } else {
      packs = state.packs.map(p => {
        return {
          ...p,
          name: `${p.product.name}-${p.product.alias} ${p.name}`
        }
      })
    }
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }) 
  const handleSubmit = () => {
    try{
      if (state.packStores.find(p => p.packId === packId && p.storeId === store.id)) {
        throw new Error('duplicatePackInStore')
      }
      if (+price <= 0 || +price !== Number((+price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      const packStore = {
        packId,
        storeId: store.id!,
        price: +price,
        isRetail: store.type === 's',
        time: new Date()
      }
      addPackStore(packStore, state.packs, state.users, state.packRequests, packRequest)
      message(labels.addSuccess, 3000)
      if (packRequest) history.push('/')
      else history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }

  return (
    <Page>
      <Navbar title={`${labels.addProduct} ${store.name}`} backLink={labels.back} />
      <List form inlineLabels>
        <ListItem
          title={labels.product}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: '#packs', 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="packId" value={packId} onChange={e => setPackId(e.target.value)}>
            <option value=""></option>
            {packs.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="price" 
          label={labels.price}
          value={price}
          clearButton
          type="number" 
          onChange={e => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
      </List>
      {packId && price &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddStorePack
