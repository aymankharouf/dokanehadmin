import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {addPack, getMessage} from '../data/actions'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {units} from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  productId: string,
  requestId: string
}
const AddPack = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [packRequest] = useState(() => state.packRequests.find(r => r.id === params.requestId))
  const [siblingPack] = useState(() => state.packs.find(p => p.id === packRequest?.siblingPackId))
  const [name, setName] = useState(packRequest?.name || '')
  const [unitsCount, setUnitsCount] = useState('')
  const [byWeight, setByWeight] = useState(siblingPack?.byWeight || false)
  const [specialImage, setSpecialImage] = useState(!!packRequest?.imageUrl || false)
  const [image, setImage] = useState<File>()
  const [product] = useState(() => state.products.find(p => p.id === params.productId)!)
  const [price, setPrice] = useState(packRequest?.price.toFixed(2) || '')
  const [storeId, setStoreId] = useState(packRequest?.storeId || '')
  const [forSale, setForSale] = useState(() => state.stores.find(s => s.id === storeId)?.type === 's')
  const [imageUrl, setImageUrl] = useState('')
  const inputEl = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (byWeight) setUnitsCount('1')
  }, [byWeight])
  useEffect(() => {
    if (byWeight || unitsCount) setName(byWeight ? labels.byWeight : `${unitsCount} ${units.find(u => u.id === product.unit)?.name}`)
  }, [unitsCount, product, byWeight])
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click();
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files
      if (!files) return
      const filename = files[0].name
      if (filename.lastIndexOf('.') <= 0) {
        throw new Error('invalidFile')
      }
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        if (fileReader.result) setImageUrl(fileReader.result.toString())
      })
      fileReader.readAsDataURL(files[0])
      setImage(files[0])
    } catch (err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleSubmit = () => {
    try{
      if (state.packs.find(p => p.product.id === params.productId && p.name === name)) {
        throw new Error('duplicateName')
      }
      const stores = [{
        storeId, 
        price: +price, 
        isRetail: state.stores.find(s => s.id === storeId)!.type === 's', 
        isActive: true,
        time: new Date()
      }]
      const pack = {
        name,
        product,
        stores,
        unitsCount: +unitsCount,
        byWeight,
        isActive: true,
        forSale,
        lastTrans: new Date()
      }
      addPack(pack, product, state.users, state.packRequests, packRequest, image)
      message(labels.addSuccess, 3000)
      if (packRequest) history.push('/')
      else history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.addPack} ${product.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.name}</IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.forSale}</IonLabel>
            <IonToggle checked={forSale} onIonChange={() => setForSale(s => !s)}/>
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.byWeight}</IonLabel>
            <IonToggle checked={byWeight} onIonChange={() => setByWeight(s => !s)}/>
          </IonItem>
          {!byWeight &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.unitsCount}
              </IonLabel>
              <IonInput 
                value={unitsCount} 
                type="number"
                clearInput
                onIonChange={e => setUnitsCount(e.detail.value!)} 
              />
            </IonItem>
          }
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.store}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={storeId}
              onIonChange={e => setStoreId(e.detail.value)}
            >
              {state.stores.map(t => <IonSelectOption key={t.id} value={t.id}>{t.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.price}
            </IonLabel>
            <IonInput 
              value={price} 
              type="number" 
              clearInput
              onIonChange={e => setPrice(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.specialImage}</IonLabel>
            <IonToggle checked={specialImage} onIonChange={() => setSpecialImage(s => !s)}/>
          </IonItem>
          {specialImage && <>
            <input 
              ref={inputEl}
              type="file" 
              accept="image/*" 
              style={{display: "none"}}
              onChange={e => handleFileChange(e)}
            />
            <IonButton 
              expand="block" 
              fill="clear" 
              onClick={onUploadClick}
            >
              {labels.setImage}
            </IonButton>
            <img src={imageUrl} className="img-card" alt={labels.noImage} />
          </>}
        </IonList>
      </IonContent>
      {name && unitsCount &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit}>
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddPack
