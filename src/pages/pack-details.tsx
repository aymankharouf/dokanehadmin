import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, Card, CardContent, CardFooter, Link, List, ListItem, Icon, Fab, Badge, FabButton, FabButtons, FabBackdrop } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { getPackStores, deleteStorePack, deletePack, showMessage, showError, getMessage } from '../data/actions'
import moment from 'moment'
import labels from '../data/labels'
import { Pack, PackPrice, Store } from '../data/types'

type Props = {
  id: string
}
type ExtendedPack = Pack & {
  detailsCount: number
}
type ExtendedPackPrice = PackPrice & {
  packInfo: Pack,
  storeInfo: Store
}
const PackDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [pack, setPack] = useState<ExtendedPack>(() => {
    const pack = state.packs.find(p => p.id === props.id)!
    const detailsCount = state.packPrices.filter(p => p.packId === pack.id).length
    return {
      ...pack,
      detailsCount
    }
  })
  const [packStores, setPackStores] = useState<ExtendedPackPrice[]>([])
  useEffect(() => {
    setPackStores(() => {
      const packStores = getPackStores(pack, state.packPrices, state.stores, state.packs)
      return packStores.sort((s1, s2) => (s1.unitPrice ?? 0) - (s2.unitPrice ?? 0))
    })
  }, [pack, state.stores, state.packPrices, state.packs])
  useEffect(() => {
    setPack(() => {
      const pack = state.packs.find(p => p.id === props.id)!
      let detailsCount = state.packPrices.filter(p => p.packId === pack.id).length
      return {
        ...pack,
        detailsCount
      }
    })
  }, [state.packs, state.packPrices, props.id])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deletePack(pack.id!)
        showMessage(labels.deleteSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }
  const handleDeletePrice = (storePackInfo: PackPrice) => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deleteStorePack(storePackInfo, state.packPrices, state.packs)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }

  let i = 0
  return (
    <Page>
      <Navbar title={`${pack.product.name}${pack.product.alias ? '-' + pack.product.alias : ''}`} backLink={labels.back} />
      <Card>
        <CardContent>
          <div className="card-title">{pack.name}</div>
          <img src={pack.imageUrl} className="img-card" alt={labels.noImage} />
        </CardContent>
        <CardFooter>
          <p>{(pack.price! / 100).toFixed(2)}</p>
          <p>{pack.typeUnits}</p>
        </CardFooter>
      </Card>
      <List mediaList>
        {packStores.map(s => 
          <ListItem 
            title={s.storeInfo?.name}
            subtitle={s.packId === pack.id ? '' : `${s.packInfo?.product.name}${s.packInfo?.product.alias ? '-' + s.packInfo.product.alias : ''}`}
            text={s.packId === pack.id ? '' : s.packInfo?.name}
            footer={s.offerEnd ? `${labels.offerUpTo}: ${moment(s.offerEnd).format('Y/M/D')}` : ''}
            key={i++}
          >
            <div className="list-subtext1">{`${labels.price}: ${(s.price / 100).toFixed(2)}${s.price === s.unitPrice ? '' : '(' + ((s.unitPrice ?? 0)/ 100).toFixed(2) + ')'}`}</div>
            <div className="list-subtext2">{s.subQuantity ? `${labels.quantity}: ${s.subQuantity}` : ''}</div>
            {s.isActive ? '' : <Badge slot="title" color='red'>{labels.inActive}</Badge>}
            {s.packId === pack.id && !s.isAuto ? <Link slot="after" iconMaterial="delete" onClick={()=> handleDeletePrice(s)}/> : ''}
          </ListItem>
        )}
      </List>
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => f7.views.current.router.navigate(`/add-pack-store/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          <FabButton color="blue" onClick={() => f7.views.current.router.navigate(`/${pack.subPackId ? 'edit-offer' : 'edit-pack'}/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          {pack.detailsCount === 0 ? 
            <FabButton color="red" onClick={() => handleDelete()}>
              <Icon material="delete"></Icon>
            </FabButton>
          : ''}
        </FabButtons>
      </Fab>
    </Page>
  )
}

export default PackDetails
