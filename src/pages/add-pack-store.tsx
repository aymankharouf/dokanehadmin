import {useState, useContext} from 'react'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {addPackStore, getMessage} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonToast } from '@ionic/react'

type Params = {
  id: string
}
const AddPackStore = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [price, setPrice] = useState('')
  const [storeId, setStoreId] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === params.id)!)
  const handleSubmit = () => {
    try{
      if (state.packStores.find(p => p.packId === pack.id && p.storeId === storeId)) {
        throw new Error('duplicatePackInStore')
      }
      if (+price <= 0 || +price !== Number((+price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      const storePack = {
        packId: pack.id!,
        storeId,
        price: +price,
        isRetail: state.stores.find(s => s.id === storeId)!.type === 's',
        isActive: true,
        time: new Date()
      }
      addPackStore(storePack, state.packs)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
    	message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <Page>
      <Navbar title={`${labels.addPrice} ${pack.product.name} ${pack.name}`} backLink={labels.back} />
      <List form inlineLabels>
        <ListItem
          title={labels.store}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: "#stores", 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="storeId" value={storeId} onChange={e => setStoreId(e.target.value)}>
            <option value=""></option>
            {state.stores.map(s => 
              <option key={s.id} value={s.id}>{s.name}</option>
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
      {storeId && price &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddPackStore
