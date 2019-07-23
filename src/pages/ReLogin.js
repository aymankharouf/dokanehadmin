import React from 'react'
import { Page, Block, Link, Navbar} from 'framework7-react'

const ReLogin = props => {
  return(
    <Page>
      <Navbar title="ReLogin" backLink="Back" />
      <Block>
        <h3 className="center">
          You have to login first <br/>
          <Link className="center" href={`/login/${props.callingPage}`}>Login</Link>
        </h3>
      </Block>
    </Page>
  )
}
export default ReLogin