import { Route, Routes } from "react-router-dom";
import Layout from './components/Layout';
import Header from './components/Header';
import Home from './components/Home';
import UserSignUp from './components/UserSignUp';
import UserSignIn from './components/UserSignIn';
import UserSignOut from './components/UserSignOut';
import MenuItems from './components/MenuItems';
import UpdateStore from './components/UpdateStore';
import Followers from './components/Followers';
import Compliments from './components/Compliments';
import StoreList from './components/StoreList';
import UserList from './components/UserList';
import Settings from "./components/Settings";
import Authenticated from './components/Authenticated';
import NotFound from './components/NotFound';
import CreateItem from './components/CreateItem';
import CreateStore from './components/CreateStore';
import PaymentProcess from './components/PaymentProcess';
import StoreDetails from './components/StoreDetails';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div>
      <Header />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="signin" element={<UserSignIn />} />
          <Route path="signup" element={<UserSignUp />} />
          <Route path="signout" element={<UserSignOut />} />
          <Route path="createitem" element={<CreateItem />} />
          <Route path="paymentprocess" element={<PaymentProcess />} />
          <Route path="storelist" element={<StoreList />} />
          <Route path="compliments" element={<Compliments />} />
          <Route path="createstore" element={<CreateStore />} />
          <Route path="menuitems" element={<MenuItems />} />
          <Route path="updatestore" element={<UpdateStore />} />
          <Route path="followers" element={<Followers />} />
          <Route path="userlist" element={<UserList />} />
          <Route path="stores/:storeId" element={<StoreDetails />} />
          <Route element={<PrivateRoute />}>
            <Route path="authenticated" element={<Authenticated />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
