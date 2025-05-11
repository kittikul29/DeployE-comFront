
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import useAuth from '../hooks/useAuth';

const guestNav = [
  { to: '/', text: 'Login' },
  // { to: '/register', text: 'Register' },
];

const userNav = [
  { to: '/', text: 'Home' },
  { to: '/cart', text: 'Cart' },
  { to: '/order', text: 'Order' },
  { to: '/profile', text: 'Profile' },
];

const adminNav = [
  { to: '/', text: 'Home' },
  { to: '/amorder', text: 'ShowOrder' },
  { to: '/list', text: 'ListProduct' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const finalNav = user?.id ? (user.role === "ADMIN" ? adminNav : userNav) : guestNav;
  const navigate = useNavigate();

  const hdlLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to log out?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
        Swal.fire('Logged out!', 'You have been logged out successfully.', 'success');
      }
    });
  };

  return (
    <div className="navbar bg-orange-400">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">
        ||  Shop Style || {user?.id ? user.name : 'Guest'}
        </a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {finalNav.map((el) => (
            <li key={el.to}>
              <Link to={el.to}>{el.text}</Link>
            </li>
          ))}
        </ul>
        {user?.id && <button onClick={hdlLogout} className="btn btn-red">Logout</button>}
      </div>
    </div>
  );
}









// import {Link, useNavigate} from 'react-router-dom'

// import useAuth from '../hooks/useAuth'


// const guestNav = [
//   { to : '/', text: 'Login'},
//   { to : '/register', text: 'Register'},
// ]

// const userNav = [
//   { to : '/', text: 'Home'},
//   {to:'/cart', text: 'cart'},
//   {to : '/order', text: 'Order'},
//   {to : 'profile', text: 'profile'},
  
// ]

// const adminNav = [
//   { to : '/', text: 'Home'},
//   {to : '/amorder', text: 'ShowOrder'},
//   {to: '/list', text: 'ListProduct'},
 
// ]


// export default function Header() {
//   const {user, logout} = useAuth()
//   // const finalNav = user?.id ? userNav : guestNav
//   const finalNav = user?.id ? (user.role ==="ADMIN" ? adminNav : userNav) : guestNav

 

//   const navigate = useNavigate()

  

//   const hdlLogout = () =>{
//     logout()
//     navigate('/')
//   }
//   return (
//     <div className="navbar bg-orange-400">
//   <div className="flex-1">
//     <a className="btn btn-ghost text-xl">Shop Style  {user?.id ? user.name : 'Guest'}</a>
//   </div>
//   <div className="flex-none">
//     <ul className='menu menu-horizontal px-1'>
//       { finalNav.map( el => (
//         <li key={el.to}>
//             <Link to={el.to}>{el.text}</Link>
//         </li>
//       ))}
//     </ul>

      
//     {user?.id && <button onClick={hdlLogout} className="btn btn-red">Logout</button>}

//     {/* <div className="dropdown dropdown-end">
//       <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
//         <div className="w-10 rounded-full">
//           <img alt="Tailwind CSS Navbar component" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
//         </div>
//       </div>
//       <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
//      {user?.id && (
//         <li>
//           <Link to='#' onClick={hdlLogout}>Logout</Link>
//         </li>
//         )}
        
//       </ul>
//     </div> */}
//   </div>
// </div>
//   )
// }
