import {useState, useContext, useEffect} from 'react'
import {f7, Page, Navbar, List, ListInput, Fab, Icon, ListItem, Toggle} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {editCategory, showMessage, showError, getMessage, getCategoryName} from '../data/actions'

type Props = {
  id: string
}
const EditCategory = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [category] = useState(() => state.categories.find(c => c.id === props.id)!)
  const [name, setName] = useState(category?.name)
  const [ordering, setOrdering] = useState(category?.ordering.toString())
  const [parentId, setParentId] = useState(category?.parentId)
  const [isActive, setIsActive] = useState(category?.isActive)
  const [hasChanged, setHasChanged] = useState(false)
  const [categories] = useState(() => {
    let otherCategories = state.categories.filter(c => c.id !== props.id)
    let categories = otherCategories.map(c => {
      return {
        id: c.id,
        name: getCategoryName(c, state.categories)
      }
    })
    return categories.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  })
  useEffect(() => {
    if (name !== category?.name
    || +ordering !== category?.ordering
    || parentId !== category?.parentId
    || isActive !== category?.isActive) setHasChanged(true)
    else setHasChanged(false)
  }, [category, name, ordering, parentId, isActive])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleEdit = () => {
    try{
      const newCategory = {
        ...category,
        parentId,
        name,
        ordering: +ordering,
        isActive
      }
      editCategory(newCategory, category, state.categories)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editCategory} backLink={labels.back} />
      <List form inlineLabels>
        <ListItem
          title={labels.mainCategory}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: '#parents', 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="parentId" value={parentId} onChange={e => setParentId(e.target.value)}>
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
          clearButton
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="ordering" 
          label={labels.ordering}
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
            onToggleChange={() => setIsActive(s => !s)}
          />
        </ListItem>
      </List>
      {name && ordering && hasChanged &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditCategory
