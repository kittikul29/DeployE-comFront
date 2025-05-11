import axios from "axios";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function LoginForm() {
  const { setUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Create navigate instance

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const hdlChange = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/auth/getproductuser");
        setProducts(response.data.getproduct);
      } catch (error) {
        console.log(error.message);
      }
    };
    getProducts();
  }, []);

  const hdlSubmit = async (e) => {
    try {
      e.preventDefault();
      const rs = await axios.post("http://localhost:8000/auth/login", input);

      if (rs.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Login successful",
          text: "You have successfully logged in!",
        });
        setShowModal(false); // Close the modal on successful login
      }

      localStorage.setItem("token", rs.data.token);
      const rs1 = await axios.get("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${rs.data.token}` },
      });
      setUser(rs1.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: err.message,
      });
    }
  };

  const handleAddToCart = (productId, price) => {
    // Show the login modal when trying to add to cart
    setShowModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-100 to-orange-150">
      <div>
        <p className="font-semibold text-center cursor-pointer text-3xl mt-3" onClick={handleAddToCart}>
          ลงชื่อเข้าใช้ เพื่อซื้อสินค้า คลิ๊กที่นี้
        </p>
      </div>
      {/* Displaying Products */}
      <div className="grid grid-cols-4 grid-rows-2 gap-4 pt-12">
        {products.map((product) => (
          <div key={product.id} className="card w-96 bg-base-100 shadow-xl">
            <figure className="px-10 pt-10">
              <img src={product.image} alt={product.name} className="rounded-xl" />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title">{product.name}</h2>
              <p>ประเภท {product.category}</p>
              <p>จำนวนสินค้าคงเหลือ: {product.store} จำนวน</p>
              <p>{product.price} บาท</p>
              <div className="card-actions">
                {product.store > 0 ? (
                  <button className="btn btn-primary" onClick={handleAddToCart}>
                    เพิ่มใส่ตะกร้า
                  </button>
                ) : (
                  <p className="text-red-500">สินค้าหมดแล้ว</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Login */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <div className="text-3xl font-semibold text-center text-gray-800 mb-6">
              ลงชื่อเข้าใช้
            </div>
            <form className="flex flex-col gap-4" onSubmit={hdlSubmit}>
              <label className="flex flex-col">
                <span className="text-gray-700">อีเมล</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  name="email"
                  value={input.email}
                  onChange={hdlChange}
                />
              </label>
              <label className="flex flex-col">
                <span className="text-gray-700">รหัสผ่าน</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  name="password"
                  value={input.password}
                  onChange={hdlChange}
                />
              </label>
              <button
                type="submit"
                className="mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition duration-300 ease-in-out"
              >
                เข้าสู่ระบบ
              </button>
              <p className="text-center">หรือ</p>
              <button
                type="button"
                className="mt-5 bg-gray-400 text-white py-3 rounded-lg font-semibold hover:bg-gray-500 transition duration-300 ease-in-out"
                onClick={() => navigate("/register")} // Navigate to register page
              >
                สมัครสมาชิก
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginForm;



// import axios from "axios";
// import { useState } from "react";
// import Swal from "sweetalert2";
// import useAuth from "../hooks/useAuth";

// function LoginForm() {
//   const { setUser } = useAuth();
//   const [input, setInput] = useState({
//     email: "",
//     password: "",
//   });

//   const hdlChange = (e) => {
//     setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const hdlSubmit = async (e) => {
//     try {
//       e.preventDefault();
//       const rs = await axios.post("http://localhost:8000/auth/login", input);

//       if (rs.status === 200) {
//         Swal.fire({
//           icon: "success",
//           title: "Login successful",
//           text: "You have successfully logged in!",
//         });
//       }

//       localStorage.setItem("token", rs.data.token);
//       const rs1 = await axios.get("http://localhost:8000/auth/me", {
//         headers: { Authorization: `Bearer ${rs.data.token}` },
//       });
//       setUser(rs1.data);
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Login failed",
//         text: err.message,
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-150">
//       <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
//         <div className="text-3xl font-semibold text-center text-gray-800 mb-6">
//           Login
//         </div>
//         <form className="flex flex-col gap-4" onSubmit={hdlSubmit}>
//           <label className="flex flex-col">
//             <span className="text-gray-700">E-mail</span>
//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//               name="email"
//               value={input.email}
//               onChange={hdlChange}
//             />
//           </label>

//           <label className="flex flex-col">
//             <span className="text-gray-700">Password</span>
//             <input
//               type="password"
//               placeholder="Enter your password"
//               className="mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//               name="password"
//               value={input.password}
//               onChange={hdlChange}
//             />
//           </label>

//           <button
//             type="submit"
//             className="mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition duration-300 ease-in-out"
//           >
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default LoginForm;





// import axios from "axios";
// import {useState} from "react";
// import useAuth from "../hooks/useAuth"

// function LoginFrom() {
//   const {setUser} = useAuth()
//     const [input, setInput] = useState({
//         email: "",
//         password: "",
       
//       });

//       const hdlChange = (e) => {
//         setInput((prv) => ({ ...prv, [e.target.name]: e.target.value }));
//       };

//       const hdlSubmit = async e => {
//         try {
//           e.preventDefault()
//           // validation
//           const rs = await axios.post('http://localhost:8000/auth/login', input)
//           console.log(rs.data.token)
          
//         //   alert(rs.data.token)
//           if (rs.status === 200) {
//             alert('Login successful');
//           }
//           console.log(rs.data)
//           localStorage.setItem('token', rs.data.token)
//           const rs1 = await axios.get('http://localhost:8000/auth/me', {
//             headers : { Authorization : `Bearer ${rs.data.token}` }
//           })
//           console.log(rs1.data)
//           setUser(rs1.data)
          
//         }catch(err) {
//           console.log( err.message)
//         }
//       }
    
//   return (
    
//     <div className="p-5 border w-4/6 min-w-[500px] mx-auto">
//       <div className="text-3xl text-center">Login From</div>
//       <form className="flex flex-col gap-2" onSubmit={hdlSubmit}>
        

//         <label className="form-control w-full max-w-xs">
//           <div className="label">
//             <span className="label-text">E-mail</span>
//           </div>
//           <input
//             type="email"
//             placeholder="Type here"
//             className="input input-bordered w-full max-w-xs"
//             name="email"
//             value={input.email}
//             onChange={ hdlChange }
//           />
//         </label>

//         <label className="form-control w-full max-w-xs">
//           <div className="label">
//             <span className="label-text">Password</span>
//           </div>
//           <input
//             type="password"
//             placeholder="Type here"
//             className="input input-bordered w-full max-w-xs"
//             name="password"
//             value={input.password}
//             onChange={ hdlChange }
//           />
//         </label>

        
//         <div className="flex gap-5">
//           <button type="submit" className="btn-outline mt-7 btn btn-success">
//             Submit
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default LoginFrom