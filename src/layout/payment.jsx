import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import assets from '../assets/pay.jpg';

const Payment = () => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setAddresses] = useState([]);
  const [selectedLocation, setSelectedAddress] = useState(null); // Add state for selected location
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [file, setFile] = useState(null)
  const [islOpen, setIsOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/cart/showidcart', {
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
    fetchCart();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:8000/cart/user', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/locations/getlocation', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(response.data);
      } catch (err) {
        console.error('Error fetching location', err);
        setError(err.message || 'Unknown error');
      }
    };
    fetchAddresses();
  }, []);

  const calculateTotalPrice = () => {
    return cart.reduce((total, cartItem) => total + cartItem.all_price, 0);
  };


  const handleCheckout = async () => {
    if (!selectedLocation) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'กรุณาเลือกที่อยู่จัดส่ง',
        showConfirmButton: true
      });
      return;
    }

    if (!paymentMethod) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'กรุณาเลือกวิธีการชำระเงิน',
        showConfirmButton: true
      });
      return;
    }

    if (paymentMethod === 'โอนจ่าย') {
      setIsOpen(true); 
      return;
    }
    M()

  };

  const M = async () => {
    try {
      const cartcloneResponses = await Promise.all(
        cart.map(item => axios.post('http://localhost:8000/cart/cartclone/', { id: item.id }))
      );

      const rs1 = await axios.post('http://localhost:8000/orders/create', {
        cartcloneId: cartcloneResponses.map(i => i.data.cartclone.id),
        date: new Date(),
        userId: user.id,
        status: 'ชำระแล้ว'
      });

      await Promise.all(cart.map(item => updatestatus(item.id)));
      cart.forEach(item => updateProductStore(item));

      const paymentData = {
        date: new Date(),
        userId: user.id,
        status: 'กำลังดำเนินการ',
        all_price: calculateTotalPrice(),
        orderId: rs1.data.id,
        locationId: selectedLocation.id,
        make_payment: paymentMethod
      };

      const rqpay = await axios.post('http://localhost:8000/payment/payments', paymentData);

      if (paymentMethod === 'โอนจ่าย') {
        await modelApiPayFn(rqpay.data.payment.id);
      }

      setSuccess(true);
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/');

    } catch (error) {
      console.error('Error creating order or payment:', error.response ? error.response.data : error.message);
      setError('Error creating order or payment. Please try again.');
    }
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    // Check for valid file type
    if (selectedFile && !validTypes.includes(selectedFile.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid file type',
        text: 'Please select a valid image file (JPEG, PNG, GIF).',
      });
      return;
    }

    // Check for file size
    if (selectedFile && selectedFile.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'File too large',
        text: 'File size should be less than 2MB.',
      });
      return;
    }

    // Set the selected file
    setFile(selectedFile);

    // Create a URL for the image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      // Update state with the image URL
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };
  

  const handlePaymentAmountChange = (event) => {
    setPaymentAmount(event.target.value);
  };
 

  const modelApiPayFn = async (paymentId) => {
    console.log(88888, paymentId)
    try {
      const formData = new FormData();
      formData.append('pay', calculateTotalPrice());
      formData.append('image', file);
      formData.append('paymentId', paymentId);

      await axios.post('http://localhost:8000/payment/pay/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

    } catch (err) {
      console.error(err);
    }
  };

  const updatestatus = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/cart/deletecart/${id}`);
    } catch (err) {
      console.error("UpdateStatus Error:", err.response ? err.response.data : err.message);
    }
  };

  const updateProductStore = async (products) => {
    try {
      const updatedStore = products.product.store - products.total;
      await axios.put(`http://localhost:8000/product/productstore/${products.product.id}`, {
        store: updatedStore
      });
    } catch (err) {
      console.error('เกิดข้อผิดพลาด', err);
    }
  };

  const hdlEditLocation = (location) => {
    setEditingLocation(location);
    setIsEditModalOpen(true);
  };
  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const PaymentModal = ({ isOpen, onClose, onConfirm, paymentAmount, handleFileChange, handlePaymentAmountChange }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">โอนจ่าย</h2>
          <img src={assets} alt="" className="items-center w-40 h-50" />
          <p>แนบรูปการโอนจ่าย</p>
          <div>
      <input
        className="block mt-2"
        type="file"
        name="image"
        id="image"
        onChange={handleFileChange}
        accept="image/*"
      />
      {/* Display the image preview if there's a selected image */}
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Selected Preview"
          className="mt-4"
          style={{ maxWidth: '15%', height: 'auto' }}
        />
      )}
    </div>
          <label htmlFor="pay" className="block mt-2">จำนวนเงิน</label>
          <input 
            type="text" 
            name='pay' 
            id='pay' 
            value={calculateTotalPrice()} 
            onChange={handlePaymentAmountChange} 
            className="border border-gray-300 p-2 rounded w-full" 
          />
          <button
             onClick={onConfirm}
            className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 mt-4"
          >
            ยืนยันการโอนจ่าย
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mt-4 ml-2"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center">หน้าชำระเงิน</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ลำดับ</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">รูปภาพ</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">สินค้า</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ประเภท</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">ราคา</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((cartItem, index) => (
              <tr key={cartItem.id} className="hover:bg-gray-100">
                <td className="px-6 py-4 border-b border-gray-300">{index + 1}</td>
                <td className="px-6 py-4 border-b border-gray-300">
                  <img
                    src={cartItem.product.image}
                    alt={cartItem.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.name}</td>
                <td className="px-6 py-4 border-b border-gray-300">{cartItem.product.category}</td>
                <td className="px-6 py-4 border-b border-gray-300">{cartItem.all_price} บาท</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="flex flex-col md:flex-row justify-between gap-6 mt-6">
  {/* Left Section: Address Selection */}
  <div className="md:w-1/2 p-4 bg-gray-50 rounded-lg shadow-sm">
  <button 
          type="button" 
          onClick={openModal}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center"
        >
          เพิ่มที่อยู่
        </button>
    <h3 className="text-xl font-bold mb-4 text-gray-800">เลือกที่อยู่การจัดส่ง</h3>
    <ul className="space-y-3">
      {location.map((location, index) => (
        <li key={index}>
          <label className="flex items-start p-3 border rounded-lg cursor-pointer transition hover:bg-gray-100">
            <input
              type="radio"
              name="location"
              value={index}
              checked={selectedLocation === location}
              onChange={() => setSelectedAddress(location)}
              className="mt-1 mr-3 accent-blue-600"
            />
            <span className="text-gray-600">
              {`เลขที่${location.house_number},หมู่ ${location.village}, ${location.road},ต.${location.districts},อ.${location.amphures},${location.provinces}, ${location.zip_code}`}
              <button
                className="ml-10 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                onClick={() => hdlEditLocation(location)}
              >
                แก้ไข
              </button>

            </span>
          </label>
          
        </li>
      ))}
    </ul>
  </div>

  

  {/* Right Section: Payment Method Selection */}
  <div className="md:w-1/2 p-4 bg-gray-50 rounded-lg shadow-sm">
    <h3 className="text-xl font-bold mb-4 text-gray-800">เลือกวิธีการชำระเงิน</h3>
    <div className="space-y-3">
      <label className="flex items-center p-2 border rounded-lg cursor-pointer transition hover:bg-gray-100">
        <input
          type="radio"
          name="paymentMethod"
          value="โอนจ่าย"
          checked={paymentMethod === "โอนจ่าย"}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="mr-3 accent-blue-600"
        />
        <span className="text-gray-700">โอนจ่าย</span>
      </label>
      {/* <label className="flex items-center p-2 border rounded-lg cursor-pointer transition hover:bg-gray-100">
        <input
          type="radio"
          name="paymentMethod"
          value="จ่ายปลายทาง"
          checked={paymentMethod === "จ่ายปลายทาง"}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="mr-3 accent-blue-600"
        />
        <span className="text-gray-700">จ่ายปลายทาง</span>
      </label> */}
      <div>
          <h1 className="text-2xl font-bold">ราคารวม: {calculateTotalPrice()} บาท</h1>
          <button
            type="button"
            className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mt-2"
            onClick={handleCheckout}
          >
            ชำระเงิน
          </button>
        </div>
    </div>
  </div>
