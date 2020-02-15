import React, { useState, useContext, useEffect } from 'react'
import { editPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const EditBulk = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [name, setName] = useState(pack.name)
  const [subPackId, setSubPackId] = useState(pack.subPackId)
  const [subQuantity, setSubQuantity] = useState(pack.subQuantity)
  const [hasChanged, setHasChanged] = useState(false)
  const [packs] = useState(() => state.packs.filter(p => p.productId === pack.productId && !p.subPackId && !p.byWeight))
  useEffect(() => {
    if (name !== pack.name
    || subPackId !== pack.subPackId
    || subQuantity !== pack.subQuantity) setHasChanged(true)
    else setHasChanged(false)
  }, [pack, name, subPackId, subQuantity])

  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

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
      }
      setInprocess(true)
      await editPack(newPack)
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.editBulk} ${pack.productName}`} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          clearButton
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem
          title={labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="subPackId" value={subPackId} onChange={e => setSubPackId(e.target.value)}>
            <option value=""></option>
            {packs.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="subQuantity" 
          label={labels.quantity}
          value={subQuantity}
          clearButton
          type="number" 
          onChange={e => setSubQuantity(e.target.value)}
          onInputClear={() => setSubQuantity('')}
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
