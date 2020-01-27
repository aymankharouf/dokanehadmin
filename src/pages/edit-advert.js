import React, {useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { editAdvert, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const EditAdvert = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [advert] = useState(() => state.adverts.find(a => a.id === props.id))
  const [title, setTitle] = useState(advert.title)
  const [text, setText] = useState(advert.text)
  const [imageUrl, setImageUrl] = useState(advert.imageUrl)
  const [image, setImage] = useState('')
  const [fileErrorMessage, setFileErrorMessage] = useState('')
  const [hasChanged, setHasChanged] = useState(false)
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setFileErrorMessage(labels.invalidFile)
      return
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      setImageUrl(fileReader.result)
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  useEffect(() => {
    if (title !== advert.title
    || text !== advert.text
    || imageUrl !== advert.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [advert, title, text, imageUrl])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleSubmit = async () => {
    try{
      const advert = {
        id: props.id,
        title,
        text,
        imageUrl
      }
      setInprocess(true)
      await editAdvert(advert, image)
      setInprocess(false)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editAdvert} backLink={labels.back} />
      <List form>
      <ListInput 
          name="title" 
          label={labels.title}
          floatingLabel 
          clearButton
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          onInputClear={() => setTitle('')}
        />
        <ListInput 
          name="text" 
          label={labels.text}
          floatingLabel 
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