</div>

      {error && <div className="text-red-500 mt-4">{error}</div>}
      {success && <div className="text-green-500 mt-4">คำสั่งซื้อและการชำระเงินสำเร็จ!</div>}

      <LocationModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        userId={user?.id}
      />

<PaymentModal
  isOpen={islOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={() => { setIsModalOpen(false); M(); }}
  paymentAmount={paymentAmount}
  handleFileChange={handleFileChange}
  handlePaymentAmountChange={handlePaymentAmountChange}
/>
<EditLocationModal 
  isOpen={isEditModalOpen} 
  onClose={() => setIsEditModalOpen(false)} 
  locationData={editingLocation} 
  userId={user?.id} 
/> 
    </div>
  );
};

const LocationModal = ({ isOpen, onClose, userId }) => {
  const [formData, setFormData] = useState({
    provinces: '',
    amphures: '',
    districts: '',
    zip_code: '',
    road: '',
    village: '',
    house_number: '',
    other: '',
    usersId: userId  
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/locations/location', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      usersId: userId,
    }));
  }, [userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">เพิ่มที่อยู่ใหม่</h2>
        <form onSubmit={handleSubmit}>
          
          <input
            type="text"
            name="house_number"
            placeholder="บ้านเลขที่"
            value={formData.house_number}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="village"
            placeholder="หมู่บ้าน"
            value={formData.village}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="amphures"
            placeholder="อำเภอ"
            value={formData.amphures}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="districts"
            placeholder="ตำบล"
            value={formData.districts}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
            
          />
          <input
            type="text"
            name="road"
            placeholder="ถนน"
            value={formData.road}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="provinces"
            placeholder="จังหวัด"
            value={formData.provinces}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <input
            type="text"
            name="zip_code"
            placeholder="รหัสไปรษณีย์"
            value={formData.zip_code}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          
          
          
          <textarea
            name="other"
            placeholder="ข้อมูลเพิ่มเติม"
            value={formData.other}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mt-4"
          >
            บันทึก
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mt-4 ml-2"
          >
            ยกเลิก
          </button>
        </form>
      </div>
      
    </div>
  );
};

