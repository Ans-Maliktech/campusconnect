import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import API from '../services/api';
import Loader from '../components/Loader';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Textbooks',
    condition: 'Good',
    imageUrl: '',
  });
  
  // State for NEW file
  const [imageFile, setImageFile] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Textbooks', 'Notes', 'Hostel Supplies', 'Electronics', 
    'Tutoring Services', 'Freelancing Services', 'Other'
  ];
  
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'N/A'];

  useEffect(() => {
    fetchListing();
    // eslint-disable-next-line
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await API.get(`/listings/${id}`);
      const listing = response.data;
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
        imageUrl: listing.imageUrl || '',
      });
    } catch (err) {
      toast.error('Failed to load listing');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5000000) { 
        toast.error("File size too large (Max 5MB)");
        return;
    }
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    toast.dismiss();

    if (!formData.title || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('condition', formData.condition);
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await API.put(`/listings/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Listing updated successfully!', { duration: 4000, icon: '✅' });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <h2 className="mb-4 fw-bold text-primary text-center">✏️ Edit Listing</h2>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-dark">Title *</Form.Label>
                  <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required className="py-2" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-dark">Description *</Form.Label>
                  <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} required />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold text-dark">Price (PKR) *</Form.Label>
                      <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold text-dark">Category *</Form.Label>
                      <Form.Select name="category" value={formData.category} onChange={handleChange}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-dark">Condition *</Form.Label>
                  <Form.Select name="condition" value={formData.condition} onChange={handleChange}>
                    {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                  </Form.Select>
                </Form.Group>

                {/* 🟢 IMAGE UPDATE SECTION (Fixed Visibility) */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold text-dark">Update Image</Form.Label>
                  
                  {/* Preview Current Image */}
                  {formData.imageUrl && !imageFile && (
                    <div className="mb-3 p-2 border rounded d-inline-flex align-items-center bg-light">
                        <img 
                          src={formData.imageUrl} 
                          alt="Current" 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                        />
                        {/* Changed from text-muted to text-dark fw-bold for visibility */}
                        <span className="ms-3 fw-bold text-dark">
                           Current Listing Photo
                        </span>
                    </div>
                  )}

                  <Form.Control 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/png, image/jpeg, image/jpg"
                  />
                  {/* Changed text-muted to text-secondary for better contrast */}
                  <Form.Text className="text-secondary fw-bold" style={{ fontSize: '0.85rem' }}>
                    ℹ️ Leave this empty if you don't want to change the photo.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-3">
                  <Button
                    variant="dark"
                    type="submit"
                    disabled={submitting}
                    className="flex-grow-1 py-2 fw-bold shadow-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    {submitting ? 'Updating...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/dashboard')}
                    className="flex-grow-1 py-2 fw-bold"
                    style={{ borderRadius: '8px' }}
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

export default EditListing;