import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Context } from '../../context/ApplicationContext'

export const NotFound = () => {
  const { logout } = useContext(Context) 

  return(<div>
    <h1>Page not Found :-(</h1>
    <Link to={location => { logout(); return '/'}} >return to login</Link>
  </div>)
}
