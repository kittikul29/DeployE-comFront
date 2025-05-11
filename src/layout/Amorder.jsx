import axios from "axios";
import React, { useState, useEffect } from "react";

function Amorder() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [visiblePayments, setVisiblePayments] = useState({}); // State to track visibility of payment details

  useEffect(() => {
    const fetchData = async (url, setState, dataKey) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setState(dataKey ? response.data[dataKey] : response.data);
      } catch (err) {
        console.error(`Error fetching data from ${url}: ${err}`);
      }
    };

    fetchData("http://localhost:8000/payment/getpayments", setPayments, 'payment');
    fetchData("http://localhost:8000/auth/amorder", setOrders);
  }, []);

  // Sort orders by date in descending order (latest first)
  const sortedOrders = orders.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Function to toggle visibility of payment details
  const togglePaymentDetails = (paymentId) => {
    setVisiblePayments((prevState) => ({
      ...prevState,
      [paymentId]: !prevState[paymentId],
    }));
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

  // Functions to handle different status updates
  const confirmpaymentstatus = (paymentId) => updatePaymentStatus(paymentId, "ยืนยันคำสั่งซื้อ");
  const Waitingpaymentstatus = (paymentId) => updatePaymentStatus(paymentId, "กำลังจัดส่ง");
  const completepaymentstatus = (paymentId) => updatePaymentStatus(paymentId, "จัดส่งสำเร็จ");
  const cancelpaymentstatus = (paymentId) => updatePaymentStatus(paymentId, "ยกเลิกคำสั่งซื้อ");

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("th-TH") + " " + date.toLocaleTimeString("th-TH");
  };

  return (
    <div className="container mx-auto p-4">
      <p className="font-semibold text-center cursor-pointer text-3xl mt-3">
        จัดการคำสั่งซื้อ
      </p>
      {sortedOrders.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">ยังไม่มีสินค้า</p>
      ) : (
        sortedOrders.map((order) => {
          const firstCart = order.orderCarts[0]; // Get the first cart to extract user details
          const user = firstCart?.cartclone?.user; // Extract user information

          return (
            <div
              key={order.id}
              className="mb-6 p-4 border rounded-lg shadow-lg"
            >
              <h3 className="text-xl font-bold mt-1 mb-4">Order: {order.id}</h3>
              <p className="text-lg font-semibold">Status: {order.status}</p>
              <p className="text-gray-600">Date: {formatDate(order.date)}</p>
              {user && (
                <div>
                  <p className="text-lg font-semibold">
                    ชื่อผู้สั่ง: {user.name}
                  </p>
                  <p className="text-gray-600">เบอร์: {user.phone}</p>
                </div>
              )}

              <ul>
                {order.orderCarts.map((cart) => (
                  <li
                    key={cart.id}
                    className="mb-4 p-4 border rounded-md bg-gray-50"
                  >
                    <div className="flex items-center mt-2">
                      <img
                        src={
                          cart.cartclone?.product?.image || "placeholder.jpg"
                        }
                        alt={cart.cartclone?.product?.name || "Product Image"}
                        className="w-24 h-24 object-cover rounded-lg mr-4"
                      />
                      <div>
                        <p className="text-gray-600">
                          {cart.cartclone?.product?.name || "Product Name"}
                        </p>
                        <p className="text-gray-600">
                          Category: {cart.cartclone?.product?.category || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          Price: {cart.cartclone?.product?.price || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          Total: {cart.cartclone?.total || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          Price: {cart.cartclone.all_price}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {payments
                .filter((payment) => payment.order.id === order.id)
                .map((payment) => (
                  <h4 key={payment.id} className="text-lg font-bold mt-4">
                    ราคารวม {payment.all_price}
                  </h4>
                ))}

              <h4 className="text-lg font-bold mt-4">Payments:</h4>
              {payments.filter((payment) => payment.order.id === order.id)
                .length === 0 ? (
                <p className="text-gray-600">
                  ยังไม่มีการชำระเงินสำหรับออเดอร์นี้
                </p>
              ) : (
                payments
                  .filter((payment) => payment.order.id === order.id)
                  .map((payment) => (
                    <div
                      key={payment.id}
                      className="mb-6 p-4 border rounded-lg shadow-lg"
                    >
                      <p
                        className={`text-lg font-semibold ${
                          payment.status === "ยืนยันคำสั่งซื้อ"
                            ? "text-blue-500"
                            : payment.status === "กำลังจัดส่ง"
                            ? "text-yellow-500"
                            : payment.status === "จัดส่งสำเร็จ"
                            ? "text-green-500"
                            : payment.status === "ยกเลิกคำสั่งซื้อ"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        การสั่งซื้อ: {payment.status}
                      </p>
                      <button
                        onClick={() => togglePaymentDetails(payment.id)}
                        className="mt-2 text-blue-500 underline"
                      >
                        {visiblePayments[payment.id]
                          ? "ซ่อนรายละเอียด"
                          : "แสดงรายละเอียด"}
                      </button>
                      {visiblePayments[payment.id] && payment.location && (
                        <div className="flex flex-wrap lg:flex-nowrap gap-4">
                          <div className="w-full lg:w-1/2 p-4">
                            <p className="font-bold mb-2">ที่อยู่</p>
                            <p>บ้านเลขที่: {payment.location.house_number}</p>
                            <p>จังหวัด: {payment.location.provinces}</p>
                            <p>อำเภอ: {payment.location.amphures}</p>
                            <p>ตำบล: {payment.location.districts}</p>
                            <p>ถนน: {payment.location.road}</p>
                            <p>หมู่บ้าน: {payment.location.village}</p>
                            <p>รหัสไปรษณีย์: {payment.location.zip_code}</p>
                            <p>อื่นๆ: {payment.location.other}</p>
                          </div>

                          <div className="w-full lg:w-1/2 p-4">
                            <p className="font-bold mb-2">หลักฐานการโอน</p>
                            {payment.Transfer_Payment &&
                            payment.Transfer_Payment.length > 0 ? (
                              payment.Transfer_Payment.map((transfer) => (
                                <div key={transfer.id} className="mt-2">
                                  <img
                                    src={transfer.image}
                                    alt={`Transfer slip for payment ${payment.id}`}
                                    className="w-48 h-48 object-cover rounded mb-2"
                                  />
                                  <p className="text-gray-700">
                                    จำนวนเงินที่โอน: {transfer.pay} บาท
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p>ไม่มีสลิปการโอน</p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => confirmpaymentstatus(payment.id)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                          ยืนยันคำสั่งซื้อ
                        </button>
                        <button
                          onClick={() => Waitingpaymentstatus(payment.id)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                        >
                          กำลังส่งสินค้า
                        </button>
                        <button
                          onClick={() => completepaymentstatus(payment.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                          ส่งสินค้าเสร็จสิ้น
                        </button>

                        <button
                          onClick={() => cancelpaymentstatus(payment.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-gray-600 transition"
                        >
                          ยกเลิกคำสั่งซื้อ
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Amorder;
