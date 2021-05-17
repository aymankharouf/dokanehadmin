import {useState, useContext, useEffect, ChangeEvent} from 'react'
import {f7, Page, Navbar, List, ListInput, Fab, Icon} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import {editAdvert, getMessage} from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonToast } from '@ionic/react'

type Params = {
  id: string
}
const EditAdvert = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [advert] = useState(() => state.adverts.find(a => a.id === params.id)!)
  const [title, setTitle] = useState(advert?.title)
  const [text, setText] = useState(advert?.text)
  const [imageUrl, setImageUrl] = useState(advert?.imageUrl)
  const [image, setImage] = useState<File>()
  const [fileErrorMessage, setFileErrorMessage] = useState('')
  const [hasChanged, setHasChanged] = useState(false)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setFileErrorMessage(labels.invalidFile)
      return
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      if (fileReader.result) setImageUrl(fileReader.result.toString())
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  useEffect(() => {
    if (title !== advert?.title
    || text !== advert?.text
    || imageUrl !== advert?.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [advert, title, text, imageUrl])
  const handleSubmit = () => {
    try{
      const newAdvert = {
        ...advert,
        title,
        text,
      }
      editAdvert(newAdvert, image)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <Page>
      <Navbar title={labels.editAdvert} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="title" 
          label={labels.title}
          clearButton
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          onInputClear={() => setTitle('')}
        />
        <ListInput 
          name="text" 
          label={labels.text}
          clearButton
          type="textarea" 
          value={text} 
          onChange={e => setText(e.target.value)}
          onInputClear={() => setText('')}
        />
        <ListInput 
          name="image" 
          label="Image" 
          type="file" 
          accept="image/*" 
          errorMessage={fileErrorMessage}
          errorMessageForce
          onChange={e => handleFileChange(e)}
        />
        <img src={imageUrl} className="img-card" alt={title} />
      </List>
      {!title || (!text && !imageUrl) || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditAdvert
