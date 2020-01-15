import React, { useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { addAdvert, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const AddAdvert = props => {
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState(null)
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setError(labels.invalidFile)
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
      setInprocess(true)
      await addAdvert(title, text, image)
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.addAdvert} backLink={labels.back} />
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
