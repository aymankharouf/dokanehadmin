import React from 'react'
import { Page, Block, Link, Navbar} from 'framework7-react'
import labels from '../data/labels'

const ReLogin = props => {
  return(
    <Page>
      <Navbar title={labels.reloginTitle} backLink={labels.back} />
      <Block>
        <h3 className="center">
          {labels.relogin} <br/>
          <Link className="center" href="/login/">{labels.login}</Link>
        </h3>
      </Block>
    </Page>
  )
}
export default ReLogin