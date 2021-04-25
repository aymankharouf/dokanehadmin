import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { ProductRequest } from '../data/types'

const ProductRequests = () => {
  const { state } = useContext(StateContext)
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([])
  useEffect(() => {
    setProductRequests(() => [...state.productRequests].sort((r1, r2) => r1.time > r2.time ? 1 : -1))
  }, [state.productRequests])
  return(
    <Page>
      <Navbar title={labels.productRequests} backLink={labels.back} />
      <Block>
        <List mediaList>
          {productRequests.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : productRequests.map(r => 
              <ListItem
                link={`/product-request-details/${r.id}`}
                title={r.name}
                subtitle={r.weight}
                text={r.country}
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

export default ProductRequests
