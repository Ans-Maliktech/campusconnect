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
    category: 'Textbooks',
    condition: 'Good',
    city: 'Abbottabad',
    university: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Constants
  const categories = ['Textbooks', 'Notes', 'Hostel Supplies', 'Electronics', 'Tutoring Services', 'Freelancing Services', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'N/A'];
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

      case 'university':
        if (!value.trim()) {
          errors.university = 'University/College is required';
        } else if (value.length < 2) {
          errors.university = 'Please enter a valid university name';
        } else {
          delete errors.university;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [validationErrors]);

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Image compression and preview
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const options = { 
      maxSizeMB: 0.5, 
      maxWidthOrHeight: 1200, 
      useWebWorker: true,
      fileType: 'image/jpeg' // Convert to JPEG for better compatibility
    };
    
    try {
      setCompressing(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Compress image
      const compressedFile = await imageCompression(file, options);
      
      // Log compression stats
      const originalSizeKB = (file.size / 1024).toFixed(2);
      const compressedSizeKB = (compressedFile.size / 1024).toFixed(2);
      console.log(`Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB`);
      
      setImageFile(compressedFile);
      toast.success(`Image optimized! (${originalSizeKB}KB → ${compressedSizeKB}KB)`, { 
        duration: 2000,
        icon: '⚡' 
      });
    } catch (error) {
      console.error('Image compression error:', error);
      setImageFile(file); // Fallback to original
      toast.error('Failed to optimize image, using original');
    } finally {
      setCompressing(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // Validate all fields before submission
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim() || formData.title.length < 3) {
      errors.title = 'Valid title is required (min 3 characters)';
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      errors.description = 'Valid description is required (min 10 characters)';
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      errors.price = 'Valid price is required';
    }
    if (!formData.university.trim()) {
      errors.university = 'University/College is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading || compressing) return;

    toast.dismiss();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      // Prepare FormData
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('price', parseFloat(formData.price));
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('city', formData.city);
      data.append('university', formData.university.trim());
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      // Make API call
      const response = await API.post('/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // 30 second timeout
      });
      
      toast.success('Listing posted successfully!', { 
        icon: '🚀',
        duration: 3000 
      });

      // Small delay for better UX
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (err) {
      console.error('Listing creation error:', err);
      
      // Handle different error types
      if (err.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection and try again.');
      } else if (err.response) {
        // Server responded with error
        const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create listing';
        toast.error(msg, { duration: 4000 });
      } else if (err.request) {
        // Request made but no response
        toast.error('No response from server. Please check your connection.');
      } else {
        // Other errors
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Authentication Required</Alert.Heading>
          <p>Please log in to create a listing.</p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
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
              <h2 className="mb-4 fw-bold text-primary text-center">Post a New Listing</h2>
              
              <Form onSubmit={handleSubmit} noValidate>
                {/* Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    name="title" 
                    placeholder="e.g., Data Structures Book" 
                    value={formData.title} 
                    onChange={handleChange}
                    isInvalid={!!validationErrors.title}
                    className="py-2"
                    maxLength={100}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.title}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.title.length}/100 characters
                  </Form.Text>
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Description <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    name="description" 
                    placeholder="Describe your item in detail..."
                    value={formData.description} 
                    onChange={handleChange}
                    isInvalid={!!validationErrors.description}
                    maxLength={1000}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.description}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.description.length}/1000 characters
                  </Form.Text>
                </Form.Group>

                {/* Location Fields */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        City <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange}
                      >
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        University / College <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="university" 
                        placeholder="e.g. COMSATS, NUST, etc." 
                        value={formData.university} 
                        onChange={handleChange}
                        isInvalid={!!validationErrors.university}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.university}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Price and Category */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        Price (PKR) <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control 
                        type="number" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleChange}
                        isInvalid={!!validationErrors.price}
                        min="0"
                        step="1"
                        placeholder="e.g., 500"
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.price}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        Category <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Condition */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    Condition <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select 
                    name="condition" 
                    value={formData.condition} 
                    onChange={handleChange}
                  >
                    {conditions.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Image Upload */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Upload Image</Form.Label>
                  <Form.Control 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/*"
                    disabled={compressing}
                  />
                  <Form.Text className={compressing ? "text-primary fw-bold" : "text-muted"}>
                    {compressing ? "⚡ Optimizing image..." : "Image will be automatically optimized. Max 10MB."}
                  </Form.Text>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-3 position-relative" style={{ maxWidth: '300px' }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="img-fluid rounded border"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2"
                        onClick={handleRemoveImage}
                        style={{ opacity: 0.9 }}
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </Form.Group>

                {/* Submit Buttons */}
                <div className="d-flex gap-3">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading || compressing}
                    className="flex-grow-1 py-2 fw-bold shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Publishing...
                      </>
                    ) : (
                      'Publish Listing'
                    )}
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                    className="flex-grow-1 py-2"
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