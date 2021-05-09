import {useContext, useState, useEffect} from 'react'
import {Page, Block, Navbar, List, ListItem} from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {PackRequest} from '../data/types'

const PackRequests = () => {
  const {state} = useContext(StateContext)
  const [packRequests, setPackRequests] = useState<PackRequest[]>([])
  useEffect(() => {
    setPackRequests(() => [...state.packRequests].sort((r1, r2) => r1.time > r2.time ? -1 : 1))
  }, [state.packRequests])
  return(
    <Page>
      <Navbar title={labels.packRequests} backLink={labels.back} />
      <Block>
        <List mediaList>
          {packRequests.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : packRequests.map(r => 
              <ListItem
                link={`/pack-request-details/${r.id}`}
                title={state.packs.find(p => p.id === r.siblingPackId)?.product.name}
                subtitle={r.name}
                text={`${labels.price}: ${r.price.toFixed(2)}`}
                footer={moment(r.time).fromNow()}
                key={r.id}
              />
            )
          }
        </List>
      </Block>
    </Page>
  )
}

export default PackRequests
