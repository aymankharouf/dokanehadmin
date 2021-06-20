import {useContext, useState, useEffect} from 'react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {getCategoryName, getArchivedProducts, getMessage, productOfText} from '../data/actions'
import {Product} from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonLoading, useIonToast } from '@ionic/react'
import { useLocation } from 'react-router'
import Header from './header'
import { colors } from '../data/config'
import { cloudDownloadOutline } from 'ionicons/icons'
import Fuse from "fuse.js"

type ExtendedProduct = Product & {
  categoryName: string,
  trademarkName?: string,
  countryName: string
}
const ArchivedProducts = () => {
  const {state, dispatch} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const [loading, dismiss] = useIonLoading()
  const [products, setProducts] = useState<ExtendedProduct[]>([])
  const [data, setData] = useState<ExtendedProduct[]>([])
  useEffect(() => {
    return function cleanUp() {
      dispatch({type: 'CLEAR_SEARCH'})
    }
  }, [dispatch])
  useEffect(() => {
    setProducts(() => {
      const archivedProducts = state.products.filter(p => !p.isActive)
      const results = archivedProducts.map(p => {
        const categoryInfo = state.categories.find(c => c.id === p.categoryId)!
        const trademarkName = state.trademarks.find(t => t.id === p.trademarkId)?.name
        const countryName = state.countries.find(c => c.id === p.countryId)!.name
        return {
          ...p,
          categoryName: getCategoryName(categoryInfo, state),
          trademarkName,
          countryName
        }
      })
      return results.sort((p1, p2) => p1.categoryId === p2.categoryId ? (p1.name > p2.name ? 1 : -1) : (p1.categoryName! > p2.categoryName! ? 1 : -1))
    })
  }, [state.products, state.categories, state.countries, state.trademarks])
  useEffect(() => {
    if (!state.searchText) {
      setData(products)
      return
    }
    const options = {
      includeScore: true,
      findAllMatches: true,
      threshold: 0.1,
      keys: ['name', 'alias', 'description', 'categoryName', 'trademarkName', 'countryName']
    }
    const fuse = new Fuse(products, options)
    const result = fuse.search(state.searchText)
    setData(result.map(p => p.item))
  }, [state.searchText, products])
  const handleRetreive = async () => {
    try{
      loading()
      const products = await getArchivedProducts()
      if (products.length > 0) {
        dispatch({type: 'SET_ARCHIVED_PRODUCTS', payload: products})
      }
      dismiss()
    } catch(err) {
      dismiss()
      message(getMessage(location.pathname, err), 3000)
    }
  }
  return(
    <IonPage>
      <Header title={labels.archived} withSearch/>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {data.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : data.map(p => 
              <IonItem key={p.id} routerLink={`/product-packs/${p.id}/a`}>
                <IonThumbnail slot="start">
                  <IonImg src={p.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.description}</IonText>
                  <IonText style={{color: colors[3].name}}>{p.categoryName}</IonText>
                  <IonText style={{color: colors[4].name}}>{productOfText(p.countryName, p.trademarkName)}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
        <IonFab horizontal="end" vertical="top" slot="fixed" style={{top: '-10px'}}>
          <IonFabButton onClick={handleRetreive} size="small">
            <IonIcon ios={cloudDownloadOutline}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default ArchivedProducts