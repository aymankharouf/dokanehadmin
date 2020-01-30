import React, { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { editCategory, showMessage, showError, getMessage, getCategoryName } from '../data/actions'


const EditCategory = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [category] = useState(() => state.categories.find(c => c.id === props.id))
  const [name, setName] = useState('')
  const [ordering, setOrdering] = useState('')
  const [categories, setCategories] = useState([])
  const [parentId, setParentId] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    setCategories(() => {
      let categories = state.categories.filter(c => c.id !== props.id)
      categories = categories.map(c => {
        return {
          id: c.id,
          name: getCategoryName(c, state.categories)
        }
      })
      return categories.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
    })
  }, [state.categories, props.id])
  useEffect(() => {
    if (name !== category.name
    || ordering !== category.ordering
    || parentId !== category.parentId
    || isActive !== category.isActive) setHasChanged(true)
    else setHasChanged(false)
  }, [category, name, ordering, parentId, isActive])

  useEffect(() => {
    setName(category.name)
    setOrdering(category.ordering)
    setParentId(category.parentId)
    setIsActive(category.isActive)
  }, [category])
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

  const handleEdit = async () => {
    try{
      setInprocess(true)
      await editCategory({
        id: category.id,
        parentId,
        name,
        ordering,
        isActive
      })
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
      <Navbar title={labels.editCategory} backLink={labels.back} />
      <List form>
        <ListItem
          title={labels.mainCategory}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="parentId" defaultValue={category.parentId} onChange={e => setParentId(e.target.value)}>
            <option value=""></option>
            {categories.map(c => 
              <option key={c.id} value={c.id}>{c.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="name" 
          label={labels.name}
          value={name}
          floatingLabel 
          clearButton
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="ordering" 
          label={labels.ordering}
          floatingLabel 
          clearButton
          type="number" 
          value={ordering}
          onChange={e => setOrdering(e.target.value)}
          onInputClear={() => setOrdering('')}
        />
        <ListItem>
          <span>{labels.isActive}</span>
          <Toggle 
            name="isActive" 
            color="green" 
            checked={isActive} 
            onToggleChange={() => setIsActive(!isActive)}
          />
        </ListItem>
      </List>
      {!name || !ordering || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>

    </Page>
  )
}
export default EditCategory
