import React, { useState } from 'react';
import { Badge, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import UpdateForm from './UpdateForm';
import { HOST } from '../utils/constants';

const Plant = React.forwardRef(({ plant, onClick, isDeleteMode, onSelect, isSelected, refetch }, ref) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  if (!plant) return null;

  const statusImages = {
    Sale: 'sale.png',
    'New Arrival': 'newarrival.png',
    'Best Seller': 'bestseller.png',
    'Sold Out': 'soldout.png',
  };

  const imageSource = plant.image
    ? `${HOST}/upload/images/${plant.image}`
    : '/assets/images/commingsoon.jpg';

  const statusImage = statusImages[plant.status] || null;

  const handleUpdate = (e) => {
    e.stopPropagation();
    setShowUpdateModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`${HOST}/api/plants/delete?id=${plant._id}`);
      alert(`Deleted ${response.data.deletedCount} plant`);
      setShowDeleteModal(false);
      await refetch();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting plant');
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect(plant._id);
  };

  const categories = [
    'Air Purifying Plants',
    'Aromatic Fragrant Plants',
    'Insect Repellent Plants',
    'Medicinal Plants',
    'Low Maintenance Plants',
  ];

  return (
    <>
      <article
        ref={ref}
        className="bg-gray-700 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer p-4 border border-green-600 flex flex-col items-center justify-between w-[225px] sm:w-[275px] lg:w-[325px] xl:w-[375px] h-[400px] relative mx-auto"
        onClick={isDeleteMode ? null : onClick}
      >
        {isDeleteMode && (
          <>
            <Form.Check
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 left-2 z-20 scale-150"
            />
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-10 rounded-lg pointer-events-auto" />
          </>
        )}
        {statusImage && (
          <img
            src={`/assets/images/${statusImage}`}
            alt={plant.status || 'Status'}
            className="absolute top-2 right-2 w-16 h-16 object-contain z-0"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}

        <h2 className="text-xl font-semibold text-green-400 mb-3 text-center truncate w-full z-0">
          {plant.name || 'No Name'}
        </h2>

        <div className="w-full flex-grow mb-3 z-0">
          <img
            src={imageSource}
            alt={plant.name || 'No Name'}
            className="w-full h-[200px] object-cover rounded-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = plant.image
                ? `/assets/images/${plant.image}` 
                : '/assets/images/commingsoon.jpg';
            }}
          />
        </div>

        <div className="flex flex-col items-center w-full gap-2 z-0">
          <Badge bg="success" className="text-3xl px-4 py-2" style={{ fontSize: '1.25rem' }}>
            {plant.cost || 'N/A'}
          </Badge>
          <div className="flex justify-center gap-2 w-full">
            <Button
              variant="warning"
              size="sm"
              className="px-3 py-1"
              onClick={handleUpdate}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="px-3 py-1"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </article>

      {/* Modal Delete */}
      <Modal
        show={showDeleteModal}
        onHide={handleCloseModal}
        centered
        backdrop="static"
        keyboard={false}
        className="text-green-300"
      >
        <Modal.Header closeButton className="bg-gray-800 border-green-600">
          <Modal.Title className="text-green-500">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-gray-800">
          <p className="text-gray-200 text-lg">
            Are you sure you want to delete this plant?
          </p>
          <div className="mt-3">
            <p className="text-gray-200">
              <strong>ID:</strong> {plant._id}
            </p>
            <p className="text-gray-200">
              <strong>Name:</strong> {plant.name || 'No Name'}
            </p>
            <p className="text-gray-200">
              <strong>Category:</strong> {plant.category || 'N/A'}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-gray-800 border-green-600">
          <Button
            variant="secondary"
            className="hover:bg-gray-600"
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="hover:bg-red-700"
            onClick={handleDeleteConfirm}
            disabled={showDeleteModal === false}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Update */}
      <Modal
        show={showUpdateModal}
        onHide={handleCloseUpdateModal}
        centered
        backdrop="static"
        keyboard={false}
        className="text-green-300"
      >
        <Modal.Header closeButton className="bg-gray-800 border-green-600">
          <Modal.Title className="text-green-500">Update Plant</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-gray-800">
          <UpdateForm
            plant={plant}
            onClose={handleCloseUpdateModal}
            refetch={refetch}
            categories={categories}
          />
        </Modal.Body>
      </Modal>
    </>
  );
});

export default Plant;