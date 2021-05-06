import {Page, Block, Button, Navbar, NavRight, Searchbar, Link} from 'framework7-react'
import { useContext } from 'react'
import {randomColors, userTypes} from '../data/config'
import labels from '../data/labels'
import { StateContext } from '../data/state-provider'

const UserTypes = () => {
  const {state} = useContext(StateContext)
  let i = 0
  return (
    <Page>
      <Navbar title={labels.users} backLink={labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-inner"
          clearButton
          expandable
          placeholder={labels.search}
        />
      </Navbar>
      <Block>
        {userTypes.map(t => 
          <Button
            text={`${t.name}(${state.users.filter(u => u.type === t.id).length})`}
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={`/users/${t.id}`} 
            key={t.id}
          />
        )}
      </Block>
    </Page>
  )
}

export default UserTypes
