import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, Card, CardContent, Toolbar, CardFooter, Popover, List, Link, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import { deleteStorePack, confirmPrice, haltOffer, extendOffer, showMessage, showError, getMessage } from '../data/actions'
import PackImage from './pack-image'
import labels from '../data/labels'

const StorePackDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const storePack = useMemo(() => state.storePacks.find(p => p.id === props.id)
  , [state.storePacks, props.id])
  const pack = useMemo(() => storePack ? state.packs.find(p => p.id === storePack.packId) : ''
  , [state.packs, storePack])
  const product = useMemo(() => pack ? state.products.find(p => p.id === pack.productId) : ''
  , [state.products, pack])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        await deleteStorePack(storePack, pack, state.storePacks, state.packs)
        showMessage(labels.deleteSuccess)
        props.f7router.navigate('/home/', {reloadAll: true})
      } catch(err) {
        setError(getMessage(props, err))
      }
    })
  }
  const handleConfirmPrice = async () => {
    try{
      await confirmPrice(storePack)
      showMessage(labels.approveSuccess)
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
        f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
          try{
            await haltOffer(storePack, pack, state.storePacks, state.packs)
            showMessage(labels.haltSuccess)
            props.f7router.back()  
          } catch(err) {
            setError(getMessage(props, err))
          }
        })
      } else {
        await haltOffer(storePack, pack, state.storePacks)
        showMessage(labels.haltSuccess)
        props.f7router.back()    
      }
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  const handleExtendOffer = () => {
    f7.dialog.prompt(labels.confirmationText, labels.confirmationTitle, async days => {
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
        showMessage(labels.editSuccess)
        props.f7router.back() 
      } catch(err) {
        setError(getMessage(props, err))
      }
    })
  }
  if (!storePack) return null //to handle delete operation
  return (
    <Page>
      <Navbar title={`${product.name} ${state.stores.find(s => s.id === storePack.storeId).name}`} backLink={labels.back} />
      <Block>
        <Card>
          <CardContent>
            <div className="card-title">{pack.name}</div>
            <PackImage pack={pack} type="card" />
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
              link={`/edit-price/${storePack.id}`} 
              popoverClose 
              title={labels.editPrice}
            />
          }
          {storePack.storeId === 's' ? '' : 
            <ListItem 
              link="#" 
              popoverClose 
              title={labels.delete} 
              onClick={() => handleDelete()}
            />
          }
          {storePack.storeId === 's' ? '' : 
            <ListItem 
              link="#" 
              popoverClose 
              title={labels.confirmPrice} 
              onClick={() => handleConfirmPrice()}
            />
          }
          {storePack.offerEnd ? 
            <ListItem 
              link="#" 
              popoverClose 
              title={labels.haltOffer} 
              onClick={() => handleHaltOffer()}
            /> 
          : ''}
          {storePack.offerEnd ? 
            <ListItem 
              link="#" 
              popoverClose 
              title={labels.extendOffer} 
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