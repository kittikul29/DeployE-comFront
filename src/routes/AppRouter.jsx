import {createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom'
import LoginFrom from '../layout/LoginFrom';
import RegisterFrom from '../layout/RegisterFrom';
import useAuth from '../hooks/useAuth';
import Header from '../layout/Header';
import Product from '../layout/Product';
import Addproduct from '../layout/Addproduct';
import ListProduct from '../layout/ListProduct'
import  Cart  from '../layout/Cart'
import Payment from '../layout/payment';
import Order from '../layout/Order';
import Amorder from '../layout/Amorder';
import Profile from '../layout/Profile';


const guestRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header/>
        <Outlet />
      </>
    ),
    children: [
      { index: true, element: <LoginFrom/> },
      { path: "/register", element: <RegisterFrom/>},
    ],
  },
]);

const userRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <Outlet />
      </>
    ),
    children: [

      { index:true, element: <Product/>},
      {path:'/order', element: <Order/>},
      { path: '/cart', element: <Cart/>},
      { path: '/payment', element: <Payment/>},
      { path: '/profile', element: <Profile/>},
      
      // { index: true, element: <UserHome /> },
      // { path: "/new", element: <NewTodoForm /> },
      // { path: "/Booking", element: <Booking /> },
      
    ],
  },
]);

const adminRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <Outlet />
      </>
    ),children: [
      { index: true, element: <Addproduct/> },
      {path: '/amorder', element: <Amorder/>},
      { path: '/list', element: <ListProduct/>}
      
    ],
  }
])

export default function AppRouter() {
    const { user } = useAuth();
    // console.log(user?.role)
    // const finalRouter = user?.id ? userRouter : guestRouter
    const finalRouter = user?.id ? (user.role ==="ADMIN" ? adminRouter: userRouter) : guestRouter
    return <RouterProvider router={finalRouter} />;
  }