const EditLocationModal = ({ isOpen, onClose, locationData, userId }) => {
  const [EditformData, setFormData] = useState({
    provinces: locationData?.provinces || '',
    amphures: locationData?.amphures || '',
    districts: locationData?.districts || '',
    zip_code: locationData?.zip_code || '',
    road: locationData?.road || '',
    village: locationData?.village || '',
    house_number: locationData?.house_number || '',
    other: locationData?.other || '',
    usersId: userId
  });

  useEffect(() => {
    if (locationData) {
      setFormData({
        provinces: locationData.provinces,
        amphures: locationData.amphures,
        districts: locationData.districts,
        zip_code: locationData.zip_code,
        road: locationData.road,
        village: locationData.village,
        house_number: locationData.house_number,
        other: locationData.other,
        usersId: userId,
      });
    }
  }, [locationData, userId]);

  const handleChangeEdit = (e) => {
    setFormData({
      ...EditformData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/locations/editlocation/${locationData.id}`, EditformData, {  // Ensure the correct endpoint and ID are used.
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
      window.location.reload(); // Consider more sophisticated state management to update the UI without a full reload.
    } catch (error) {
      console.error('Error editing location:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">แก้ไขที่อยู่</h2>
        <form onSubmit={handleSubmitEdit}>

        <p>บ้านเลขที่</p>
          <input
            type="text"
            name="house_number"
            placeholder="บ้านเลขที่"
            value={EditformData.house_number}
            onChange={handleChangeEdit}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <p>หมู่</p>
          <input
            type="text"
            name="village"
            placeholder="หมู่บ้าน"
            value={EditformData.village}
            onChange={handleChangeEdit}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <p>อำเภอ</p>
          <input
            type="text"
            name="amphures"
            placeholder="อำเภอ"
            value={EditformData.amphures}
            onChange={handleChangeEdit}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <p>ตำบล</p>
          <input
            type="text"
            name="districts"
            placeholder="ตำบล"
            value={EditformData.districts}
            onChange={handleChangeEdit}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <p>ถนน</p>
          <input
            type="text"
            name="road"
            placeholder="ถนน"
            value={EditformData.road}
            onChange={handleChangeEdit}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <p>จังหวัด</p>
          <input
            type="text"
            name="provinces"
            placeholder="จังหวัด"
            value={EditformData.provinces}
            onChange={handleChangeEdit}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <p>รหัสไปรษณีย์</p>
          <input
            type="text"
            name="zip_code"
            placeholder="รหัสไปรษณีย์"
            value={EditformData.zip_code}
            onChange={handleChangeEdit}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <textarea
            name="other"
            placeholder="ข้อมูลเพิ่มเติม"
            value={EditformData.other}
            onChange={handleChangeEdit}
            className="w-full px-4 py-2 mb-2 border rounded"
          />
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mt-4"
          >
            บันทึก
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mt-4 ml-2"
          >
            ยกเลิก
          </button>
        </form>
      </div>
    </div>
  );
};



export default Payment;
