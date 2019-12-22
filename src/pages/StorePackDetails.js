import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, Card, CardContent, Toolbar, CardFooter, Popover, List, Link, ListItem } from 'framework7-react'
import { StoreContext } from '../data/Store';
import { deleteStorePack, confirmPrice, haltOffer, extendOffer, showMessage, showError, getMessage } from '../data/Actions'

const StorePackDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const storePack = useMemo(() => state.storePacks.find(p => p.id === props.id)
  , [state.storePacks, props.id])
  const pack = useMemo(() => storePack ? state.packs.find(p => p.id === storePack.packId) : ''
  , [state.packs, storePack])
  const product = useMemo(() => pack ? state.products.find(p => p.id === pack.productId) : ''
  , [state.products, pack])
  const bonusProduct = useMemo(() => pack.bonusPackId ? state.products.find(p => p.id === state.packs.find(pa => pa.id === pack.bonusPackId).productId) : ''
  , [pack, state.products, state.packs])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  const handleDelete = () => {
    props.f7router.app.dialog.confirm(state.labels.confirmationText, state.labels.confirmationTitle, async () => {
      try{
        await deleteStorePack(storePack, pack, state.storePacks)
        showMessage(props, state.labels.deleteSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
      } catch(err) {
        setError(getMessage(props, err))
      }
    })
  }
  const handleConfirmPrice = async () => {
    try{
      await confirmPrice(storePack)
      showMessage(props, state.labels.approveSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handleHaltOffer = async () => {
    try{
      const offerEndDate = new Date(storePack.offerEnd)
      const today = (new Date()).setHours(0, 0, 0, 0)
      if (offerEndDate > today) {
        props.f7router.app.dialog.confirm(state.labels.confirmationText, state.labels.confirmationTitle, async () => {
          try{
            await haltOffer(storePack, pack, state.storePacks)
            showMessage(props, state.labels.haltSuccess)
            props.f7router.back()  
          } catch(err) {
            setError(getMessage(props, err))
          }
        })
      } else {
        await haltOffer(storePack, pack, state.storePacks)
        showMessage(props, state.labels.haltSuccess)
        props.f7router.back()    
      }
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handleExtendOffer = () => {
    props.f7router.app.dialog.prompt(state.labels.confirmationText, state.labels.confirmationTitle, async days => {
      try{
        if (!days || Number(days) <= 0) {
          throw new Error('invalidValue')
        }
        const offerEnd = storePack.offerEnd.toDate()
        offerEnd.setDate(offerEnd.getDate() + Number(days))
        const newStorePack = {
          ...storePack,
          offerEnd
        }
        await extendOffer(newStorePack)
        showMessage(props, state.labels.editSuccess)
        props.f7router.back() 
      } catch(err) {
        setError(getMessage(props, err))
      }
    })
  }
  if (!storePack) return null //to handle delete operation
  return (
    <Page>
      <Navbar title={`${product.name} ${state.stores.find(s => s.id === storePack.storeId).name}`} backLink={state.labels.back} className="page-title" />
      <Block>
        <Card>
          <CardContent>
            <div className="card-title">{pack.name}</div>
            <div className="relative">
              <img src={product.imageUrl} className="img-card" alt={product.name} />
              {pack.offerQuantity > 1 ? <span className="offer-quantity-card">{`× ${pack.offerQuantity}`}</span> : ''}
              {pack.bonusPackId ? 
                <div>
                  <img src={bonusProduct.imageUrl} className="bonus-img-card" alt={bonusProduct.name} />
                  {pack.bonusQuantity > 1 ? <span className="bonus-quantity-card">{`× ${pack.bonusQuantity}`}</span> : ''}
                </div>
              : ''}
            </div>
          </CardContent>
          <CardFooter>
            <p>{(storePack.price / 1000).toFixed(3)}</p>
          </CardFooter>
        </Card>
      </Block>
      <Popover className="popover-menu">
        <List>
          {storePack.storeId === 's' && storePack.quantity === 0 ? '' : 
            <ListItem 
              link={`/editPrice/${storePack.id}`} 
              popoverClose 
              title={state.labels.editPrice}
            />
          }
          {storePack.storeId === 's' ? '' : 
            <ListItem 
              link="#" 
              popoverClose 
              title={state.labels.delete} 
              onClick={() => handleDelete()}
            />
          }
          {storePack.storeId === 's' ? '' : 
            <ListItem 
              link="#" 
              popoverClose 
              title={state.labels.confirmPrice} 
              onClick={() => handleConfirmPrice()}
            />
          }
          {storePack.offerEnd ? 
            <ListItem 
              link="#" 
              popoverClose 
              title={state.labels.haltOffer} 
              onClick={() => handleHaltOffer()}
            /> 
          : ''}
          {storePack.offerEnd ? 
            <ListItem 
              link="#" 
              popoverClose 
              title={state.labels.extendOffer} 
              onClick={() => handleExtendOffer()}
            /> 
          : ''}
        </List>
      </Popover>

      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link popoverOpen=".popover-menu" iconMaterial="more_vert" />
      </Toolbar>
    </Page>
  )
}

export default StorePackDetails
