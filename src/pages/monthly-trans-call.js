import { useState } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import Footer from './footer'
import labels from '../data/labels'


const MonthlyTransCall = () => {
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  return (
    <Page>
      <Navbar title={labels.profits} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="month" 
          label={labels.month} 
          clearButton
          type="number"
          value={month}
          onChange={e => setMonth(e.target.value)}
          onInputClear={() => setMonth('')}
        />
        <ListInput 
          name="year" 
          label={labels.year} 
          clearButton
          type="number"
          value={year}
          onChange={e => setYear(e.target.value)}
          onInputClear={() => setYear('')}
        />
      </List>
      {!month || !year ? '' : 
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" href={`/monthly-trans/${year * 100 + Number(month)}`}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Footer/>
    </Page>
  )
}
export default MonthlyTransCall
