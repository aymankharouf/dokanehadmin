import React, { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import moment from 'moment'
import PackImage from './pack-image'
import labels from '../data/labels'
import { haltOffer, showMessage, getMessage, showError } from '../data/actions'

const Offers = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [storePacks, setStorePacks] = useState([])
  useEffect(() => {
    setStorePacks(() => {
      let storePacks = state.storePacks.filter(p => p.offerEnd)
      storePacks = storePacks.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)
        const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
        return {
          ...p,
          packInfo,
          storeName
        }
      })
      return storePacks.sort((p1, p2) => p1.offerEnd.seconds - p2.offerEnd.seconds)
    })
  }, [state.storePacks, state.packs, state.stores])
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

  const handleHaltOffer = async storePack => {
    try{
      const offerEndDate = storePack.offerEnd.toDate().setHours(0, 0, 0, 0)
      const today = (new Date()).setHours(0, 0, 0, 0)
      if (offerEndDate > today) {
        f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
          try{
            setInprocess(true)
            await haltOffer(storePack, state.storePacks, state.packs)
            setInprocess(false)
            showMessage(labels.haltSuccess)
            props.f7router.back()  
          } catch(err) {
            setInprocess(false)
            setError(getMessage(props, err))
          }
        })
      } else {
        setInprocess(true)
        await haltOffer(storePack, state.storePacks, state.packs)
        setInprocess(false)
        showMessage(labels.haltSuccess)
      }
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={labels.offers} backLink={labels.back} />
      <Block>
        <List mediaList>
          {storePacks.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : storePacks.map(p => 
              <ListItem
                title={p.packInfo.productName}
                subtitle={p.packInfo.name}
                text={`${labels.productOf} ${p.packInfo.trademark ? labels.company + ' ' + p.packInfo.trademark + '-' : ''}${p.packInfo.country}`}
                footer={moment(p.offerEnd.toDate()).format('Y/M/D')}
                key={p.id}
              >
                <PackImage slot="media" pack={p.packInfo} type="list" />
                {p.storeName ? <div className="list-subtext1">{`${labels.storeName}: ${p.storeName}`}</div> : ''}
                <div className="list-subtext2">{`${labels.price}: ${(p.price / 1000).toFixed(3)}`}</div>
                {p.price === 0 ? '' : 
                  <Button text={labels.haltOffer} slot="after" onClick={() => handleHaltOffer(p)} />
                }
              </ListItem>
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Offers