import {useContext, useState, useEffect} from 'react'
import {Page, Block, Navbar, Button} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {randomColors} from '../data/config'
import {User} from '../data/types'

type Section = {
  id: string,
  name: string,
  path: string,
  count: number
}
const Approvals = () => {
  const {state} = useContext(StateContext)
  const [sections, setSections] = useState<Section[]>([])
  const [newOwners, setNewOwners] = useState<User[]>([])
  useEffect(() => {
    setNewOwners(() => state.users.filter(u => u.storeName && !u.storeId))
  }, [state.users])
  useEffect(() => {
    setSections(() => [
      {id: '1', name: labels.passwordRequests, path: '/password-requests/', count: state.passwordRequests.length},
      {id: '2', name: labels.newOwners, path: '/permission-list/n', count: newOwners.length},
      {id: '3', name: labels.productRequests, path: '/product-requests/', count: state.productRequests.length},
    ])
  }, [state.passwordRequests, state.productRequests, newOwners])
  let i = 0
  return(
    <Page>
      <Navbar title={labels.approvals} backLink={labels.back} />
      <Block>
        {sections.map(s => 
          <Button 
            text={`${s.name} ${s.count > 0 ? '(' + s.count + ')' : ''}`}
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={s.path} 
            key={s.id}
          />
        )}
      </Block>
    </Page>
  )
}

export default Approvals
