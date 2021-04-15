import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Button, Badge, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import moment from 'moment'
import labels from '../data/labels'
import { changeStorePackStatus, showMessage, getMessage, showError } from '../data/actions'

const Offers = () => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [offers, setOffers] = useState([])
  useEffect(() => {
    setOffers(() => {
      let offers = state.packPrices.filter((p: any) => p.offerEnd)
      offers = offers.map((o: any) => {
        const packInfo = state.packs.find((p: any) => p.id === o.packId)
        const storeName = o.storeId ? (o.storeId === 'm' ? labels.multipleStores : state.stores.find((s: any) => s.id === o.storeId).name) : ''
        return {
          ...o,
          packInfo,
          storeName
        }
      })
      return offers.sort((o1: any, o2: any) => o1.offerEnd.seconds - o2.offerEnd.seconds)
    })
  }, [state.packPrices, state.packs, state.stores])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleHaltOffer = (storePack: any) => {
    try{
      const offerEndDate = storePack.offerEnd.toDate().setHours(0, 0, 0, 0)
      const today = (new Date()).setHours(0, 0, 0, 0)
      if (offerEndDate > today) {
        f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
          try{
            changeStorePackStatus(storePack, state.packPrices, state.packs)
            showMessage(labels.haltSuccess)
          } catch(err) {
            setError(getMessage(f7.views.current.router.currentRoute.path, err))
          }
        })
      } else {
        changeStorePackStatus(storePack, state.packPrices, state.packs)
        showMessage(labels.haltSuccess)
      }
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  let i = 0
  return(
    <Page>
      <Navbar title={labels.offers} backLink={labels.back} />
      <Block>
        <List mediaList>
          {offers.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : offers.map((p: any) => 
              <ListItem
                title={p.packInfo.productName}
                subtitle={p.packInfo.productAlias}
                text={p.packInfo.name}
                footer={moment(p.offerEnd.toDate()).format('Y/M/D')}
                key={i++}
              >
                <img src={p.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
                <div className="list-subtext1">{`${labels.storeName}: ${p.storeName}`}</div>
                <div className="list-subtext1">{`${labels.price}: ${(p.price / 100).toFixed(2)}`}</div>
                {p.isActive ? '' : <Badge slot="text" color='red'>{labels.inActive}</Badge>}
                {p.packInfo.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
                {p.isActive ? <Button text={labels.haltOffer} slot="after" onClick={() => handleHaltOffer(p)} /> : ''}
              </ListItem>
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Offers