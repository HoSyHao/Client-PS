import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "react-bootstrap";

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/plants/${id}`);
        setPlant(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchPlant();
  }, [id]);

  const imageSource = plant?.image
  ? `http://localhost:5000/upload/images/${plant.image}`
  : '/assets/images/commingsoon.jpg';


  const handleBack = () => {
    navigate("/");
  };

  if (loading) return <div className="text-green-500 text-center mt-5 text-xl">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-5 text-xl">Error: {error}</div>;
  if (!plant) return <div className="text-green-300 text-center mt-5 text-xl">Plant not found</div>;

  return (
    <div className="w-full py-8 bg-gray-800 min-h-screen px-8">
      {/* Nút Back (mũi tên) nằm góc trên trái */}
      <Button
        variant="success"
        className="top-10 left-48 z-50 rounded-full w-14 h-14 text-3xl shadow-lg hover:bg-green-600 transition-opacity duration-300"
        onClick={handleBack}
      >
        ←
      </Button>

      {/* Card chính */}
      <div className="card shadow-lg p-6 mx-auto bg-gray-700" style={{ maxWidth: "1000px" }}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Hình ảnh */}
          <div className="md:w-1/3">
            <img
              src={imageSource}
              alt={plant.name || "No Name"}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = plant.image
                  ? `/assets/images/${plant.image}` 
                  : '/assets/images/commingsoon.jpg';
              }}
              className="w-full h-[400px] object-cover rounded-md"
            />
          </div>
          {/* Nội dung chi tiết */}
          <div className="md:w-2/3">
            <div className="card-body">
              <h1 className="text-4xl font-bold text-green-500 mb-4">
                {plant.name}
              </h1>
              <p className="text-gray-500 mb-3 text-xl">
                <strong>Cost:</strong>{" "}
                <span className="text-green-400">{plant.cost}</span>
              </p>
              <p className="text-gray-500 mb-3 text-xl">
                <strong>Category:</strong> {plant.category}
              </p>
              <p className="text-gray-500 mb-3 text-xl">
                <strong>Status:</strong>{" "}
                <span className="text-green-400">{plant.status || "None"}</span>
              </p>
              <p className="text-gray-500 mb-5 text-xl">
                <strong>Description:</strong>{" "}
                {plant.description || "No description available."}
              </p>
              {/* Nút Add to Cart */}
              <Button
                variant="success"
                className="w-full hover:bg-green-600 transition-colors text-xl py-3 mt-12"
                onClick={() => alert("Added to cart!")}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;