import axios from "axios";
import { useState } from "react";

export default function AddProduct() {
  const [addProduct, setProduct] = useState({
    name: "",
    image: "",
    category: "",
    price: "",
    store: "",
  });

  const [preview, setPreview] = useState(null); // State to store image preview URL
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  const hdlChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setProduct((prev) => ({ ...prev, [name]: files[0] }));
      setPreview(URL.createObjectURL(files[0])); // Set the preview URL
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const hdlSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", addProduct.name);
      formData.append("image", addProduct.image);
      formData.append("category", addProduct.category);
      formData.append("price", addProduct.price);
      formData.append("store", addProduct.store);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/product/addproduct",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);

      if (response.status === 200) {
        alert("Addproduct Successful");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const hdlReset = () => {
    setProduct({
      name: "",
      image: "",
      category: "",
      price: "",
      store: "",
    });
    setPreview(null); // Clear the preview image
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg"
        onSubmit={hdlSubmit}
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-semibold text-center text-orange-500 mb-6">
          เพิ่มสินค้า
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
            รูปภาพสินค้า
          </label>
          <input
            type="file"
            className="file-input file-input-bordered file-input-primary w-full"
            name="image"
            onChange={hdlChange}
          />
          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Product Preview"
                className="h-auto w-full object-cover rounded-lg shadow-sm cursor-pointer"
                onClick={openModal} // Open modal on click
              />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
            ชื่อสินค้า
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            name="name"
            placeholder="Enter product name"
            value={addProduct.name}
            onChange={hdlChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="price">
            ราคา
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            name="price"
            placeholder="Enter product price"
            value={addProduct.price}
            onChange={hdlChange}
            onWheel={(e) => e.target.blur()}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
            Category
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            name="category"
            placeholder="Enter product category"
            value={addProduct.category}
            onChange={hdlChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="store">
            จำนวนสินค้า
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            name="store"
            placeholder="Enter product quantity"
            value={addProduct.store}
            onChange={hdlChange}
            onWheel={(e) => e.target.blur()}
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Submit
          </button>
          <button
            type="reset"
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
            onClick={hdlReset}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Modal for full-size image preview */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <img
              src={preview}
              alt="Full Size Preview"
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}


