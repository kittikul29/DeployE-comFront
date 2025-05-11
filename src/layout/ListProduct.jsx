import axios from "axios";
import { useEffect, useState } from "react";

export default function ListProduct() {
  const [product, setshowpro] = useState([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: '',
    name: '',
    image: null, // Set as null initially
    category: '',
    price: '',
    store: ''
  });
  const [ids, setIds] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const rs = await axios.get(`http://localhost:8000/product/getproduct`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setshowpro(rs.data.getproduct);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchProducts();
  }, []);

  const hdldele = async (id) => {
    try {
      const confirmation = window.confirm("คุณต้องการลบสินค้านี้หรือไม่?");
      if (!confirmation) {
        return;
      }

      const token = localStorage.getItem("token");
      const rs = await axios.delete(`http://localhost:8000/product/del/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (rs.status === 200) {
        alert("ลบสำเร็จ");
        setshowpro((prevProducts) => prevProducts.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const hdledit = (product, id) => {
    setCurrentProduct({ ...product, image: null }); // Reset image to null
    setEditModalOpen(true);
    setIds(id);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    setCurrentProduct({ ...currentProduct, image: e.target.files[0] }); // Handle image as file
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      // Prepare FormData
      const formData = new FormData();
      formData.append("name", currentProduct.name);
      formData.append("category", currentProduct.category);
      formData.append("price", currentProduct.price);
      formData.append("store", currentProduct.store);

      if (currentProduct.image) {
        formData.append("image", currentProduct.image); // Append image file only if it exists
      }

      const rs = await axios.put(`http://localhost:8000/product/productedit/${ids}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Set the content type to multipart
        },
      });

      if (rs.status === 200) {
        alert("แก้ไขสำเร็จ");
        setshowpro((prevProducts) =>
          prevProducts.map((item) => (item.id === currentProduct.id ? rs.data.product : item))
        );
        setEditModalOpen(false);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="grid grid-cols-4 grid-rows-4 gap-4 pt-12">
      {product.map((product) => (
        <div key={product.id} className="card w-96 bg-base-100 shadow-xl">
          <figure className="px-10 pt-10">
            <img src={product.image} alt={product.name} className="rounded-xl" />
          </figure>
          <div className="card-body items-center text-center">
            <h2 className="card-title">{product.name}</h2>
            <p>ประเภท {product.category}</p>
            <p>{product.price} บาท</p>
            <p>สินค้าคงเหลือ {product.store}</p>
            <div className="card-actions">
              <button className="btn btn-warning" onClick={() => hdledit(product, product.id)}>
                แก้ไข
              </button>
              <button className="btn btn-error" onClick={() => hdldele(product.id)}>
                ลบ
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Modal for editing product */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow-lg">
            <h2 className="text-2xl mb-4">แก้ไขสินค้า</h2>
            <input
              type="text"
              name="name"
              value={currentProduct.name}
              onChange={handleEditChange}
              placeholder="ชื่อสินค้า"
              className="input input-bordered w-full mb-2"
            />
            <input
              type="file"
              name="image"
              onChange={handleImageChange} // Use handleImageChange for file input
              placeholder="รูปภาพสินค้า"
              className="input input-bordered w-full mb-2"
            />
            <input
              type="text"
              name="category"
              value={currentProduct.category}
              onChange={handleEditChange}
              placeholder="ประเภทสินค้า"
              className="input input-bordered w-full mb-2"
            />
            <input
              type="number"
              name="price"
              value={currentProduct.price}
              onChange={handleEditChange}
              placeholder="ราคาสินค้า"
              className="input input-bordered w-full mb-2"
              onWheel={(e) => e.target.blur()}
            />
            <input
              type="number"
              name="store"
              value={currentProduct.store}
              onChange={handleEditChange}
              placeholder="จำนวนสินค้า"
              className="input input-bordered w-full mb-2"
              onWheel={(e) => e.target.blur()}
            />
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-primary mr-2"
                onClick={handleEditSubmit}
              >
                บันทึก
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditModalOpen(false)}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
