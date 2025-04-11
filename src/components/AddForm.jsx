import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const AddForm = ({ onClose, refetch, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    category: '',
    status: '',
    description: '',
    image: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image: file.name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('cost', formData.cost);
      dataToSend.append('category', formData.category);
      dataToSend.append('status', formData.status);
      dataToSend.append('description', formData.description);
      if (selectedImage) {
        dataToSend.append('image', selectedImage);
      }

      await axios.post('http://localhost:5000/api/plants/add', dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Plant added successfully!');
      onClose();
      refetch();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding plant');
    }
  };

  return (
    <Form onSubmit={handleSubmit} >
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="text-gray-200">Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-gray-700 text-green-300 border-green-600 focus:ring-green-500"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-gray-200">Cost</Form.Label>
            <Form.Control
              type="text"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              required
              className="bg-gray-700 text-green-300 border-green-600 focus:ring-green-500"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-gray-200">Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="bg-gray-700 text-green-300 border-green-600 focus:ring-green-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-800 text-green-200">
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-gray-200">Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="bg-gray-700 text-green-300 border-green-600 focus:ring-green-500"
            >
              <option value="">None</option>
              <option value="Sale" className="bg-gray-800 text-green-200">Sale</option>
              <option value="New Arrival" className="bg-gray-800 text-green-200">New Arrival</option>
              <option value="Best Seller" className="bg-gray-800 text-green-200">Best Seller</option>
              <option value="Sold Out" className="bg-gray-800 text-green-200">Sold Out</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-gray-200">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="bg-gray-700 text-green-300 border-green-600 focus:ring-green-500"
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="text-gray-200">Image</Form.Label>
            <Form.Control
              type="file"
              name="image"
              required
              onChange={handleImageChange}
              className="bg-gray-700 text-green-300 border-green-600 focus:ring-green-500"
            />
            {previewImage && (
              <div className="mt-3">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-[250px] object-cover rounded-md"
                />
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Button
        variant="success"
        type="submit"
        className="w-full mt-3 hover:bg-green-600 transition-colors"
      >
        Add Plant
      </Button>
    </Form>
  );
};

export default AddForm;