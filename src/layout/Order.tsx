import axios from 'axios';
import React, { useState, useEffect } from 'react';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [showLocation, setShowLocation] = useState({});
  const [payments, setPayments] = useState([]); // State to track visibility of location details

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios('http://localhost:8000/orders/orderallpay', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Sort orders by date in descending order (latest first)
        const sortedOrders = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
      } catch (err) {
        console.log(`เกิดข้อผิดพลาด: ${err}`);
      }
    };
    fetchOrders();
  }, []);

  const toggleLocation = (paymentId) => {
    setShowLocation((prev) => ({
      ...prev,
      [paymentId]: !prev[paymentId],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('th-TH') + ' ' + date.toLocaleTimeString('th-TH');
  };

  // Function to update payment status
  const updatePaymentStatus = async (paymentId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:8000/payment/putstatuspayments",
        { paymentId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      // Refresh payments data after update
      const updatedPayments = payments.map((payment) =>
        payment.id === paymentId ? { ...payment, status } : payment
      );
      setPayments(updatedPayments);
    } catch (error) {
      console.error(`Failed to update payment status: ${error}`);
    }
  };

  const cancelpaymentstatus = (paymentId) => updatePaymentStatus(paymentId, "ยกเลิกคำสั่งซื้อ");

  return (
    <div className="container mx-auto p-4">
      <p className='font-semibold text-center cursor-pointer text-3xl mt-3'>รายการสั่งซื้อ</p>
      {orders.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">ยังไม่มีการสั้งซื้อ</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="mb-6 p-4 border rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Status: {order.status}</p>
            <p className="text-gray-600">Date: {formatDate(order.date)}</p>
            <h3 className="text-xl font-bold mt-4 mb-2">Order: {order.id}</h3>
            {order.payment.map(payment => (
              <div key={payment.id}>
                <p className="text-xl font-bold">ติดตามสินค้า: {payment.status}</p>
                <ul>
                  {order.orderCarts.map(cart => (
                    <li key={cart.id} className="mb-4 p-4 border rounded-md bg-gray-50">
                      <p className="text-gray-700">Total: {cart.cartclone.total}</p>
                      <p className="text-gray-700">Price: {cart.cartclone.all_price}</p>
                      <div className="flex items-center mt-2">
                        <img
                          src={cart.cartclone.product.image}
                          alt={cart.cartclone.product.name}
                          className="w-24 h-24 object-cover rounded-lg mr-4"
                        />
                        <div>
                          <p className="text-lg font-semibold">{cart.cartclone.product.name}</p>
                          <p className="text-gray-600">Category: {cart.cartclone.product.category}</p>
                          <p className="text-gray-600">Price: {cart.cartclone.product.price}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {payment.location && (
                  <>
                    <button 
                      onClick={() => toggleLocation(payment.id)}
                      className="mt-2 text-blue-500 underline"
                    >
                      {showLocation[payment.id] ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}
                    </button>
                    {showLocation[payment.id] && (
                      <div className="mt-2">
                        <p>บ้านเลขที่: {payment.location.house_number}</p>
                        <p>จังหวัด: {payment.location.provinces}</p>
                        <p>อำเภอ: {payment.location.amphures}</p>
                        <p>ตำบล: {payment.location.districts}</p>
                        <p>ถนน: {payment.location.road}</p>
                        <p>หมู่บ้าน: {payment.location.village}</p>
                        <p>รหัสไปรษณีย์: {payment.location.zip_code}</p>
                        <p>อื่นๆ: {payment.location.other}</p>

                        
                      </div>
                      
                    )}
                    <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => cancelpaymentstatus(payment.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-gray-600 transition"
                        >
                          ยกเลิกคำสั่งซื้อ
                        </button>
                       
                      </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default Order;

