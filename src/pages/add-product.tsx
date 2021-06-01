import {useState, useContext, useEffect, ChangeEvent, useRef} from 'react'
import {StateContext } from '../data/state-provider'
import {addProduct, getCategoryName, getMessage} from '../data/actions'
import labels from '../data/labels'
import {units} from '../data/config'
import { Category } from '../data/types'
import { useHistory, useLocation } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

const AddProduct = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [trademarkId, setTrademarkId] = useState('')
  const [countryId, setCountryId] = useState('')
  const [unit, setUnit] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState<File>()
  const inputEl = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([])
  useEffect(() => {
    setCategories(() => state.categories.filter(c => c.isLeaf).sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  }, [state.categories])
  useEffect(() => {
    if (countryId === '0') history.push('/add-country')
    if (trademarkId === '0') history.push('/add-trademark')
    if (categoryId === '0') history.push('/add-category/0')
  }, [countryId, trademarkId, categoryId, history])
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click()
  }
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
      if (state.products.find(p => p.categoryId === categoryId && p.countryId === countryId && p.name === name && p.alias === alias)) {
        throw new Error('duplicateProduct')
      }
      const product = {
        name,
        alias,
        description,
        categoryId,
        trademarkId,
        countryId,
        rating: 0,
        ratingCount: 0,
        isActive: true,
        unit,
        imageUrl
      }
      addProduct(product, image)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.addProduct} />
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
              {state.trademarks.map(t => <IonSelectOption key={t.id} value={t.id}>{t.name}</IonSelectOption>)}
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
              {categories.map(c => <IonSelectOption key={c.id} value={c.id}>{getCategoryName(c, state.categories)}</IonSelectOption>)}
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
              {state.countries.map(c => <IonSelectOption key={c.id} value={c.id}>{c.name}</IonSelectOption>)}
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
          <IonImg src={imageUrl} alt={labels.noImage} />
        </IonList>
      </IonContent>
      {name && categoryId !== '0' && countryId !== '0' && (trademarkId !== '0' || !trademarkId) && unit && imageUrl &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddProduct
