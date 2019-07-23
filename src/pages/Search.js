import React, { useState, useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Link, Icon,  Col, Input} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Search = props => {
  const { state, products } = useContext(StoreContext)
  const [orderBy, setOrderBy] = useState('0')
  const [searchText, setSearchText] = useState('')
  const [results, setResults] = useState([])
  const handleSearch = () => {
    if (searchText === '') return
    setResults(products.filter(product => product.name.indexOf(searchText) >= 0))
  }
  const handleOrder = e => {
    switch(e.target.value){
      case '1':
        setResults(results.sort((producta, productb) => producta.value - productb.value))
        break
      case '2':
        setResults(results.sort((producta, productb) => producta.price - productb.price))
        break
      case '3':
        setResults(results.sort((producta, productb) => productb.sales - producta.sales))
        break
      case '4':
        setResults(results.sort((producta, productb) => productb.rating - producta.rating))
        break
      case '5':
        setResults(results.sort((producta, productb) => productb.time.seconds - producta.time.seconds))
        break
      case '6':
        setResults(results.sort((producta, productb) => producta.trademark - productb.trademark))
        break
      default:
        setResults(products.filter(product => product.name.indexOf(searchText) >= 0))
      }
    setOrderBy(e.target.value)
  }

  const orderByList = state.orderByList.map(orderByItem => orderByItem.id === 0 ? <option key={orderByItem.id} value={orderByItem.id} disabled>{orderByItem.name}</option> : <option key={orderByItem.id} value={orderByItem.id}>{orderByItem.name}</option>)
  const orderList = results.length <= 1 ? '' : 
    <ListItem
      title="Order"
      smartSelect
      smartSelectParams={{openIn: 'popover', closeOnSelect: true}}
    >
      <select name="order" value={orderBy} onChange={(e) => handleOrder(e)}>
        {orderByList}
      </select>
    </ListItem>

  return(
    <Page>
      <Navbar title="Search" backLink="Back" />
      <Block>
          <List>
            <ListItem>
              <Col width="90">
                <Input inputId="searchText" size="100" type="text" clearButton onChange={(e) => setSearchText(e.target.value)} onInputClear={() => setResults('')}/>
              </Col>
              <Col width="10">
                <Link onClick={() => handleSearch()} className="search-icon"><Icon material="search"></Icon></Link>
              </Col>
            </ListItem>
            {orderList}
          </List>
          <List mediaList>
            {results && results.map(product => {
              return (
                <ListItem
                  link={`/product/${product.id}`}
                  title={product.name}
                  after={parseFloat(product.price).toFixed(3)}
                  subtitle={product.trademark}
                  text={product.name}
                  key={product.id}
                >
                  <img slot="media" src={product.imageUrl} width="80" alt=""/>
                </ListItem>
              )
            })}
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Search
