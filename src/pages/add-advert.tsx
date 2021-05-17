import {useState, ChangeEvent} from 'react'
import {f7, Page, Navbar, List, ListInput, ListItem, Fab, Icon} from 'framework7-react'
import {addAdvert, getMessage} from '../data/actions'
import labels from '../data/labels'
import {advertTypes} from '../data/config'
import { useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'

const AddAdvert = () => {
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [type, setType] = useState('')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState<File>()
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
        if (fileReader.result) setImageUrl(fileReader.result?.toString())
      })
      fileReader.readAsDataURL(files[0])
      setImage(files[0])
    } catch (err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleSubmit = () => {
    try{
      const advert = {
        type,
        title,
        text,
        isActive: false,
        time: new Date()
      }
      addAdvert(advert, image)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  
  return (
    <Page>
      <Navbar title={labels.addAdvert} backLink={labels.back} />
      <List form inlineLabels>
        <ListItem
          title={labels.type}
          smartSelect
          id="types"
          // @ts-ignore
          smartSelectParams={{
            // el: "#types", 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="type" value={type} onChange={e => setType(e.target.value)}>
            <option value=""></option>
            {advertTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
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
        <ListInput name="image" label={labels.image} type="file" accept="image/*" onChange={e => handleFileChange(e)}/>
        <img src={imageUrl} className="img-card" alt={title} />
      </List>
      {!title || (!text && !imageUrl) ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddAdvert
