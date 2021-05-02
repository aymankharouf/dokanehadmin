import {useState, useEffect} from 'react'
import {f7, Page, Navbar, List, ListInput, Button} from 'framework7-react'
import {registerUser, showMessage, showError, getMessage} from '../data/actions'
import labels from '../data/labels'

type Props = {
  id: string
}
const Register = (props: Props) => {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
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

  const handleRegister = async () => {
    try{
      setInprocess(true)
      await registerUser(email, password)
      setInprocess(false)
      showMessage(labels.registerSuccess)
      f7.views.current.router.back()
      f7.panel.close('right') 
    } catch (err){
      setInprocess(false)
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return (
    <Page>
      <Navbar title={labels.registerTitle} backLink={labels.back} />
      <List form>
        <ListInput
          label={labels.email}
          type="text"
          clearButton
          autofocus
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <ListInput
          label={labels.password}
          type="text"
          clearButton
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </List>
      {!email || !password ? '' :
        <Button text={labels.register} href="#" large onClick={() => handleRegister()} />
      }
    </Page>
  )
}
export default Register
