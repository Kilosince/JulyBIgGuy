import { Link } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../context/UserContext";

const Nav = () => {
  const { authUser } = useContext(UserContext);
  return (
    <nav>
      {authUser === null ? 
      <>
        <Link className="signup" to="/signup">Sign up</Link>
        <Link className="signin" to="/signin">Sign in</Link>
      </>
      :
      <>
      <span> Welcome {authUser.name} </span>
        <Link className="home" to="/authenticated">Home</Link>
        <Link className="createstore" to="/createstore">Store</Link>
        <Link className="updatestore" to="/updatestore">Manage</Link>
        <Link className="storelist" to="/storelist"> Storelist</Link>
        <Link className="paymentprocess" to="/paymentprocess"> Cart</Link>
        <Link className="followers" to="/followers">Followers</Link>
        <Link className="user" to="/userlist">Users</Link>
        <Link className="settings" to="/settings">Settings</Link>
        <Link className="signout" to="/signout">Sign Out</Link>
     
      </>
      }
      
    </nav>
  );
}

export default Nav;