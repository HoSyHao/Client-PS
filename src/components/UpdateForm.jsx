import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const UpdateForm = ({ plant, onClose, refetch, categories }) => {
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (plant) {
      setFormData({
        name: plant.name || '',
        cost: plant.cost || '',
        category: plant.category || '',
        status: plant.status || '',
        description: plant.description || '',
        image: plant.image || '',
      });
      setPreviewImage(
        plant.image
          ? `http://localhost:5000/upload/images/${plant.image}`
          : '/assets/images/commingsoon.jpg'
      );
    }
  }, [plant]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    try {
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('cost', formData.cost);
      dataToSend.append('category', formData.category);
      dataToSend.append('status', formData.status);
      dataToSend.append('description', formData.description);
      if (selectedImage) {
        dataToSend.append('image', selectedImage);
      } else {
        dataToSend.append('image', formData.image);
      }

      await axios.put(`http://localhost:5000/api/plants/update/${plant._id}`, dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await refetch();
      alert('Plant updated successfully!');
      setShowConfirmModal(false);
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating plant');
      setShowConfirmModal(false);
    }
  };

  const cancelUpdate = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
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
                onChange={handleImageChange}
                className="bg-gray-700 text-green-300 border-green-600 focus:ring-green-500"
              />
              {previewImage && (
                <div className="mt-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-[250px] object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = plant.image
                        ? `/assets/images/${plant.image}`
                        : '/assets/images/commingsoon.jpg';
                    }}
                  />
                  <p className="text-gray-400 text-sm mt-1">Current image: {formData.image || 'None'}</p>
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
          Update Plant
        </Button>
      </Form>

      {/* Modal xác nhận */}
      <Modal
        show={showConfirmModal}
        onHide={cancelUpdate}
        centered
        backdrop="static"
        keyboard={false}
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please review the updated plant information:</p>
          <ul className="list-unstyled">
            <li><strong>Category:</strong> {formData.category || 'N/A'}</li>
            <li><strong>Name:</strong> {formData.name || 'N/A'}</li>
            <li><strong>Image:</strong> {formData.image || 'No change'}</li>
            {selectedImage && (
              <li>
                <strong>New Image Preview:</strong>
                <img
                  src={previewImage}
                  alt="New Preview"
                  className="w-100 h-[150px] object-cover rounded-md mt-2"
                />
              </li>
            )}
            <li><strong>Description:</strong> {formData.description || 'N/A'}</li>
            <li><strong>Cost:</strong> {formData.cost || 'N/A'}</li>
            <li><strong>Status:</strong> {formData.status || 'None'}</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelUpdate}>
            Cancel
          </Button>
          <Button variant="success" onClick={confirmUpdate}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .custom-modal .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.7);
        }
      `}</style>
    </>
  );
};

export default UpdateForm;