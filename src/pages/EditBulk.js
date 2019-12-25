import React, { useState, useContext, useEffect, useMemo } from 'react'
import { editPack, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react';
import { StoreContext } from '../data/Store'
import ReLogin from './ReLogin'

const EditBulk = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])

  const [name, setName] = useState(pack.name)
  const [orderLimit, setOrderLimit] = useState(pack.orderLimit)
  const [subPackId, setSubPackId] = useState(pack.subPackId)
  const [subQuantity, setSubQuantity] = useState(pack.subQuantity)
  const packs = useMemo(() => state.packs.filter(p => p.productId === pack.productId && !p.subPackId && !p.byWeight)
  , [state.packs, pack])
  const hasChanged = useMemo(() => {
    if (name !== pack.name) return true
    if (orderLimit !== pack.orderLimit) return true
    if (subPackId !== pack.subPackId) return true
    if (subQuantity !== pack.subQuantity) return true
    return false
  }, [pack, name, orderLimit, subPackId, subQuantity])

  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  const handleSubmit = async () => {
    try{
      if (Number(subQuantity) < 1) {
        throw new Error('invalidQuantity')
      }
      const subPackInfo = state.packs.find(p => p.id === subPackId)
      const newPack = {
        ...pack,
        name,
        subPackId,
        subQuantity: Number(subQuantity),
        unitsCount: Number(subQuantity) * (subPackInfo.unitsCount + (subPackInfo.bonusUnits || 0)),
        orderLimit: Number(orderLimit)
      }
      await editPack(newPack)
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  if (!user) return <ReLogin />
  return (
    <Page>
      <Navbar title={`${state.labels.editBulk} ${product.name}`} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem
          title={state.labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select 
            name="subPackId" 
            value={subPackId} 
            onChange={e => setSubPackId(e.target.value)}
          >
            <option value=""></option>
            {packs.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="subQuantity" 
          label={state.labels.quantity}
          value={subQuantity}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setSubQuantity(e.target.value)}
          onInputClear={() => setSubQuantity('')}
        />
        <ListInput 
          name="orderLimit" 
          label={state.labels.packLimit}
          floatingLabel 
          clearButton
          type="number" 
          value={orderLimit} 
          onChange={e => setOrderLimit(e.target.value)}
          onInputClear={() => setOrderLimit('')}
        />
      </List>
      {!name || !subPackId || !subQuantity || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditBulk
