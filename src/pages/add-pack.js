import React, { useState, useContext, useEffect } from 'react'
import { addPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const AddPack = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [name, setName] = useState('')
  const [unitsCount, setUnitsCount] = useState('')
  const [isDivided, setIsDivided] = useState(false)
  const [byWeight, setByWeight] = useState(false)
  const [product] = useState(() => state.products.find(p => p.id === props.id))
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (isDivided) {
      setByWeight(true)
    }
  }, [isDivided])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleSubmit = async () => {
    try{
      const pack = {
        productId: props.id,
        productName: product.name,
        productAlias: product.alias,
        productDescription: product.description,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        country: product.country,
        trademark: product.trademark,
        sales: product.sales,
        rating: product.rating,
        ratingCount: product.ratingCount,
        name,
        unitsCount: Number(unitsCount),
        isDivided,
        closeExpired: false,
        byWeight,
        isOffer: false,
        isArchived: false,
        price: 0,
        time: new Date()
      }
      setInprocess(true)
      await addPack(pack)
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
      <Navbar title={`${labels.addPack} ${product.name}`} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="unitsCount" 
          label={labels.unitsCount}
          floatingLabel 
          clearButton
          type="number" 
          value={unitsCount} 
          onChange={e => setUnitsCount(e.target.value)}
          onInputClear={() => setUnitsCount('')}
        />
        <ListItem>
          <span>{labels.isDivided}</span>
          <Toggle 
            name="isDivived" 
            color="green" 
            checked={isDivided} 
            onToggleChange={() => setIsDivided(!isDivided)}
          />
        </ListItem>
        <ListItem>
          <span>{labels.byWeight}</span>
          <Toggle 
            name="byWeight" 
            color="green" 
            checked={byWeight} 
            onToggleChange={() => setByWeight(!byWeight)}
            disabled={isDivided}
          />
        </ListItem>
      </List>
      {!name || !unitsCount ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddPack
