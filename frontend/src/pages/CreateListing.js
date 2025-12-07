import React, { useState, useContext, useCallback } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import imageCompression from 'browser-image-compression';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const CreateListing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Textbooks & Course Materials',
    condition: 'Used (Good)',
    city: 'Abbottabad',
    university: 'COMSATS University (CUI)', // Default Value
  });
   
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // 🏛️ LIST OF MAJOR PAKISTANI UNIVERSITIES
  const universities = [
    "COMSATS University (CUI)",
    "NUST (National University of Sciences & Technology)",
    "LUMS (Lahore University of Management Sciences)",
    "FAST NUCES",
    "IBA (Institute of Business Administration)",
    "UET (University of Engineering & Technology)",
    "Punjab University (PU)",
    "Karachi University (KU)",
    "GIKI (Ghulam Ishaq Khan Institute)",
    "Bahria University",
    "Air University",
    "Quaid-e-Azam University (QAU)",
    "Medical College (KEMU/AIMC/RMU)",
    "Army Medical College (AMC)",
    "Other"
  ];

  const categories = [
    "Textbooks & Course Materials",
    "Notes & Past Papers",
    "Electronics & Gadgets",
    "Medical Instruments",
    "Engineering & Art Tools",
    "Hostel Essentials",
    "Fashion & Uniforms",
    "Services (Tutoring/Freelance)",
    "Other"
  ];

  const conditions = [
    "New (Sealed)",
    "Like New (Unmarked)",
    "Used (Good)",
    "Used (Fair/Worn)",
    "Heavily Marked (Highlighted)",
    "N/A (For Services)"
  ];

  const cities = ['Abbottabad', 'Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Multan', 'Rawalpindi', 'Other'];

  // Field-level validation
  const validateField = useCallback((name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case 'title':
        if (!value.trim()) {
          errors.title = 'Title is required';
        } else if (value.length < 3) {
          errors.title = 'Title must be at least 3 characters';
        } else if (value.length > 100) {
          errors.title = 'Title must not exceed 100 characters';
        } else {
          delete errors.title;
        }
        break;

      case 'description':
        if (!value.trim()) {
          errors.description = 'Description is required';
        } else if (value.length < 10) {
          errors.description = 'Description must be at least 10 characters';
        } else if (value.length > 1000) {
          errors.description = 'Description must not exceed 1000 characters';
        } else {
          delete errors.description;
        }
        break;

      case 'price':
        if (!value || value === '') {
          errors.price = 'Price is required';
        } else if (parseFloat(value) < 0) {
          errors.price = 'Price cannot be negative';
        } else if (parseFloat(value) > 10000000) {
          errors.price = 'Price seems unrealistic';
        } else {
          delete errors.price;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [validationErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const options = { 
      maxSizeMB: 0.5, 
      maxWidthOrHeight: 1200, 
      useWebWorker: true,
      fileType: 'image/jpeg'
    };
    
    try {
      setCompressing(true);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);
      toast.success(`Image optimized!`, { duration: 2000, icon: '⚡' });
    } catch (error) {
      console.error('Image compression error:', error);
      setImageFile(file);
      toast.error('Failed to optimize image, using original');
    } finally {
      setCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim() || formData.title.length < 3) errors.title = 'Valid title is required';
    if (!formData.description.trim() || formData.description.length < 10) errors.description = 'Valid description is required';
    if (!formData.price || parseFloat(formData.price) < 0) errors.price = 'Valid price is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || compressing) return;

    toast.dismiss();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('price', parseFloat(formData.price));
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('city', formData.city);
      data.append('university', formData.university); // Sends the dropdown value
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      await API.post('/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });
      
      toast.success('Listing posted successfully!', { icon: '🚀', duration: 3000 });

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (err) {
      console.error('Listing creation error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create listing';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Authentication Required</Alert.Heading>
          <p>Please log in to create a listing.</p>
          <Button variant="primary" onClick={() => navigate('/login')}>Go to Login</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Post a New Listing</h2>
                <p className="text-muted">Turn your unused campus items into cash 💸</p>
              </div>
              
              <Form onSubmit={handleSubmit} noValidate>
                {/* Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">What are you selling? <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    name="title" 
                    placeholder="e.g. Guyton Physiology Book, Casio Calculator..." 
                    value={formData.title} 
                    onChange={handleChange}
                    isInvalid={!!validationErrors.title}
                    className="py-2"
                    maxLength={100}
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.title}</Form.Control.Feedback>
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    name="description" 
                    placeholder="Mention edition, authors, specs, or defects."
                    value={formData.description} 
                    onChange={handleChange}
                    isInvalid={!!validationErrors.description}
                    maxLength={1000}
                  />
                  <Form.Control.Feedback type="invalid">{validationErrors.description}</Form.Control.Feedback>
                </Form.Group>

                {/* Categories & Condition */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Category <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="category" value={formData.category} onChange={handleChange}>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Condition <span className="text-danger">*</span></Form.Label>
                      <Form.Select name="condition" value={formData.condition} onChange={handleChange}>
                        {conditions.map(cond => (
                          <option key={cond} value={cond}>{cond}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Price & University */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Price (PKR) <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="number" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleChange}
                        isInvalid={!!validationErrors.price}
                        min="0"
                        placeholder="e.g. 2500"
                      />
                      <Form.Control.Feedback type="invalid">{validationErrors.price}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  {/* 🟢 UPDATED: University Dropdown */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">University / Campus <span className="text-danger">*</span></Form.Label>
                      <Form.Select 
                        name="university" 
                        value={formData.university} 
                        onChange={handleChange}
                      >
                        {universities.map(uni => (
                          <option key={uni} value={uni}>{uni}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* City */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">City <span className="text-danger">*</span></Form.Label>
                  <Form.Select name="city" value={formData.city} onChange={handleChange}>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Image Upload */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Upload Photo</Form.Label>
                  <div className="p-3 border rounded bg-light text-center">
                    {!imagePreview ? (
                      <>
                        <p className="text-muted mb-2">Supported formats: JPG, PNG (Max 10MB)</p>
                        <Form.Control 
                          type="file" 
                          onChange={handleFileChange} 
                          accept="image/*"
                          disabled={compressing}
                        />
                      </>
                    ) : (
                      <div className="position-relative d-inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="img-fluid rounded border shadow-sm"
                          style={{ maxHeight: '250px' }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-2 rounded-circle"
                          onClick={handleRemoveImage}
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                  </div>
                  {compressing && <div className="text-primary mt-2 small fw-bold">⚡ Optimizing image quality...</div>}
                </Form.Group>

                {/* Submit Buttons */}
                <div className="d-flex gap-3 pt-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading || compressing}
                    className="flex-grow-1 py-2 fw-bold shadow-sm"
                    size="lg"
                  >
                    {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2"/> Publishing...</> : '🚀 Publish Now'}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                    className="flex-grow-1 py-2"
                    size="lg"
                  >
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