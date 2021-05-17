import {useContext, useState, useEffect} from 'react'
import {f7, Page, Block, Navbar, List, ListItem, Fab, Icon, FabButton, FabButtons, Badge, FabBackdrop} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {deleteCategory, getMessage, categoryChildren} from '../data/actions'
import {Category} from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonToast } from '@ionic/react'

type Params = {
  id: string
}
type ExtendedCategory = Category & {
  childrenCount: number,
  productsCount: number
}
const Categories = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [categories, setCategories] = useState<ExtendedCategory[]>([])
  const [currentCategory] = useState(() => state.categories.find(c => c.id === params.id))
  const [categoryChildrenCount] = useState(() => state.categories.filter(c => c.parentId === currentCategory?.id).length)
  const [categoryProductsCount] = useState(() => state.products.filter(p => p.categoryId === currentCategory?.id).length)
  useEffect(() => {
    setCategories(() => {
      const children = state.categories.filter(c => c.parentId === params.id)
      let categories = children.map(c => {
        const childrenCount = state.categories.filter(cc => cc.parentId === c.id).length
        const categoryChildrens = categoryChildren(c.id, state.categories)
        const productsCount = state.products.filter(p => categoryChildrens.includes(p.categoryId)).length
        return {
          ...c,
          childrenCount,
          productsCount
        }
      })
      return categories.sort((c1, c2) => c1.ordering - c2.ordering)
    })
  }, [state.categories, state.products, params.id])
  const handleDelete = () => {
    try{
      if (!currentCategory) return
      deleteCategory(currentCategory, state.categories)
      message(labels.deleteSuccess, 3000)
      history.goBack()
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <Page>
      <Navbar title={currentCategory?.name || labels.categories} backLink={labels.back} />
      <Block>
        <List mediaList>
          {categories.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : categories.map(c =>
              <ListItem 
                link={`/categories/${c.id}`} 
                title={c.name}
                subtitle={`${labels.childrenCount}: ${c.childrenCount}`}
                text={`${labels.attachedProducts}: ${c.productsCount}`}
                after={c.ordering}
                key={c.id} 
              >
                {c.isActive ? '' : <Badge slot="title" color='red'>{labels.inActive}</Badge>}
              </ListItem>
            )
          }
        </List>
      </Block>
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => f7.views.current.router.navigate(`/add-category/${params.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          {params.id === '0' ? '' :
            <FabButton color="blue" onClick={() => f7.views.current.router.navigate(`/edit-category/${params.id}`)}>
              <Icon material="edit"></Icon>
            </FabButton>
          }
          {params.id !== '0' && categoryChildrenCount + categoryProductsCount === 0 ?
            <FabButton color="red" onClick={() => handleDelete()}>
              <Icon material="delete"></Icon>
            </FabButton>
          : ''}
          <FabButton color="orange" onClick={() => f7.views.current.router.navigate(`/products/${params.id}`)}>
            <Icon material="shopping_cart"></Icon>
          </FabButton>

        </FabButtons>
      </Fab>
    </Page>
  )
}

export default Categories
