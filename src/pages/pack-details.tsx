import {useContext, useState, useEffect} from 'react'
import {f7, Page, Navbar, Card, CardContent, CardFooter, Link, List, ListItem, Icon, Fab, FabButton, FabButtons, FabBackdrop} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import {deleteStorePack, deletePack, showMessage, showError, getMessage} from '../data/actions'
import labels from '../data/labels'
import {Pack, PackStore, Store} from '../data/types'
import {units} from '../data/config'

type Props = {
  id: string
}
type ExtendedPackStore = PackStore & {
  packInfo: Pack,
  storeInfo: Store
}
const PackDetails = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [packStores, setPackStores] = useState<ExtendedPackStore[]>([])
  useEffect(() => {
    setPackStores(() => {
      const packStores = state.packStores.filter(p => p.packId === pack?.id || state.packs.find(pa => pa.id === p.packId && pa.subPackId === pack?.id))
      const results = packStores.map(s => {
        const storeInfo = state.stores.find(st => st.id === s.storeId)!
        const packInfo = state.packs.find(p => p.id === s.packId)!
        return {
          ...s,
          storeInfo,
          packInfo
        }
      })
      return results.sort((s1, s2) => s1.price - s2.price)
    })
  }, [pack, state.stores, state.packStores, state.packs])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deletePack(pack?.id!)
        showMessage(labels.deleteSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }
  const handleDeletePrice = (storePackInfo: PackStore) => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deleteStorePack(storePackInfo, state.packStores, state.packs)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }

  let i = 0
  return (
    <Page>
      <Navbar title={`${pack?.product.name}${pack?.product.alias ? '-' + pack.product.alias : ''}`} backLink={labels.back} />
      <Card>
        <CardContent>
          <div className="card-title">{pack?.name}</div>
          <img src={pack?.imageUrl} className="img-card" alt={labels.noImage} />
        </CardContent>
        <CardFooter>
          <p>{`${pack?.unitsCount} ${units.find(u => u.id === pack?.product.unit)?.name}`}</p>
        </CardFooter>
      </Card>
      <List mediaList>
        {packStores.map(s => 
          <ListItem 
            title={s.storeInfo?.name}
            subtitle={s.packId === pack?.id ? '' : `${s.packInfo?.product.name}${s.packInfo?.product.alias ? '-' + s.packInfo.product.alias : ''}`}
            text={s.packId === pack?.id ? '' : s.packInfo?.name}
            footer={s.packInfo.subCount ? `${labels.count}: ${s.packInfo.subCount}` : ''}
            key={i++}
          >
            <div className="list-subtext1">{`${labels.price}: ${s.price.toFixed(2)}`}</div>
            {s.packId === pack?.id ? <Link slot="after" iconMaterial="delete" onClick={()=> handleDeletePrice(s)}/> : ''}
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
          <FabButton color="blue" onClick={() => f7.views.current.router.navigate(`/${pack?.subPackId ? 'edit-group' : 'edit-pack'}/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          {state.packStores.filter(p => p.packId === pack?.id).length === 0 && 
            <FabButton color="red" onClick={() => handleDelete()}>
              <Icon material="delete"></Icon>
            </FabButton>
          }
        </FabButtons>
      </Fab>
    </Page>
  )
}

export default PackDetails
