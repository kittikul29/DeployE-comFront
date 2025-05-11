
//สมบูรณ์ที่สุด
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return token;
  };

  const fetchCart = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:8000/cart/showcarts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (err) {
      console.error('Error fetching cart data', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const deleteCart = async (id) => {
    try {
      const token = getToken();
      await axios.delete(`http://localhost:8000/cart/deletecart/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(cart.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting cart item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  const updateQuantity = async (id, total) => {
    if (total < 1) {
      setError('Quantity must be at least 1');
      return;
    }
    try {
      const token = getToken();
      const cartItem = cart.find(item => item.id === id);
      const all_price = cartItem.product.price * total;
      await axios.put(
        `http://localhost:8000/cart/updatequantity/${id}`,
        { total, all_price },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCart(cart.map(item => item.id === id ? { ...item, total, all_price } : item));
    } catch (err) {
      console.error('Error updating quantity:', err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "จำนวนสินค้าหมดแล้ว!",
        footer: '<a href="#">จำนวนสินค้าได้หมดลงแล้ว?</a>'
      });
    }
  };

  const calculateTotalPrice = () => {
    const totalPrice = cart.reduce((total, cartItem) => total + cartItem.product.price * cartItem.total, 0);
    return totalPrice === 0 ? 'ไม่มีสินค้า' : totalPrice;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('กรุณาเพิ่มสินค้าใส่ตะกร้า');
    } else {
      navigate('/payment', { state: { cartId: cart.map(item => item.id) } })
    }
  };

  if (loading) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">ตะกร้าสินค้า</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left">ลำดับ</th>
              <th className="px-6 py-4 text-left">รูป</th>
              <th className="px-6 py-4 text-left">สินค้า</th>
              <th className="px-6 py-4 text-left">ประเภทสินค้า</th>
              <th className="px-6 py-4 text-left">ราคา</th>
              <th className="px-6 py-4 text-left">จำนวน</th>
              <th className="px-6 py-4 text-left">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((cartItem, index) => {
              const { product } = cartItem;
              return (
                <tr key={cartItem.id} className="hover:bg-gray-100 border-b border-gray-200">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">{product.price}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={cartItem.total}
                      min="1"
                      onChange={(e) => updateQuantity(cartItem.id, parseInt(e.target.value))}
                      className="w-16 border border-gray-300 rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteCart(cartItem.id)} className="text-red-500 font-semibold hover:text-red-700">ลบ</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-8 flex justify-end">
        <div className="text-xl font-semibold mr-8">ราคารวม: {calculateTotalPrice()}</div>
        <button
          type="button"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
          onClick={handleCheckout}
        >
          สั่งซื้อ
        </button>
      </div>
    </div>
  );
};

export default Cart;






// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from 'react-router-dom';

// const Cart = () => {
//   const [cart, setCart] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   const getToken = () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       throw new Error('No token found');
//     }
//     return token;
//   };

//   const fetchCart = async () => {
//     try {
//       const token = getToken();
//       const response = await axios.get('http://localhost:8000/cart/showcarts', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setCart(response.data);
//     } catch (err) {
//       console.error('Error fetching cart data', err);
//       setError(err.message || 'Unknown error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const deleteCart = async (id) => {
//     try {
//       const token = getToken();
//       await axios.delete(`http://localhost:8000/cart/deletecart/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setCart(cart.filter(item => item.id !== id));
//     } catch (err) {
//       console.error('Error deleting cart item:', err);
//       setError('Failed to delete item. Please try again.');
//     }
//   };

//   const updateQuantity = async (id, total) => {
//     if (total < 1) {
//       setError('Quantity must be at least 1');
//       return;
//     }
//     try {
//       const token = getToken();
//       const cartItem = cart.find(item => item.id === id);
//       const all_price = cartItem.product.price * total;
//       await axios.put(
//         `http://localhost:8000/cart/updatequantity/${id}`,
//         { total, all_price },
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );
//       setCart(cart.map(item => item.id === id ? { ...item, total, all_price } : item));
//     } catch (err) {
//       console.error('Error updating quantity:', err);
//       setError('Failed to update quantity. Please try again.');
//     }
//   };

//   const calculateTotalPrice = () => {
//     const totalPrice = cart.reduce((total, cartItem) => total + cartItem.product.price * cartItem.total, 0);
//     return totalPrice === 0 ? 'ไม่มีสินค้า' : totalPrice;
//   };

//   const handleCheckout = () => {
//     if (cart.length === 0) {
//       alert('กรุณาเพิ่มสินค้าใส่ตะกร้า');
//     } else {
//       navigate('/payment', { state: { cartId: cart.map(item => item.id) } })
//     }
//   };

//   if (loading) {
//     return <div className="text-center mt-4">Loading...</div>;
//   }

//   if (error) {
//     return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
//   }

//   return (
//     <div className="container mx-auto mt-10">
//       <h2 className="text-2xl font-bold mb-6 text-center">Your Cart</h2>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border border-gray-300">
//           <thead>
//             <tr>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ลำดับ</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Image</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Product</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Category</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Price</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Quantity</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Delete</th>
//             </tr>
//           </thead>
//           <tbody>
//             {cart.map((cartItem, index) => {
//               const { product } = cartItem;
//               return (
//                 <tr key={cartItem.id} className="hover:bg-gray-100">
//                   <td className="px-6 py-4 border-b border-gray-300">{index + 1}</td>
//                   <td className="px-6 py-4 border-b border-gray-300">
//                     <img
//                       src={product.image}
//                       alt={product.name}
//                       className="w-16 h-16 object-cover rounded"
//                     />
//                   </td>
//                   <td className="px-6 py-4 border-b border-gray-300">{product.name}</td>
//                   <td className="px-6 py-4 border-b border-gray-300">{product.category}</td>
//                   <td className="px-6 py-4 border-b border-gray-300">{product.price}</td>
//                   <td className="px-6 py-4 border-b border-gray-300">
//                     <input
//                       type="number"
//                       value={cartItem.total}
//                       min="1"
//                       onChange={(e) => updateQuantity(cartItem.id, parseInt(e.target.value))}
//                       className="w-16 border border-gray-300 rounded px-2 py-1"
//                     />
//                   </td>
//                   <td className="px-6 py-4 border-b border-gray-300">
//                     <button onClick={() => deleteCart(cartItem.id)} className="text-red-500">Delete</button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       <h1 className="text-2xl font-bold mt-6 ml-[50rem]">ราคารวม: {calculateTotalPrice()}</h1>
//       <div className="mt-6 ml-[50rem]">
//         <button
//           type="button"
//           className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center"
//           onClick={handleCheckout}
//         >
//           สั่งซื้อ
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Cart;












// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from 'react-router-dom';

// const Cart = () => {
//   const [cart, setCart] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   const getToken = () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       throw new Error('No token found');
//     }
//     return token;
//   };

//   useEffect(() => {
//     const showCart = async () => {
//       try {
//         const token = getToken();
//         const response = await axios.get('http://localhost:8000/cart/showcarts', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setCart(response.data);
//       } catch (err) {
//         console.error('Error fetching cart data', err);
//         setError(err.message || 'Unknown error');
//       } finally {
//         setLoading(false);
//       }
//     };
//     showCart();
//   }, []);

//   const deleteCart = async (id) => {
//     try {
//       const token = getToken();
//       await axios.delete(`http://localhost:8000/cart/deletecart/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setCart(cart.filter(item => item.id !== id));
//     } catch (err) {
//       console.error('Error deleting cart item:', err);
//       setError('Failed to delete item. Please try again.');
//     }
//   };

//   const updateQuantity = async (id, total) => {
//     if (total < 1) {
//       setError('Quantity must be at least 1');
//       return;
//     }
//     try {
//       const token = getToken();
//       const cartItem = cart.find(item => item.id === id);
//       const all_price = cartItem.product.price * total;
//       const response = await axios.put(
//         `http://localhost:8000/cart/updatequantity/${id}`,
//         { total, all_price },
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );
//       setCart(cart.map(item => item.id === id ? { ...item, total, all_price } : item));
//     } catch (err) {
//       console.error('Error updating quantity:', err);
//       setError('Failed to update quantity. Please try again.');
//     }
//   };

