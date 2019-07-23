import React, { useContext } from 'react'
import { Button, Block, Page, Navbar, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const Categories = props => {
  const { state } = useContext(StoreContext)
  const section = state.sections.find(section => section.id === props.id)
  const categories = state.categories.filter(category => category.section === props.id)
  return(
    <Page>
      <Navbar title={section.name} backLink="Back" />
      <Block>
        {categories && categories.map(category => {
          return (
            <Button large fill className="sections" color={state.randomColors[parseInt(category.id) % 13].name} href={`/category/${category.id}`} key={category.id}>
              {category.name}
            </Button>
          )
        })}
      </Block>
      <Toolbar bottom>
        <BottomToolbar isHome="1"/>
      </Toolbar>
    </Page>
  )
}


export default Categories
