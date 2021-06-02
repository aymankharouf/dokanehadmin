import {useContext, useState, useEffect} from 'react'
import RatingStars from './rating-stars'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {archiveProduct, deleteProduct, getMessage, productOfText, getArchivedPacks} from '../data/actions'
import {Pack} from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonBadge, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonRow, IonText, useIonAlert, useIonLoading, useIonToast } from '@ionic/react'
import Header from './header'
import { randomColors } from '../data/config'
import { settingsOutline } from 'ionicons/icons'

type Params = {
  id: string,
  type: string
}
const ProductPacks = () => {
  const {state, dispatch} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [loading, dismiss] = useIonLoading()
  const [alert] = useIonAlert()
  const [product, setProduct] = useState(() => state.products.find(p => p.id === params.id)!)
  const [packs, setPacks] = useState<Pack[]>([])
  const [activePacks, setActivePacks] = useState<Pack[]>([])
  const [actionOpened, setActionOpened] = useState(false)
  useEffect(() => {
    setProduct(() => state.products.find(p => p.id === params.id)!)
  }, [state.products])
  useEffect(() => {
    const getPacks = async () => {
      loading()
      const packs = await getArchivedPacks(params.id)
      dismiss()
      if (packs.length > 0) {
        dispatch({type: 'SET_ARCHIVED_PACKS', payload: packs})
      }
    }
    if (params.type === 'a') getPacks()
  }, [dispatch, params.id, params.type, loading, dismiss])
  useEffect(() => {
    setPacks(() => {
      const packs = state.packs.filter(p => p.product.id === params.id)
      return packs.sort((p1, p2) => p2.price! - p1.price!)
    })
  }, [state.packs, params.id])
  useEffect(() => {
    setActivePacks(() => packs.filter(p => p.isActive))
  }, [packs])
  const handleArchive = () => {
    try{
      archiveProduct(product, state.packs)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            deleteProduct(product)
            message(labels.deleteSuccess, 3000)
            history.goBack()
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  let i = 0
  return (
    <IonPage>
      <Header title={product.name} />
      <IonContent fullscreen>
        <IonCard>
          <IonGrid>
            <IonRow>
              <IonCol className="card-title">
                {product.alias}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonImg src={product.imageUrl} alt={labels.noImage} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol style={{textAlign: 'center'}}>
                {product.description}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{productOfText(state.countries.find(c => c.id === product.countryId)!.name, state.trademarks.find(t => t.id === product.trademarkId)?.name)}</IonCol>
              <IonCol className="ion-text-end"><RatingStars rating={product.rating ?? 0} count={product.ratingCount ?? 0} /></IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
        <IonList className="list">
          {packs.map(p => 
            <IonItem key={p.id} routerLink={`/pack-details/${p.id}`}>
              <IonLabel>
                <IonText style={{color: randomColors[0].name}}>{p.name}</IonText>
                <IonText style={{color: randomColors[1].name}}>{`${labels.stores}: ${state.packStores.filter(s => s.packId === p.id).length}`}</IonText>
              </IonLabel>
              {p.price! > 0 && <IonLabel slot="end" className="price">{p.price!.toFixed(2)}</IonLabel>}
              {!p.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
            </IonItem>
          )}
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setActionOpened(true)}>
          <IonIcon ios={settingsOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.edit,
            cssClass: randomColors[i++ % 7].name,
            handler: () => history.push(`/edit-product/${params.id}`)
          },
          {
            text: labels.addPack,
            cssClass: randomColors[i++ % 7].name,
            handler: () => history.push(`/add-pack/${params.id}`)
          },
          {
            text: labels.addGroup,
            cssClass: randomColors[i++ % 7].name,
            handler: () => history.push(`/add-group/${params.id}`)
          },
          {
            text: labels.archive,
            cssClass: activePacks.length === 0 ? randomColors[i++ % 7].name : 'ion-hide',
            handler: () => handleArchive()
          },
          {
            text: labels.delete,
            cssClass: packs.length === 0 ? randomColors[i++ % 7].name : 'ion-hide',
            handler: () => handleDelete()
          },

        ]}
      />
    </IonPage>
  )
}

export default ProductPacks