//   const calculateTotalPrice = () => {
//     const totalPrice = cart.reduce((total, cartItem) => total + cartItem.product.price * cartItem.total, 0);
//     return totalPrice === 0 ? 'ไม่มีสินค้า' : totalPrice;
//   };

//   const handleCheckout = () => {
//     navigate('/payment', { state: { cartId: cart.map(item => item.id) } });
//   };

//   if (loading) {
//     return <div className="text-center mt-4">Loading...</div>;
//   }

//   if (error) {
//     return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
//   }

//   return (
//     <div className="container mx-auto mt-10">
//       <h2 className="text-2xl font-bold mb-6 text-center">Your Cart</h2>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border border-gray-300">
//           <thead>
//             <tr>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ลำดับ</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Image</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Product</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Category</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Price</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Quantity</th>
//               <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Delete</th>
//             </tr>
//           </thead>
//           <tbody>
//             {cart.map((cartItem, index) => (
//               <tr key={cartItem.id} className="hover:bg-gray-100">
//                 <td className="px-6 py-4 border-b border-gray-300">{index + 1}</td>
//                 <td className="px-6 py-4 border-b border-gray-300">
//                   <img
//                     src={cartItem.product.image}
//                     alt={cartItem.product.name}
//                     className="w-16 h-16 object-cover rounded"
//                   />
//                 </td>
//                 <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.name}</td>
//                 <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.category}</td>
//                 <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.price}</td>
//                 <td className="px-6 py-4 border-b border-gray-300">
//                   <input
//                     type="number"
//                     value={cartItem.total}
//                     min="1"
//                     onChange={(e) => updateQuantity(cartItem.id, parseInt(e.target.value))}
//                     className="w-16 border border-gray-300 rounded px-2 py-1"
//                   />
//                 </td>
//                 <td className="px-6 py-4 border-b border-gray-300">
//                   <button onClick={() => deleteCart(cartItem.id)} className="text-red-500">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <h1 className="text-2xl font-bold mt-6">ราคารวม: {calculateTotalPrice()}</h1>
//       <div className="mt-6">
//         <button
//           type="button"
//           className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center"
//           onClick={handleCheckout}
//         >
//           สั่งซื้อ
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Cart;
