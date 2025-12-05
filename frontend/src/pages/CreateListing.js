import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import imageCompression from 'browser-image-compression';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const CreateListing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🟢 State includes new Location fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Textbooks',
    condition: 'Good',
    city: 'Abbottabad', // Default
    university: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  // Lists match Backend Schema
  const categories = ['Textbooks', 'Notes', 'Hostel Supplies', 'Electronics', 'Tutoring Services', 'Freelancing Services', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'N/A'];
  const cities = ['Abbottabad', 'Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Multan', 'Rawalpindi', 'Other'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🟢 Image Compression Logic
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Compress to max 0.5MB
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };
    
    try {
      setCompressing(true);
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);
      setCompressing(false);
      toast.success("Image optimized! ⚡", { style: { fontSize: '0.8rem' } });
    } catch (error) {
      console.error(error);
      setImageFile(file); // Fallback to original
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    // 🟢 Validation (Includes University)
    if (!formData.title || !formData.description || !formData.price || !formData.university) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.price < 0) {
      toast.error('Price cannot be negative');
      setLoading(false);
      return;
    }

    // 🟢 Prepare FormData
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('condition', formData.condition);
    data.append('city', formData.city);
    data.append('university', formData.university);
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await API.post('/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Listing posted successfully!', { icon: '🚀' });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create listing';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <h2 className="mb-4 fw-bold text-primary text-center">Post a New Listing</h2>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Title *</Form.Label>
                  <Form.Control type="text" name="title" placeholder="e.g., Data Structures Book" 
                    value={formData.title} onChange={handleChange} required className="py-2" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Description *</Form.Label>
                  <Form.Control as="textarea" rows={4} name="description" placeholder="Describe details..."
                    value={formData.description} onChange={handleChange} required />
                </Form.Group>

                {/* 🟢 LOCATION FIELDS */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">City *</Form.Label>
                      <Form.Select name="city" value={formData.city} onChange={handleChange}>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">University / College *</Form.Label>
                      <Form.Control type="text" name="university" placeholder="e.g. Comsats" 
                        value={formData.university} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Price (PKR) *</Form.Label>
                      <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Category *</Form.Label>
                      <Form.Select name="category" value={formData.category} onChange={handleChange}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Condition *</Form.Label>
                  <Form.Select name="condition" value={formData.condition} onChange={handleChange}>
                    {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Upload Image</Form.Label>
                  <Form.Control 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/*"
                    disabled={compressing}
                  />
                  <Form.Text className={compressing ? "text-primary fw-bold" : "text-muted"}>
                    {compressing ? "⚡ Optimizing image..." : "Image will be optimized automatically."}
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-3">
                  <Button variant="primary" type="submit" disabled={loading || compressing} className="flex-grow-1 py-2 fw-bold shadow-sm">
                    {loading ? 'Publishing...' : 'Publish Listing'}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate('/dashboard')} className="flex-grow-1 py-2">
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default CreateListing;