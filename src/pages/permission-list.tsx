import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, NavRight, Searchbar, Link, Button } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { permitUser, showMessage, showError, getMessage } from '../data/actions'
import { User } from '../data/types'

type Props = {
  id: string
}
const PermissionList = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    setUsers(() => {
      const customers = state.users.filter(u => (props.id === 's' && u.storeId) || (props.id === 'n' && u.storeName && !u.storeId))
      return customers.map(c => {
        const storeName = state.stores.find(s => s.id === c.storeId)?.name || c.storeName || ''
        return {
          ...c,
          storeName
        }
      })
    })
  }, [state.stores, state.users, props.id])
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
  const handleUnPermit = (user: User) => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        setInprocess(true)
        const storeId = props.id === 's' ? '' : user.storeId!
        await permitUser(user, storeId)
        setInprocess(false)
        showMessage(labels.unPermitSuccess)
        f7.views.current.router.back()
      } catch (err){
        setInprocess(false)
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }
  return(
    <Page>
      <Navbar title={props.id === 's' ? labels.storesOwners : labels.newOwners} backLink={labels.back}>
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
        <List className="searchbar-not-found">
          <ListItem title={labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {users.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : users.map(u => 
              <ListItem
                title={u.name}
                subtitle={u.storeName}
                key={u.id}
              >
                {props.id === 'n' ?
                  <Button text={labels.permitUser} slot="after" onClick={() => f7.views.current.router.navigate(`/permit-user/${u.id}`)} />
                : 
                  <Button text={labels.unPermitUser} slot="after" onClick={() => handleUnPermit(u)} />
                }
              </ListItem>
            )
          }
        </List>
      </Block>
    </Page>
  )
}

export default PermissionList
