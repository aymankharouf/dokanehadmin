import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Fab, Icon, FabButton, FabButtons, Badge, FabBackdrop, Toolbar } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import Footer from './footer'
import { deleteCategory, showMessage, showError, getMessage, categoryChildren } from '../data/actions'

interface Props {
  id: string
}
const Categories = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<any>([])
  const [currentCategory] = useState(() => state.categories.find(c => c.id === props.id))
  const [categoryChildrenCount] = useState(() => state.categories.filter(c => c.parentId === currentCategory?.id).length)
  const [categoryProductsCount] = useState(() => state.products.filter((p: any) => p.categoryId === currentCategory?.id).length)
  useEffect(() => {
    setCategories(() => {
      const children = state.categories.filter((c: any) => c.parentId === props.id)
      let categories = children.map((c: any) => {
        const childrenCount = state.categories.filter((cc: any) => cc.parentId === c.id).length
        const categoryChildrens = categoryChildren(c.id, state.categories)
        const productsCount = state.products.filter((p: any) => categoryChildrens.includes(p.categoryId)).length
        return {
          ...c,
          childrenCount,
          productsCount
        }
      })
      return categories.sort((c1: any, c2: any) => c1.ordering - c2.ordering)
    })
  }, [state.categories, state.products, props.id])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = () => {
    try{
      if (!currentCategory) return
      deleteCategory(currentCategory, state.categories)
      showMessage(labels.deleteSuccess)
      f7.views.current.router.back()
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return (
    <Page>
      <Navbar title={currentCategory?.name || labels.categories} backLink={labels.back} />
      <Block>
        <List mediaList>
          {categories.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : categories.map((c: any) =>
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
          <FabButton color="green" onClick={() => f7.views.current.router.navigate(`/add-category/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          {props.id === '0' ? '' :
            <FabButton color="blue" onClick={() => f7.views.current.router.navigate(`/edit-category/${props.id}`)}>
              <Icon material="edit"></Icon>
            </FabButton>
          }
          {props.id !== '0' && categoryChildrenCount + categoryProductsCount === 0 ?
            <FabButton color="red" onClick={() => handleDelete()}>
              <Icon material="delete"></Icon>
            </FabButton>
          : ''}
          <FabButton color="orange" onClick={() => f7.views.current.router.navigate(`/products/${props.id}`)}>
            <Icon material="shopping_cart"></Icon>
          </FabButton>

        </FabButtons>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Categories
