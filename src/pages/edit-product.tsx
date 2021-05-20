import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {StateContext} from '../data/state-provider'
import {editProduct, getCategoryName, getMessage} from '../data/actions'
import labels from '../data/labels'
import {units} from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditProduct = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [product] = useState(() => state.products.find(p => p.id === params.id)!)
  const [name, setName] = useState(product.name)
  const [alias, setAlias] = useState(product.alias)
  const [description, setDescription] = useState(product.description)
  const [categoryId, setCategoryId] = useState(product.categoryId)
  const [trademarkId, setTrademarkId] = useState(product.trademarkId)
  const [countryId, setCountryId] = useState(product.countryId)
  const [unit, setUnit] = useState(product.unit)
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const [image, setImage] = useState<File>()
  const inputEl = useRef<HTMLInputElement | null>(null);
  const [hasChanged, setHasChanged] = useState(false)
  const [categories] = useState(() => [...state.categories].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  const [countries] = useState(() => [...state.countries].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  const [trademarks] = useState(() => [...state.trademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  useEffect(() => {
    if (countryId === '0') history.push('/add-country')
    if (trademarkId === '0') history.push('/add-trademark')
    if (categoryId === '0') history.push('/add-category/0')
  }, [countryId, trademarkId, categoryId, history])
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
  useEffect(() => {
    if (name !== product.name
    || alias !== product.alias
    || description !== product.description
    || countryId !== product.countryId
    || categoryId !== product.categoryId
    || trademarkId !== product.trademarkId
    || unit !== product.unit
    || imageUrl !== product.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [product, name, alias, description, countryId, categoryId, trademarkId, unit, imageUrl])
  const handleSubmit = () => {
    try{
      if (state.products.find(p => p.id !== product.id && p.categoryId === categoryId && p.countryId === countryId && p.name === name)) {
        throw new Error('duplicateProduct')
      }
      const newProduct = {
        ...product,
        categoryId,
        name,
        alias,
        description,
        trademarkId,
        countryId,
        unit
      }
      editProduct(newProduct, product.name, state.packs, image)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.editProduct} />
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
            <IonLabel position="floating" color="primary">{labels.alias}</IonLabel>
            <IonInput 
              value={alias} 
              type="text" 
              clearInput
              onIonChange={e => setAlias(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.description}</IonLabel>
            <IonInput 
              value={description} 
              type="text" 
              clearInput
              onIonChange={e => setDescription(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.trademark}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={trademarkId}
              onIonChange={e => setTrademarkId(e.detail.value)}
            >
              <IonSelectOption value=""></IonSelectOption>
              <IonSelectOption value="0">{labels.new}</IonSelectOption>
              {trademarks.map(t => <IonSelectOption key={t.id} value={t.id}>{t.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.category}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={categoryId}
              onIonChange={e => setCategoryId(e.detail.value)}
            >
              <IonSelectOption value="0">{labels.new}</IonSelectOption>
              {categories.map(c => <IonSelectOption key={c.id} value={c.id} disabled={!c.isLeaf}>{getCategoryName(c, state.categories)}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.country}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={countryId}
              onIonChange={e => setCountryId(e.detail.value)}
            >
              <IonSelectOption value="0">{labels.new}</IonSelectOption>
              {countries.map(c => <IonSelectOption key={c.id} value={c.id}>{c.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">{labels.unit}</IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={unit}
              onIonChange={e => setUnit(e.detail.value)}
            >
              {units.map(u => <IonSelectOption key={u.id} value={u.id}>{u.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <input 
            ref={inputEl}
            type="file" 
            accept="image/*" 
            style={{display: "none" }}
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
        </IonList>
      </IonContent>
      {name && categoryId && countryId && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit}>
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default EditProduct
