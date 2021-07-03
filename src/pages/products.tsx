import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { productOfText, getCategoryName } from '../data/actions'
import { Product } from '../data/types'
import { useParams } from 'react-router'
import { IonButton, IonContent, IonFooter, IonGrid, IonItem, IonLabel, IonList, IonPage, IonRow, IonText, IonThumbnail, IonToolbar } from '@ionic/react'
import Header from './header'
import { colors } from '../data/config'
import Fuse from "fuse.js"

type Params = {
  id: string
}
type ExtendedProduct = Product & {
  categoryName: string,
  trademarkName?: string,
  countryName: string
}
const Products = () => {
  const { state, dispatch } = useContext(StateContext)
  const params = useParams<Params>()
  const [category] = useState(() => state.categories.find(c => c.id === params.id))
  const [products, setProducts] = useState<ExtendedProduct[]>([])
  const [data, setData] = useState<ExtendedProduct[]>([])
  useEffect(() => {
    return function cleanUp() {
      dispatch({type: 'CLEAR_SEARCH'})
    }
  }, [dispatch])
  useEffect(() => {
    setProducts(() => {
      const products = state.products.filter(p => params.id === '-1' ? state.packs.filter(pa => pa.product.id === p.id && pa.isActive).length === 0 : params.id === '0' || p.categoryId === params.id)
      const results = products.map(p => {
        const categoryInfo = state.categories.find(c => c.id === p.categoryId)!
        const trademarkName = state.trademarks.find(t => t.id === p.trademarkId)?.name
        const countryName = state.countries.find(c => c.id === p.countryId)!.name
        return {
          ...p,
          categoryName: getCategoryName(categoryInfo, state.categories),
          trademarkName,
          countryName
        }
      })
      return results.sort((p1, p2) => p1.categoryId === p2.categoryId ? (p1.name > p2.name ? 1 : -1) : (p1.categoryName! > p2.categoryName! ? 1 : -1))
    })
  }, [state.products, state.categories, state.packs, state.countries, state.trademarks, params.id])
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
  let i = 0
  return(
    <IonPage>
      <Header title={params.id === '-1' ? labels.notUsedProducts : (params.id === '0' ? labels.products : category?.name || '')} withSearch/>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {data.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : data.map(p => 
              <IonItem key={p.id} routerLink={`/product-packs/${p.id}/n`}>
                <IonThumbnail slot="start">
                  <img src={p.imageUrl} alt={labels.noImage} />
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
      </IonContent>
      <IonFooter>
        <IonToolbar className="ion-justify-content-center">
          <IonGrid>
            <IonRow>
              <IonButton className={colors[i++ % 10].name} size="small" style={{width: '22vw'}} routerLink="/add-product/0">{labels.add}</IonButton>
              <IonButton className={colors[i++ % 10].name} size="small" style={{width: '22vw', marginRight: '5px'}} routerLink="/archived-products">{labels.archived}</IonButton>
              <IonButton className={colors[i++ % 10].name} size="small" style={{width: '22vw', marginRight: '5px'}} routerLink="/products/-1">{labels.notUsedProducts}</IonButton>
              <IonButton className={colors[i++ % 10].name} size="small" style={{width: '22vw', marginRight: '5px'}} routerLink="/packs/0">{labels.notUsedPacks}</IonButton>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  )
}

export default Products