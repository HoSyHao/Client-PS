import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Plant from './Plant';
import AddForm from './AddForm';
import { Form, Button, Modal } from 'react-bootstrap';
import { HOST } from '../utils/constants';

function PlantList() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOption, setSortOption] = useState('default');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const observerRef = useRef(null);
  const navigate = useNavigate();

  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data,
    status,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['plants', categoryFilter, sortOption],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get(`${HOST}/api/plants`, {
        params: {
          page: pageParam,
          pageSize: 6,
          category: categoryFilter === 'All' ? undefined : categoryFilter,
          sort: sortOption === 'default' ? undefined : sortOption,
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage, allPlants) => {
      const totalPlants = lastPage.total || 0;
      const loadedPlants = allPlants.flatMap((page) => page.plants).length;
      return loadedPlants < totalPlants ? lastPage.page + 1 : undefined;
    },
  });

  const lastPlantRef = useCallback(
    (node) => {
      if (isFetchingNextPage || !hasNextPage || isInitialLoad) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        { rootMargin: '10px', threshold: 0.1 }
      );
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, isInitialLoad, fetchNextPage]
  );

  useEffect(() => {
    const handleScroll = () => {
      const isAtTop = window.scrollY <= 100;
      const hasMoreThanOnePage = data?.pages?.length > 1;
      setShowBackToTop(hasMoreThanOnePage && !isAtTop && !isInitialLoad);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data, isInitialLoad]);

  useEffect(() => {
    if (status === 'success' && isInitialLoad) {
      const timer = setTimeout(() => setIsInitialLoad(false), 500);
      return () => clearTimeout(timer);
    }
  }, [status, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad) refetch();
  }, [categoryFilter, sortOption, refetch, isInitialLoad]);

  const handleAddPlant = () => {
    setShowAddForm(true);
  };

  const handleDeletePlants = () => {
    setIsDeleteMode(!isDeleteMode);
    if (isDeleteMode) {
      setSelectedPlants([]);
    }
  };

  const handleSelectPlant = (plantId) => {
    setSelectedPlants((prev) =>
      prev.includes(plantId)
        ? prev.filter((id) => id !== plantId)
        : [...prev, plantId]
    );
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`${HOST}/api/plants/delete`, {
        data: { ids: selectedPlants },
      });
  
      // Chờ refetch hoàn tất trước khi thông báo
      await refetch();
      alert(`Deleted ${response.data.deletedCount} plants`);
      setShowDeleteModal(false);
      setSelectedPlants([]);
      setIsDeleteMode(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting plants');
      setShowDeleteModal(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  if (status === 'loading') return <p className="text-green-500 text-center mt-5">Loading...</p>;
  if (status === 'error') return <p className="text-red-500 text-center mt-5">Error: {error.message}</p>;

  const allPlants = data?.pages?.flatMap((pg) => pg.plants) || [];
  const content = data?.pages?.map((pg) =>
    pg?.plants?.map((plant, i) => {
      if (!plant) return null;
      const plantProps = {
        plant,
        onClick: () => navigate(`/plants/${plant._id}`),
        isDeleteMode,
        onSelect: handleSelectPlant,
        isSelected: selectedPlants.includes(plant._id),
        refetch,
      };
      if (pg.plants.length === i + 1) {
        return <Plant key={plant._id} {...plantProps} ref={lastPlantRef} />;
      }
      return <Plant key={plant._id} {...plantProps} />;
    })
  ) || [];

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const isAtTop = window.scrollY <= 100;
      const hasMoreThanOnePage = data?.pages?.length > 1;
      setShowBackToTop(hasMoreThanOnePage && !isAtTop && !isInitialLoad);
    }, 500);
  };

  const categories = [
    'All',
    'Air Purifying Plants',
    'Aromatic Fragrant Plants',
    'Insect Repellent Plants',
    'Medicinal Plants',
    'Low Maintenance Plants',
  ];

  return (
    <div className="w-full py-6 bg-gray-800 min-h-screen px-6">
      <h1 id="top" className="text-4xl font-bold text-green-500 text-center mb-6">
        ∞ Infinite Plants Demo
      </h1>
      <div className="mb-6 flex items-center justify-center gap-4 flex-wrap">
        <Form className="flex items-center gap-3">
          <Form.Label htmlFor="categoryFilter" className="text-gray-200">
            Category
          </Form.Label>
          <Form.Select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-700 text-green-300 border-green-600 focus:ring-green-500 w-40"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-800 text-green-200">
                {cat}
              </option>
            ))}
          </Form.Select>

          <Form.Label htmlFor="sortOption" className="text-gray-200">
            Price
          </Form.Label>
          <Form.Select
            id="sortOption"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-gray-700 text-green-300 border-green-600 focus:ring-green-500 w-40"
          >
            <option value="default" className="bg-gray-800 text-green-200">Default</option>
            <option value="priceAsc" className="bg-gray-800 text-green-200">Low to High</option>
            <option value="priceDesc" className="bg-gray-800 text-green-200">High to Low</option>
          </Form.Select>
        </Form>
        <div className="text-center">
          <span className="text-2xl font-bold text-green-400">
            {data?.pages[0]?.total || 0}
          </span>
          <span className="text-gray-300 ml-2">Plants</span>
        </div>
        <Button
          variant="success"
          className="rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md hover:bg-green-600 transition-colors"
          onClick={handleAddPlant}
          title="Add New Plant"
        >
          +
        </Button>
        <Button
          variant={isDeleteMode ? 'danger' : 'success'}
          className="rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md hover:bg-red-700 transition-colors"
          onClick={handleDeletePlants}
          title="Delete Plants"
        >
          -
        </Button>
        {isDeleteMode && selectedPlants.length > 0 && (
          <Button
            variant="danger"
            className="rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-md hover:bg-red-700 transition-colors"
            onClick={() => setShowDeleteModal(true)}
            title="Submit Delete"
          >
            ✓ ({selectedPlants.length})
          </Button>
        )}
      </div>

      <div className="plants-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {content}
      </div>
      {isFetchingNextPage && (
        <p className="text-green-400 text-center mt-4">Loading More Plants...</p>
      )}
      <Button
        variant="success"
        className={`fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 text-2xl shadow-lg transition-opacity duration-300 ${
          showBackToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleBackToTop}
      >
        ↑
      </Button>

      <Modal show={showAddForm} onHide={handleCloseForm} centered backdrop="static" keyboard={false} className="text-green-300">
        <Modal.Header closeButton className="bg-gray-800 border-green-600">
          <Modal.Title className="text-green-500">Add New Plant</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-gray-800">
          <AddForm
            onClose={handleCloseForm}
            refetch={refetch}
            categories={categories.filter((cat) => cat !== 'All')}
          />
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        centered
        backdrop="static"
        keyboard={false}
        className="text-green-300"
      >
        <Modal.Header closeButton className="bg-gray-800 border-green-600">
          <Modal.Title className="text-green-500">Confirm Delete Multiple Plants</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-gray-800">
          <p className="text-gray-200 text-lg">
            Are you sure you want to delete the following {selectedPlants.length} plants?
          </p>
          <div className="mt-3 max-h-60 overflow-y-auto">
            {selectedPlants.map((plantId) => {
              const plant = allPlants.find((p) => p._id === plantId) || {
                _id: plantId,
                name: 'Loading...',
                category: 'Loading...',
              };
              return (
                <div key={plant._id} className="mb-2">
                  <p className="text-gray-200">
                    <strong>ID:</strong> {plant._id}
                  </p>
                  <p className="text-gray-200">
                    <strong>Name:</strong> {plant.name || 'No Name'}
                  </p>
                  <p className="text-gray-200">
                    <strong>Category:</strong> {plant.category || 'N/A'}
                  </p>
                  <hr className="border-gray-600" />
                </div>
              );
            })}
          </div>
          {selectedPlants.length > allPlants.filter((p) => selectedPlants.includes(p._id)).length && (
            <p className="text-yellow-400 mt-2">
              Note: Some selected plants are not currently displayed due to filtering. They will still be deleted.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-gray-800 border-green-600">
          <Button
            variant="secondary"
            className="hover:bg-gray-600"
            onClick={handleCloseDeleteModal}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="hover:bg-red-700"
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PlantList;