import {useState, useContext, useEffect} from 'react'
import {f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {addPackPrice, showMessage, showError, getMessage} from '../data/actions'

type Props = {
  id: string
}
const AddStorePack = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [packId, setPackId] = useState('')
  const [price, setPrice] = useState('')
  const [store] = useState(() => state.stores.find(s => s.id === props.id)!)
  const [packs] = useState(() => {
    const packs = state.packs.map(p => {
      return {
        id: p.id,
        name: `${p.product.name}-${p.product.alias} ${p.name}`
      }
    })
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }) 
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (state.packPrices.find(p => p.packId === packId && p.storeId === store.id)) {
        throw new Error('duplicatePackInStore')
      }
      if (Number(price) !== Number(Number(price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      if (Number(price) < 0) {
        throw new Error('invalidPrice')
      }
      const storePack = {
        packId,
        storeId: store.id!,
        price: +price,
        time: new Date()
      }
      addPackPrice(storePack, state.packs)
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
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
